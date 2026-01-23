// src/pages/Subscriptions.jsx
import { useState, useEffect, useCallback } from 'react';
import { subscriptionService } from '../services/contractService';
import { clientService } from '../services/clientService';
import { formatCurrency } from '../utils/currency';
import { useToast } from '../contexts/ToastContext';

const Subscriptions = () => {
    const [subscriptions, setSubscriptions] = useState([]);
    const [clients, setClients] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [filter, setFilter] = useState('all');
    const [formData, setFormData] = useState({
        client_id: '', name: '', start_date: new Date().toISOString().split('T')[0],
        billing_cycle: 'monthly', amount: ''
    });
    const { showToast } = useToast();

    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            const status = filter !== 'all' ? filter : null;
            const [subsRes, clientsRes] = await Promise.allSettled([
                subscriptionService.getAll(status), clientService.getAll()
            ]);
            if (subsRes.status === 'fulfilled') setSubscriptions(subsRes.value.data || subsRes.value || []);
            if (clientsRes.status === 'fulfilled') setClients(clientsRes.value.data || clientsRes.value || []);
        } catch (err) { showToast('Erreur', 'error'); }
        finally { setLoading(false); }
    }, [filter, showToast]);

    useEffect(() => { fetchData(); }, [fetchData]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await subscriptionService.create(formData);
            showToast('Abonnement créé', 'success');
            setShowModal(false);
            fetchData();
        } catch (err) { showToast('Erreur', 'error'); }
    };

    const handleAction = async (id, action) => {
        try {
            if (action === 'pause') await subscriptionService.pause(id);
            else if (action === 'resume') await subscriptionService.resume(id);
            else if (action === 'cancel') await subscriptionService.cancel(id);
            else if (action === 'invoice') await subscriptionService.generateInvoice(id);
            showToast('Action effectuée', 'success');
            fetchData();
        } catch (err) { showToast('Erreur', 'error'); }
    };

    const getStatusBadge = (status) => {
        const styles = {
            active: 'bg-emerald-100 text-emerald-700', paused: 'bg-amber-100 text-amber-700',
            cancelled: 'bg-rose-100 text-rose-700'
        };
        const labels = { active: 'Actif', paused: 'En pause', cancelled: 'Annulé' };
        return <span className={`px-2 py-1 rounded-full text-xs font-medium ${styles[status] || 'bg-slate-100 text-slate-700'}`}>{labels[status] || status}</span>;
    };

    return (
        <>
            <div className="flex items-center justify-between">
                <div>
                    <nav className="flex items-center gap-2 text-xs font-medium text-slate-400 mb-1">
                        <span>Commercial</span><span>/</span><span className="text-slate-800 dark:text-slate-200">Abonnements</span>
                    </nav>
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Gestion des Abonnements</h2>
                </div>
                <button onClick={() => setShowModal(true)} className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl text-sm font-semibold shadow-lg">
                    <span className="material-symbols-outlined text-lg">add</span>Nouvel Abonnement
                </button>
            </div>

            <div className="flex gap-2">
                {['all', 'active', 'paused', 'cancelled'].map(f => (
                    <button key={f} onClick={() => setFilter(f)} className={`px-4 py-2 rounded-lg text-sm font-medium ${filter === f ? 'bg-purple-600 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-600'}`}>
                        {f === 'all' ? 'Tous' : f === 'active' ? 'Actifs' : f === 'paused' ? 'En pause' : 'Annulés'}
                    </button>
                ))}
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
                {loading ? (
                    <div className="flex items-center justify-center h-64"><div className="w-10 h-10 border-4 border-purple-600 border-t-transparent rounded-full animate-spin"></div></div>
                ) : subscriptions.length === 0 ? (
                    <div className="text-center py-16"><span className="material-symbols-outlined text-6xl text-slate-300 mb-4">autorenew</span><p className="text-slate-500">Aucun abonnement</p></div>
                ) : (
                    <table className="w-full">
                        <thead className="bg-slate-50 dark:bg-slate-800">
                            <tr>
                                <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase">Abonnement</th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase">Client</th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase">Cycle</th>
                                <th className="px-6 py-4 text-right text-xs font-bold text-slate-500 uppercase">Montant</th>
                                <th className="px-6 py-4 text-center text-xs font-bold text-slate-500 uppercase">Statut</th>
                                <th className="px-6 py-4 text-center text-xs font-bold text-slate-500 uppercase">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                            {subscriptions.map((s) => (
                                <tr key={s.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                                    <td className="px-6 py-4"><span className="font-semibold text-slate-900 dark:text-white">{s.name}</span></td>
                                    <td className="px-6 py-4 text-sm text-slate-600">{s.client?.name || '-'}</td>
                                    <td className="px-6 py-4 text-sm text-slate-600">{s.billing_cycle === 'monthly' ? 'Mensuel' : s.billing_cycle === 'yearly' ? 'Annuel' : s.billing_cycle}</td>
                                    <td className="px-6 py-4 text-right font-bold">{formatCurrency(s.amount || 0)}</td>
                                    <td className="px-6 py-4 text-center">{getStatusBadge(s.status)}</td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center justify-center gap-1">
                                            {s.status === 'active' && <button onClick={() => handleAction(s.id, 'pause')} className="p-2 hover:bg-amber-50 rounded-lg text-amber-600" title="Pause"><span className="material-symbols-outlined">pause</span></button>}
                                            {s.status === 'paused' && <button onClick={() => handleAction(s.id, 'resume')} className="p-2 hover:bg-emerald-50 rounded-lg text-emerald-600" title="Reprendre"><span className="material-symbols-outlined">play_arrow</span></button>}
                                            {s.status === 'active' && <button onClick={() => handleAction(s.id, 'invoice')} className="p-2 hover:bg-blue-50 rounded-lg text-blue-600" title="Facturer"><span className="material-symbols-outlined">receipt</span></button>}
                                            {s.status !== 'cancelled' && <button onClick={() => handleAction(s.id, 'cancel')} className="p-2 hover:bg-red-50 rounded-lg text-red-600" title="Annuler"><span className="material-symbols-outlined">cancel</span></button>}
                                        </div>
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
                        <div className="p-6 border-b border-slate-200 dark:border-slate-800"><h3 className="text-xl font-bold">Nouvel Abonnement</h3></div>
                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            <select value={formData.client_id} onChange={(e) => setFormData({ ...formData, client_id: e.target.value })} className="w-full px-4 py-2 border rounded-lg dark:bg-slate-800" required>
                                <option value="">Sélectionner un client</option>
                                {clients.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                            </select>
                            <input type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="w-full px-4 py-2 border rounded-lg dark:bg-slate-800" required placeholder="Nom de l'abonnement" />
                            <div className="grid grid-cols-2 gap-4">
                                <input type="date" value={formData.start_date} onChange={(e) => setFormData({ ...formData, start_date: e.target.value })} className="w-full px-4 py-2 border rounded-lg dark:bg-slate-800" required />
                                <select value={formData.billing_cycle} onChange={(e) => setFormData({ ...formData, billing_cycle: e.target.value })} className="w-full px-4 py-2 border rounded-lg dark:bg-slate-800">
                                    <option value="monthly">Mensuel</option>
                                    <option value="quarterly">Trimestriel</option>
                                    <option value="yearly">Annuel</option>
                                </select>
                            </div>
                            <input type="number" value={formData.amount} onChange={(e) => setFormData({ ...formData, amount: e.target.value })} className="w-full px-4 py-2 border rounded-lg dark:bg-slate-800" required placeholder="Montant" />
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

export default Subscriptions;
