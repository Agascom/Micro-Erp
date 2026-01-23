import { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { followUpService } from '../services/followUpService';
import { useToast } from '../contexts/ToastContext';

const FollowUpDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    const { showToast } = useToast();
    
    // Initialize with state if available, otherwise null
    const [followUp, setFollowUp] = useState(location.state?.followUp || null);
    const [loading, setLoading] = useState(!location.state?.followUp);

    useEffect(() => {
        const fetchDetails = async () => {
             // If we already have data from state, we can skip fetching or fetch silently to update
            if (!followUp) setLoading(true);
            
            try {
                const data = await followUpService.getById(id);
                setFollowUp(data.data || data);
            } catch (err) {
                console.error(err);
                // If we have state data, suppress the error toast or just show a warning
                if (!followUp) {
                     showToast('Impossible de charger les détails complets', 'error');
                }
            } finally {
                setLoading(false);
            }
        };

        fetchDetails();
    }, [id, showToast]); // Removed dependency on navigate/followUp to avoid loops, simplified logic

    const safeDate = (dateStr) => {
        if (!dateStr) return null;
        const d = new Date(dateStr);
        return isNaN(d.getTime()) ? null : d;
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
            case 'whatsapp': return 'bg-green-100 text-green-700';
            case 'email': return 'bg-blue-100 text-blue-700';
            case 'meeting': return 'bg-purple-100 text-purple-700';
            default: return 'bg-amber-100 text-amber-700';
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="w-12 h-12 border-4 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    if (!followUp) {
        return (
            <div className="flex flex-col items-center justify-center py-12">
                <span className="material-symbols-outlined text-6xl text-slate-300 mb-4">find_in_page</span>
                <p className="text-slate-500 font-medium text-lg">Relance introuvable</p>
                <button 
                    onClick={() => navigate('/follow-ups')}
                    className="mt-4 px-4 py-2 bg-purple-600 text-white rounded-xl font-medium hover:bg-purple-700 transition"
                >
                    Retour à la liste
                </button>
            </div>
        );
    }

    const followUpDate = safeDate(followUp.date);
    const nextDate = safeDate(followUp.next_follow_up_date);
    const createdDate = safeDate(followUp.created_at);
    const updatedDate = safeDate(followUp.updated_at);

    return (
        <div className="space-y-6 animate-fade-in max-w-4xl mx-auto">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <nav className="flex items-center gap-2 text-xs font-medium text-slate-400 mb-1">
                        <button onClick={() => navigate('/follow-ups')} className="hover:text-slate-600 transition-colors">CRM</button>
                        <span>/</span>
                        <button onClick={() => navigate('/follow-ups')} className="hover:text-slate-600 transition-colors">Suivi & Relances</button>
                        <span>/</span>
                        <span className="text-slate-800 dark:text-slate-200">Détails</span>
                    </nav>
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Détails de la Relance</h2>
                </div>
                <button
                    onClick={() => navigate('/follow-ups')}
                    className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-medium hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                >
                    <span className="material-symbols-outlined">arrow_back</span>
                    Retour
                </button>
            </div>

            {/* Main Card */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
                <div className="p-6 md:p-8 space-y-6">
                    
                    {/* Top Info */}
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-100 dark:border-slate-800">
                        <div className="flex items-center gap-4">
                            <div className={`w-16 h-16 rounded-full flex items-center justify-center ${getTypeColor(followUp.type)}`}>
                                <span className="material-symbols-outlined text-3xl">{getTypeIcon(followUp.type)}</span>
                            </div>
                            <div>
                                <p className="text-sm text-slate-500 uppercase tracking-wider font-bold mb-1">Client</p>
                                <h3 className="text-xl font-bold text-slate-900 dark:text-white">{followUp.client?.name || 'Client Inconnu'}</h3>
                                {followUp.client?.email && (
                                    <p className="text-sm text-slate-500">{followUp.client.email}</p>
                                )}
                            </div>
                        </div>
                        <div className="text-right">
                            <p className="text-sm text-slate-500 uppercase tracking-wider font-bold mb-1">Date</p>
                            <p className="text-lg font-semibold text-slate-900 dark:text-white">
                                {followUpDate 
                                    ? followUpDate.toLocaleDateString('fr-FR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) 
                                    : 'Date invalide'}
                            </p>
                        </div>
                    </div>

                    {/* Content */}
                    <div>
                        <h4 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-3">Compte Rendu</h4>
                        <div className="bg-slate-50 dark:bg-slate-950 p-6 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-wrap">
                            {followUp.content || 'Aucun contenu'}
                        </div>
                    </div>

                    {/* Next Follow Up */}
                    {nextDate && (
                        <div className="bg-purple-50 dark:bg-purple-900/10 p-4 rounded-xl border border-purple-100 dark:border-purple-800/30 flex items-center gap-3 text-purple-700 dark:text-purple-300">
                            <span className="material-symbols-outlined">event_upcoming</span>
                            <span className="font-semibold">Prochaine relance planifiée le :</span>
                            <span>{nextDate.toLocaleDateString('fr-FR')}</span>
                        </div>
                    )}

                    {/* Meta Info */}
                    <div className="pt-6 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-400 flex gap-6">
                        {createdDate && <span>Créé le {createdDate.toLocaleString('fr-FR')}</span>}
                        {updatedDate && <span>Dernière modification le {updatedDate.toLocaleString('fr-FR')}</span>}
                    </div>

                </div>
            </div>
        </div>
    );
};

export default FollowUpDetails;
