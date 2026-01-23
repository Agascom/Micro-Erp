import { useState, useEffect } from 'react';
import { appointmentService } from '../services/appointmentService';
import { clientService } from '../services/clientService';
import { useToast } from '../contexts/ToastContext';

const Appointments = () => {
    const { addToast } = useToast();
    const [appointments, setAppointments] = useState([]);
    const [clients, setClients] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    // Form data
    const [formData, setFormData] = useState({
        client_id: '',
        title: '',
        date: new Date().toISOString().split('T')[0],
        time: '',
        location: '',
        notes: ''
    });

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [aptRes, clientRes] = await Promise.all([
                appointmentService.getAppointments(),
                clientService.getAll()
            ]);
            setAppointments(aptRes.data || aptRes || []);
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
            // Combine date and time if needed by API, or send separate
            const payload = {
                ...formData,
                // Ensure date string is properly formatted if ISO 8601 is required
            };
            
            await appointmentService.createAppointment(payload);
            setShowModal(false);
            setFormData({
                client_id: '',
                title: '',
                date: new Date().toISOString().split('T')[0],
                time: '',
                location: '',
                notes: ''
            });
            fetchData();
            addToast('Rendez-vous planifié avec succès', 'success');
        } catch (err) {
            setError(err.response?.data?.message || 'Erreur lors de la création du rendez-vous.');
            addToast('Erreur lors de la création du rendez-vous', 'error');
        } finally {
            setSubmitting(false);
        }
    };

    const getClientName = (id) => {
        const client = clients.find(c => c.id === id);
        return client ? client.name : 'Client Inconnu';
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
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                     <nav className="flex items-center gap-2 text-xs font-medium text-slate-400 mb-1">
                        <span>CRM</span>
                        <span>/</span>
                        <span className="text-slate-800 dark:text-slate-200">Rendez-vous</span>
                    </nav>
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Planning des Rendez-vous</h2>
                </div>
                
                <button
                    onClick={() => setShowModal(true)}
                    className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl text-sm font-semibold shadow-lg hover:shadow-purple-500/20 transition-all hover:scale-105 active:scale-95"
                >
                    <span className="material-symbols-outlined text-lg">add_circle</span>
                    Nouveau RDV
                </button>
            </div>

            {error && (
                <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl text-red-600 flex items-center gap-2 animate-fadeIn mt-4">
                    <span className="material-symbols-outlined">error</span>
                    {error}
                    <button onClick={() => setError('')} className="ml-auto hover:bg-red-100 rounded-full p-1">
                        <span className="material-symbols-outlined text-lg">close</span>
                    </button>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
                {appointments.length === 0 ? (
                    <div className="col-span-full pt-10 text-center">
                         <div className="flex flex-col items-center gap-3">
                            <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center text-slate-400">
                                <span className="material-symbols-outlined text-3xl">event_busy</span>
                            </div>
                            <p className="text-slate-500 dark:text-slate-400 font-medium">Aucun rendez-vous prévu</p>
                        </div>
                    </div>
                ) : (
                    appointments.map((apt) => (
                        <div key={apt.id} className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-all group">
                            <div className="flex justify-between items-start mb-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 rounded-xl bg-purple-50 dark:bg-purple-900/20 text-purple-600 flex flex-col items-center justify-center border border-purple-100 dark:border-purple-800">
                                        <span className="text-xs font-bold uppercase">{new Date(apt.date).toLocaleString('default', { month: 'short' })}</span>
                                        <span className="text-lg font-bold leading-none">{new Date(apt.date).getDate()}</span>
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-slate-900 dark:text-white line-clamp-1">{apt.title}</h3>
                                        <p className="text-sm text-slate-500 flex items-center gap-1">
                                            <span className="material-symbols-outlined text-xs">schedule</span>
                                            {apt.time ? apt.time.substring(0, 5) : 'Toute la journée'}
                                        </p>
                                    </div>
                                </div>
                                <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button className="text-slate-400 hover:text-purple-600">
                                        <span className="material-symbols-outlined">more_vert</span>
                                    </button>
                                </div>
                            </div>
                            
                            <div className="space-y-3">
                                <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
                                    <span className="material-symbols-outlined text-[18px] text-slate-400">person</span>
                                    <span className="font-medium">{apt.client?.name || getClientName(apt.client_id)}</span>
                                </div>
                                {apt.location && (
                                    <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
                                        <span className="material-symbols-outlined text-[18px] text-slate-400">location_on</span>
                                        <span className="truncate">{apt.location}</span>
                                    </div>
                                )}
                            </div>

                            {apt.notes && (
                                <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800">
                                    <p className="text-xs text-slate-500 line-clamp-2 italic">"{apt.notes}"</p>
                                </div>
                            )}
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
                                Planifier un Rendez-vous
                            </h3>
                            <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600 transition-colors">
                                <span className="material-symbols-outlined">close</span>
                            </button>
                        </div>
                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Titre / Sujet</label>
                                <input
                                    type="text"
                                    value={formData.title}
                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                    required
                                    className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:ring-2 focus:ring-purple-500 outline-none transition-all"
                                    placeholder="Ex: Présentation produit, Négociation..."
                                />
                            </div>

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
                                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Date</label>
                                    <input
                                        type="date"
                                        value={formData.date}
                                        onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                                        required
                                        className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:ring-2 focus:ring-purple-500 outline-none transition-all"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Heure</label>
                                    <input
                                        type="time"
                                        value={formData.time}
                                        onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                                        className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:ring-2 focus:ring-purple-500 outline-none transition-all"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Lieu (Optionnel)</label>
                                <input
                                    type="text"
                                    value={formData.location}
                                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                                    className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:ring-2 focus:ring-purple-500 outline-none transition-all"
                                    placeholder="Ex: Bureau, Zoom, Chez le client..."
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Notes</label>
                                <textarea
                                    value={formData.notes}
                                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                                    className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:ring-2 focus:ring-purple-500 outline-none transition-all h-24 resize-none"
                                    placeholder="Détails supplémentaires..."
                                ></textarea>
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
                                    {submitting ? 'Planifier...' : 'Planifier'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </>
    );
};

export default Appointments;
