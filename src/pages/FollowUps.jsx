import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { followUpService } from '../services/followUpService';
import { clientService } from '../services/clientService';
import { useToast } from '../contexts/ToastContext';
const FollowUps = () => {
    const { addToast } = useToast();
    const navigate = useNavigate();
    const [followUps, setFollowUps] = useState([]);
    const [clients, setClients] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [filterClient, setFilterClient] = useState('');
    // ...
    // Skipping down to the map render part for replacement
    
    // Actually I should just import useNavigate one line 1 and add it inside component.
    // And then replace the card render.
    
    // Breaking this into smaller chunks for safer replacement.


    const [formData, setFormData] = useState({
        client_id: '',
        type: 'call', // call, whatsapp, email, meeting
        content: '',
        date: new Date().toISOString().split('T')[0],
        next_follow_up_date: ''
    });

    useEffect(() => {
        fetchData();
    }, [filterClient]);

    const fetchData = async () => {
        setLoading(true);
        try {
            const params = filterClient ? { client_id: filterClient } : {};
            const [followRes, clientRes] = await Promise.all([
                followUpService.getFollowUps(params),
                clientService.getAll()
            ]);
            setFollowUps(followRes.data || followRes || []);
            setClients(clientRes.data || clientRes || []);
        } catch (err) {
            console.error(err);
            setError('Erreur lors du chargement des données.');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            await followUpService.createFollowUp(formData);
            setShowModal(false);
            setFormData({
                client_id: '',
                type: 'call',
                content: '',
                date: new Date().toISOString().split('T')[0],
                next_follow_up_date: ''
            });
            fetchData();
            addToast('Relance enregistrée avec succès', 'success');
        } catch (err) {
            setError(err.response?.data?.message || 'Erreur lors de l\'enregistrement.');
            addToast('Erreur lors de l\'enregistrement', 'error');
        } finally {
            setSubmitting(false);
        }
    };

    const getTypeIcon = (type) => {
        switch (type) {
            case 'whatsapp': return 'chat';
            case 'email': return 'mail';
            case 'meeting': return 'groups';
            default: return 'call';
        }
    };

    const getTypeColor = (type) => {
        switch (type) {
            case 'whatsapp': return 'text-green-500 bg-green-50 dark:bg-green-900/20';
            case 'email': return 'text-blue-500 bg-blue-50 dark:bg-blue-900/20';
            case 'meeting': return 'text-purple-500 bg-purple-50 dark:bg-purple-900/20';
            default: return 'text-amber-500 bg-amber-50 dark:bg-amber-900/20';
        }
    };

    if (loading && followUps.length === 0) {
         return (
            <div className="flex items-center justify-center h-64">
                <div className="w-12 h-12 border-4 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    return (
        <>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                     <nav className="flex items-center gap-2 text-xs font-medium text-slate-400 mb-1">
                        <span>CRM</span>
                        <span>/</span>
                        <span className="text-slate-800 dark:text-slate-200">Suivi Client</span>
                    </nav>
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Historique des Relances</h2>
                </div>
                
                <div className="flex items-center gap-3">
                    <select 
                        value={filterClient} 
                        onChange={(e) => setFilterClient(e.target.value)}
                        className="px-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:ring-2 focus:ring-purple-500 outline-none"
                    >
                        <option value="">Tous les clients</option>
                        {clients.map(c => (
                            <option key={c.id} value={c.id}>{c.name}</option>
                        ))}
                    </select>

                    <button
                        onClick={() => setShowModal(true)}
                        className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl text-sm font-semibold shadow-lg hover:shadow-purple-500/20 transition-all hover:scale-105 active:scale-95"
                    >
                        <span className="material-symbols-outlined text-lg">add_comment</span>
                        Nouvelle Relance
                    </button>
                </div>
            </div>

            {error && (
                <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl text-red-600 flex items-center gap-2 animate-fadeIn mt-4">
                    <span className="material-symbols-outlined">error</span>
                    {error}
                </div>
            )}

            <div className="mt-8 relative space-y-8 before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-300 before:to-transparent">
                {followUps.length === 0 ? (
                     <div className="text-center py-12 relative z-10">
                        <div className="inline-flex items-center justify-center p-4 rounded-full bg-slate-100 dark:bg-slate-800 mb-4">
                            <span className="material-symbols-outlined text-3xl text-slate-300">history_edu</span>
                        </div>
                        <p className="text-slate-500">Aucun historique de relance trouvé.</p>
                    </div>
                ) : (
                    followUps.map((item, index) => (
                        <div 
                            key={item.id} 
                            onClick={() => navigate(`/follow-ups/${item.id}`, { state: { followUp: item } })}
                            className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active cursor-pointer"
                        >
                            
                            {/* Icon */}
                            <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 border-white dark:border-slate-900 shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 ${getTypeColor(item.type)} transition-transform group-hover:scale-110`}>
                                <span className="material-symbols-outlined text-lg">{getTypeIcon(item.type)}</span>
                            </div>

                            {/* Card */}
                            <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm transition-all group-hover:shadow-md group-hover:border-purple-200 dark:group-hover:border-purple-800 group-hover:-translate-y-1">
                                <div className="flex items-center justify-between mb-2">
                                    <span className="font-bold text-slate-900 dark:text-white group-hover:text-purple-600 transition-colors">
                                        {item.client?.name || 'Client Inconnu'}
                                    </span>
                                    <div className="flex items-center gap-2">
                                        <time className="font-mono text-xs text-slate-500">{new Date(item.date).toLocaleDateString()}</time>
                                        <span className="material-symbols-outlined text-sm text-slate-300 group-hover:text-purple-400">arrow_forward_ios</span>
                                    </div>
                                </div>
                                <div className="text-sm text-slate-600 dark:text-slate-300 line-clamp-2">
                                    {item.content}
                                </div>
                                {item.next_follow_up_date && (
                                    <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center gap-2 text-xs font-semibold text-purple-600">
                                        <span className="material-symbols-outlined text-sm">event</span>
                                        Prochaine relance : {new Date(item.next_follow_up_date).toLocaleDateString()}
                                    </div>
                                )}
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fadeIn">
                    <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-lg scale-100 animate-scaleIn">
                        <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center">
                            <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                                Enregistrer une Relance
                            </h3>
                            <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600 transition-colors">
                                <span className="material-symbols-outlined">close</span>
                            </button>
                        </div>
                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Client</label>
                                <select
                                    value={formData.client_id}
                                    onChange={(e) => setFormData({ ...formData, client_id: e.target.value })}
                                    required
                                    className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:ring-2 focus:ring-purple-500 outline-none transition-all"
                                >
                                    <option value="">Sélectionner un client</option>
                                    {clients.map(client => (
                                        <option key={client.id} value={client.id}>{client.name}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Type</label>
                                    <select
                                        value={formData.type}
                                        onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                                        className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:ring-2 focus:ring-purple-500 outline-none transition-all"
                                    >
                                        <option value="call">Appel Téléphonique</option>
                                        <option value="whatsapp">WhatsApp</option>
                                        <option value="email">Email</option>
                                        <option value="meeting">Réunion Physique</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Date</label>
                                    <input
                                        type="date"
                                        value={formData.date}
                                        onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                                        required
                                        className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:ring-2 focus:ring-purple-500 outline-none transition-all"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Compte Rendu</label>
                                <textarea
                                    value={formData.content}
                                    onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                                    required
                                    className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:ring-2 focus:ring-purple-500 outline-none transition-all h-24 resize-none"
                                    placeholder="De quoi avez-vous discuté ?"
                                ></textarea>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Prochaine Relance (Optionnel)</label>
                                <input
                                    type="date"
                                    value={formData.next_follow_up_date}
                                    onChange={(e) => setFormData({ ...formData, next_follow_up_date: e.target.value })}
                                    className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:ring-2 focus:ring-purple-500 outline-none transition-all"
                                />
                            </div>

                            <div className="pt-4 flex gap-3">
                                <button
                                    type="button"
                                    onClick={() => setShowModal(false)}
                                    className="flex-1 px-4 py-3 border border-slate-200 dark:border-slate-700 rounded-xl font-medium hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                                >
                                    Annuler
                                </button>
                                <button
                                    type="submit"
                                    disabled={submitting}
                                    className="flex-1 px-4 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-purple-500/20 transition-all disabled:opacity-70"
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

export default FollowUps;
