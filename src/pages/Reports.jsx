// src/pages/Reports.jsx
import { useState, useEffect, useCallback } from 'react';
import { reportService } from '../services/reportService';
import { formatCurrency } from '../utils/currency';
import { useToast } from '../contexts/ToastContext';

const Reports = () => {
    const [activeTab, setActiveTab] = useState('sales');
    const [loading, setLoading] = useState(false);
    const [salesData, setSalesData] = useState(null);
    const [profitabilityData, setProfitabilityData] = useState({ products: [], clients: [] });
    const [inventoryData, setInventoryData] = useState(null);
    const [savedReports, setSavedReports] = useState([]);
    const [filters, setFilters] = useState({
        start_date: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0],
        end_date: new Date().toISOString().split('T')[0],
        group_by: 'day'
    });
    const { showToast } = useToast();

    const fetchSalesReport = useCallback(async () => {
        setLoading(true);
        try {
            const res = await reportService.getSalesReport(filters.start_date, filters.end_date, filters.group_by);
            setSalesData(res.data || res);
        } catch (err) {
            showToast('Erreur lors du chargement du rapport', 'error');
        } finally {
            setLoading(false);
        }
    }, [filters, showToast]);

    const fetchProfitability = useCallback(async () => {
        setLoading(true);
        try {
            const [products, clients] = await Promise.allSettled([
                reportService.getProfitabilityByProduct(filters.start_date, filters.end_date),
                reportService.getProfitabilityByClient(filters.start_date, filters.end_date)
            ]);
            setProfitabilityData({
                products: products.status === 'fulfilled' ? (products.value.data || products.value || []) : [],
                clients: clients.status === 'fulfilled' ? (clients.value.data || clients.value || []) : []
            });
        } catch (err) {
            showToast('Erreur lors du chargement', 'error');
        } finally {
            setLoading(false);
        }
    }, [filters, showToast]);

    const fetchInventory = useCallback(async () => {
        setLoading(true);
        try {
            const res = await reportService.getInventoryReport();
            setInventoryData(res.data || res);
        } catch (err) {
            showToast('Erreur lors du chargement', 'error');
        } finally {
            setLoading(false);
        }
    }, [showToast]);

    const fetchSavedReports = useCallback(async () => {
        try {
            const res = await reportService.getSavedReports();
            setSavedReports(res.data || res || []);
        } catch (err) {
            console.error(err);
        }
    }, []);

    useEffect(() => {
        fetchSavedReports();
    }, [fetchSavedReports]);

    useEffect(() => {
        if (activeTab === 'sales') fetchSalesReport();
        else if (activeTab === 'profitability') fetchProfitability();
        else if (activeTab === 'inventory') fetchInventory();
    }, [activeTab, fetchSalesReport, fetchProfitability, fetchInventory]);

    const handleExport = async (type) => {
        try {
            const blob = await reportService.exportCsv(type, filters.start_date, filters.end_date);
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `${type}_${filters.start_date}_${filters.end_date}.csv`;
            a.click();
            showToast('Export téléchargé', 'success');
        } catch (err) {
            showToast('Erreur lors de l\'export', 'error');
        }
    };

    const handleSaveReport = async () => {
        const name = prompt('Nom du rapport :');
        if (!name) return;
        try {
            await reportService.saveReport({
                name,
                type: activeTab,
                parameters: filters
            });
            showToast('Rapport sauvegardé', 'success');
            fetchSavedReports();
        } catch (err) {
            showToast('Erreur lors de la sauvegarde', 'error');
        }
    };

    const handleDeleteSavedReport = async (id) => {
        if (!window.confirm('Supprimer ce rapport ?')) return;
        try {
            await reportService.deleteSavedReport(id);
            showToast('Rapport supprimé', 'success');
            fetchSavedReports();
        } catch (err) {
            showToast('Erreur lors de la suppression', 'error');
        }
    };

    const tabs = [
        { id: 'sales', label: 'Ventes', icon: 'bar_chart' },
        { id: 'profitability', label: 'Rentabilité', icon: 'insights' },
        { id: 'inventory', label: 'Inventaire', icon: 'inventory' },
        { id: 'saved', label: 'Sauvegardés', icon: 'bookmark' }
    ];

    return (
        <>
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <nav className="flex items-center gap-2 text-xs font-medium text-slate-400 mb-1">
                        <span>Analyse</span>
                        <span>/</span>
                        <span className="text-slate-800 dark:text-slate-200">Rapports</span>
                    </nav>
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Rapports & Statistiques</h2>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={handleSaveReport}
                        className="flex items-center gap-2 px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl text-sm font-semibold hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                    >
                        <span className="material-symbols-outlined text-lg">bookmark_add</span>
                        Sauvegarder
                    </button>
                    <div className="relative group">
                        <button className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl text-sm font-semibold shadow-lg">
                            <span className="material-symbols-outlined text-lg">download</span>
                            Exporter CSV
                        </button>
                        <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10">
                            {['invoices', 'products', 'clients'].map(type => (
                                <button
                                    key={type}
                                    onClick={() => handleExport(type)}
                                    className="w-full px-4 py-2 text-left text-sm hover:bg-slate-50 dark:hover:bg-slate-700 first:rounded-t-xl last:rounded-b-xl"
                                >
                                    {type === 'invoices' ? 'Factures' : type === 'products' ? 'Produits' : 'Clients'}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Filters */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4">
                <div className="flex flex-wrap items-center gap-4">
                    <div className="flex items-center gap-2">
                        <label className="text-sm text-slate-500">Du</label>
                        <input
                            type="date"
                            value={filters.start_date}
                            onChange={(e) => setFilters({ ...filters, start_date: e.target.value })}
                            className="px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg text-sm dark:bg-slate-800"
                        />
                    </div>
                    <div className="flex items-center gap-2">
                        <label className="text-sm text-slate-500">Au</label>
                        <input
                            type="date"
                            value={filters.end_date}
                            onChange={(e) => setFilters({ ...filters, end_date: e.target.value })}
                            className="px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg text-sm dark:bg-slate-800"
                        />
                    </div>
                    <div className="flex items-center gap-2">
                        <label className="text-sm text-slate-500">Grouper par</label>
                        <select
                            value={filters.group_by}
                            onChange={(e) => setFilters({ ...filters, group_by: e.target.value })}
                            className="px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg text-sm dark:bg-slate-800"
                        >
                            <option value="day">Jour</option>
                            <option value="week">Semaine</option>
                            <option value="month">Mois</option>
                            <option value="year">Année</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-2 border-b border-slate-200 dark:border-slate-800">
                {tabs.map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                            activeTab === tab.id
                                ? 'border-purple-600 text-purple-600'
                                : 'border-transparent text-slate-500 hover:text-slate-700'
                        }`}
                    >
                        <span className="material-symbols-outlined text-lg">{tab.icon}</span>
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Content */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-6">
                {loading ? (
                    <div className="flex items-center justify-center h-64">
                        <div className="w-10 h-10 border-4 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
                    </div>
                ) : activeTab === 'sales' ? (
                    <div className="space-y-6">
                        {/* Summary Cards */}
                        {salesData?.summary && (
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-xl">
                                    <p className="text-sm text-purple-600">Total Factures</p>
                                    <p className="text-2xl font-bold text-purple-700">{salesData.summary.total_invoices || 0}</p>
                                </div>
                                <div className="p-4 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl">
                                    <p className="text-sm text-emerald-600">Chiffre d'Affaires</p>
                                    <p className="text-2xl font-bold text-emerald-700">{formatCurrency(salesData.summary.total_revenue || 0)}</p>
                                </div>
                                <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
                                    <p className="text-sm text-blue-600">Factures Payées</p>
                                    <p className="text-2xl font-bold text-blue-700">{salesData.summary.paid_invoices || 0}</p>
                                </div>
                                <div className="p-4 bg-amber-50 dark:bg-amber-900/20 rounded-xl">
                                    <p className="text-sm text-amber-600">En Attente</p>
                                    <p className="text-2xl font-bold text-amber-700">{salesData.summary.pending_invoices || 0}</p>
                                </div>
                            </div>
                        )}

                        {/* Chart Placeholder */}
                        <div className="h-64 bg-slate-50 dark:bg-slate-800 rounded-xl flex items-center justify-center">
                            <div className="text-center">
                                <span className="material-symbols-outlined text-5xl text-slate-300">bar_chart</span>
                                <p className="text-slate-500 mt-2">Graphique des ventes</p>
                                <p className="text-xs text-slate-400">Période: {filters.start_date} - {filters.end_date}</p>
                            </div>
                        </div>

                        {/* Data Table */}
                        {salesData?.data && salesData.data.length > 0 && (
                            <table className="w-full">
                                <thead className="bg-slate-50 dark:bg-slate-800">
                                    <tr>
                                        <th className="px-4 py-3 text-left text-xs font-bold text-slate-500 uppercase">Période</th>
                                        <th className="px-4 py-3 text-right text-xs font-bold text-slate-500 uppercase">Factures</th>
                                        <th className="px-4 py-3 text-right text-xs font-bold text-slate-500 uppercase">Montant</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                                    {salesData.data.map((row, index) => (
                                        <tr key={index}>
                                            <td className="px-4 py-3 text-sm">{row.period || row.date}</td>
                                            <td className="px-4 py-3 text-sm text-right">{row.count || 0}</td>
                                            <td className="px-4 py-3 text-sm text-right font-semibold">{formatCurrency(row.total || 0)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>
                ) : activeTab === 'profitability' ? (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Top Products */}
                        <div>
                            <h4 className="font-bold text-slate-900 dark:text-white mb-4">Top Produits</h4>
                            <div className="space-y-3">
                                {profitabilityData.products.slice(0, 10).map((product, index) => (
                                    <div key={index} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
                                        <div className="flex items-center gap-3">
                                            <span className="w-6 h-6 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center text-xs font-bold">
                                                {index + 1}
                                            </span>
                                            <span className="font-medium">{product.name}</span>
                                        </div>
                                        <span className="font-bold text-emerald-600">{formatCurrency(product.revenue || 0)}</span>
                                    </div>
                                ))}
                                {profitabilityData.products.length === 0 && (
                                    <p className="text-center text-slate-500 py-8">Aucune donnée disponible</p>
                                )}
                            </div>
                        </div>

                        {/* Top Clients */}
                        <div>
                            <h4 className="font-bold text-slate-900 dark:text-white mb-4">Top Clients</h4>
                            <div className="space-y-3">
                                {profitabilityData.clients.slice(0, 10).map((client, index) => (
                                    <div key={index} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
                                        <div className="flex items-center gap-3">
                                            <span className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-bold">
                                                {index + 1}
                                            </span>
                                            <span className="font-medium">{client.name}</span>
                                        </div>
                                        <span className="font-bold text-emerald-600">{formatCurrency(client.revenue || 0)}</span>
                                    </div>
                                ))}
                                {profitabilityData.clients.length === 0 && (
                                    <p className="text-center text-slate-500 py-8">Aucune donnée disponible</p>
                                )}
                            </div>
                        </div>
                    </div>
                ) : activeTab === 'inventory' ? (
                    <div className="space-y-6">
                        {inventoryData?.summary && (
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
                                    <p className="text-sm text-blue-600">Total Produits</p>
                                    <p className="text-2xl font-bold text-blue-700">{inventoryData.summary.total_products || 0}</p>
                                </div>
                                <div className="p-4 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl">
                                    <p className="text-sm text-emerald-600">En Stock</p>
                                    <p className="text-2xl font-bold text-emerald-700">{inventoryData.summary.in_stock || 0}</p>
                                </div>
                                <div className="p-4 bg-amber-50 dark:bg-amber-900/20 rounded-xl">
                                    <p className="text-sm text-amber-600">Stock Faible</p>
                                    <p className="text-2xl font-bold text-amber-700">{inventoryData.summary.low_stock || 0}</p>
                                </div>
                                <div className="p-4 bg-rose-50 dark:bg-rose-900/20 rounded-xl">
                                    <p className="text-sm text-rose-600">Rupture</p>
                                    <p className="text-2xl font-bold text-rose-700">{inventoryData.summary.out_of_stock || 0}</p>
                                </div>
                            </div>
                        )}
                        <p className="text-center text-slate-500 py-8">Rapport d'inventaire détaillé</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        <h4 className="font-bold text-slate-900 dark:text-white">Rapports Sauvegardés</h4>
                        {savedReports.length === 0 ? (
                            <p className="text-center text-slate-500 py-8">Aucun rapport sauvegardé</p>
                        ) : (
                            <div className="divide-y divide-slate-200 dark:divide-slate-800">
                                {savedReports.map((report) => (
                                    <div key={report.id} className="py-4 flex items-center justify-between">
                                        <div>
                                            <h5 className="font-semibold text-slate-900 dark:text-white">{report.name}</h5>
                                            <p className="text-sm text-slate-500">
                                                {report.type} • Créé le {new Date(report.created_at).toLocaleDateString('fr-FR')}
                                            </p>
                                        </div>
                                        <button
                                            onClick={() => handleDeleteSavedReport(report.id)}
                                            className="p-2 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg text-red-600"
                                        >
                                            <span className="material-symbols-outlined">delete</span>
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </>
    );
};

export default Reports;
