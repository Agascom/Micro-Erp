// src/pages/AuditLogs.jsx
import { useState, useEffect, useCallback } from 'react';
import { auditService } from '../services/auditService';
import { useToast } from '../contexts/ToastContext';

const AuditLogs = () => {
    const [logs, setLogs] = useState([]);
    const [loginLogs, setLoginLogs] = useState([]);
    const [summary, setSummary] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('activity');
    const [filters, setFilters] = useState({ start_date: '', end_date: '', action: '', user_id: '' });
    const { showToast } = useToast();

    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            const [logsRes, loginRes, summaryRes] = await Promise.allSettled([
                auditService.getActivityLogs(filters),
                auditService.getLoginLogs(filters),
                auditService.getSummary()
            ]);

            // Process Activity Logs
            if (logsRes.status === 'fulfilled') {
                setLogs(logsRes.value.data || logsRes.value || []);
            } else {
                setLogs([]); // No data or error
            }

            // Process Login Logs
            if (loginRes.status === 'fulfilled') {
                setLoginLogs(loginRes.value.data || loginRes.value || []);
            } else {
                setLoginLogs([]); // No data or error
            }

            // Process Summary
            if (summaryRes.status === 'fulfilled') {
                setSummary(summaryRes.value.data || summaryRes.value);
            } else {
                setSummary(null); // No data or error
            }

        } catch (err) { 
            console.error("Audit fetch error", err);
            showToast('Erreur lors du chargement des logs', 'error'); 
        } finally { 
            setLoading(false); 
        }
    }, [filters, showToast]);

    useEffect(() => { fetchData(); }, [fetchData]);

    const getActionBadge = (action) => {
        const styles = {
            created: 'bg-emerald-100 text-emerald-700 border border-emerald-200',
            updated: 'bg-blue-100 text-blue-700 border border-blue-200',
            deleted: 'bg-rose-100 text-rose-700 border border-rose-200',
            login: 'bg-indigo-100 text-indigo-700 border border-indigo-200',
            logout: 'bg-slate-100 text-slate-600 border border-slate-200'
        };
        
        const label = {
            created: 'Création',
            updated: 'Mise à jour',
            deleted: 'Suppression',
            login: 'Connexion',
            logout: 'Déconnexion'
        }[action] || action;

        return (
            <span className={`px-2.5 py-1 rounded-full text-xs font-semibold uppercase tracking-wide flex items-center gap-1 w-fit ${styles[action] || 'bg-slate-100 text-slate-700'}`}>
                <span className={`w-1.5 h-1.5 rounded-full ${
                    action === 'created' ? 'bg-emerald-500' :
                    action === 'updated' ? 'bg-blue-500' :
                    action === 'deleted' ? 'bg-rose-500' :
                    action === 'login' ? 'bg-indigo-500' : 'bg-slate-500'
                }`}></span>
                {label}
            </span>
        );
    };

    return (
        <div className="space-y-6 animate-fade-in">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <nav className="flex items-center gap-2 text-xs font-medium text-slate-400 mb-1">
                        <span>Administration</span><span>/</span><span className="text-slate-800 dark:text-slate-200">Audit</span>
                    </nav>
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Journal d'Audit & Sécurité</h2>
                </div>
                <button onClick={fetchData} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors text-slate-500">
                    <span className="material-symbols-outlined">refresh</span>
                </button>
            </div>

            {summary && (
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow">
                        <div className="flex items-center justify-between mb-2">
                             <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Activités (24h)</p>
                             <span className="material-symbols-outlined text-purple-600 bg-purple-50 dark:bg-purple-900/20 p-1.5 rounded-lg">history</span>
                        </div>
                        <p className="text-3xl font-bold text-slate-900 dark:text-white">{summary.activities_today || 0}</p>
                        <p className="text-xs text-purple-600 flex items-center mt-1 font-medium"><span className="material-symbols-outlined text-sm mr-0.5">trending_up</span> Activité modérée</p>
                    </div>
                    <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow">
                        <div className="flex items-center justify-between mb-2">
                             <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Connexions</p>
                             <span className="material-symbols-outlined text-blue-600 bg-blue-50 dark:bg-blue-900/20 p-1.5 rounded-lg">login</span>
                        </div>
                        <p className="text-3xl font-bold text-slate-900 dark:text-white">{summary.logins_today || 0}</p>
                        <p className="text-xs text-blue-600 flex items-center mt-1 font-medium"><span className="material-symbols-outlined text-sm mr-0.5">group</span> Aujourd'hui</p>
                    </div>
                    <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow">
                        <div className="flex items-center justify-between mb-2">
                             <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Utilisateurs Actifs</p>
                             <span className="material-symbols-outlined text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20 p-1.5 rounded-lg">person_check</span>
                        </div>
                        <p className="text-3xl font-bold text-slate-900 dark:text-white">{summary.active_users || 0}</p>
                        <p className="text-xs text-emerald-600 flex items-center mt-1 font-medium"><span className="material-symbols-outlined text-sm mr-0.5">verified_user</span> En ligne</p>
                    </div>
                    <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow">
                        <div className="flex items-center justify-between mb-2">
                             <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Securité API</p>
                             <span className="material-symbols-outlined text-amber-600 bg-amber-50 dark:bg-amber-900/20 p-1.5 rounded-lg">security</span>
                        </div>
                        <p className="text-3xl font-bold text-slate-900 dark:text-white">{summary.api_calls || 0}</p>
                        <p className="text-xs text-amber-600 flex items-center mt-1 font-medium"><span className="material-symbols-outlined text-sm mr-0.5">api</span> Requêtes totales</p>
                    </div>
                </div>
            )}

            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
                <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row gap-4 justify-between items-center bg-slate-50/50 dark:bg-slate-950/50">
                    <div className="flex gap-2">
                        {[{ id: 'activity', label: 'Journal d\'Activité', icon: 'history' }, { id: 'logins', label: 'Connexions', icon: 'shield_person' }].map(tab => (
                            <button 
                                key={tab.id} 
                                onClick={() => setActiveTab(tab.id)} 
                                className={`flex items-center gap-2 px-4 py-2 text-sm font-bold rounded-xl transition-all ${activeTab === tab.id ? 'bg-white dark:bg-slate-800 text-purple-600 shadow-sm ring-1 ring-slate-200 dark:ring-slate-700' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
                            >
                                <span className="material-symbols-outlined text-lg">{tab.icon}</span>{tab.label}
                            </button>
                        ))}
                    </div>

                    <div className="flex items-center gap-2 w-full sm:w-auto">
                        <input type="date" value={filters.start_date} onChange={(e) => setFilters({ ...filters, start_date: e.target.value })} className="px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-xl text-xs dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-500/20" />
                        <span className="text-slate-400">-</span>
                        <input type="date" value={filters.end_date} onChange={(e) => setFilters({ ...filters, end_date: e.target.value })} className="px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-xl text-xs dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-500/20" />
                    </div>
                </div>

                <div className="overflow-x-auto min-h-[400px]">
                    {loading ? (
                        <div className="flex items-center justify-center py-20"><div className="w-12 h-12 border-4 border-purple-600 border-t-transparent rounded-full animate-spin"></div></div>
                    ) : activeTab === 'activity' ? (
                        logs.length === 0 ? (
                            <div className="text-center py-16 flex flex-col items-center">
                                <span className="material-symbols-outlined text-6xl text-slate-200 dark:text-slate-800 mb-4">history</span>
                                <p className="text-slate-500 font-medium">Aucune activité enregistrée</p>
                            </div>
                        ) : (
                            <table className="w-full">
                                <thead className="bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800">
                                    <tr>
                                        <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Date & Heure</th>
                                        <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Utilisateur</th>
                                        <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Action</th>
                                        <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Cible</th>
                                        <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Détails</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                    {logs.map((log) => (
                                        <tr key={log.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group">
                                            <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-400 font-mono">
                                                {new Date(log.created_at).toLocaleString('fr-FR', { day:'2-digit', month:'2-digit', year:'numeric', hour:'2-digit', minute:'2-digit' })}
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-6 h-6 rounded-full bg-gradient-to-br from-purple-500 to-indigo-500 flex items-center justify-center text-white text-[10px] font-bold">
                                                        {(log.user?.name || 'S').charAt(0).toUpperCase()}
                                                    </div>
                                                    <span className="text-sm font-semibold text-slate-900 dark:text-white">{log.user?.name || 'Système'}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">{getActionBadge(log.action)}</td>
                                            <td className="px-6 py-4">
                                                <span className="text-xs font-mono bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
                                                    {log.model_type} #{log.model_id}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-slate-500 dark:text-slate-400">{log.description || 'Aucune description disponible'}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )
                    ) : (
                        loginLogs.length === 0 ? (
                            <div className="text-center py-16 flex flex-col items-center">
                                <span className="material-symbols-outlined text-6xl text-slate-200 dark:text-slate-800 mb-4">shield_person</span>
                                <p className="text-slate-500 font-medium">Aucun journal de connexion</p>
                            </div>
                        ) : (
                            <table className="w-full">
                                <thead className="bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800">
                                    <tr>
                                        <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Date & Heure</th>
                                        <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Utilisateur</th>
                                        <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Événement</th>
                                        <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Adresse IP</th>
                                        <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Appareil / Navigateur</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                    {loginLogs.map((log) => (
                                        <tr key={log.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                                            <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-400 font-mono">
                                                {new Date(log.created_at).toLocaleString('fr-FR', { day:'2-digit', month:'2-digit', year:'numeric', hour:'2-digit', minute:'2-digit' })}
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-white text-[10px] font-bold">
                                                        {(log.user?.name || log.email || 'U').charAt(0).toUpperCase()}
                                                    </div>
                                                    <span className="text-sm font-semibold text-slate-900 dark:text-white">{log.user?.name || log.email}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">{getActionBadge(log.action)}</td>
                                            <td className="px-6 py-4 text-sm font-mono text-slate-600 dark:text-slate-500">{log.ip_address || 'Non masquée'}</td>
                                            <td className="px-6 py-4 text-sm text-slate-500 dark:text-slate-400 max-w-xs truncate">
                                                <div className="flex items-center gap-2">
                                                    <span className="material-symbols-outlined text-slate-400 text-sm">devices</span>
                                                    {log.user_agent || 'Inconnu'}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )
                    )}
                </div>
            </div>
        </div>
    );
};

export default AuditLogs;
