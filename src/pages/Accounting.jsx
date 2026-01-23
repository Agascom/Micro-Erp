import { useState, useEffect, useMemo } from 'react';
import { invoiceService } from '../services/invoiceService';
import { expenseService } from '../services/expenseService';
import { formatCurrency } from '../utils/currency';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';
import { Line, Doughnut } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

const Accounting = () => {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [period, setPeriod] = useState('month'); // month, quarter, year

    useEffect(() => {
        fetchData();
    }, [period]);

    const fetchData = async () => {
        setLoading(true);
        try {
            // Fetch real data in parallel
            const [invoicesRes, expensesRes] = await Promise.all([
                invoiceService.getAll(),
                expenseService.getAll()
            ]);

            const invoices = Array.isArray(invoicesRes) ? invoicesRes : (invoicesRes.data || []);
            const expenses = Array.isArray(expensesRes) ? expensesRes : (expensesRes.data || []);

            processData(invoices, expenses, period);
        } catch (err) {
            console.error(err);
            setError('Impossible de charger les données comptables.');
        } finally {
            setLoading(false);
        }
    };

    const processData = (invoices, expenses, period) => {
        const now = new Date();
        const currentYear = now.getFullYear();
        const currentMonth = now.getMonth();
        
        // Date filtering logic
        const filterDate = (dateStr) => {
            const date = new Date(dateStr);
            if (period === 'month') {
                return date.getMonth() === currentMonth && date.getFullYear() === currentYear;
            } else if (period === 'quarter') {
                const currentQuarter = Math.floor(currentMonth / 3);
                const dateQuarter = Math.floor(date.getMonth() / 3);
                return dateQuarter === currentQuarter && date.getFullYear() === currentYear;
            } else if (period === 'year') {
                return date.getFullYear() === currentYear;
            }
            return true;
        };

        // Filter data
        const filteredInvoices = invoices.filter(inv => filterDate(inv.date || inv.created_at) && inv.status !== 'cancelled' && inv.status !== 'draft');
        const filteredExpenses = expenses.filter(exp => filterDate(exp.date || exp.expense_date || exp.created_at));

        // Calculate Totals
        const totalRevenue = filteredInvoices.reduce((sum, inv) => sum + Number(inv.total || 0), 0);
        const totalExpenses = filteredExpenses.reduce((sum, exp) => sum + Number(exp.amount || 0), 0);
        const netProfit = totalRevenue - totalExpenses;
        const profitMargin = totalRevenue > 0 ? ((netProfit / totalRevenue) * 100).toFixed(1) : 0;

        // --- Chart Data Preparation ---
        // Labels and grouping logic depend on period
        let labels = [];
        let revenueData = [];
        let expenseData = [];

        if (period === 'month') {
            // Group by day (1-31)
            const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
            labels = Array.from({length: daysInMonth}, (_, i) => (i + 1).toString());
            revenueData = new Array(daysInMonth).fill(0);
            expenseData = new Array(daysInMonth).fill(0);

            filteredInvoices.forEach(inv => {
                const d = new Date(inv.date || inv.created_at).getDate();
                revenueData[d-1] += Number(inv.total || 0);
            });
            filteredExpenses.forEach(exp => {
                const d = new Date(exp.date || exp.expense_date || exp.created_at).getDate();
                expenseData[d-1] += Number(exp.amount || 0);
            });
        } else {
            // Group by month (Jan-Dec) for year or quarter
            const months = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Août', 'Sep', 'Oct', 'Nov', 'Déc'];
            
            if (period === 'quarter') {
                const startMonth = Math.floor(currentMonth / 3) * 3;
                labels = months.slice(startMonth, startMonth + 3);
                revenueData = new Array(3).fill(0);
                expenseData = new Array(3).fill(0);

                const getIndex = (date) => new Date(date).getMonth() - startMonth;

                filteredInvoices.forEach(inv => {
                    const idx = getIndex(inv.date || inv.created_at);
                    if (idx >= 0 && idx < 3) revenueData[idx] += Number(inv.total || 0);
                });
                filteredExpenses.forEach(exp => {
                    const idx = getIndex(exp.date || exp.created_at);
                     if (idx >= 0 && idx < 3) expenseData[idx] += Number(exp.amount || 0);
                });

            } else { // Year
                labels = months;
                revenueData = new Array(12).fill(0);
                expenseData = new Array(12).fill(0);
                
                filteredInvoices.forEach(inv => {
                    const idx = new Date(inv.date || inv.created_at).getMonth();
                    revenueData[idx] += Number(inv.total || 0);
                });
                filteredExpenses.forEach(exp => {
                    const idx = new Date(exp.date || exp.created_at).getMonth();
                    expenseData[idx] += Number(exp.amount || 0);
                });
            }
        }

        // --- Expense Categories ---
        const categoryMap = {};
        filteredExpenses.forEach(exp => {
            const cat = exp.category?.name || exp.category || 'Autre';
            categoryMap[cat] = (categoryMap[cat] || 0) + Number(exp.amount || 0);
        });

        setStats({
            revenue: totalRevenue,
            expenses: totalExpenses,
            net_profit: netProfit,
            profit_margin: profitMargin,
            chart_data: {
                labels,
                revenue: revenueData,
                expenses: expenseData
            },
            expense_categories: {
                labels: Object.keys(categoryMap),
                data: Object.values(categoryMap)
            }
        });
    };

    if (loading) {
         return (
            <div className="flex items-center justify-center h-screen bg-slate-50 dark:bg-slate-950">
                <div className="relative">
                    <div className="w-16 h-16 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin"></div>
                    <div className="mt-4 text-center text-purple-600 font-medium text-sm">Chargement des données...</div>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-fade-in">
             <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                     <nav className="flex items-center gap-2 text-xs font-medium text-slate-400 mb-1">
                        <span>Finance</span>
                        <span>/</span>
                        <span className="text-slate-800 dark:text-slate-200">Comptabilité</span>
                    </nav>
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Bilan Financier</h2>
                </div>
                
                <div className="flex items-center gap-2 bg-white dark:bg-slate-900 p-1 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
                    {['month', 'quarter', 'year'].map((p) => (
                        <button
                            key={p}
                            onClick={() => setPeriod(p)}
                            className={`px-4 py-1.5 rounded-lg text-sm font-semibold transition-all ${
                                period === p 
                                    ? 'bg-purple-600 text-white shadow-md' 
                                    : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800'
                            }`}
                        >
                            {p === 'month' ? 'Ce Mois' : p === 'quarter' ? 'Ce Trimestre' : 'Cette Année'}
                        </button>
                    ))}
                </div>
            </div>

            {error ? (
                <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl text-red-600 flex items-center gap-2">
                    <span className="material-symbols-outlined">error</span>
                    {error}
                </div>
            ) : (
                <>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Revenue Card */}
                    <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                             <span className="material-symbols-outlined text-8xl text-emerald-500">payments</span>
                        </div>
                        <div className="relative z-10">
                            <p className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-1">Chiffre d'Affaires</p>
                            <h3 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">{formatCurrency(stats?.revenue || 0)}</h3>
                            <div className="flex items-center text-xs font-semibold text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20 px-2 py-1 rounded-full w-fit">
                                <span className="material-symbols-outlined text-sm mr-1">trending_up</span>
                                Basé sur les factures (hors brouillons/annulées)
                            </div>
                        </div>
                    </div>

                    {/* Expenses Card */}
                    <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                             <span className="material-symbols-outlined text-8xl text-red-500">account_balance_wallet</span>
                        </div>
                        <div className="relative z-10">
                            <p className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-1">Dépenses Totales</p>
                            <h3 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">{formatCurrency(stats?.expenses || 0)}</h3>
                            <div className="flex items-center text-xs font-semibold text-red-600 bg-red-50 dark:bg-red-900/20 px-2 py-1 rounded-full w-fit">
                                <span className="material-symbols-outlined text-sm mr-1">trending_up</span>
                                Basé sur les dépenses enregistrées
                            </div>
                        </div>
                    </div>

                    {/* Net Profit Card */}
                    <div className="bg-gradient-to-br from-purple-600 to-blue-600 p-6 rounded-2xl shadow-lg relative overflow-hidden text-white group">
                        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                             <span className="material-symbols-outlined text-8xl text-white">savings</span>
                        </div>
                        <div className="relative z-10">
                            <p className="text-sm font-bold text-purple-200 uppercase tracking-wider mb-1">Bénéfice Net</p>
                            <h3 className="text-4xl font-bold mb-2">{formatCurrency(stats?.net_profit || 0)}</h3>
                            <p className="text-sm font-medium text-purple-100 opacity-90">
                                Marge bénéficiaire: <span className="font-bold">{stats?.profit_margin || 0}%</span>
                            </p>
                        </div>
                    </div>
                </div>

                {/* Charts */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
                    <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm min-h-[350px]">
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Évolution de la Trésorerie ({period === 'month' ? 'Jours' : 'Mois'})</h3>
                        <div className="h-64">
                             {stats?.chart_data && (
                                <Line 
                                    data={{
                                        labels: stats.chart_data.labels,
                                        datasets: [
                                            {
                                                label: 'Revenus',
                                                data: stats.chart_data.revenue,
                                                borderColor: '#10b981', // emerald-500
                                                backgroundColor: 'rgba(16, 185, 129, 0.1)',
                                                fill: true,
                                                tension: 0.4
                                            },
                                            {
                                                label: 'Dépenses',
                                                data: stats.chart_data.expenses,
                                                borderColor: '#ef4444', // red-500
                                                backgroundColor: 'rgba(239, 68, 68, 0.1)',
                                                fill: true,
                                                tension: 0.4
                                            }
                                        ]
                                    }}
                                    options={{
                                        responsive: true,
                                        maintainAspectRatio: false,
                                        plugins: {
                                            legend: {
                                                position: 'top',
                                            },
                                            tooltip: {
                                                mode: 'index',
                                                intersect: false,
                                            }
                                        },
                                        scales: {
                                            y: {
                                                beginAtZero: true
                                            }
                                        },
                                        interaction: {
                                            mode: 'nearest',
                                            axis: 'x',
                                            intersect: false
                                        }
                                    }}
                                />
                            )}
                        </div>
                    </div>

                     <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm min-h-[350px]">
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Répartition des Dépenses</h3>
                        <div className="h-64 flex justify-center">
                            {stats?.expense_categories?.data?.length > 0 ? (
                                <Doughnut 
                                    data={{
                                        labels: stats.expense_categories.labels,
                                        datasets: [
                                            {
                                                label: 'Montant',
                                                data: stats.expense_categories.data,
                                                backgroundColor: [
                                                    'rgba(147, 51, 234, 0.8)', // purple
                                                    'rgba(59, 130, 246, 0.8)', // blue
                                                    'rgba(16, 185, 129, 0.8)', // emerald
                                                    'rgba(245, 158, 11, 0.8)', // amber
                                                    'rgba(239, 68, 68, 0.8)',  // red
                                                    'rgba(107, 114, 128, 0.8)', // gray
                                                ],
                                                borderWidth: 1
                                            }
                                        ]
                                    }}
                                    options={{
                                        responsive: true,
                                        maintainAspectRatio: false,
                                        plugins: {
                                            legend: {
                                                position: 'right',
                                            }
                                        }
                                    }}
                                />
                            ) : (
                                <div className="flex items-center justify-center w-full h-full text-slate-400 flex-col">
                                    <span className="material-symbols-outlined text-4xl mb-2">data_usage</span>
                                    <p>Pas de données de dépenses</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
                </>
            )}
        </div>
    );
};

export default Accounting;
