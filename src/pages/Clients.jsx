import { useState, useEffect } from 'react';
import { clientService } from '../services/clientService';
import { appointmentService } from '../services/appointmentService';

const Clients = () => {
    const [clients, setClients] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [editingClient, setEditingClient] = useState(null);
    const [formData, setFormData] = useState({
        client_id: '',
        name: '',
        email: '',
        phone: '',
        address: ''
    });
    const [submitting, setSubmitting] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [viewMode, setViewMode] = useState('grid');
    
    // New state for details view
    const [selectedClient, setSelectedClient] = useState(null);
    const [clientAppointments, setClientAppointments] = useState([]);
    const [loadingAppointments, setLoadingAppointments] = useState(false);

    useEffect(() => {
        fetchClients();
    }, []);

    useEffect(() => {
        if (selectedClient) {
            fetchClientAppointments(selectedClient.id);
        } else {
            setClientAppointments([]);
        }
    }, [selectedClient]);

    const fetchClients = async () => {
        try {
            const res = await clientService.getAll();
            setClients(res.data || res || []);
        } catch (err) {
            setError('Erreur lors du chargement des clients');
        } finally {
            setLoading(false);
        }
    };

    const fetchClientAppointments = async (clientId) => {
        setLoadingAppointments(true);
        try {
            // Trying to use params to filter by client_id if API supports it, 
            // otherwise we might need to filter client-side if the API returns all.
            // Assuming API supports filtering: ?client_id=X
            const res = await appointmentService.getAppointments({ client_id: clientId });
            // If API returns all and doesn't filter, we filter manually:
            const appointments = res.data || res || [];
            // Basic client-side filter fallback if API ignores param (safety net)
            const filtered = appointments.filter(a => a.client_id == clientId || a.client?.id == clientId);
            setClientAppointments(filtered);
        } catch (err) {
            console.error("Failed to fetch appointments", err);
        } finally {
            setLoadingAppointments(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            if (editingClient) {
                await clientService.update(editingClient.id, formData);
            } else {
                await clientService.create(formData);
            }
            setShowModal(false);
            setEditingClient(null);
            setFormData({ client_id: '', name: '', email: '', phone: '', address: '' });
            fetchClients();
        } catch (err) {
            setError(err.response?.data?.message || 'Erreur lors de la sauvegarde');
        } finally {
            setSubmitting(false);
        }
    };

    const handleEdit = (e, client) => {
        e.stopPropagation(); // Prevent opening details
        setEditingClient(client);
        setFormData({
            client_id: client.client_id,
            name: client.name,
            email: client.email || '',
            phone: client.phone || '',
            address: client.address || ''
        });
        setShowModal(true);
    };

    const handleDelete = async (e, id) => {
        e.stopPropagation(); // Prevent opening details
        if (confirm('Êtes-vous sûr de vouloir supprimer ce client ?')) {
            try {
                await clientService.delete(id);
                fetchClients();
                if (selectedClient?.id === id) setSelectedClient(null);
            } catch (err) {
                setError('Erreur lors de la suppression');
            }
        }
    };

    const filteredClients = clients.filter(client =>
        client.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        client.client_id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        client.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        client.phone?.includes(searchTerm)
    );

    if (loading) {
        return (
            <div className="flex items-center justify-center h-screen bg-slate-50 dark:bg-slate-950">
                <div className="relative">
                    <div className="w-16 h-16 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin"></div>
                    <div className="mt-4 text-center text-purple-600 font-medium text-sm">Chargement...</div>
                </div>
            </div>
        );
    }

    return (
        <div className="flex h-[calc(100vh-2rem)] gap-6">
            {/* Main Content List/Grid */}
            <div className={`flex-1 flex flex-col space-y-6 transition-all duration-300 ${selectedClient ? 'w-2/3' : 'w-full'}`}>
                
                {/* Header & Stats */}
                <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm">
                    <div className="flex flex-col md:flex-row justify-between md:items-center gap-4 mb-6">
                        <div>
                            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Clients</h1>
                            <p className="text-slate-500 dark:text-slate-400 text-sm">Gérez votre portefeuille client</p>
                        </div>
                        <div className="flex gap-3">
                            <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
                                <button
                                    onClick={() => setViewMode('list')}
                                    className={`p-2 rounded-lg transition-all ${viewMode === 'list' ? 'bg-white dark:bg-slate-700 shadow-sm text-purple-600' : 'text-slate-400'}`}
                                >
                                    <span className="material-symbols-outlined">table_rows</span>
                                </button>
                                <button
                                    onClick={() => setViewMode('grid')}
                                    className={`p-2 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-white dark:bg-slate-700 shadow-sm text-purple-600' : 'text-slate-400'}`}
                                >
                                    <span className="material-symbols-outlined">grid_view</span>
                                </button>
                            </div>
                            <button
                                onClick={() => {
                                    setEditingClient(null);
                                    setFormData({ client_id: '', name: '', email: '', phone: '', address: '' });
                                    setShowModal(true);
                                }}
                                className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-xl text-sm font-bold shadow-lg shadow-purple-500/25 hover:bg-purple-700 transition-all"
                            >
                                <span className="material-symbols-outlined text-[20px]">add</span>
                                <span className="hidden sm:inline">Nouveau</span>
                            </button>
                        </div>
                    </div>

                    <div className="relative">
                        <span className="material-symbols-outlined absolute left-4 top-3.5 text-slate-400">search</span>
                        <input
                            type="text"
                            placeholder="Rechercher par nom, email, téléphone..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-12 pr-4 py-3 bg-slate-50 dark:bg-slate-950 border-none rounded-xl text-slate-900 dark:text-white focus:ring-2 focus:ring-purple-500/20 placeholder:text-slate-400 transition-all"
                        />
                    </div>
                </div>

                {/* Content Area */}
                <div className="flex-1 overflow-y-auto custom-scrollbar pr-2">
                    {viewMode === 'list' ? (
                        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
                            <table className="w-full text-left">
                                <thead className="bg-slate-50 dark:bg-slate-950/50 sticky top-0 z-10">
                                    <tr>
                                        <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Client</th>
                                        <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Contact</th>
                                        <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                    {filteredClients.map((client) => (
                                        <tr 
                                            key={client.id} 
                                            onClick={() => setSelectedClient(client)}
                                            className={`cursor-pointer transition-colors ${selectedClient?.id === client.id ? 'bg-purple-50 dark:bg-purple-900/10' : 'hover:bg-slate-50 dark:hover:bg-slate-800/50'}`}
                                        >
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 bg-gradient-to-br from-purple-100 to-indigo-100 dark:from-slate-800 dark:to-slate-700 text-purple-600 dark:text-purple-400 rounded-full flex items-center justify-center font-bold text-sm">
                                                        {client.name?.charAt(0)?.toUpperCase()}
                                                    </div>
                                                    <div>
                                                        <span className="block font-semibold text-slate-900 dark:text-white">{client.name}</span>
                                                        <span className="text-xs text-slate-500">{client.client_id}</span>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="text-sm text-slate-600 dark:text-slate-400">
                                                    <div className="flex items-center gap-2">
                                                        <span className="material-symbols-outlined text-[16px] opacity-70">mail</span>
                                                        {client.email || '-'}
                                                    </div>
                                                    <div className="flex items-center gap-2 mt-1">
                                                        <span className="material-symbols-outlined text-[16px] opacity-70">phone</span>
                                                        {client.phone || '-'}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="flex items-center justify-end gap-1">
                                                    <button onClick={(e) => handleEdit(e, client)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg">
                                                        <span className="material-symbols-outlined text-lg">edit</span>
                                                    </button>
                                                    <button onClick={(e) => handleDelete(e, client.id)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg">
                                                        <span className="material-symbols-outlined text-lg">delete</span>
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {filteredClients.map((client) => (
                                <div 
                                    key={client.id} 
                                    onClick={() => setSelectedClient(client)}
                                    className={`group bg-white dark:bg-slate-900 rounded-2xl border p-6 shadow-sm cursor-pointer transition-all duration-300 relative overflow-hidden
                                        ${selectedClient?.id === client.id 
                                            ? 'border-purple-500 ring-2 ring-purple-500/20 shadow-purple-500/10' 
                                            : 'border-slate-200 dark:border-slate-800 hover:shadow-xl hover:-translate-y-1'}`}
                                >
                                    <div className="flex items-start justify-between mb-4">
                                        <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-indigo-600 text-white rounded-2xl flex items-center justify-center font-bold text-xl shadow-lg shadow-purple-500/20">
                                            {client.name?.charAt(0)?.toUpperCase()}
                                        </div>
                                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity absolute top-4 right-4">
                                             <button onClick={(e) => handleEdit(e, client)} className="p-1.5 bg-white dark:bg-slate-800 text-blue-600 rounded-lg shadow-sm border border-slate-100 dark:border-slate-700 hover:bg-blue-50">
                                                <span className="material-symbols-outlined text-sm">edit</span>
                                            </button>
                                            <button onClick={(e) => handleDelete(e, client.id)} className="p-1.5 bg-white dark:bg-slate-800 text-red-600 rounded-lg shadow-sm border border-slate-100 dark:border-slate-700 hover:bg-red-50">
                                                <span className="material-symbols-outlined text-sm">delete</span>
                                            </button>
                                        </div>
                                    </div>
                                    
                                    <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1 line-clamp-1">{client.name}</h3>
                                    <p className="text-xs font-mono text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-900/20 px-2 py-0.5 rounded w-fit mb-4">
                                        {client.client_id}
                                    </p>
                                    
                                    <div className="space-y-2 text-sm text-slate-600 dark:text-slate-400">
                                        <div className="flex items-center gap-2">
                                            <span className="material-symbols-outlined text-[18px] opacity-60">mail</span>
                                            <span className="truncate">{client.email || 'N/A'}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className="material-symbols-outlined text-[18px] opacity-60">phone</span>
                                            <span className="truncate">{client.phone || 'N/A'}</span>
                                        </div>
                                    </div>
                                    
                                    <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs font-medium text-slate-500">
                                        <span>Cliquez pour voir les détails</span>
                                        <span className="material-symbols-outlined text-sm">arrow_forward</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Details Sidebar */}
            <div className={`
                fixed inset-y-0 right-0 w-96 bg-white dark:bg-slate-900 shadow-2xl transform transition-transform duration-300 ease-in-out z-50 border-l border-slate-200 dark:border-slate-800
                ${selectedClient ? 'translate-x-0' : 'translate-x-full'}
            `}>
                {selectedClient ? (
                    <div className="h-full flex flex-col">
                        {/* Sidebar Header */}
                        <div className="p-6 bg-slate-50 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 relative">
                            <button 
                                onClick={() => setSelectedClient(null)}
                                className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-800 rounded-full transition-all"
                            >
                                <span className="material-symbols-outlined">close</span>
                            </button>
                            
                            <div className="flex flex-col items-center text-center mt-2">
                                <div className="w-24 h-24 bg-gradient-to-br from-purple-600 to-indigo-600 text-white rounded-full flex items-center justify-center font-bold text-4xl shadow-lg ring-4 ring-white dark:ring-slate-900 mb-4">
                                    {selectedClient.name?.charAt(0)?.toUpperCase()}
                                </div>
                                <h2 className="text-xl font-bold text-slate-900 dark:text-white leading-tight">{selectedClient.name}</h2>
                                <p className="text-sm font-mono text-purple-600 dark:text-purple-400 mt-1">{selectedClient.client_id}</p>
                            </div>
                        </div>

                        {/* Sidebar Content */}
                        <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-8">
                            {/* Contact Info */}
                            <div className="space-y-4">
                                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Informations de contact</h3>
                                <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-4 space-y-3">
                                    <div className="flex items-start gap-3">
                                        <div className="p-2 bg-white dark:bg-slate-800 rounded-lg text-slate-500 shadow-sm">
                                            <span className="material-symbols-outlined text-lg">mail</span>
                                        </div>
                                        <div>
                                            <p className="text-xs text-slate-500">Email</p>
                                            <p className="text-sm font-medium text-slate-900 dark:text-white break-all">{selectedClient.email || '-'}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-3">
                                        <div className="p-2 bg-white dark:bg-slate-800 rounded-lg text-slate-500 shadow-sm">
                                            <span className="material-symbols-outlined text-lg">call</span>
                                        </div>
                                        <div>
                                            <p className="text-xs text-slate-500">Téléphone</p>
                                            <p className="text-sm font-medium text-slate-900 dark:text-white">{selectedClient.phone || '-'}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-3">
                                        <div className="p-2 bg-white dark:bg-slate-800 rounded-lg text-slate-500 shadow-sm">
                                            <span className="material-symbols-outlined text-lg">location_on</span>
                                        </div>
                                        <div>
                                            <p className="text-xs text-slate-500">Adresse</p>
                                            <p className="text-sm font-medium text-slate-900 dark:text-white">{selectedClient.address || '-'}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Appointments Section */}
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Rendez-vous récents</h3>
                                    <span className="text-xs font-medium text-purple-600 bg-purple-50 dark:bg-purple-900/20 px-2 py-0.5 rounded-full">
                                        {clientAppointments.length}
                                    </span>
                                </div>

                                {loadingAppointments ? (
                                    <div className="flex justify-center py-8">
                                        <div className="w-8 h-8 border-2 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
                                    </div>
                                ) : clientAppointments.length > 0 ? (
                                    <div className="space-y-3">
                                        {clientAppointments.map((apt) => (
                                            <div key={apt.id} className="bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-xl p-4 transition-all hover:shadow-md hover:border-purple-200 dark:hover:border-purple-800 group">
                                                <div className="flex gap-3">
                                                    <div className="flex flex-col items-center justify-center w-12 h-12 bg-purple-50 dark:bg-purple-900/20 rounded-lg text-purple-600 dark:text-purple-400 font-bold border border-purple-100 dark:border-purple-800/50">
                                                        <span className="text-[10px] uppercase leading-none">{new Date(apt.date).toLocaleString('default', { month: 'short' })}</span>
                                                        <span className="text-lg leading-none">{new Date(apt.date).getDate()}</span>
                                                    </div>
                                                    <div className="flex-1">
                                                        <h4 className="font-bold text-slate-900 dark:text-white text-sm line-clamp-1">{apt.title}</h4>
                                                        <div className="flex items-center gap-2 mt-1 text-xs text-slate-500">
                                                            <span className="flex items-center gap-1">
                                                                <span className="material-symbols-outlined text-[14px]">schedule</span>
                                                                {apt.time?.substring(0, 5) || '--:--'}
                                                            </span>
                                                            {apt.location && (
                                                                <span className="flex items-center gap-1">
                                                                    <span className="material-symbols-outlined text-[14px]">location_on</span>
                                                                    <span className="truncate max-w-[80px]">{apt.location}</span>
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                                {apt.notes && (
                                                    <div className="mt-3 pt-3 border-t border-slate-50 dark:border-slate-700">
                                                        <p className="text-xs text-slate-500 italic line-clamp-2">"{apt.notes}"</p>
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-8 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-dashed border-slate-200 dark:border-slate-700">
                                        <div className="w-10 h-10 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-2 text-slate-400">
                                            <span className="material-symbols-outlined">event_busy</span>
                                        </div>
                                        <p className="text-sm text-slate-500">Aucun rendez-vous</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Sidebar Footer */}
                        <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950">
                            <button
                                onClick={() => {
                                    handleEdit(new Event('click'), selectedClient);
                                }}
                                className="w-full py-3 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl font-bold hover:bg-slate-800 dark:hover:bg-slate-200 transition-colors flex items-center justify-center gap-2"
                            >
                                <span className="material-symbols-outlined text-lg">edit</span>
                                Modifier le Profil
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="h-full flex items-center justify-center text-slate-400">
                        <p>Sélectionnez un client</p>
                    </div>
                )}
            </div>

            {/* Modal for Edit/Create */}
            {showModal && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-[60] p-4 animate-fade-in">
                     <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl w-full max-w-lg border border-slate-200 dark:border-slate-800 overflow-hidden animate-slide-in">
                        <div className="bg-slate-50 dark:bg-slate-950 p-6 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center">
                            <div>
                                <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                                    {editingClient ? 'Modifier le client' : 'Nouveau client'}
                                </h3>
                                <p className="text-sm text-slate-500 mt-1">Saisissez les informations du client</p>
                            </div>
                            <button 
                                onClick={() => setShowModal(false)}
                                className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors"
                            >
                                <span className="material-symbols-outlined">close</span>
                            </button>
                        </div>
                        
                        <form onSubmit={handleSubmit} className="p-8 space-y-6">
                            <div className="grid grid-cols-2 gap-5">
                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">ID Client <span className="text-red-500">*</span></label>
                                    <div className="relative">
                                        <span className="material-symbols-outlined absolute left-4 top-3.5 text-slate-400 text-sm">badge</span>
                                        <input
                                            type="text"
                                            value={formData.client_id}
                                            onChange={(e) => setFormData({ ...formData, client_id: e.target.value })}
                                            required
                                            className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:ring-2 focus:ring-purple-500 focus:bg-white dark:focus:bg-slate-900 transition-all font-mono text-sm"
                                            placeholder="CL-0000"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Nom Complet <span className="text-red-500">*</span></label>
                                    <div className="relative">
                                        <span className="material-symbols-outlined absolute left-4 top-3.5 text-slate-400 text-sm">person</span>
                                        <input
                                            type="text"
                                            value={formData.name}
                                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                            required
                                            className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:ring-2 focus:ring-purple-500 focus:bg-white dark:focus:bg-slate-900 transition-all"
                                            placeholder="Nom de l'entreprise"
                                        />
                                    </div>
                                </div>
                            </div>
                            
                            <div className="grid grid-cols-2 gap-5">
                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Email</label>
                                    <div className="relative">
                                        <span className="material-symbols-outlined absolute left-4 top-3.5 text-slate-400 text-sm">mail</span>
                                        <input
                                            type="email"
                                            value={formData.email}
                                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                            className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:ring-2 focus:ring-purple-500 focus:bg-white dark:focus:bg-slate-900 transition-all"
                                            placeholder="contact@email.com"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Téléphone</label>
                                    <div className="relative">
                                        <span className="material-symbols-outlined absolute left-4 top-3.5 text-slate-400 text-sm">call</span>
                                        <input
                                            type="text"
                                            value={formData.phone}
                                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                            className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:ring-2 focus:ring-purple-500 focus:bg-white dark:focus:bg-slate-900 transition-all"
                                            placeholder="+33 6 00 00 00 00"
                                        />
                                    </div>
                                </div>
                            </div>
                            
                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Adresse</label>
                                <div className="relative">
                                    <span className="material-symbols-outlined absolute left-4 top-3.5 text-slate-400 text-sm">location_on</span>
                                    <textarea
                                        value={formData.address}
                                        onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                        rows="3"
                                        className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:ring-2 focus:ring-purple-500 focus:bg-white dark:focus:bg-slate-900 transition-all resize-none"
                                        placeholder="Adresse complète du siège..."
                                    />
                                </div>
                            </div>

                            {error && (
                                <div className="p-4 bg-red-50 dark:bg-red-900/20 text-red-600 rounded-xl text-sm flex items-center gap-2">
                                    <span className="material-symbols-outlined text-lg">error</span>
                                    {error}
                                </div>
                            )}

                            <div className="flex gap-4 pt-4 border-t border-slate-100 dark:border-slate-800">
                                <button
                                    type="button"
                                    onClick={() => setShowModal(false)}
                                    className="flex-1 px-6 py-3.5 border border-slate-200 dark:border-slate-700 rounded-xl font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                                >
                                    Annuler
                                </button>
                                <button
                                    type="submit"
                                    disabled={submitting}
                                    className="flex-1 px-6 py-3.5 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl font-bold shadow-lg shadow-purple-500/25 hover:shadow-xl hover:shadow-purple-500/30 hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {submitting ? (
                                        <span className="flex items-center justify-center gap-2">
                                            <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                                            Enregistrement...
                                        </span>
                                    ) : (
                                        'Enregistrer le client'
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Clients;
