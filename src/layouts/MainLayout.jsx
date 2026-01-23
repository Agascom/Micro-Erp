// src/layouts/MainLayout.jsx
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useState } from 'react';

const MainLayout = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [showUserMenu, setShowUserMenu] = useState(false);

    const handleLogout = async () => {
        await logout();
        navigate('/login');
    };

    const navItems = [
        { type: 'header', label: 'Vue d\'ensemble' },
        { type: 'link', to: '/dashboard', icon: 'dashboard', label: 'Tableau de bord' },
        { type: 'link', to: '/kpi', icon: 'analytics', label: 'KPIs & Objectifs' },
        { type: 'link', to: '/reports', icon: 'bar_chart', label: 'Rapports' },

        { type: 'header', label: 'Commercial' },
        { type: 'link', to: '/clients', icon: 'people', label: 'Clients' },
        { type: 'link', to: '/appointments', icon: 'calendar_month', label: 'Rendez-vous' },
        { type: 'link', to: '/follow-ups', icon: 'history', label: 'Suivi & Relances' },
        { type: 'link', to: '/quotes', icon: 'request_quote', label: 'Devis' },
        { type: 'link', to: '/contracts', icon: 'description', label: 'Contrats' },
        { type: 'link', to: '/subscriptions', icon: 'autorenew', label: 'Abonnements' },

        { type: 'header', label: 'Ventes' },
        { type: 'link', to: '/invoices', icon: 'receipt_long', label: 'Factures' },
        { type: 'link', to: '/payments', icon: 'payments', label: 'Paiements' },

        { type: 'header', label: 'Achats & Stock' },
        { type: 'link', to: '/products', icon: 'inventory_2', label: 'Produits' },
        { type: 'link', to: '/categories', icon: 'category', label: 'Catégories' },
        { type: 'link', to: '/suppliers', icon: 'local_shipping', label: 'Fournisseurs' },
        { type: 'link', to: '/purchase-orders', icon: 'shopping_cart', label: 'Commandes' },
        { type: 'link', to: '/stock', icon: 'inventory', label: 'Stock' },
        { type: 'link', to: '/warehouses', icon: 'warehouse', label: 'Entrepôts' },

        { type: 'header', label: 'Projets' },
        { type: 'link', to: '/projects', icon: 'rocket_launch', label: 'Projets' },

        { type: 'header', label: 'RH' },
        { type: 'link', to: '/employees', icon: 'badge', label: 'Employés' },
        { type: 'link', to: '/attendance', icon: 'schedule', label: 'Présences' },
        { type: 'link', to: '/payslips', icon: 'payments', label: 'Fiches de Paie' },
        { type: 'link', to: '/roles', icon: 'security', label: 'Rôles & Accès' },

        { type: 'header', label: 'Finance' },
        { type: 'link', to: '/expenses', icon: 'account_balance_wallet', label: 'Dépenses' },
        { type: 'link', to: '/accounting', icon: 'account_balance', label: 'Comptabilité' },

        { type: 'header', label: 'Administration' },
        { type: 'link', to: '/users', icon: 'manage_accounts', label: 'Utilisateurs' },
        { type: 'link', to: '/companies', icon: 'business', label: 'Entreprises' },
        { type: 'link', to: '/audit', icon: 'history', label: 'Audit & Logs' },
        { type: 'link', to: '/api-keys', icon: 'key', label: 'API & Webhooks' },
    ];

    return (
        <div className="bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 min-h-screen flex">
            {/* Sidebar */}
            <aside className="w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col fixed h-full z-40 overflow-hidden">
                {/* Logo */}
                <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex-shrink-0">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-purple-500/20">
                            <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
                                <path d="M42.4379 44C42.4379 44 36.0744 33.9038 41.1692 24C46.8624 12.9336 42.2078 4 42.2078 4L7.01134 4C7.01134 4 11.6577 12.932 5.96912 23.9969C0.876273 33.9029 7.27094 44 7.27094 44L42.4379 44Z" fill="currentColor"></path>
                            </svg>
                        </div>
                        <div>
                            <h1 className="text-lg font-bold text-slate-900 dark:text-white leading-tight">Micro ERP</h1>
                            <p className="text-xs text-slate-500 font-medium">Gestion Premium</p>
                        </div>
                    </div>
                </div>

                {/* Navigation */}
                <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto custom-scrollbar">
                    {navItems.map((item, index) => {
                        if (item.type === 'header') {
                            return (
                                <div key={index} className="px-4 pt-4 pb-2">
                                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">{item.label}</p>
                                </div>
                            );
                        }
                        return (
                            <NavLink
                                key={item.to}
                                to={item.to}
                                className={({ isActive }) =>
                                    `flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group ${
                                        isActive
                                            ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg shadow-purple-500/20'
                                            : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'
                                    }`
                                }
                            >
                                <span className="material-symbols-outlined text-[20px]">{item.icon}</span>
                                {item.label}
                            </NavLink>
                        );
                    })}
                </nav>

                {/* User Section */}
                <div className="p-4 border-t border-slate-200 dark:border-slate-800">
                    <div className="relative">
                        <button
                            onClick={() => setShowUserMenu(!showUserMenu)}
                            className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                        >
                            <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full flex items-center justify-center text-white font-bold">
                                {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                            </div>
                            <div className="flex-1 text-left">
                                <p className="text-sm font-semibold text-slate-900 dark:text-white truncate">{user?.name}</p>
                                <p className="text-xs text-slate-500 truncate">{user?.email}</p>
                            </div>
                            <span className="material-symbols-outlined text-slate-400">expand_more</span>
                        </button>

                        {showUserMenu && (
                            <div className="absolute bottom-full left-0 right-0 mb-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-lg overflow-hidden">
                                <button
                                    onClick={handleLogout}
                                    className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                                >
                                    <span className="material-symbols-outlined">logout</span>
                                    Déconnexion
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 ml-64 min-h-screen">
                <div className="p-8 space-y-6">
                    <Outlet />
                </div>
            </main>
        </div>
    );
};

export default MainLayout;
