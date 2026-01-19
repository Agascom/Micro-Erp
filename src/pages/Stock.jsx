// src/pages/Stock.jsx
import { useState, useEffect } from 'react';
import { stockMovementService } from '../services/stockMovementService';
import { productService } from '../services/productService';

const Stock = () => {
    const [movements, setMovements] = useState([]);
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [formData, setFormData] = useState({
        product_id: '',
        type: 'entry',
        quantity: 1,
        reason: '',
        notes: ''
    });
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [movementsRes, productsRes] = await Promise.all([
                stockMovementService.getAll(),
                productService.getAll()
            ]);
            setMovements(movementsRes.data || movementsRes || []);
            setProducts(productsRes.data || productsRes || []);
        } catch (err) {
            setError('Erreur lors du chargement');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            await stockMovementService.create(formData);
            setShowModal(false);
            setFormData({
                product_id: '',
                type: 'entry',
                quantity: 1,
                reason: '',
                notes: ''
            });
            fetchData();
            setSuccess('Mouvement enregistré avec succès');
            setTimeout(() => setSuccess(''), 3000);
        } catch (err) {
            setError(err.response?.data?.message || 'Erreur lors de la création');
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="w-12 h-12 border-4 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    return (
        <>
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <nav className="flex items-center gap-2 text-xs font-medium text-slate-400 mb-1">
                        <span>Inventaire</span>
                        <span>/</span>
                        <span className="text-slate-800 dark:text-slate-200">Mouvements de Stock</span>
                    </nav>
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Gestion du Stock</h2>
                </div>
                <button
                    onClick={() => setShowModal(true)}
                    className="flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl text-sm font-semibold shadow-lg hover:shadow-xl transition-all"
                >
                    <span className="material-symbols-outlined">add</span>
                    Nouveau Mouvement
                </button>
            </div>

            {error && (
                <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl text-red-600 flex items-center gap-2">
                    <span className="material-symbols-outlined">error</span>
                    {error}
                    <button onClick={() => setError('')} className="ml-auto">
                        <span className="material-symbols-outlined">close</span>
                    </button>
                </div>
            )}

            {success && (
                <div className="p-4 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-xl text-emerald-600 flex items-center gap-2">
                    <span className="material-symbols-outlined">check_circle</span>
                    {success}
                </div>
            )}

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6">
                    <div className="flex items-center justify-between mb-2">
                        <p className="text-sm text-slate-500">Total Produits</p>
                        <span className="material-symbols-outlined text-purple-500 text-2xl">inventory_2</span>
                    </div>
                    <p className="text-3xl font-bold text-slate-900 dark:text-white">{products.length}</p>
                </div>
                <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6">
                    <div className="flex items-center justify-between mb-2">
                        <p className="text-sm text-slate-500">Entrées ce mois</p>
                        <span className="material-symbols-outlined text-emerald-500 text-2xl">arrow_downward</span>
                    </div>
                    <p className="text-3xl font-bold text-emerald-600">
                        {movements.filter(m => m.type === 'entry').length}
                    </p>
                </div>
                <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6">
                    <div className="flex items-center justify-between mb-2">
                        <p className="text-sm text-slate-500">Sorties ce mois</p>
                        <span className="material-symbols-outlined text-red-500 text-2xl">arrow_upward</span>
                    </div>
                    <p className="text-3xl font-bold text-red-600">
                        {movements.filter(m => m.type === 'exit').length}
                    </p>
                </div>
            </div>

            {/* Movements Table */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-slate-200 dark:border-slate-800">
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">Historique des Mouvements</h3>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800">
                                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase">Date</th>
                                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase">Produit</th>
                                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase">Type</th>
                                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase">Quantité</th>
                                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase">Raison</th>
                                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase">Notes</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                            {movements.length === 0 ? (
                                <tr>
                                    <td colSpan="6" className="px-6 py-12 text-center text-slate-500">
                                        Aucun mouvement enregistré
                                    </td>
                                </tr>
                            ) : (
                                movements.map((movement) => (
                                    <tr key={movement.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                                        <td className="px-6 py-4 text-sm text-slate-600">
                                            {new Date(movement.created_at).toLocaleDateString('fr-FR', {
                                                day: '2-digit',
                                                month: 'short',
                                                year: 'numeric',
                                                hour: '2-digit',
                                                minute: '2-digit'
                                            })}
                                        </td>
                                        <td className="px-6 py-4 font-medium text-slate-900 dark:text-white">
                                            {movement.product?.name || '-'}
                                        </td>
                                        <td className="px-6 py-4">
                                            {movement.type === 'entry' ? (
                                                <span className="inline-flex items-center gap-1 px-3 py-1 bg-emerald-100 text-emerald-600 rounded-full text-xs font-bold">
                                                    <span className="material-symbols-outlined text-sm">arrow_downward</span>
                                                    Entrée
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center gap-1 px-3 py-1 bg-red-100 text-red-600 rounded-full text-xs font-bold">
                                                    <span className="material-symbols-outlined text-sm">arrow_upward</span>
                                                    Sortie
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`font-bold ${movement.type === 'entry' ? 'text-emerald-600' : 'text-red-600'}`}>
                                                {movement.type === 'entry' ? '+' : '-'}{movement.quantity}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-slate-600">{movement.reason || '-'}</td>
                                        <td className="px-6 py-4 text-slate-500 text-sm max-w-xs truncate">{movement.notes || '-'}</td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Create Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-lg">
                        <div className="p-6 border-b border-slate-200 dark:border-slate-800">
                            <h3 className="text-xl font-bold text-slate-900 dark:text-white">Nouveau Mouvement de Stock</h3>
                        </div>
                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Produit</label>
                                <select
                                    value={formData.product_id}
                                    onChange={(e) => setFormData({ ...formData, product_id: e.target.value })}
                                    required
                                    className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:ring-2 focus:ring-purple-500"
                                >
                                    <option value="">Sélectionner un produit</option>
                                    {products.map((p) => (
                                        <option key={p.id} value={p.id}>{p.name} (Stock: {p.stock_level})</option>
                                    ))}
                                </select>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Type</label>
                                    <select
                                        value={formData.type}
                                        onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                                        className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:ring-2 focus:ring-purple-500"
                                    >
                                        <option value="entry">Entrée (réception)</option>
                                        <option value="exit">Sortie (expédition)</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Quantité</label>
                                    <input
                                        type="number"
                                        value={formData.quantity}
                                        onChange={(e) => setFormData({ ...formData, quantity: parseInt(e.target.value) })}
                                        min="1"
                                        required
                                        className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:ring-2 focus:ring-purple-500"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Raison</label>
                                <input
                                    type="text"
                                    value={formData.reason}
                                    onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                                    className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:ring-2 focus:ring-purple-500"
                                    placeholder="Ex: Réapprovisionnement, Vente, Inventaire..."
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Notes</label>
                                <textarea
                                    value={formData.notes}
                                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                                    rows="2"
                                    className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:ring-2 focus:ring-purple-500 resize-none"
                                    placeholder="Notes additionnelles..."
                                />
                            </div>
                            <div className="flex gap-3 pt-4">
                                <button
                                    type="button"
                                    onClick={() => setShowModal(false)}
                                    className="flex-1 px-4 py-3 border border-slate-200 dark:border-slate-700 rounded-xl font-medium hover:bg-slate-50 transition-colors"
                                >
                                    Annuler
                                </button>
                                <button
                                    type="submit"
                                    disabled={submitting}
                                    className="flex-1 px-4 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl font-semibold disabled:opacity-50"
                                >
                                    {submitting ? 'Enregistrement...' : 'Enregistrer'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </>
    );
};

export default Stock;
