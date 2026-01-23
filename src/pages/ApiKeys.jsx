// src/pages/ApiKeys.jsx
import { useState, useEffect, useCallback } from 'react';
import { apiKeyService, webhookService } from '../services/apiManagementService';
import { useToast } from '../contexts/ToastContext';

const ApiKeys = () => {
    const [apiKeys, setApiKeys] = useState([]);
    const [webhooks, setWebhooks] = useState([]);
    const [availableEvents, setAvailableEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('keys');
    const [showKeyModal, setShowKeyModal] = useState(false);
    const [showWebhookModal, setShowWebhookModal] = useState(false);
    const [newKeySecret, setNewKeySecret] = useState('');
    const [keyForm, setKeyForm] = useState({ name: '', permissions: [], rate_limit: 1000 });
    const [webhookForm, setWebhookForm] = useState({ name: '', url: '', events: [] });
    const { showToast } = useToast();

    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            const [keysRes, webhooksRes, eventsRes] = await Promise.allSettled([
                apiKeyService.getAll(), webhookService.getAll(), webhookService.getAvailableEvents()
            ]);
            if (keysRes.status === 'fulfilled') setApiKeys(keysRes.value.data || keysRes.value || []);
            if (webhooksRes.status === 'fulfilled') setWebhooks(webhooksRes.value.data || webhooksRes.value || []);
            if (eventsRes.status === 'fulfilled') setAvailableEvents(eventsRes.value.data || eventsRes.value || []);
        } catch (err) { showToast('Erreur', 'error'); }
        finally { setLoading(false); }
    }, [showToast]);

    useEffect(() => { fetchData(); }, [fetchData]);

    const handleCreateKey = async (e) => {
        e.preventDefault();
        try {
            const res = await apiKeyService.create(keyForm);
            setNewKeySecret(res.secret || res.data?.secret || '');
            showToast('Clé API créée', 'success');
            fetchData();
        } catch (err) { showToast('Erreur', 'error'); }
    };

    const handleRevokeKey = async (id) => {
        if (!window.confirm('Révoquer cette clé ?')) return;
        try { await apiKeyService.revoke(id); showToast('Clé révoquée', 'success'); fetchData(); }
        catch (err) { showToast('Erreur', 'error'); }
    };

    const handleCreateWebhook = async (e) => {
        e.preventDefault();
        try {
            await webhookService.create(webhookForm);
            showToast('Webhook créé', 'success');
            setShowWebhookModal(false);
            fetchData();
        } catch (err) { showToast('Erreur', 'error'); }
    };

    const handleTestWebhook = async (id) => {
        try { await webhookService.test(id); showToast('Test envoyé', 'success'); }
        catch (err) { showToast('Erreur lors du test', 'error'); }
    };

    const handleDeleteWebhook = async (id) => {
        if (!window.confirm('Supprimer ce webhook ?')) return;
        try { await webhookService.delete(id); showToast('Supprimé', 'success'); fetchData(); }
        catch (err) { showToast('Erreur', 'error'); }
    };

    return (
        <>
            <div className="flex items-center justify-between">
                <div>
                    <nav className="flex items-center gap-2 text-xs font-medium text-slate-400 mb-1">
                        <span>Paramètres</span><span>/</span><span className="text-slate-800 dark:text-slate-200">API & Webhooks</span>
                    </nav>
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Gestion API</h2>
                </div>
                <div className="flex gap-2">
                    {activeTab === 'keys' && <button onClick={() => setShowKeyModal(true)} className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl text-sm font-semibold shadow-lg"><span className="material-symbols-outlined text-lg">add</span>Nouvelle Clé</button>}
                    {activeTab === 'webhooks' && <button onClick={() => setShowWebhookModal(true)} className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl text-sm font-semibold shadow-lg"><span className="material-symbols-outlined text-lg">add</span>Nouveau Webhook</button>}
                </div>
            </div>

            <div className="flex gap-2 border-b border-slate-200 dark:border-slate-800">
                {[{ id: 'keys', label: 'Clés API', icon: 'key' }, { id: 'webhooks', label: 'Webhooks', icon: 'webhook' }].map(tab => (
                    <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 ${activeTab === tab.id ? 'border-purple-600 text-purple-600' : 'border-transparent text-slate-500'}`}>
                        <span className="material-symbols-outlined text-lg">{tab.icon}</span>{tab.label}
                    </button>
                ))}
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
                {loading ? (
                    <div className="flex items-center justify-center h-64"><div className="w-10 h-10 border-4 border-purple-600 border-t-transparent rounded-full animate-spin"></div></div>
                ) : activeTab === 'keys' ? (
                    apiKeys.length === 0 ? (
                        <div className="text-center py-16"><span className="material-symbols-outlined text-6xl text-slate-300 mb-4">key</span><p className="text-slate-500">Aucune clé API</p></div>
                    ) : (
                        <table className="w-full">
                            <thead className="bg-slate-50 dark:bg-slate-800">
                                <tr>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase">Nom</th>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase">Clé</th>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase">Dernière utilisation</th>
                                    <th className="px-6 py-4 text-center text-xs font-bold text-slate-500 uppercase">Statut</th>
                                    <th className="px-6 py-4 text-center text-xs font-bold text-slate-500 uppercase">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                                {apiKeys.map((key) => (
                                    <tr key={key.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                                        <td className="px-6 py-4 font-semibold text-slate-900 dark:text-white">{key.name}</td>
                                        <td className="px-6 py-4 text-sm text-slate-600 font-mono">{key.key_prefix}...****</td>
                                        <td className="px-6 py-4 text-sm text-slate-600">{key.last_used_at ? new Date(key.last_used_at).toLocaleString('fr-FR') : 'Jamais'}</td>
                                        <td className="px-6 py-4 text-center">
                                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${key.is_active ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>{key.is_active ? 'Active' : 'Révoquée'}</span>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            {key.is_active && <button onClick={() => handleRevokeKey(key.id)} className="p-2 hover:bg-red-50 rounded-lg text-red-600"><span className="material-symbols-outlined">block</span></button>}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )
                ) : (
                    webhooks.length === 0 ? (
                        <div className="text-center py-16"><span className="material-symbols-outlined text-6xl text-slate-300 mb-4">webhook</span><p className="text-slate-500">Aucun webhook</p></div>
                    ) : (
                        <table className="w-full">
                            <thead className="bg-slate-50 dark:bg-slate-800">
                                <tr>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase">Nom</th>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase">URL</th>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase">Événements</th>
                                    <th className="px-6 py-4 text-center text-xs font-bold text-slate-500 uppercase">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                                {webhooks.map((wh) => (
                                    <tr key={wh.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                                        <td className="px-6 py-4 font-semibold text-slate-900 dark:text-white">{wh.name}</td>
                                        <td className="px-6 py-4 text-sm text-slate-600 truncate max-w-xs">{wh.url}</td>
                                        <td className="px-6 py-4 text-sm text-slate-500">{wh.events?.length || 0} événement(s)</td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center justify-center gap-1">
                                                <button onClick={() => handleTestWebhook(wh.id)} className="p-2 hover:bg-blue-50 rounded-lg text-blue-600" title="Tester"><span className="material-symbols-outlined">send</span></button>
                                                <button onClick={() => handleDeleteWebhook(wh.id)} className="p-2 hover:bg-red-50 rounded-lg text-red-600"><span className="material-symbols-outlined">delete</span></button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )
                )}
            </div>

            {showKeyModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
                    <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-md mx-4">
                        <div className="p-6 border-b border-slate-200 dark:border-slate-800"><h3 className="text-xl font-bold">Nouvelle Clé API</h3></div>
                        {newKeySecret ? (
                            <div className="p-6">
                                <div className="p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl mb-4">
                                    <p className="text-sm text-amber-700 dark:text-amber-400 font-medium">⚠️ Copiez cette clé maintenant. Elle ne sera plus affichée.</p>
                                </div>
                                <div className="p-4 bg-slate-100 dark:bg-slate-800 rounded-lg font-mono text-sm break-all">{newKeySecret}</div>
                                <button onClick={() => { setShowKeyModal(false); setNewKeySecret(''); setKeyForm({ name: '', permissions: [], rate_limit: 1000 }); }} className="w-full mt-4 px-4 py-2 bg-purple-600 text-white rounded-lg font-semibold">Fermer</button>
                            </div>
                        ) : (
                            <form onSubmit={handleCreateKey} className="p-6 space-y-4">
                                <input type="text" value={keyForm.name} onChange={(e) => setKeyForm({ ...keyForm, name: e.target.value })} className="w-full px-4 py-2 border rounded-lg dark:bg-slate-800" required placeholder="Nom de la clé" />
                                <input type="number" value={keyForm.rate_limit} onChange={(e) => setKeyForm({ ...keyForm, rate_limit: e.target.value })} className="w-full px-4 py-2 border rounded-lg dark:bg-slate-800" placeholder="Limite de requêtes/heure" />
                                <div className="flex gap-3 pt-4">
                                    <button type="button" onClick={() => setShowKeyModal(false)} className="flex-1 px-4 py-2 border rounded-lg">Annuler</button>
                                    <button type="submit" className="flex-1 px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg font-semibold">Créer</button>
                                </div>
                            </form>
                        )}
                    </div>
                </div>
            )}

            {showWebhookModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
                    <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-md mx-4">
                        <div className="p-6 border-b border-slate-200 dark:border-slate-800"><h3 className="text-xl font-bold">Nouveau Webhook</h3></div>
                        <form onSubmit={handleCreateWebhook} className="p-6 space-y-4">
                            <input type="text" value={webhookForm.name} onChange={(e) => setWebhookForm({ ...webhookForm, name: e.target.value })} className="w-full px-4 py-2 border rounded-lg dark:bg-slate-800" required placeholder="Nom" />
                            <input type="url" value={webhookForm.url} onChange={(e) => setWebhookForm({ ...webhookForm, url: e.target.value })} className="w-full px-4 py-2 border rounded-lg dark:bg-slate-800" required placeholder="URL du webhook" />
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Événements</label>
                                <div className="max-h-40 overflow-y-auto space-y-2">
                                    {availableEvents.map((event) => (
                                        <label key={event} className="flex items-center gap-2 text-sm">
                                            <input type="checkbox" checked={webhookForm.events.includes(event)} onChange={(e) => {
                                                if (e.target.checked) setWebhookForm({ ...webhookForm, events: [...webhookForm.events, event] });
                                                else setWebhookForm({ ...webhookForm, events: webhookForm.events.filter(ev => ev !== event) });
                                            }} className="rounded" />
                                            {event}
                                        </label>
                                    ))}
                                </div>
                            </div>
                            <div className="flex gap-3 pt-4">
                                <button type="button" onClick={() => setShowWebhookModal(false)} className="flex-1 px-4 py-2 border rounded-lg">Annuler</button>
                                <button type="submit" className="flex-1 px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg font-semibold">Créer</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </>
    );
};

export default ApiKeys;
