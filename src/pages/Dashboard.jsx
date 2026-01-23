// src/pages/Dashboard.jsx
import { useState, useEffect, useCallback } from 'react';
import { dashboardService } from '../services/dashboardService';
import { productService } from '../services/productService';
import { clientService } from '../services/clientService';
import { invoiceService } from '../services/invoiceService';
import { employeeService } from '../services/employeeService';
import { kpiService } from '../services/kpiService';
import { Link } from 'react-router-dom';
import { formatCurrency } from '../utils/currency';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    ArcElement,
    Title,
    Tooltip,
    Legend,
    Filler
} from 'chart.js';
import { Line, Bar, Doughnut } from 'react-chartjs-2';

// Register Chart.js components
ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    ArcElement,
    Title,
    Tooltip,
    Legend,
    Filler
);

const Dashboard = () => {
    const [stats, setStats] = useState({
        total_revenue: 0, monthly_revenue: 0, total_clients: 0, new_clients_month: 0,
        total_products: 0, pending_invoices: 0, paid_invoices: 0, overdue_invoices: 0,
        low_stock_alerts: 0, total_employees: 0, monthly_payroll: 0,
        payment_rate: 0, revenue_growth: 0, total_quotes: 0, converted_quotes: 0
    });
    const [recentInvoices, setRecentInvoices] = useState([]);
    const [recentClients, setRecentClients] = useState([]);
    const [lowStockProducts, setLowStockProducts] = useState([]);
    const [objectives, setObjectives] = useState([]);
    const [monthlyRevenueData, setMonthlyRevenueData] = useState({ labels: [], datasets: [] });
    const [invoiceStatusData, setInvoiceStatusData] = useState({ labels: [], datasets: [] });
    const [invoiceCountData, setInvoiceCountData] = useState({ labels: [], datasets: [] });
    const [categoryData, setCategoryData] = useState({ labels: [], datasets: [] });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [lastUpdated, setLastUpdated] = useState(null);
    const [activeTimeframe, setActiveTimeframe] = useState('month');

    const fetchStats = useCallback(async () => {
        setLoading(true);
        setError('');
        
        try {
            const [productsRes, clientsRes, invoicesRes, employeesRes, kpiRes] = await Promise.allSettled([
                productService.getAll(),
                clientService.getAll(),
                invoiceService.getAll(),
                employeeService.getAll(),
                kpiService.getObjectives()
            ]);

            const products = productsRes.status === 'fulfilled' ? (productsRes.value.data || productsRes.value || []) : [];
            const clients = clientsRes.status === 'fulfilled' ? (clientsRes.value.data || clientsRes.value || []) : [];
            const invoices = invoicesRes.status === 'fulfilled' ? (invoicesRes.value.data || invoicesRes.value || []) : [];
            const employees = employeesRes.status === 'fulfilled' ? (employeesRes.value.data || employeesRes.value || []) : [];
            const objectivesData = kpiRes.status === 'fulfilled' ? (kpiRes.value.data || kpiRes.value || []) : [];

            // Dates
            const now = new Date();
            const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
            const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
            const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);

            // Calculs détaillés
            const paidInvoices = invoices.filter(inv => inv.status === 'paid');
            const pendingInvoices = invoices.filter(inv => inv.status === 'pending');
            const overdueInvoices = invoices.filter(inv => {
                if (inv.status !== 'pending') return false;
                const dueDate = new Date(inv.due_date);
                return dueDate < now;
            });

            const totalRevenue = paidInvoices.reduce((sum, inv) => sum + (parseFloat(inv.total) || 0), 0);
            
            const monthlyInvoices = paidInvoices.filter(inv => new Date(inv.created_at) >= startOfMonth);
            const monthlyRevenue = monthlyInvoices.reduce((sum, inv) => sum + (parseFloat(inv.total) || 0), 0);
            
            const lastMonthInvoices = paidInvoices.filter(inv => {
                const date = new Date(inv.created_at);
                return date >= startOfLastMonth && date <= endOfLastMonth;
            });
            const lastMonthRevenue = lastMonthInvoices.reduce((sum, inv) => sum + (parseFloat(inv.total) || 0), 0);
            
            const revenueGrowth = lastMonthRevenue > 0 
                ? ((monthlyRevenue - lastMonthRevenue) / lastMonthRevenue) * 100 
                : monthlyRevenue > 0 ? 100 : 0;

            const newClientsMonth = clients.filter(c => new Date(c.created_at) >= startOfMonth).length;
            const lowStockAlerts = products.filter(p => (p.stock_level || 0) <= 10);
            const monthlyPayroll = employees.reduce((sum, emp) => sum + (parseFloat(emp.base_salary) || 0), 0);
            
            const paymentRate = invoices.length > 0 
                ? (paidInvoices.length / invoices.length) * 100 
                : 0;

            // Generate monthly revenue chart data (last 6 months)
            const monthNames = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Août', 'Sep', 'Oct', 'Nov', 'Déc'];
            const revenueByMonth = [];
            const invoicesByMonth = [];
            const labels = [];
            
            for (let i = 5; i >= 0; i--) {
                const monthDate = new Date(now.getFullYear(), now.getMonth() - i, 1);
                const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0);
                const monthInvs = paidInvoices.filter(inv => {
                    const date = new Date(inv.created_at);
                    return date >= monthDate && date <= monthEnd;
                });
                const revenue = monthInvs.reduce((sum, inv) => sum + (parseFloat(inv.total) || 0), 0);
                labels.push(monthNames[monthDate.getMonth()]);
                revenueByMonth.push(revenue);
                invoicesByMonth.push(monthInvs.length);
            }

            // Chart data for revenue
            setMonthlyRevenueData({
                labels,
                datasets: [{
                    label: 'Chiffre d\'Affaires',
                    data: revenueByMonth,
                    fill: true,
                    borderColor: '#8b5cf6',
                    backgroundColor: 'rgba(139, 92, 246, 0.1)',
                    tension: 0.4,
                    pointBackgroundColor: '#8b5cf6',
                    pointBorderColor: '#fff',
                    pointBorderWidth: 2,
                    pointRadius: 4
                }]
            });

            // Chart data for invoice count
            setInvoiceCountData({
                labels,
                datasets: [{
                    label: 'Nombre de Factures',
                    data: invoicesByMonth,
                    backgroundColor: 'rgba(59, 130, 246, 0.8)',
                    borderColor: '#3b82f6',
                    borderWidth: 1,
                    borderRadius: 6
                }]
            });

            // Invoice status pie chart
            setInvoiceStatusData({
                labels: ['Payées', 'En attente', 'En retard'],
                datasets: [{
                    data: [
                        paidInvoices.length,
                        pendingInvoices.length - overdueInvoices.length,
                        overdueInvoices.length
                    ],
                    backgroundColor: ['#10b981', '#f59e0b', '#ef4444'],
                    borderColor: ['#fff', '#fff', '#fff'],
                    borderWidth: 3
                }]
            });

            // Category distribution
            const categoryMap = {};
            products.forEach(p => {
                const catName = p.category?.name || 'Sans catégorie';
                categoryMap[catName] = (categoryMap[catName] || 0) + 1;
            });
            const catEntries = Object.entries(categoryMap).slice(0, 6);
            const colors = ['#8b5cf6', '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#ec4899'];
            
            setCategoryData({
                labels: catEntries.map(([name]) => name),
                datasets: [{
                    label: 'Produits',
                    data: catEntries.map(([, value]) => value),
                    backgroundColor: colors.slice(0, catEntries.length),
                    borderWidth: 0,
                    borderRadius: 6
                }]
            });

            setStats({
                total_revenue: totalRevenue,
                monthly_revenue: monthlyRevenue,
                total_clients: clients.length,
                new_clients_month: newClientsMonth,
                total_products: products.length,
                pending_invoices: pendingInvoices.length,
                paid_invoices: paidInvoices.length,
                overdue_invoices: overdueInvoices.length,
                low_stock_alerts: lowStockAlerts.length,
                total_employees: employees.length,
                monthly_payroll: monthlyPayroll,
                payment_rate: paymentRate,
                revenue_growth: revenueGrowth,
                total_quotes: 0,
                converted_quotes: 0
            });

            setRecentInvoices(invoices.slice(0, 5));
            setRecentClients(clients.slice(0, 5));
            setLowStockProducts(lowStockAlerts.slice(0, 5));
            setObjectives(objectivesData.slice(0, 3));
            
            setLastUpdated(new Date());
        } catch (err) {
            setError('Erreur lors du chargement des statistiques');
            console.error(err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchStats();
        const interval = setInterval(fetchStats, 300000);
        return () => clearInterval(interval);
    }, [fetchStats]);

    const handleRefresh = () => fetchStats();

    const getProgressColor = (progress) => {
        if (progress >= 80) return 'bg-emerald-500';
        if (progress >= 50) return 'bg-amber-500';
        return 'bg-rose-500';
    };

    // Chart options
    const lineChartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { display: false },
            tooltip: {
                backgroundColor: '#1e293b',
                titleColor: '#fff',
                bodyColor: '#fff',
                padding: 12,
                cornerRadius: 8,
                callbacks: {
                    label: (context) => formatCurrency(context.raw)
                }
            }
        },
        scales: {
            x: {
                grid: { display: false },
                ticks: { color: '#94a3b8' }
            },
            y: {
                grid: { color: 'rgba(148, 163, 184, 0.1)' },
                ticks: { 
                    color: '#94a3b8',
                    callback: (value) => `${(value/1000).toFixed(0)}k`
                }
            }
        }
    };

    const barChartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { display: false },
            tooltip: {
                backgroundColor: '#1e293b',
                titleColor: '#fff',
                bodyColor: '#fff',
                padding: 12,
                cornerRadius: 8
            }
        },
        scales: {
            x: {
                grid: { display: false },
                ticks: { color: '#94a3b8' }
            },
            y: {
                grid: { color: 'rgba(148, 163, 184, 0.1)' },
                ticks: { color: '#94a3b8' }
            }
        }
    };

    const doughnutOptions = {
        responsive: true,
        maintainAspectRatio: false,
        cutout: '65%',
        plugins: {
            legend: {
                position: 'bottom',
                labels: { color: '#94a3b8', padding: 15, usePointStyle: true }
            },
            tooltip: {
                backgroundColor: '#1e293b',
                titleColor: '#fff',
                bodyColor: '#fff',
                padding: 12,
                cornerRadius: 8
            }
        }
    };

    if (loading && !stats.total_revenue) {
        return (
            <div className="flex items-center justify-center h-screen">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-16 h-16 border-4 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
                    <p className="text-slate-600 dark:text-slate-400 text-lg">Chargement du tableau de bord...</p>
                </div>
            </div>
        );
    }

    const mainKpis = [
        {
            title: 'Chiffre d\'Affaires',
            value: formatCurrency(activeTimeframe === 'month' ? stats.monthly_revenue : stats.total_revenue),
            subtitle: activeTimeframe === 'month' ? 'Ce mois' : 'Total',
            change: stats.revenue_growth,
            icon: 'trending_up',
            color: 'from-purple-500 to-purple-600',
            bgLight: 'bg-purple-50 dark:bg-purple-900/20'
        },
        {
            title: 'Factures en Attente',
            value: stats.pending_invoices,
            subtitle: `${stats.overdue_invoices} en retard`,
            alert: stats.overdue_invoices > 0,
            icon: 'receipt_long',
            color: 'from-amber-500 to-amber-600',
            bgLight: 'bg-amber-50 dark:bg-amber-900/20'
        },
        {
            title: 'Clients',
            value: stats.total_clients,
            subtitle: `+${stats.new_clients_month} ce mois`,
            icon: 'people',
            color: 'from-blue-500 to-blue-600',
            bgLight: 'bg-blue-50 dark:bg-blue-900/20'
        },
        {
            title: 'Taux de Paiement',
            value: `${stats.payment_rate.toFixed(1)}%`,
            subtitle: `${stats.paid_invoices} factures payées`,
            icon: 'payments',
            color: 'from-emerald-500 to-emerald-600',
            bgLight: 'bg-emerald-50 dark:bg-emerald-900/20'
        }
    ];

    const secondaryStats = [
        { label: 'Produits', value: stats.total_products, icon: 'inventory_2', color: 'text-indigo-600', to: '/products' },
        { label: 'Employés', value: stats.total_employees, icon: 'badge', color: 'text-cyan-600', to: '/employees' },
        { label: 'Alertes Stock', value: stats.low_stock_alerts, icon: 'warning', color: 'text-rose-600', to: '/stock', alert: stats.low_stock_alerts > 0 },
        { label: 'Masse Salariale', value: formatCurrency(stats.monthly_payroll), icon: 'account_balance', color: 'text-violet-600', to: '/payslips' }
    ];

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Tableau de Bord</h1>
                    <p className="text-slate-500 mt-1">
                        Bienvenue ! Voici un aperçu de votre activité.
                        {lastUpdated && (
                            <span className="text-xs ml-2">
                                Mis à jour à {lastUpdated.toLocaleTimeString('fr-FR')}
                            </span>
                        )}
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="flex bg-slate-100 dark:bg-slate-800 rounded-xl p-1">
                        {['month', 'total'].map(tf => (
                            <button
                                key={tf}
                                onClick={() => setActiveTimeframe(tf)}
                                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                                    activeTimeframe === tf 
                                        ? 'bg-white dark:bg-slate-700 text-purple-600 shadow-sm' 
                                        : 'text-slate-500 hover:text-slate-700'
                                }`}
                            >
                                {tf === 'month' ? 'Ce mois' : 'Total'}
                            </button>
                        ))}
                    </div>
                    <button 
                        onClick={handleRefresh}
                        disabled={loading}
                        className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl text-sm font-semibold shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50"
                    >
                        <span className={`material-symbols-outlined text-lg ${loading ? 'animate-spin' : ''}`}>
                            {loading ? 'progress_activity' : 'refresh'}
                        </span>
                        {loading ? 'Actualisation...' : 'Actualiser'}
                    </button>
                </div>
            </div>

            {error && (
                <div className="p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl text-amber-700 dark:text-amber-400 flex items-center gap-2">
                    <span className="material-symbols-outlined">warning</span>
                    <span>{error}</span>
                </div>
            )}

            {/* Main KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {mainKpis.map((kpi, index) => (
                    <div 
                        key={index}
                        className="relative overflow-hidden bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-xl transition-all duration-300 group"
                    >
                        <div className="flex justify-between items-start mb-4">
                            <div className={`p-3 rounded-xl bg-gradient-to-br ${kpi.color} text-white shadow-lg`}>
                                <span className="material-symbols-outlined text-2xl">{kpi.icon}</span>
                            </div>
                            {kpi.change !== undefined && (
                                <span className={`flex items-center gap-1 text-sm font-medium ${kpi.change >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                                    <span className="material-symbols-outlined text-sm">
                                        {kpi.change >= 0 ? 'trending_up' : 'trending_down'}
                                    </span>
                                    {Math.abs(kpi.change).toFixed(1)}%
                                </span>
                            )}
                            {kpi.alert && (
                                <span className="flex h-3 w-3">
                                    <span className="animate-ping absolute inline-flex h-3 w-3 rounded-full bg-rose-400 opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-3 w-3 bg-rose-500"></span>
                                </span>
                            )}
                        </div>
                        <p className="text-sm font-medium text-slate-500 mb-1">{kpi.title}</p>
                        <p className="text-3xl font-bold text-slate-900 dark:text-white mb-1">{kpi.value}</p>
                        <p className="text-xs text-slate-400">{kpi.subtitle}</p>
                        <div className={`absolute -right-8 -bottom-8 w-32 h-32 rounded-full ${kpi.bgLight} opacity-50 group-hover:scale-150 transition-transform duration-500`}></div>
                    </div>
                ))}
            </div>

            {/* Secondary Stats Bar */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {secondaryStats.map((stat, index) => (
                    <Link
                        key={index}
                        to={stat.to}
                        className={`flex items-center gap-4 p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-purple-300 dark:hover:border-purple-700 transition-all group ${stat.alert ? 'ring-2 ring-rose-500/50' : ''}`}
                    >
                        <span className={`material-symbols-outlined text-2xl ${stat.color} group-hover:scale-110 transition-transform`}>
                            {stat.icon}
                        </span>
                        <div>
                            <p className="text-xs text-slate-500">{stat.label}</p>
                            <p className="text-lg font-bold text-slate-900 dark:text-white">{stat.value}</p>
                        </div>
                    </Link>
                ))}
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Revenue Chart - Line */}
                <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-6">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                            <span className="material-symbols-outlined text-purple-600">show_chart</span>
                            Évolution du Chiffre d'Affaires
                        </h3>
                        <span className="text-xs text-slate-500">6 derniers mois</span>
                    </div>
                    <div className="h-72">
                        <Line data={monthlyRevenueData} options={lineChartOptions} />
                    </div>
                </div>

                {/* Invoice Status Doughnut Chart */}
                <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-6">
                    <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2 mb-6">
                        <span className="material-symbols-outlined text-amber-600">pie_chart</span>
                        Statut des Factures
                    </h3>
                    <div className="h-64">
                        <Doughnut data={invoiceStatusData} options={doughnutOptions} />
                    </div>
                </div>
            </div>

            {/* Second Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Bar Chart - Factures par mois */}
                <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-6">
                    <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2 mb-6">
                        <span className="material-symbols-outlined text-blue-600">bar_chart</span>
                        Nombre de Factures par Mois
                    </h3>
                    <div className="h-64">
                        <Bar data={invoiceCountData} options={barChartOptions} />
                    </div>
                </div>

                {/* Category Distribution */}
                <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-6">
                    <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2 mb-6">
                        <span className="material-symbols-outlined text-emerald-600">category</span>
                        Produits par Catégorie
                    </h3>
                    <div className="h-64">
                        <Bar data={categoryData} options={{...barChartOptions, indexAxis: 'y'}} />
                    </div>
                </div>
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Recent Invoices */}
                <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
                    <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-slate-800">
                        <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                            <span className="material-symbols-outlined text-purple-600">receipt_long</span>
                            Dernières Factures
                        </h3>
                        <Link to="/invoices" className="text-sm text-purple-600 hover:text-purple-700 font-medium">
                            Voir tout →
                        </Link>
                    </div>
                    <div className="divide-y divide-slate-200 dark:divide-slate-800">
                        {recentInvoices.length === 0 ? (
                            <div className="p-8 text-center text-slate-500">
                                <span className="material-symbols-outlined text-4xl mb-2">receipt_long</span>
                                <p>Aucune facture récente</p>
                            </div>
                        ) : (
                            recentInvoices.map((invoice) => (
                                <div key={invoice.id} className="flex items-center justify-between p-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                                    <div className="flex items-center gap-4">
                                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                                            invoice.status === 'paid' ? 'bg-emerald-100 text-emerald-600' :
                                            invoice.status === 'pending' ? 'bg-amber-100 text-amber-600' :
                                            'bg-slate-100 text-slate-600'
                                        }`}>
                                            <span className="material-symbols-outlined">
                                                {invoice.status === 'paid' ? 'check_circle' : 'schedule'}
                                            </span>
                                        </div>
                                        <div>
                                            <p className="font-semibold text-slate-900 dark:text-white">{invoice.invoice_number}</p>
                                            <p className="text-sm text-slate-500">{invoice.client?.name || 'Client'}</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-bold text-slate-900 dark:text-white">{formatCurrency(invoice.total)}</p>
                                        <p className="text-xs text-slate-400">{new Date(invoice.created_at).toLocaleDateString('fr-FR')}</p>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* Objectives Progress */}
                <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
                    <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-slate-800">
                        <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                            <span className="material-symbols-outlined text-purple-600">target</span>
                            Objectifs
                        </h3>
                        <Link to="/kpi/objectives" className="text-sm text-purple-600 hover:text-purple-700 font-medium">
                            Voir tout →
                        </Link>
                    </div>
                    <div className="p-6 space-y-4">
                        {objectives.length === 0 ? (
                            <div className="text-center py-8">
                                <span className="material-symbols-outlined text-4xl text-slate-300 mb-2">target</span>
                                <p className="text-slate-500 text-sm">Aucun objectif défini</p>
                                <Link to="/kpi/objectives" className="inline-flex items-center gap-1 mt-3 text-sm text-purple-600 hover:text-purple-700">
                                    <span className="material-symbols-outlined text-sm">add</span>
                                    Créer un objectif
                                </Link>
                            </div>
                        ) : (
                            objectives.map((obj) => {
                                const progress = obj.target_value > 0 ? (obj.current_value / obj.target_value) * 100 : 0;
                                return (
                                    <div key={obj.id} className="space-y-2">
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{obj.name}</span>
                                            <span className="text-sm font-bold text-slate-900 dark:text-white">{progress.toFixed(0)}%</span>
                                        </div>
                                        <div className="h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                                            <div 
                                                className={`h-full ${getProgressColor(progress)} rounded-full transition-all duration-500`}
                                                style={{ width: `${Math.min(progress, 100)}%` }}
                                            ></div>
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>
                </div>
            </div>

            {/* Bottom Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Low Stock Alerts */}
                <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
                    <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-slate-800">
                        <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                            <span className="material-symbols-outlined text-rose-600">warning</span>
                            Alertes de Stock
                            {lowStockProducts.length > 0 && (
                                <span className="px-2 py-0.5 bg-rose-100 text-rose-600 rounded-full text-xs font-medium">
                                    {stats.low_stock_alerts}
                                </span>
                            )}
                        </h3>
                        <Link to="/stock" className="text-sm text-purple-600 hover:text-purple-700 font-medium">
                            Gérer →
                        </Link>
                    </div>
                    <div className="divide-y divide-slate-200 dark:divide-slate-800">
                        {lowStockProducts.length === 0 ? (
                            <div className="p-8 text-center">
                                <span className="material-symbols-outlined text-4xl text-emerald-400 mb-2">check_circle</span>
                                <p className="text-slate-500">Tous les stocks sont suffisants</p>
                            </div>
                        ) : (
                            lowStockProducts.map((product) => (
                                <div key={product.id} className="flex items-center justify-between p-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-rose-100 dark:bg-rose-900/30 rounded-lg flex items-center justify-center">
                                            <span className="material-symbols-outlined text-rose-600">inventory_2</span>
                                        </div>
                                        <div>
                                            <p className="font-medium text-slate-900 dark:text-white">{product.name}</p>
                                            <p className="text-xs text-slate-500">{product.category?.name || 'Sans catégorie'}</p>
                                        </div>
                                    </div>
                                    <span className={`px-3 py-1 rounded-full text-sm font-bold ${
                                        product.stock_level === 0 ? 'bg-rose-100 text-rose-700' : 'bg-amber-100 text-amber-700'
                                    }`}>
                                        {product.stock_level || 0} unités
                                    </span>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* Quick Actions */}
                <div className="bg-gradient-to-br from-purple-600 to-blue-600 rounded-2xl p-6 text-white">
                    <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
                        <span className="material-symbols-outlined">bolt</span>
                        Actions Rapides
                    </h3>
                    <div className="grid grid-cols-2 gap-4">
                        {[
                            { to: '/invoices', icon: 'add_circle', label: 'Nouvelle Facture' },
                            { to: '/quotes', icon: 'request_quote', label: 'Nouveau Devis' },
                            { to: '/clients', icon: 'person_add', label: 'Nouveau Client' },
                            { to: '/products', icon: 'add_box', label: 'Nouveau Produit' },
                            { to: '/payments', icon: 'payments', label: 'Enregistrer Paiement' },
                            { to: '/reports', icon: 'bar_chart', label: 'Voir Rapports' }
                        ].map((action, index) => (
                            <Link
                                key={index}
                                to={action.to}
                                className="flex items-center gap-3 p-4 bg-white/10 backdrop-blur-sm rounded-xl hover:bg-white/20 transition-all group"
                            >
                                <span className="material-symbols-outlined text-2xl group-hover:scale-110 transition-transform">
                                    {action.icon}
                                </span>
                                <span className="text-sm font-medium">{action.label}</span>
                            </Link>
                        ))}
                    </div>
                </div>
            </div>

            {/* Recent Clients */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
                <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-slate-800">
                    <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                        <span className="material-symbols-outlined text-blue-600">people</span>
                        Derniers Clients
                    </h3>
                    <Link to="/clients" className="text-sm text-purple-600 hover:text-purple-700 font-medium">
                        Voir tout →
                    </Link>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4 p-6">
                    {recentClients.length === 0 ? (
                        <div className="col-span-full text-center py-8 text-slate-500">
                            Aucun client récent
                        </div>
                    ) : (
                        recentClients.map((client) => (
                            <div key={client.id} className="flex flex-col items-center p-4 bg-slate-50 dark:bg-slate-800 rounded-xl hover:shadow-lg transition-shadow">
                                <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full flex items-center justify-center text-white font-bold text-xl mb-3">
                                    {client.name?.charAt(0)?.toUpperCase() || 'C'}
                                </div>
                                <p className="font-semibold text-slate-900 dark:text-white text-center text-sm truncate w-full">{client.name}</p>
                                <p className="text-xs text-slate-500 truncate w-full text-center">{client.email || client.phone || '-'}</p>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
