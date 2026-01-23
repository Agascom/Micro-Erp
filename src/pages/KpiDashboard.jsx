// src/pages/KpiDashboard.jsx
import { useState, useEffect, useCallback } from 'react';
import { kpiService } from '../services/kpiService';
import { useToast } from '../contexts/ToastContext';
import { formatCurrency } from '../utils/currency';

const KpiDashboard = () => {
    const { showToast } = useToast();
    const [activeTab, setActiveTab] = useState('objectives');
    const [objectives, setObjectives] = useState([]);
    const [definitions, setDefinitions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all');
    const [showModal, setShowModal] = useState(false);
    const [modalMode, setModalMode] = useState('objective'); // 'objective' or 'definition'
    const [formData, setFormData] = useState({
        name: '', type: 'revenue', target_value: '', start_date: '', end_date: '', user_id: ''
    });
    const [defFormData, setDefFormData] = useState({
        name: '', code: '', description: '', calculation_formula: '', unit: ''
    });

    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            const [objectivesRes, definitionsRes] = await Promise.allSettled([
                kpiService.getObjectives(),
                kpiService.getDefinitions()
            ]);
            
            if (objectivesRes.status === 'fulfilled') {
                setObjectives(objectivesRes.value.data || objectivesRes.value || []);
            }
            if (definitionsRes.status === 'fulfilled') {
                setDefinitions(definitionsRes.value.data || definitionsRes.value || []);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const getProgressColor = (progress) => {
        if (progress >= 100) return 'bg-emerald-500';
        if (progress >= 80) return 'bg-emerald-400';
        if (progress >= 50) return 'bg-amber-500';
        if (progress >= 25) return 'bg-orange-500';
        return 'bg-rose-500';
    };

    const getStatusBadge = (objective) => {
        const progress = objective.target_value > 0 ? (objective.current_value / objective.target_value) * 100 : 0;
        const endDate = new Date(objective.end_date);
        const now = new Date();
        
        if (progress >= 100) {
            return <span className="px-2 py-1 text-xs font-medium bg-emerald-100 text-emerald-700 rounded-full">Atteint</span>;
        }
        if (endDate < now) {
            return <span className="px-2 py-1 text-xs font-medium bg-rose-100 text-rose-700 rounded-full">Expiré</span>;
        }
        if (progress >= 50) {
            return <span className="px-2 py-1 text-xs font-medium bg-amber-100 text-amber-700 rounded-full">En cours</span>;
        }
        return <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-700 rounded-full">En début</span>;
    };

    const filteredObjectives = objectives.filter(obj => {
        if (filter === 'all') return true;
        const progress = obj.target_value > 0 ? (obj.current_value / obj.target_value) * 100 : 0;
        const endDate = new Date(obj.end_date);
        const now = new Date();
        
        if (filter === 'completed') return progress >= 100;
        if (filter === 'active') return progress < 100 && endDate >= now;
        if (filter === 'expired') return progress < 100 && endDate < now;
        return true;
    });

    const handleCreateObjective = async (e) => {
        e.preventDefault();
        try {
            await kpiService.createObjective(formData);
            showToast('Objectif créé avec succès', 'success');
            setShowModal(false);
            setFormData({ name: '', type: 'revenue', target_value: '', start_date: '', end_date: '', user_id: '' });
            fetchData();
        } catch (err) {
            showToast('Erreur lors de la création', 'error');
        }
    };

    const handleCreateDefinition = async (e) => {
        e.preventDefault();
        try {
            await kpiService.createDefinition(defFormData);
            showToast('Définition KPI créée avec succès', 'success');
            setShowModal(false);
            setDefFormData({ name: '', code: '', description: '', calculation_formula: '', unit: '' });
            fetchData();
        } catch (err) {
            showToast('Erreur lors de la création', 'error');
        }
    };

    const handleDeleteObjective = async (id) => {
        if (!window.confirm('Supprimer cet objectif ?')) return;
        try {
            await kpiService.deleteObjective(id);
            showToast('Objectif supprimé', 'success');
            fetchData();
        } catch (err) {
            showToast('Erreur lors de la suppression', 'error');
        }
    };

    const handleUpdateProgress = async (id) => {
        try {
            await kpiService.updateObjectiveProgress(id);
            showToast('Progression mise à jour', 'success');
            fetchData();
        } catch (err) {
            showToast('Erreur lors de la mise à jour', 'error');
        }
    };

    const openModal = (mode) => {
        setModalMode(mode);
        setShowModal(true);
    };

    // Stats calculation
    const totalObjectives = objectives.length;
    const completedObjectives = objectives.filter(o => (o.current_value / o.target_value) * 100 >= 100).length;
    const activeObjectives = objectives.filter(o => {
        const progress = (o.current_value / o.target_value) * 100;
        const endDate = new Date(o.end_date);
        return progress < 100 && endDate >= new Date();
    }).length;
    const avgProgress = objectives.length > 0 
        ? objectives.reduce((sum, o) => sum + Math.min((o.current_value / o.target_value) * 100, 100), 0) / objectives.length 
        : 0;

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <nav className="flex items-center gap-2 text-xs font-medium text-slate-400 mb-1">
                        <span>Performance</span>
                        <span>/</span>
                        <span className="text-slate-800 dark:text-slate-200">KPIs & Objectifs</span>
                    </nav>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Gestion des KPIs</h1>
                    <p className="text-sm text-slate-500 mt-1">Définissez et suivez vos indicateurs de performance</p>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => openModal('definition')}
                        className="flex items-center gap-2 px-4 py-2.5 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 rounded-xl text-sm font-medium hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                    >
                        <span className="material-symbols-outlined text-lg">tune</span>
                        Définir KPI
                    </button>
                    <button
                        onClick={() => openModal('objective')}
                        className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl text-sm font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
                    >
                        <span className="material-symbols-outlined text-lg">add</span>
                        Nouvel Objectif
                    </button>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800">
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                            <span className="material-symbols-outlined text-purple-600">target</span>
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-slate-900 dark:text-white">{totalObjectives}</p>
                            <p className="text-xs text-slate-500">Total objectifs</p>
                        </div>
                    </div>
                </div>
                <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800">
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg">
                            <span className="material-symbols-outlined text-emerald-600">check_circle</span>
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-slate-900 dark:text-white">{completedObjectives}</p>
                            <p className="text-xs text-slate-500">Atteints</p>
                        </div>
                    </div>
                </div>
                <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800">
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                            <span className="material-symbols-outlined text-blue-600">pending</span>
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-slate-900 dark:text-white">{activeObjectives}</p>
                            <p className="text-xs text-slate-500">En cours</p>
                        </div>
                    </div>
                </div>
                <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800">
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 bg-amber-100 dark:bg-amber-900/30 rounded-lg">
                            <span className="material-symbols-outlined text-amber-600">speed</span>
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-slate-900 dark:text-white">{avgProgress.toFixed(0)}%</p>
                            <p className="text-xs text-slate-500">Progression moyenne</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl w-fit">
                <button
                    onClick={() => setActiveTab('objectives')}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                        activeTab === 'objectives' 
                            ? 'bg-white dark:bg-slate-700 text-purple-600 shadow-sm' 
                            : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                    }`}
                >
                    <span className="material-symbols-outlined text-sm align-middle mr-1">flag</span>
                    Objectifs
                </button>
                <button
                    onClick={() => setActiveTab('definitions')}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                        activeTab === 'definitions' 
                            ? 'bg-white dark:bg-slate-700 text-purple-600 shadow-sm' 
                            : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                    }`}
                >
                    <span className="material-symbols-outlined text-sm align-middle mr-1">tune</span>
                    Définitions KPI
                </button>
            </div>

            {/* Objectives Tab */}
            {activeTab === 'objectives' && (
                <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
                    {/* Filters */}
                    <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-4">
                        <div className="flex items-center gap-2">
                            {['all', 'active', 'completed', 'expired'].map(f => (
                                <button
                                    key={f}
                                    onClick={() => setFilter(f)}
                                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                                        filter === f 
                                            ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400' 
                                            : 'text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800'
                                    }`}
                                >
                                    {f === 'all' ? 'Tous' : f === 'active' ? 'En cours' : f === 'completed' ? 'Atteints' : 'Expirés'}
                                </button>
                            ))}
                        </div>
                        <p className="text-sm text-slate-500">{filteredObjectives.length} objectif(s)</p>
                    </div>

                    {/* Table */}
                    {loading ? (
                        <div className="flex items-center justify-center py-16">
                            <div className="w-10 h-10 border-4 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
                        </div>
                    ) : filteredObjectives.length === 0 ? (
                        <div className="text-center py-16">
                            <span className="material-symbols-outlined text-5xl text-slate-300 mb-4">target</span>
                            <p className="text-slate-500 mb-4">Aucun objectif trouvé</p>
                            <button
                                onClick={() => openModal('objective')}
                                className="inline-flex items-center gap-2 px-4 py-2 bg-purple-50 text-purple-600 rounded-lg hover:bg-purple-100 transition-colors"
                            >
                                <span className="material-symbols-outlined text-sm">add</span>
                                Créer un objectif
                            </button>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-slate-50 dark:bg-slate-800/50">
                                    <tr>
                                        <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Objectif</th>
                                        <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Type</th>
                                        <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Progression</th>
                                        <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Période</th>
                                        <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Statut</th>
                                        <th className="px-6 py-4 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                                    {filteredObjectives.map((obj) => {
                                        const progress = obj.target_value > 0 ? (obj.current_value / obj.target_value) * 100 : 0;
                                        return (
                                            <tr key={obj.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                                                <td className="px-6 py-4">
                                                    <div>
                                                        <p className="font-semibold text-slate-900 dark:text-white">{obj.name}</p>
                                                        <p className="text-sm text-slate-500">
                                                            {obj.type === 'revenue' ? formatCurrency(obj.current_value) : obj.current_value}
                                                            {' / '}
                                                            {obj.type === 'revenue' ? formatCurrency(obj.target_value) : obj.target_value}
                                                        </p>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className="inline-flex items-center gap-1 text-sm text-slate-600 dark:text-slate-400">
                                                        <span className="material-symbols-outlined text-sm">
                                                            {obj.type === 'revenue' ? 'attach_money' : 
                                                             obj.type === 'quantity' ? 'inventory' : 
                                                             obj.type === 'new_clients' ? 'person_add' : 'flag'}
                                                        </span>
                                                        {obj.type === 'revenue' ? 'CA' : 
                                                         obj.type === 'quantity' ? 'Quantité' : 
                                                         obj.type === 'new_clients' ? 'Clients' : obj.type}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 min-w-48">
                                                    <div className="flex items-center gap-3">
                                                        <div className="flex-1 h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                                                            <div 
                                                                className={`h-full ${getProgressColor(progress)} rounded-full transition-all duration-500`}
                                                                style={{ width: `${Math.min(progress, 100)}%` }}
                                                            ></div>
                                                        </div>
                                                        <span className="text-sm font-semibold text-slate-900 dark:text-white min-w-12 text-right">
                                                            {progress.toFixed(0)}%
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-400">
                                                    {new Date(obj.start_date).toLocaleDateString('fr-FR')} - {new Date(obj.end_date).toLocaleDateString('fr-FR')}
                                                </td>
                                                <td className="px-6 py-4">
                                                    {getStatusBadge(obj)}
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <div className="flex items-center justify-end gap-2">
                                                        <button
                                                            onClick={() => handleUpdateProgress(obj.id)}
                                                            className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                                                            title="Actualiser"
                                                        >
                                                            <span className="material-symbols-outlined text-xl">refresh</span>
                                                        </button>
                                                        <button
                                                            onClick={() => handleDeleteObjective(obj.id)}
                                                            className="p-2 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-lg transition-colors"
                                                            title="Supprimer"
                                                        >
                                                            <span className="material-symbols-outlined text-xl">delete</span>
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            )}

            {/* Definitions Tab */}
            {activeTab === 'definitions' && (
                <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
                    <div className="p-4 border-b border-slate-200 dark:border-slate-800">
                        <h3 className="font-semibold text-slate-900 dark:text-white">Indicateurs Clés de Performance</h3>
                        <p className="text-sm text-slate-500">Définissez les formules et métriques de vos KPIs</p>
                    </div>

                    {definitions.length === 0 ? (
                        <div className="text-center py-16">
                            <span className="material-symbols-outlined text-5xl text-slate-300 mb-4">tune</span>
                            <p className="text-slate-500 mb-4">Aucune définition KPI</p>
                            <button
                                onClick={() => openModal('definition')}
                                className="inline-flex items-center gap-2 px-4 py-2 bg-purple-50 text-purple-600 rounded-lg hover:bg-purple-100 transition-colors"
                            >
                                <span className="material-symbols-outlined text-sm">add</span>
                                Créer une définition
                            </button>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-6">
                            {definitions.map((def) => (
                                <div key={def.id} className="p-4 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
                                    <div className="flex items-start justify-between mb-3">
                                        <div>
                                            <h4 className="font-semibold text-slate-900 dark:text-white">{def.name}</h4>
                                            <p className="text-xs text-purple-600 font-mono">{def.code}</p>
                                        </div>
                                        <span className="px-2 py-1 bg-slate-200 dark:bg-slate-700 rounded text-xs text-slate-600 dark:text-slate-400">
                                            {def.unit || 'N/A'}
                                        </span>
                                    </div>
                                    {def.description && (
                                        <p className="text-sm text-slate-500 mb-3">{def.description}</p>
                                    )}
                                    {def.calculation_formula && (
                                        <div className="p-2 bg-slate-100 dark:bg-slate-900 rounded-lg">
                                            <p className="text-xs text-slate-500 font-mono">{def.calculation_formula}</p>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
                        <div className="p-6 border-b border-slate-200 dark:border-slate-800">
                            <div className="flex items-center justify-between">
                                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                                    {modalMode === 'objective' ? 'Nouvel Objectif' : 'Nouvelle Définition KPI'}
                                </h3>
                                <button
                                    onClick={() => setShowModal(false)}
                                    className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"
                                >
                                    <span className="material-symbols-outlined">close</span>
                                </button>
                            </div>
                        </div>
                        
                        <form onSubmit={modalMode === 'objective' ? handleCreateObjective : handleCreateDefinition} className="p-6 space-y-4">
                            {modalMode === 'objective' ? (
                                <>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Nom de l'objectif *</label>
                                        <input
                                            type="text"
                                            value={formData.name}
                                            onChange={(e) => setFormData({...formData, name: e.target.value})}
                                            className="w-full px-4 py-2.5 border border-slate-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                            placeholder="Ex: CA Janvier 2026"
                                            required
                                        />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Type *</label>
                                            <select
                                                value={formData.type}
                                                onChange={(e) => setFormData({...formData, type: e.target.value})}
                                                className="w-full px-4 py-2.5 border border-slate-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-purple-500"
                                                required
                                            >
                                                <option value="revenue">Chiffre d'affaires</option>
                                                <option value="quantity">Quantité vendue</option>
                                                <option value="new_clients">Nouveaux clients</option>
                                                <option value="custom">Personnalisé</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Valeur cible *</label>
                                            <input
                                                type="number"
                                                value={formData.target_value}
                                                onChange={(e) => setFormData({...formData, target_value: e.target.value})}
                                                className="w-full px-4 py-2.5 border border-slate-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-purple-500"
                                                placeholder="1000000"
                                                required
                                            />
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Date de début *</label>
                                            <input
                                                type="date"
                                                value={formData.start_date}
                                                onChange={(e) => setFormData({...formData, start_date: e.target.value})}
                                                className="w-full px-4 py-2.5 border border-slate-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-purple-500"
                                                required
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Date de fin *</label>
                                            <input
                                                type="date"
                                                value={formData.end_date}
                                                onChange={(e) => setFormData({...formData, end_date: e.target.value})}
                                                className="w-full px-4 py-2.5 border border-slate-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-purple-500"
                                                required
                                            />
                                        </div>
                                    </div>
                                </>
                            ) : (
                                <>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Nom du KPI *</label>
                                        <input
                                            type="text"
                                            value={defFormData.name}
                                            onChange={(e) => setDefFormData({...defFormData, name: e.target.value})}
                                            className="w-full px-4 py-2.5 border border-slate-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-purple-500"
                                            placeholder="Taux de conversion"
                                            required
                                        />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Code *</label>
                                            <input
                                                type="text"
                                                value={defFormData.code}
                                                onChange={(e) => setDefFormData({...defFormData, code: e.target.value.toUpperCase()})}
                                                className="w-full px-4 py-2.5 border border-slate-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-mono focus:ring-2 focus:ring-purple-500"
                                                placeholder="CONV_RATE"
                                                required
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Unité</label>
                                            <input
                                                type="text"
                                                value={defFormData.unit}
                                                onChange={(e) => setDefFormData({...defFormData, unit: e.target.value})}
                                                className="w-full px-4 py-2.5 border border-slate-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-purple-500"
                                                placeholder="%"
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Description</label>
                                        <textarea
                                            value={defFormData.description}
                                            onChange={(e) => setDefFormData({...defFormData, description: e.target.value})}
                                            className="w-full px-4 py-2.5 border border-slate-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-purple-500 resize-none"
                                            rows="2"
                                            placeholder="Description du KPI..."
                                        ></textarea>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Formule de calcul</label>
                                        <input
                                            type="text"
                                            value={defFormData.calculation_formula}
                                            onChange={(e) => setDefFormData({...defFormData, calculation_formula: e.target.value})}
                                            className="w-full px-4 py-2.5 border border-slate-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-mono text-sm focus:ring-2 focus:ring-purple-500"
                                            placeholder="(devis_convertis / devis_total) * 100"
                                        />
                                    </div>
                                </>
                            )}

                            <div className="flex justify-end gap-3 pt-4">
                                <button
                                    type="button"
                                    onClick={() => setShowModal(false)}
                                    className="px-4 py-2.5 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                                >
                                    Annuler
                                </button>
                                <button
                                    type="submit"
                                    className="px-6 py-2.5 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all"
                                >
                                    Créer
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default KpiDashboard;
