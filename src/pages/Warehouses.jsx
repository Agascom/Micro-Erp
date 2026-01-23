// src/pages/Warehouses.jsx
import { useState, useEffect, useCallback } from 'react';
import { warehouseService } from '../services/warehouseService';
import { useToast } from '../contexts/ToastContext';

const Warehouses = () => {
    const [warehouses, setWarehouses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [showTransferModal, setShowTransferModal] = useState(false);
    const [formData, setFormData] = useState({ name: '', code: '', address: '', phone: '', manager_name: '', is_default: false });
    const [transferData, setTransferData] = useState({ product_id: '', from_warehouse_id: '', to_warehouse_id: '', quantity: '' });
    const { showToast } = useToast();

    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            const res = await warehouseService.getAll();
            setWarehouses(res.data || res || []);
        } catch (err) { showToast('Erreur', 'error'); }
        finally { setLoading(false); }
    }, [showToast]);

    useEffect(() => { fetchData(); }, [fetchData]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await warehouseService.create(formData);
            showToast('Entrepôt créé', 'success');
            setShowModal(false);
            setFormData({ name: '', code: '', address: '', phone: '', manager_name: '', is_default: false });
            fetchData();
        } catch (err) { showToast('Erreur', 'error'); }
    };

    const handleTransfer = async (e) => {
        e.preventDefault();
        try {
            await warehouseService.transferStock(transferData);
            showToast('Transfert effectué', 'success');
            setShowTransferModal(false);
            fetchData();
        } catch (err) { showToast('Erreur', 'error'); }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Supprimer cet entrepôt ?')) return;
        try { await warehouseService.delete(id); showToast('Supprimé', 'success'); fetchData(); }
        catch (err) { showToast('Erreur', 'error'); }
    };

    return (
        <>
            <div className="flex items-center justify-between">
                <div>
                    <nav className="flex items-center gap-2 text-xs font-medium text-slate-400 mb-1">
                        <span>Inventaire</span><span>/</span><span className="text-slate-800 dark:text-slate-200">Entrepôts</span>
                    </nav>
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Gestion des Entrepôts</h2>
                </div>
                <div className="flex gap-2">
                    <button onClick={() => setShowTransferModal(true)} className="flex items-center gap-2 px-4 py-2 bg-amber-500 text-white rounded-xl text-sm font-semibold">
                        <span className="material-symbols-outlined text-lg">swap_horiz</span>Transfert
                    </button>
                    <button onClick={() => setShowModal(true)} className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl text-sm font-semibold shadow-lg">
                        <span className="material-symbols-outlined text-lg">add</span>Nouvel Entrepôt
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {loading ? (
                    <div className="col-span-full flex items-center justify-center h-64"><div className="w-10 h-10 border-4 border-purple-600 border-t-transparent rounded-full animate-spin"></div></div>
                ) : warehouses.length === 0 ? (
                    <div className="col-span-full text-center py-16"><span className="material-symbols-outlined text-6xl text-slate-300 mb-4">warehouse</span><p className="text-slate-500">Aucun entrepôt</p></div>
                ) : (
                    warehouses.map((w) => (
                        <div key={w.id} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-6 hover:shadow-lg transition-shadow">
                            <div className="flex items-start justify-between mb-4">
                                <div className="flex items-center gap-3">
                                    <span className="material-symbols-outlined text-3xl text-purple-600 bg-purple-100 dark:bg-purple-900/30 p-3 rounded-xl">warehouse</span>
                                    <div>
                                        <h3 className="font-bold text-slate-900 dark:text-white">{w.name}</h3>
                                        <p className="text-sm text-slate-500">{w.code}</p>
                                    </div>
                                </div>
                                {w.is_default && <span className="px-2 py-1 bg-emerald-100 text-emerald-700 rounded-full text-xs font-medium">Principal</span>}
                            </div>
                            <div className="space-y-2 text-sm text-slate-600 dark:text-slate-400">
                                {w.address && <p className="flex items-center gap-2"><span className="material-symbols-outlined text-lg">location_on</span>{w.address}</p>}
                                {w.phone && <p className="flex items-center gap-2"><span className="material-symbols-outlined text-lg">phone</span>{w.phone}</p>}
                                {w.manager_name && <p className="flex items-center gap-2"><span className="material-symbols-outlined text-lg">person</span>{w.manager_name}</p>}
                            </div>
                            <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-200 dark:border-slate-800">
                                <span className="text-lg font-bold text-purple-600">{w.total_stock || 0} articles</span>
                                <button onClick={() => handleDelete(w.id)} className="p-2 hover:bg-red-50 rounded-lg text-red-600"><span className="material-symbols-outlined">delete</span></button>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
                    <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-lg mx-4">
                        <div className="p-6 border-b border-slate-200 dark:border-slate-800"><h3 className="text-xl font-bold">Nouvel Entrepôt</h3></div>
                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <input type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="w-full px-4 py-2 border rounded-lg dark:bg-slate-800" required placeholder="Nom" />
                                <input type="text" value={formData.code} onChange={(e) => setFormData({ ...formData, code: e.target.value })} className="w-full px-4 py-2 border rounded-lg dark:bg-slate-800" required placeholder="Code" />
                            </div>
                            <input type="text" value={formData.address} onChange={(e) => setFormData({ ...formData, address: e.target.value })} className="w-full px-4 py-2 border rounded-lg dark:bg-slate-800" placeholder="Adresse" />
                            <div className="grid grid-cols-2 gap-4">
                                <input type="text" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} className="w-full px-4 py-2 border rounded-lg dark:bg-slate-800" placeholder="Téléphone" />
                                <input type="text" value={formData.manager_name} onChange={(e) => setFormData({ ...formData, manager_name: e.target.value })} className="w-full px-4 py-2 border rounded-lg dark:bg-slate-800" placeholder="Responsable" />
                            </div>
                            <label className="flex items-center gap-2"><input type="checkbox" checked={formData.is_default} onChange={(e) => setFormData({ ...formData, is_default: e.target.checked })} className="rounded" /><span className="text-sm">Entrepôt principal</span></label>
                            <div className="flex gap-3 pt-4">
                                <button type="button" onClick={() => setShowModal(false)} className="flex-1 px-4 py-2 border rounded-lg">Annuler</button>
                                <button type="submit" className="flex-1 px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg font-semibold">Créer</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {showTransferModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
                    <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-md mx-4">
                        <div className="p-6 border-b border-slate-200 dark:border-slate-800"><h3 className="text-xl font-bold">Transfert de Stock</h3></div>
                        <form onSubmit={handleTransfer} className="p-6 space-y-4">
                            <input type="number" value={transferData.product_id} onChange={(e) => setTransferData({ ...transferData, product_id: e.target.value })} className="w-full px-4 py-2 border rounded-lg dark:bg-slate-800" required placeholder="ID Produit" />
                            <select value={transferData.from_warehouse_id} onChange={(e) => setTransferData({ ...transferData, from_warehouse_id: e.target.value })} className="w-full px-4 py-2 border rounded-lg dark:bg-slate-800" required>
                                <option value="">Entrepôt source</option>
                                {warehouses.map((w) => <option key={w.id} value={w.id}>{w.name}</option>)}
                            </select>
                            <select value={transferData.to_warehouse_id} onChange={(e) => setTransferData({ ...transferData, to_warehouse_id: e.target.value })} className="w-full px-4 py-2 border rounded-lg dark:bg-slate-800" required>
                                <option value="">Entrepôt destination</option>
                                {warehouses.map((w) => <option key={w.id} value={w.id}>{w.name}</option>)}
                            </select>
                            <input type="number" value={transferData.quantity} onChange={(e) => setTransferData({ ...transferData, quantity: e.target.value })} className="w-full px-4 py-2 border rounded-lg dark:bg-slate-800" required placeholder="Quantité" min="1" />
                            <div className="flex gap-3 pt-4">
                                <button type="button" onClick={() => setShowTransferModal(false)} className="flex-1 px-4 py-2 border rounded-lg">Annuler</button>
                                <button type="submit" className="flex-1 px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg font-semibold">Transférer</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </>
    );
};

export default Warehouses;
