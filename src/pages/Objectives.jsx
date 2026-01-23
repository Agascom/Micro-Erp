// src/pages/Objectives.jsx
import { useState, useEffect, useCallback } from 'react';
import { kpiService } from '../services/kpiService';
import { formatCurrency } from '../utils/currency';
import { useToast } from '../contexts/ToastContext';

const Objectives = () => {
    const [objectives, setObjectives] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [filter, setFilter] = useState('all');
    const [formData, setFormData] = useState({
        name: '',
        type: 'revenue',
        period: 'monthly',
        start_date: new Date().toISOString().split('T')[0],
        end_date: '',
        target_value: ''
    });
    const { showToast } = useToast();

    const fetchObjectives = useCallback(async () => {
        setLoading(true);
        try {
            const status = filter !== 'all' ? filter : null;
            const res = await kpiService.getObjectives(status);
            setObjectives(res.data || res || []);
        } catch (err) {
            showToast('Erreur lors du chargement des objectifs', 'error');
        } finally {
            setLoading(false);
        }
    }, [filter, showToast]);

    useEffect(() => {
        fetchObjectives();
    }, [fetchObjectives]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await kpiService.createObjective(formData);
            showToast('Objectif créé avec succès', 'success');
            setShowModal(false);
            setFormData({
                name: '',
                type: 'revenue',
                period: 'monthly',
                start_date: new Date().toISOString().split('T')[0],
                end_date: '',
                target_value: ''
            });
            fetchObjectives();
        } catch (err) {
            showToast('Erreur lors de la création', 'error');
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Supprimer cet objectif ?')) return;
        try {
            await kpiService.deleteObjective(id);
            showToast('Objectif supprimé', 'success');
            fetchObjectives();
        } catch (err) {
            showToast('Erreur lors de la suppression', 'error');
        }
    };

    const handleUpdateProgress = async (id) => {
        try {
            await kpiService.updateObjectiveProgress(id);
            showToast('Progression mise à jour', 'success');
            fetchObjectives();
        } catch (err) {
            showToast('Erreur lors de la mise à jour', 'error');
        }
    };

    const getProgressColor = (progress) => {
        if (progress >= 80) return 'bg-emerald-500';
        if (progress >= 50) return 'bg-amber-500';
        return 'bg-rose-500';
    };

    const getStatusBadge = (status) => {
        const styles = {
            active: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
            completed: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
            failed: 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400'
        };
        const labels = { active: 'En cours', completed: 'Atteint', failed: 'Non atteint' };
        return (
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${styles[status] || styles.active}`}>
                {labels[status] || status}
            </span>
        );
    };

    const typeLabels = {
        revenue: 'Chiffre d\'affaires',
        quantity: 'Quantité vendue',
        new_clients: 'Nouveaux clients',
        invoices_count: 'Nombre de factures'
    };

    return (
        <>
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <nav className="flex items-center gap-2 text-xs font-medium text-slate-400 mb-1">
                        <span>Performance</span>
                        <span>/</span>
                        <span className="text-slate-800 dark:text-slate-200">Objectifs</span>
                    </nav>
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Gestion des Objectifs</h2>
                </div>
                <button
                    onClick={() => setShowModal(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl text-sm font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
                >
                    <span className="material-symbols-outlined text-lg">add</span>
                    Nouvel Objectif
                </button>
            </div>

            {/* Filters */}
            <div className="flex gap-2">
                {[
                    { value: 'all', label: 'Tous' },
                    { value: 'active', label: 'En cours' },
                    { value: 'completed', label: 'Atteints' },
                    { value: 'failed', label: 'Non atteints' }
                ].map(f => (
                    <button
                        key={f.value}
                        onClick={() => setFilter(f.value)}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                            filter === f.value
                                ? 'bg-purple-600 text-white'
                                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                        }`}
                    >
                        {f.label}
                    </button>
                ))}
            </div>

            {/* Objectives List */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
                {loading ? (
                    <div className="flex items-center justify-center h-64">
                        <div className="w-10 h-10 border-4 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
                    </div>
                ) : objectives.length === 0 ? (
                    <div className="text-center py-16">
                        <span className="material-symbols-outlined text-6xl text-slate-300 mb-4">target</span>
                        <p className="text-slate-500 text-lg">Aucun objectif trouvé</p>
                    </div>
                ) : (
                    <div className="divide-y divide-slate-200 dark:divide-slate-800">
                        {objectives.map((obj) => {
                            const progress = obj.target_value > 0
                                ? (obj.current_value / obj.target_value) * 100
                                : 0;
                            return (
                                <div key={obj.id} className="p-6 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                                    <div className="flex items-start justify-between mb-4">
                                        <div>
                                            <div className="flex items-center gap-3 mb-1">
                                                <h4 className="font-bold text-slate-900 dark:text-white text-lg">{obj.name}</h4>
                                                {getStatusBadge(obj.status)}
                                            </div>
                                            <p className="text-sm text-slate-500">
                                                {typeLabels[obj.type] || obj.type} • {obj.period}
                                            </p>
                                            <p className="text-xs text-slate-400 mt-1">
                                                Du {new Date(obj.start_date).toLocaleDateString('fr-FR')} au {new Date(obj.end_date).toLocaleDateString('fr-FR')}
                                            </p>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <button
                                                onClick={() => handleUpdateProgress(obj.id)}
                                                className="p-2 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg text-blue-600 transition-colors"
                                                title="Mettre à jour"
                                            >
                                                <span className="material-symbols-outlined">refresh</span>
                                            </button>
                                            <button
                                                onClick={() => handleDelete(obj.id)}
                                                className="p-2 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg text-red-600 transition-colors"
                                                title="Supprimer"
                                            >
                                                <span className="material-symbols-outlined">delete</span>
                                            </button>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <div className="flex-1">
                                            <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                                                <div
                                                    className={`h-full ${getProgressColor(progress)} rounded-full transition-all duration-500`}
                                                    style={{ width: `${Math.min(progress, 100)}%` }}
                                                ></div>
                                            </div>
                                        </div>
                                        <div className="text-right min-w-[150px]">
                                            <p className="font-bold text-slate-900 dark:text-white">
                                                {obj.type === 'revenue' 
                                                    ? formatCurrency(obj.current_value || 0)
                                                    : (obj.current_value || 0).toLocaleString('fr-FR')}
                                            </p>
                                            <p className="text-sm text-slate-500">
                                                / {obj.type === 'revenue' 
                                                    ? formatCurrency(obj.target_value || 0)
                                                    : (obj.target_value || 0).toLocaleString('fr-FR')}
                                                <span className="ml-2">({progress.toFixed(1)}%)</span>
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
                    <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto">
                        <div className="p-6 border-b border-slate-200 dark:border-slate-800">
                            <h3 className="text-xl font-bold text-slate-900 dark:text-white">Nouvel Objectif</h3>
                        </div>
                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                                    Nom de l'objectif
                                </label>
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-purple-500 dark:bg-slate-800"
                                    required
                                    placeholder="ex: CA Q1 2026"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                                        Type
                                    </label>
                                    <select
                                        value={formData.type}
                                        onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                                        className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-purple-500 dark:bg-slate-800"
                                    >
                                        <option value="revenue">Chiffre d'affaires</option>
                                        <option value="quantity">Quantité vendue</option>
                                        <option value="new_clients">Nouveaux clients</option>
                                        <option value="invoices_count">Nombre de factures</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                                        Période
                                    </label>
                                    <select
                                        value={formData.period}
                                        onChange={(e) => setFormData({ ...formData, period: e.target.value })}
                                        className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-purple-500 dark:bg-slate-800"
                                    >
                                        <option value="weekly">Hebdomadaire</option>
                                        <option value="monthly">Mensuel</option>
                                        <option value="quarterly">Trimestriel</option>
                                        <option value="yearly">Annuel</option>
                                    </select>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                                        Date de début
                                    </label>
                                    <input
                                        type="date"
                                        value={formData.start_date}
                                        onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                                        className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-purple-500 dark:bg-slate-800"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                                        Date de fin
                                    </label>
                                    <input
                                        type="date"
                                        value={formData.end_date}
                                        onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                                        className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-purple-500 dark:bg-slate-800"
                                        required
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                                    Valeur cible
                                </label>
                                <input
                                    type="number"
                                    value={formData.target_value}
                                    onChange={(e) => setFormData({ ...formData, target_value: e.target.value })}
                                    className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-purple-500 dark:bg-slate-800"
                                    required
                                    min="0"
                                    placeholder={formData.type === 'revenue' ? 'ex: 500000000' : 'ex: 100'}
                                />
                            </div>
                            <div className="flex gap-3 pt-4">
                                <button
                                    type="button"
                                    onClick={() => setShowModal(false)}
                                    className="flex-1 px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                                >
                                    Annuler
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg font-semibold hover:shadow-lg transition-all"
                                >
                                    Créer
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </>
    );
};

export default Objectives;
