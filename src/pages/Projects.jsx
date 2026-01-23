import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { projectService } from '../services/projectService';
import { clientService } from '../services/clientService';
import { useToast } from '../contexts/ToastContext';

const Projects = () => {
    const { addToast } = useToast();
    const [projects, setProjects] = useState([]);
    const [clients, setClients] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    const [formData, setFormData] = useState({
        name: '',
        client_id: '',
        start_date: new Date().toISOString().split('T')[0],
        deadline: '',
        description: '',
        status: 'ongoing' // ongoing, completed, on_hold
    });

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [projRes, clientRes] = await Promise.all([
                projectService.getAll(),
                clientService.getAll()
            ]);
            setProjects(projRes.data || projRes || []);
            setClients(clientRes.data || clientRes || []);
        } catch (err) {
            console.error(err);
            setError('Erreur lors du chargement des projets.');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            await projectService.create(formData);
            setShowModal(false);
            setFormData({
                name: '',
                client_id: '',
                start_date: new Date().toISOString().split('T')[0],
                deadline: '',
                description: '',
                status: 'ongoing'
            });
            fetchData();
            addToast('Projet créé avec succès', 'success');
        } catch (err) {
            setError(err.response?.data?.message || 'Erreur lors de la création du projet.');
            addToast('Erreur lors de la création du projet', 'error');
        } finally {
            setSubmitting(false);
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'completed': return 'bg-emerald-100 text-emerald-700';
            case 'on_hold': return 'bg-amber-100 text-amber-700';
            default: return 'bg-blue-100 text-blue-700';
        }
    };

    const getStatusLabel = (status) => {
        switch (status) {
            case 'completed': return 'Terminé';
            case 'on_hold': return 'En pause';
            default: return 'En cours';
        }
    };

    const calculateProgress = (project) => {
        // If the API returns progress, use it. Otherwise mock it or calculate from tasks if available
        return project.progress || 0;
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
                        <span>Gestion de Projets</span>
                        <span>/</span>
                        <span className="text-slate-800 dark:text-slate-200">Liste</span>
                    </nav>
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Projets en cours</h2>
                </div>
                
                <button
                    onClick={() => setShowModal(true)}
                    className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl text-sm font-semibold shadow-lg hover:shadow-purple-500/20 transition-all hover:scale-105 active:scale-95"
                >
                    <span className="material-symbols-outlined text-lg">add_task</span>
                    Nouveau Projet
                </button>
            </div>

            {error && (
                <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl text-red-600 flex items-center gap-2 animate-fadeIn mt-4">
                    <span className="material-symbols-outlined">error</span>
                    {error}
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
                {projects.length === 0 ? (
                    <div className="col-span-full pt-12 text-center text-slate-500">
                        Aucun projet trouvé. Créez-en un pour commencer.
                    </div>
                ) : (
                    projects.map((project) => (
                        <Link 
                            to={`/projects/${project.id}`} 
                            key={project.id}
                            className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-lg transition-all group hover:-translate-y-1 block"
                        >
                            <div className="flex justify-between items-start mb-4">
                                <span className={`px-2.5 py-1 rounded-lg text-xs font-bold uppercase tracking-wide ${getStatusColor(project.status)}`}>
                                    {getStatusLabel(project.status)}
                                </span>
                                <div className="p-2 -mr-2 text-slate-300 group-hover:text-purple-600 transition-colors">
                                    <span className="material-symbols-outlined">arrow_outward</span>
                                </div>
                            </div>
                            
                            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1 line-clamp-1">{project.name}</h3>
                            <p className="text-sm text-slate-500 mb-4">{project.client?.name || 'Client interne'}</p>
                            
                            <div className="mb-4">
                                <div className="flex justify-between text-xs font-semibold mb-1">
                                    <span className="text-slate-500">Progression</span>
                                    <span className="text-purple-600">{calculateProgress(project)}%</span>
                                </div>
                                <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                                    <div 
                                        className="h-full bg-gradient-to-r from-purple-500 to-blue-500 rounded-full transition-all duration-1000 ease-out"
                                        style={{ width: `${calculateProgress(project)}%` }}
                                    ></div>
                                </div>
                            </div>

                            <div className="flex items-center justify-between text-xs text-slate-500 border-t border-slate-100 dark:border-slate-800 pt-4">
                                <div className="flex items-center gap-1">
                                    <span className="material-symbols-outlined text-sm">calendar_today</span>
                                    {new Date(project.start_date).toLocaleDateString()}
                                </div>
                                {project.deadline && (
                                    <div className="flex items-center gap-1 text-red-500/80">
                                        <span className="material-symbols-outlined text-sm">flag</span>
                                        {new Date(project.deadline).toLocaleDateString()}
                                    </div>
                                )}
                            </div>
                        </Link>
                    ))
                )}
            </div>

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fadeIn">
                    <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-lg scale-100 animate-scaleIn">
                         <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center">
                            <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                                Nouveau Projet
                            </h3>
                            <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600 transition-colors">
                                <span className="material-symbols-outlined">close</span>
                            </button>
                        </div>
                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Nom du projet</label>
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    required
                                    className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:ring-2 focus:ring-purple-500 outline-none transition-all"
                                    placeholder="Ex: Refonte Site Web..."
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Client</label>
                                <select
                                    value={formData.client_id}
                                    onChange={(e) => setFormData({ ...formData, client_id: e.target.value })}
                                    className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:ring-2 focus:ring-purple-500 outline-none transition-all"
                                >
                                    <option value="">-- Aucun (Projet Interne) --</option>
                                    {clients.map(c => (
                                        <option key={c.id} value={c.id}>{c.name}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Date début</label>
                                    <input
                                        type="date"
                                        value={formData.start_date}
                                        onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                                        required
                                        className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:ring-2 focus:ring-purple-500 outline-none transition-all"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Deadline (Optionnel)</label>
                                    <input
                                        type="date"
                                        value={formData.deadline}
                                        onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                                        className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:ring-2 focus:ring-purple-500 outline-none transition-all"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Description</label>
                                <textarea
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:ring-2 focus:ring-purple-500 outline-none transition-all h-24 resize-none"
                                    placeholder="Détails du projet..."
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
                                    {submitting ? 'Création...' : 'Créer'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </>
    );
};

export default Projects;
