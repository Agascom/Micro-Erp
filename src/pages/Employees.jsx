// src/pages/Employees.jsx
import { useState, useEffect } from 'react';
import { employeeService } from '../services/employeeService';
import { formatCurrency } from '../utils/currency';

const Employees = () => {
    const [employees, setEmployees] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [editingEmployee, setEditingEmployee] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        job_title: '',
        contract_type: 'CDI',
        base_salary: 0,
        hire_date: new Date().toISOString().split('T')[0]
    });
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        fetchEmployees();
    }, []);

    const fetchEmployees = async () => {
        try {
            const res = await employeeService.getAll();
            setEmployees(res.data || res || []);
        } catch (err) {
            setError('Erreur lors du chargement des employés');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            if (editingEmployee) {
                await employeeService.update(editingEmployee.id, formData);
            } else {
                await employeeService.create(formData);
            }
            setShowModal(false);
            setEditingEmployee(null);
            setFormData({
                name: '',
                job_title: '',
                contract_type: 'CDI',
                base_salary: 0,
                hire_date: new Date().toISOString().split('T')[0]
            });
            fetchEmployees();
        } catch (err) {
            setError(err.response?.data?.message || 'Erreur lors de la sauvegarde');
        } finally {
            setSubmitting(false);
        }
    };

    const handleEdit = (employee) => {
        setEditingEmployee(employee);
        setFormData({
            name: employee.name,
            job_title: employee.job_title,
            contract_type: employee.contract_type,
            base_salary: employee.base_salary,
            hire_date: employee.hire_date?.split('T')[0] || ''
        });
        setShowModal(true);
    };

    const handleDelete = async (id) => {
        if (confirm('Êtes-vous sûr de vouloir supprimer cet employé ?')) {
            try {
                await employeeService.delete(id);
                fetchEmployees();
            } catch (err) {
                setError('Erreur lors de la suppression');
            }
        }
    };



    const getContractBadge = (type) => {
        const styles = {
            CDI: 'bg-emerald-100 text-emerald-600',
            CDD: 'bg-amber-100 text-amber-600',
            Stage: 'bg-blue-100 text-blue-600',
            Freelance: 'bg-purple-100 text-purple-600'
        };
        return (
            <span className={`px-3 py-1 rounded-full text-xs font-bold ${styles[type] || 'bg-slate-100 text-slate-600'}`}>
                {type}
            </span>
        );
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
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <nav className="flex items-center gap-2 text-xs font-medium text-slate-400 mb-1">
                        <span>RH</span>
                        <span>/</span>
                        <span className="text-slate-800 dark:text-slate-200">Employés</span>
                    </nav>
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Gestion des Employés</h2>
                </div>
                <button
                    onClick={() => {
                        setEditingEmployee(null);
                        setFormData({
                            name: '',
                            job_title: '',
                            contract_type: 'CDI',
                            base_salary: 0,
                            hire_date: new Date().toISOString().split('T')[0]
                        });
                        setShowModal(true);
                    }}
                    className="flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl text-sm font-semibold shadow-lg hover:shadow-xl transition-all"
                >
                    <span className="material-symbols-outlined">person_add</span>
                    Nouvel Employé
                </button>
            </div>

            {error && (
                <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl text-red-600 flex items-center gap-2">
                    <span className="material-symbols-outlined">error</span>
                    {error}
                    <button onClick={() => setError('')} className="ml-auto">
                        <span className="material-symbols-outlined">close</span>
                    </button>
                </div>
            )}

            {/* Employees Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {employees.length === 0 ? (
                    <div className="col-span-full text-center py-12 text-slate-500">
                        Aucun employé trouvé
                    </div>
                ) : (
                    employees.map((employee) => (
                        <div
                            key={employee.id}
                            className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 hover:shadow-lg transition-shadow"
                        >
                            <div className="flex items-start justify-between mb-4">
                                <div className="flex items-center gap-4">
                                    <div className="w-14 h-14 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-full flex items-center justify-center text-white text-xl font-bold">
                                        {employee.name?.charAt(0)?.toUpperCase()}
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-slate-900 dark:text-white">{employee.name}</h3>
                                        <p className="text-sm text-slate-500">{employee.job_title}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-1">
                                    <button
                                        onClick={() => handleEdit(employee)}
                                        className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                                    >
                                        <span className="material-symbols-outlined text-lg">edit</span>
                                    </button>
                                    <button
                                        onClick={() => handleDelete(employee.id)}
                                        className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                                    >
                                        <span className="material-symbols-outlined text-lg">delete</span>
                                    </button>
                                </div>
                            </div>
                            <div className="space-y-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-slate-500">Contrat</span>
                                    {getContractBadge(employee.contract_type)}
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-slate-500">Salaire</span>
                                    <span className="font-semibold text-slate-900 dark:text-white">{formatCurrency(employee.base_salary)}</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-slate-500">Date d'embauche</span>
                                    <span className="text-sm text-slate-700 dark:text-slate-300">
                                        {new Date(employee.hire_date).toLocaleDateString('fr-FR')}
                                    </span>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-lg">
                        <div className="p-6 border-b border-slate-200 dark:border-slate-800">
                            <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                                {editingEmployee ? 'Modifier l\'employé' : 'Nouvel employé'}
                            </h3>
                        </div>
                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Nom complet</label>
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    required
                                    className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                    placeholder="Jean Dupont"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Poste</label>
                                <input
                                    type="text"
                                    value={formData.job_title}
                                    onChange={(e) => setFormData({ ...formData, job_title: e.target.value })}
                                    required
                                    className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                    placeholder="Développeur Senior"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Type de contrat</label>
                                    <select
                                        value={formData.contract_type}
                                        onChange={(e) => setFormData({ ...formData, contract_type: e.target.value })}
                                        className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                    >
                                        <option value="CDI">CDI</option>
                                        <option value="CDD">CDD</option>
                                        <option value="Stage">Stage</option>
                                        <option value="Freelance">Freelance</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Salaire (FCFA)</label>
                                    <input
                                        type="number"
                                        value={formData.base_salary}
                                        onChange={(e) => setFormData({ ...formData, base_salary: parseFloat(e.target.value) })}
                                        min="0"
                                        step="0.01"
                                        required
                                        className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Date d'embauche</label>
                                <input
                                    type="date"
                                    value={formData.hire_date}
                                    onChange={(e) => setFormData({ ...formData, hire_date: e.target.value })}
                                    required
                                    className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                />
                            </div>
                            <div className="flex gap-3 pt-4">
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
                                    className="flex-1 px-4 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl font-semibold disabled:opacity-50 transition-all"
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

export default Employees;
