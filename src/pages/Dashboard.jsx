// src/pages/Dashboard.jsx
import { useState, useEffect, useCallback } from 'react';
import { dashboardService } from '../services/dashboardService';
import { productService } from '../services/productService';
import { clientService } from '../services/clientService';
import { invoiceService } from '../services/invoiceService';
import { employeeService } from '../services/employeeService';
import { Link } from 'react-router-dom';
import { formatCurrency } from '../utils/currency';

const Dashboard = () => {
    const [stats, setStats] = useState({
        total_revenue: 0,
        total_clients: 0,
        total_products: 0,
        pending_invoices: 0,
        low_stock_alerts: 0,
        total_employees: 0,
        monthly_payroll: 0
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [lastUpdated, setLastUpdated] = useState(null);

    const fetchStats = useCallback(async () => {
        setLoading(true);
        setError('');
        
        try {
            // Essayer d'abord l'endpoint dashboard dédié
            let dashboardData = null;
            try {
                dashboardData = await dashboardService.getStats();
            } catch (e) {
                console.log('Dashboard endpoint not available, fetching data individually...');
            }

            // Si l'endpoint dashboard renvoie des données valides, les utiliser
            if (dashboardData && (dashboardData.total_products !== undefined || dashboardData.total_clients !== undefined)) {
                setStats({
                    total_revenue: dashboardData.total_revenue || 0,
                    total_clients: dashboardData.total_clients || 0,
                    total_products: dashboardData.total_products || 0,
                    pending_invoices: dashboardData.pending_invoices || 0,
                    low_stock_alerts: dashboardData.low_stock_alerts || 0,
                    total_employees: dashboardData.total_employees || 0,
                    monthly_payroll: dashboardData.monthly_payroll || 0
                });
            } else {
                // Sinon, calculer les stats depuis les endpoints individuels
                const [productsRes, clientsRes, invoicesRes, employeesRes] = await Promise.allSettled([
                    productService.getAll(),
                    clientService.getAll(),
                    invoiceService.getAll(),
                    employeeService.getAll()
                ]);

                const products = productsRes.status === 'fulfilled' ? (productsRes.value.data || productsRes.value || []) : [];
                const clients = clientsRes.status === 'fulfilled' ? (clientsRes.value.data || clientsRes.value || []) : [];
                const invoices = invoicesRes.status === 'fulfilled' ? (invoicesRes.value.data || invoicesRes.value || []) : [];
                const employees = employeesRes.status === 'fulfilled' ? (employeesRes.value.data || employeesRes.value || []) : [];

                // Calculer les statistiques
                const pendingInvoices = invoices.filter(inv => inv.status === 'pending').length;
                const totalRevenue = invoices
                    .filter(inv => inv.status === 'paid')
                    .reduce((sum, inv) => sum + (parseFloat(inv.total) || 0), 0);
                const lowStockAlerts = products.filter(p => (p.stock_level || 0) <= 10).length;
                const monthlyPayroll = employees.reduce((sum, emp) => sum + (parseFloat(emp.base_salary) || 0), 0);

                setStats({
                    total_revenue: totalRevenue,
                    total_clients: clients.length,
                    total_products: products.length,
                    pending_invoices: pendingInvoices,
                    low_stock_alerts: lowStockAlerts,
                    total_employees: employees.length,
                    monthly_payroll: monthlyPayroll
                });
            }
            
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
    }, [fetchStats]);

    const handleRefresh = () => {
        fetchStats();
    };

    if (loading && !stats.total_products && !stats.total_clients) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 border-4 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
                    <p className="text-slate-600 dark:text-slate-400">Chargement du tableau de bord...</p>
                </div>
            </div>
        );
    }

    if (error && !stats.total_products && !stats.total_clients) {
        return (
            <div className="p-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl text-red-600 dark:text-red-400">
                <div className="flex items-center gap-3">
                    <span className="material-symbols-outlined">error</span>
                    {error}
                    <button onClick={handleRefresh} className="ml-auto px-4 py-2 bg-red-100 hover:bg-red-200 rounded-lg text-sm font-medium transition-colors">
                        Réessayer
                    </button>
                </div>
            </div>
        );
    }

    const statCards = [
        {
            title: 'Revenus Total',
            value: formatCurrency(stats.total_revenue),
            icon: 'monetization_on',
            color: 'purple',
            bgColor: 'bg-purple-500/10',
            textColor: 'text-purple-600',
        },
        {
            title: 'Clients',
            value: stats.total_clients || 0,
            icon: 'people',
            color: 'blue',
            bgColor: 'bg-blue-500/10',
            textColor: 'text-blue-600',
        },
        {
            title: 'Produits',
            value: stats.total_products || 0,
            icon: 'inventory_2',
            color: 'emerald',
            bgColor: 'bg-emerald-500/10',
            textColor: 'text-emerald-600',
        },
        {
            title: 'Factures en Attente',
            value: stats.pending_invoices || 0,
            icon: 'receipt_long',
            color: 'amber',
            bgColor: 'bg-amber-500/10',
            textColor: 'text-amber-600',
        },
        {
            title: 'Alertes Stock',
            value: stats.low_stock_alerts || 0,
            icon: 'warning',
            color: 'rose',
            bgColor: 'bg-rose-500/10',
            textColor: 'text-rose-600',
        },
        {
            title: 'Employés',
            value: stats.total_employees || 0,
            icon: 'badge',
            color: 'indigo',
            bgColor: 'bg-indigo-500/10',
            textColor: 'text-indigo-600',
        },
        {
            title: 'Masse Salariale',
            value: formatCurrency(stats.monthly_payroll),
            icon: 'payments',
            color: 'cyan',
            bgColor: 'bg-cyan-500/10',
            textColor: 'text-cyan-600',
        },
    ];

    return (
        <>
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <nav className="flex items-center gap-2 text-xs font-medium text-slate-400 mb-1">
                        <span>Main</span>
                        <span>/</span>
                        <span className="text-slate-800 dark:text-slate-200">Dashboard</span>
                    </nav>
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Vue d'ensemble</h2>
                    {lastUpdated && (
                        <p className="text-xs text-slate-400 mt-1">
                            Dernière mise à jour : {lastUpdated.toLocaleTimeString('fr-FR')}
                        </p>
                    )}
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

            {error && (
                <div className="p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl text-amber-700 dark:text-amber-400 flex items-center gap-2">
                    <span className="material-symbols-outlined">warning</span>
                    <span>Certaines données n'ont pas pu être chargées. Les statistiques peuvent être incomplètes.</span>
                </div>
            )}

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {statCards.map((stat, index) => (
                    <div 
                        key={index}
                        className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-lg transition-shadow duration-300"
                    >
                        <div className="flex justify-between items-start mb-4">
                            <p className="text-sm font-medium text-slate-500">{stat.title}</p>
                            <span className={`material-symbols-outlined ${stat.textColor} ${stat.bgColor} p-2 rounded-xl text-xl`}>
                                {stat.icon}
                            </span>
                        </div>
                        <p className="text-2xl font-bold text-slate-900 dark:text-white">{stat.value}</p>
                    </div>
                ))}
            </div>

            {/* Quick Actions */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-6">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6">Actions Rapides</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                    <Link 
                        to="/products" 
                        className="flex flex-col items-center gap-3 p-4 rounded-xl bg-slate-50 dark:bg-slate-800 hover:bg-purple-50 dark:hover:bg-purple-900/20 hover:text-purple-600 transition-all duration-200 group"
                    >
                        <span className="material-symbols-outlined text-3xl text-slate-400 group-hover:text-purple-600 transition-colors">add_box</span>
                        <span className="text-sm font-medium">Nouveau Produit</span>
                    </Link>
                    <Link 
                        to="/clients" 
                        className="flex flex-col items-center gap-3 p-4 rounded-xl bg-slate-50 dark:bg-slate-800 hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:text-blue-600 transition-all duration-200 group"
                    >
                        <span className="material-symbols-outlined text-3xl text-slate-400 group-hover:text-blue-600 transition-colors">person_add</span>
                        <span className="text-sm font-medium">Nouveau Client</span>
                    </Link>
                    <Link 
                        to="/quotes" 
                        className="flex flex-col items-center gap-3 p-4 rounded-xl bg-slate-50 dark:bg-slate-800 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 hover:text-emerald-600 transition-all duration-200 group"
                    >
                        <span className="material-symbols-outlined text-3xl text-slate-400 group-hover:text-emerald-600 transition-colors">request_quote</span>
                        <span className="text-sm font-medium">Nouveau Devis</span>
                    </Link>
                    <Link 
                        to="/invoices" 
                        className="flex flex-col items-center gap-3 p-4 rounded-xl bg-slate-50 dark:bg-slate-800 hover:bg-amber-50 dark:hover:bg-amber-900/20 hover:text-amber-600 transition-all duration-200 group"
                    >
                        <span className="material-symbols-outlined text-3xl text-slate-400 group-hover:text-amber-600 transition-colors">receipt</span>
                        <span className="text-sm font-medium">Nouvelle Facture</span>
                    </Link>
                    <Link 
                        to="/employees" 
                        className="flex flex-col items-center gap-3 p-4 rounded-xl bg-slate-50 dark:bg-slate-800 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 hover:text-indigo-600 transition-all duration-200 group"
                    >
                        <span className="material-symbols-outlined text-3xl text-slate-400 group-hover:text-indigo-600 transition-colors">badge</span>
                        <span className="text-sm font-medium">Nouvel Employé</span>
                    </Link>
                    <Link 
                        to="/payslips" 
                        className="flex flex-col items-center gap-3 p-4 rounded-xl bg-slate-50 dark:bg-slate-800 hover:bg-cyan-50 dark:hover:bg-cyan-900/20 hover:text-cyan-600 transition-all duration-200 group"
                    >
                        <span className="material-symbols-outlined text-3xl text-slate-400 group-hover:text-cyan-600 transition-colors">payments</span>
                        <span className="text-sm font-medium">Fiche de Paie</span>
                    </Link>
                </div>
            </div>

            {/* Recent Data Summary */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Quick Stats Summary */}
                <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-6">
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Résumé</h3>
                    <div className="space-y-4">
                        <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800 rounded-xl">
                            <div className="flex items-center gap-3">
                                <span className="material-symbols-outlined text-emerald-500">inventory_2</span>
                                <span className="font-medium">Produits en stock</span>
                            </div>
                            <span className="text-xl font-bold text-emerald-600">{stats.total_products}</span>
                        </div>
                        <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800 rounded-xl">
                            <div className="flex items-center gap-3">
                                <span className="material-symbols-outlined text-blue-500">people</span>
                                <span className="font-medium">Clients actifs</span>
                            </div>
                            <span className="text-xl font-bold text-blue-600">{stats.total_clients}</span>
                        </div>
                        <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800 rounded-xl">
                            <div className="flex items-center gap-3">
                                <span className="material-symbols-outlined text-amber-500">receipt_long</span>
                                <span className="font-medium">Factures en attente</span>
                            </div>
                            <span className="text-xl font-bold text-amber-600">{stats.pending_invoices}</span>
                        </div>
                        <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800 rounded-xl">
                            <div className="flex items-center gap-3">
                                <span className="material-symbols-outlined text-rose-500">warning</span>
                                <span className="font-medium">Alertes de stock</span>
                            </div>
                            <span className="text-xl font-bold text-rose-600">{stats.low_stock_alerts}</span>
                        </div>
                    </div>
                </div>

                {/* Info Panel */}
                <div className="bg-gradient-to-br from-purple-600 to-blue-600 rounded-2xl shadow-sm p-6 text-white">
                    <h3 className="text-lg font-bold mb-4">Bienvenue sur Micro ERP</h3>
                    <p className="text-white/80 text-sm mb-6">
                        Votre solution de gestion d'entreprise complète. Gérez vos produits, clients, devis, factures et ressources humaines en un seul endroit.
                    </p>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
                            <p className="text-2xl font-bold">{stats.total_products + stats.total_clients}</p>
                            <p className="text-xs text-white/70">Total enregistrements</p>
                        </div>
                        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
                            <p className="text-2xl font-bold">{stats.total_employees}</p>
                            <p className="text-xs text-white/70">Équipe</p>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default Dashboard;
