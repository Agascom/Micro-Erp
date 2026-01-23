// src/pages/Contracts.jsx
import { useState, useEffect, useCallback } from 'react';
import { contractService } from '../services/contractService';
import { clientService } from '../services/clientService';
import { formatCurrency } from '../utils/currency';
import { useToast } from '../contexts/ToastContext';

const Contracts = () => {
    const [contracts, setContracts] = useState([]);
    const [clients, setClients] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [filter, setFilter] = useState('all');
    const [formData, setFormData] = useState({
        client_id: '', title: '', type: 'service',
        start_date: new Date().toISOString().split('T')[0],
        end_date: '', billing_frequency: 'monthly', total_amount: ''
    });
    const { showToast } = useToast();

    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            const status = filter !== 'all' ? filter : null;
            const [contractsRes, clientsRes] = await Promise.allSettled([
                contractService.getAll(status), clientService.getAll()
            ]);
            if (contractsRes.status === 'fulfilled') setContracts(contractsRes.value.data || contractsRes.value || []);
            if (clientsRes.status === 'fulfilled') setClients(clientsRes.value.data || clientsRes.value || []);
        } catch (err) { showToast('Erreur', 'error'); }
        finally { setLoading(false); }
    }, [filter, showToast]);

    useEffect(() => { fetchData(); }, [fetchData]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await contractService.create(formData);
            showToast('Contrat créé', 'success');
            setShowModal(false);
            fetchData();
        } catch (err) { showToast('Erreur', 'error'); }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Supprimer ?')) return;
        try { await contractService.delete(id); showToast('Supprimé', 'success'); fetchData(); }
        catch (err) { showToast('Erreur', 'error'); }
    };

    const getStatusBadge = (status) => {
        const styles = {
            draft: 'bg-slate-100 text-slate-700', active: 'bg-emerald-100 text-emerald-700',
            expired: 'bg-rose-100 text-rose-700', cancelled: 'bg-amber-100 text-amber-700'
        };
        const labels = { draft: 'Brouillon', active: 'Actif', expired: 'Expiré', cancelled: 'Annulé' };
        return <span className={`px-2 py-1 rounded-full text-xs font-medium ${styles[status] || styles.draft}`}>{labels[status] || status}</span>;
    };

    return (
        <>
            <div className="flex items-center justify-between">
                <div>
                    <nav className="flex items-center gap-2 text-xs font-medium text-slate-400 mb-1">
                        <span>Commercial</span><span>/</span><span className="text-slate-800 dark:text-slate-200">Contrats</span>
                    </nav>
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Gestion des Contrats</h2>
                </div>
                <button onClick={() => setShowModal(true)} className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl text-sm font-semibold shadow-lg">
                    <span className="material-symbols-outlined text-lg">add</span>Nouveau Contrat
                </button>
            </div>

            <div className="flex gap-2">
                {['all', 'active', 'draft', 'expired'].map(f => (
                    <button key={f} onClick={() => setFilter(f)} className={`px-4 py-2 rounded-lg text-sm font-medium ${filter === f ? 'bg-purple-600 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-600'}`}>
                        {f === 'all' ? 'Tous' : f === 'active' ? 'Actifs' : f === 'draft' ? 'Brouillons' : 'Expirés'}
                    </button>
                ))}
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
                {loading ? (
                    <div className="flex items-center justify-center h-64"><div className="w-10 h-10 border-4 border-purple-600 border-t-transparent rounded-full animate-spin"></div></div>
                ) : contracts.length === 0 ? (
                    <div className="text-center py-16"><span className="material-symbols-outlined text-6xl text-slate-300 mb-4">description</span><p className="text-slate-500">Aucun contrat</p></div>
                ) : (
                    <table className="w-full">
                        <thead className="bg-slate-50 dark:bg-slate-800">
                            <tr>
                                <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase">Contrat</th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase">Client</th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase">Période</th>
                                <th className="px-6 py-4 text-right text-xs font-bold text-slate-500 uppercase">Montant</th>
                                <th className="px-6 py-4 text-center text-xs font-bold text-slate-500 uppercase">Statut</th>
                                <th className="px-6 py-4 text-center text-xs font-bold text-slate-500 uppercase">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                            {contracts.map((c) => (
                                <tr key={c.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                                    <td className="px-6 py-4"><span className="font-semibold text-slate-900 dark:text-white">{c.title}</span></td>
                                    <td className="px-6 py-4 text-sm text-slate-600">{c.client?.name || '-'}</td>
                                    <td className="px-6 py-4 text-sm text-slate-600">{new Date(c.start_date).toLocaleDateString('fr-FR')} - {new Date(c.end_date).toLocaleDateString('fr-FR')}</td>
                                    <td className="px-6 py-4 text-right font-bold">{formatCurrency(c.total_amount || 0)}</td>
                                    <td className="px-6 py-4 text-center">{getStatusBadge(c.status)}</td>
                                    <td className="px-6 py-4 text-center">
                                        <button onClick={() => handleDelete(c.id)} className="p-2 hover:bg-red-50 rounded-lg text-red-600"><span className="material-symbols-outlined">delete</span></button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>

            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
                    <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-lg mx-4">
                        <div className="p-6 border-b border-slate-200 dark:border-slate-800"><h3 className="text-xl font-bold">Nouveau Contrat</h3></div>
                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            <select value={formData.client_id} onChange={(e) => setFormData({ ...formData, client_id: e.target.value })} className="w-full px-4 py-2 border rounded-lg dark:bg-slate-800" required>
                                <option value="">Sélectionner un client</option>
                                {clients.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                            </select>
                            <input type="text" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} className="w-full px-4 py-2 border rounded-lg dark:bg-slate-800" required placeholder="Titre du contrat" />
                            <div className="grid grid-cols-2 gap-4">
                                <input type="date" value={formData.start_date} onChange={(e) => setFormData({ ...formData, start_date: e.target.value })} className="w-full px-4 py-2 border rounded-lg dark:bg-slate-800" required />
                                <input type="date" value={formData.end_date} onChange={(e) => setFormData({ ...formData, end_date: e.target.value })} className="w-full px-4 py-2 border rounded-lg dark:bg-slate-800" required />
                            </div>
                            <input type="number" value={formData.total_amount} onChange={(e) => setFormData({ ...formData, total_amount: e.target.value })} className="w-full px-4 py-2 border rounded-lg dark:bg-slate-800" required placeholder="Montant" />
                            <div className="flex gap-3 pt-4">
                                <button type="button" onClick={() => setShowModal(false)} className="flex-1 px-4 py-2 border rounded-lg">Annuler</button>
                                <button type="submit" className="flex-1 px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg font-semibold">Créer</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </>
    );
};

export default Contracts;
