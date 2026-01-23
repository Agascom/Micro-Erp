import { useState, useEffect } from 'react';
import { userService } from '../services/userService';
import { roleService } from '../services/roleService';
import { useToast } from '../contexts/ToastContext';

const Users = () => {
    const { addToast } = useToast();
    const [users, setUsers] = useState([]);
    const [roles, setRoles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [editingUser, setEditingUser] = useState(null);
    const [submitting, setSubmitting] = useState(false);

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        password_confirmation: '',
        role: ''
    });

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [usersRes, rolesRes] = await Promise.all([
                userService.getAll(),
                roleService.getAll()
            ]);
            setUsers(usersRes.data || usersRes || []);
            setRoles(rolesRes.data || rolesRes || []);
        } catch (err) {
            console.error(err);
            setError('Erreur lors du chargement des données.');
            addToast('Erreur lors du chargement des données', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            // If editing and password is empty, remove it from payload to avoid overwriting with empty string
            const payload = { ...formData };
            if (editingUser && !payload.password) {
                delete payload.password;
                delete payload.password_confirmation;
            } else if (!editingUser) {
                 // For creation, ensure password counts
            }

            if (editingUser) {
                await userService.update(editingUser.id, payload);
                addToast('Utilisateur modifié avec succès', 'success');
            } else {
                await userService.create(payload);
                addToast('Utilisateur créé avec succès', 'success');
            }
            setShowModal(false);
            setEditingUser(null);
            setShowModal(false);
            setEditingUser(null);
            setFormData({ name: '', email: '', password: '', password_confirmation: '', role: '' });
            fetchData();
        } catch (err) {
            setError(err.response?.data?.message || 'Erreur lors de la sauvegarde.');
            addToast('Erreur lors de la sauvegarde', 'error');
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Êtes-vous sûr de vouloir supprimer cet utilisateur ?')) {
            try {
                await userService.delete(id);
                fetchData();
                addToast('Utilisateur supprimé', 'info');
            } catch (err) {
                addToast('Erreur lors de la suppression', 'error');
            }
        }
    };

    const openModal = (user = null) => {
        if (user) {
            setEditingUser(user);
            // user.roles might be an array or single role. Let's handle simple case first.
            // If user has 'roles' relation array
            const userRole = user.roles && user.roles.length > 0 ? user.roles[0].name : (user.role || ''); 
            setFormData({
                name: user.name,
                email: user.email,
                password: '', // Don't show password
                role: userRole
            });
        } else {
            setEditingUser(null);
            setEditingUser(null);
            setFormData({ name: '', email: '', password: '', password_confirmation: '', role: '' });
        }
        setShowModal(true);
    };

    if (loading) {
         return (
            <div className="flex items-center justify-center h-64">
                <div className="w-12 h-12 border-4 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-fade-in">
             {/* Header */}
             <div className="flex items-center justify-between gap-4">
                <div>
                     <nav className="flex items-center gap-2 text-xs font-medium text-slate-400 mb-1">
                        <span>Administration</span>
                        <span>/</span>
                        <span className="text-slate-800 dark:text-slate-200">Utilisateurs</span>
                    </nav>
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Gestion des Utilisateurs</h2>
                </div>
                
                <button
                    onClick={() => openModal()}
                    className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl text-sm font-semibold shadow-lg hover:shadow-purple-500/20 transition-all hover:scale-105 active:scale-95"
                >
                    <span className="material-symbols-outlined text-lg">person_add</span>
                    Nouvel Utilisateur
                </button>
            </div>

            {error && (
                <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl text-red-600 flex items-center gap-2 animate-fadeIn">
                    <span className="material-symbols-outlined">error</span>
                    {error}
                    <button onClick={() => setError('')} className="ml-auto hover:bg-red-100 rounded-full p-1">
                        <span className="material-symbols-outlined text-lg">close</span>
                    </button>
                </div>
            )}

            {/* Users List */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800">
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Utilisateur</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Email</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Rôle</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                            {users.length === 0 ? (
                                <tr>
                                    <td colSpan="4" className="px-6 py-12 text-center text-slate-500">
                                        Aucun utilisateur trouvé
                                    </td>
                                </tr>
                            ) : (
                                users.map((u) => {
                                    // Determine display role
                                    const displayRole = u.roles && u.roles.length > 0 
                                        ? u.roles.map(r => r.name).join(', ') 
                                        : (u.role || 'Utilisateur');

                                    return (
                                        <tr key={u.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-white font-bold shadow-sm">
                                                        {u.name.charAt(0).toUpperCase()}
                                                    </div>
                                                    <span className="font-semibold text-slate-900 dark:text-white">{u.name}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-400">
                                                {u.email}
                                            </td>
                                            <td className="px-6 py-4">
                                                {(() => {
                                                    const roleName = displayRole.toLowerCase();
                                                    let badgeClass = 'bg-slate-100 text-slate-700'; // Default (User)
                                                    
                                                    if (roleName.includes('admin')) {
                                                        badgeClass = 'bg-red-100 text-red-700';
                                                    } else if (roleName.includes('manager')) {
                                                        badgeClass = 'bg-blue-100 text-blue-700';
                                                    }

                                                    return (
                                                        <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide ${badgeClass}`}>
                                                            {displayRole}
                                                        </span>
                                                    );
                                                })()}
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <button
                                                        onClick={() => openModal(u)}
                                                        className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                                                        title="Modifier"
                                                    >
                                                        <span className="material-symbols-outlined text-lg">edit</span>
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(u.id)}
                                                        className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                                                        title="Supprimer"
                                                    >
                                                        <span className="material-symbols-outlined text-lg">delete</span>
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
                    <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-md border border-slate-200 dark:border-slate-800 animate-slide-in">
                        <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-950/50 rounded-t-2xl">
                            <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                                {editingUser ? 'Modifier l\'Utilisateur' : 'Nouvel Utilisateur'}
                            </h3>
                            <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600 transition-colors p-1 hover:bg-slate-100 rounded-full">
                                <span className="material-symbols-outlined">close</span>
                            </button>
                        </div>
                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Nom Complet</label>
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    required
                                    className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:ring-2 focus:ring-purple-500 outline-none transition-all"
                                    placeholder="Ex: Jean Dupont"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Email</label>
                                <input
                                    type="email"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    required
                                    className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:ring-2 focus:ring-purple-500 outline-none transition-all"
                                    placeholder="jean.dupont@example.com"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                                    Mot de passe {editingUser && <span className="text-slate-400 font-normal normal-case">(Laisser vide pour ne pas changer)</span>}
                                </label>
                                <input
                                    type="password"
                                    value={formData.password}
                                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                    required={!editingUser}
                                    minLength="6"
                                    className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:ring-2 focus:ring-purple-500 outline-none transition-all"
                                    placeholder="••••••••"
                                />
                            </div>
                            {!editingUser && (
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                                        Confirmation du mot de passe
                                    </label>
                                    <input
                                        type="password"
                                        value={formData.password_confirmation}
                                        onChange={(e) => setFormData({ ...formData, password_confirmation: e.target.value })}
                                        required={!editingUser}
                                        minLength="6"
                                        className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:ring-2 focus:ring-purple-500 outline-none transition-all"
                                        placeholder="••••••••"
                                    />
                                </div>
                            )}
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Rôle</label>
                                <select
                                    value={formData.role}
                                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                                    required
                                    className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:ring-2 focus:ring-purple-500 outline-none transition-all appearance-none"
                                >
                                    <option value="">Sélectionner un rôle</option>
                                    {roles.map(role => (
                                        <option key={role.id} value={role.name}>{role.name}</option>
                                    ))}
                                    {/* Fallback if no roles loaded */}
                                    {roles.length === 0 && (
                                        <>
                                            <option value="admin">Administrateur</option>
                                            <option value="manager">Manager</option>
                                            <option value="employee">Employé</option>
                                        </>
                                    )}
                                </select>
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
                                    {submitting ? '...' : (editingUser ? 'Modifier' : 'Créer')}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Users;
