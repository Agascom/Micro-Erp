// src/pages/Payslips.jsx
import { useState, useEffect } from 'react';
import { payslipService } from '../services/payslipService';
import { employeeService } from '../services/employeeService';
import { formatCurrency } from '../utils/currency';

const Payslips = () => {
    const [payslips, setPayslips] = useState([]);
    const [employees, setEmployees] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [showDetailModal, setShowDetailModal] = useState(false);
    const [selectedPayslip, setSelectedPayslip] = useState(null);
    const [formData, setFormData] = useState({
        employee_id: '',
        pay_period_start: '',
        pay_period_end: '',
        bonuses: 0,
        deductions: 0,
        status: 'pending'
    });
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [payslipsRes, employeesRes] = await Promise.all([
                payslipService.getAll(),
                employeeService.getAll()
            ]);
            setPayslips(payslipsRes.data || payslipsRes || []);
            setEmployees(employeesRes.data || employeesRes || []);
        } catch (err) {
            setError('Erreur lors du chargement');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            await payslipService.create(formData);
            setShowModal(false);
            setFormData({
                employee_id: '',
                pay_period_start: '',
                pay_period_end: '',
                bonuses: 0,
                deductions: 0,
                status: 'pending'
            });
            fetchData();
        } catch (err) {
            setError(err.response?.data?.message || 'Erreur lors de la création');
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async (id) => {
        if (confirm('Êtes-vous sûr de vouloir supprimer cette fiche de paie ?')) {
            try {
                await payslipService.delete(id);
                fetchData();
            } catch (err) {
                setError('Erreur lors de la suppression');
            }
        }
    };



    const getStatusBadge = (status) => {
        const styles = {
            pending: 'bg-amber-100 text-amber-600',
            approved: 'bg-emerald-100 text-emerald-600',
            paid: 'bg-blue-100 text-blue-600',
            rejected: 'bg-red-100 text-red-600'
        };
        const labels = {
            pending: 'En attente',
            approved: 'Approuvée',
            paid: 'Payée',
            rejected: 'Rejetée'
        };
        return (
            <span className={`px-3 py-1 rounded-full text-xs font-bold ${styles[status] || styles.pending}`}>
                {labels[status] || status}
            </span>
        );
    };

    // Helper to set default period dates
    const setDefaultPeriod = () => {
        const now = new Date();
        const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
        const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);
        setFormData({
            ...formData,
            pay_period_start: firstDay.toISOString().split('T')[0],
            pay_period_end: lastDay.toISOString().split('T')[0]
        });
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
                        <span className="text-slate-800 dark:text-slate-200">Fiches de Paie</span>
                    </nav>
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Gestion des Fiches de Paie</h2>
                </div>
                <button
                    onClick={() => {
                        setDefaultPeriod();
                        setShowModal(true);
                    }}
                    className="flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl text-sm font-semibold shadow-lg hover:shadow-xl transition-all"
                >
                    <span className="material-symbols-outlined">add</span>
                    Nouvelle Fiche
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

            {/* Payslips Table */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800">
                                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase">Employé</th>
                                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase">Période</th>
                                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase">Salaire Base</th>
                                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase">Bonus</th>
                                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase">Déductions</th>
                                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase">Net</th>
                                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase">Statut</th>
                                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                            {payslips.length === 0 ? (
                                <tr>
                                    <td colSpan="8" className="px-6 py-12 text-center text-slate-500">
                                        Aucune fiche de paie trouvée
                                    </td>
                                </tr>
                            ) : (
                                payslips.map((payslip) => (
                                    <tr key={payslip.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 bg-gradient-to-br from-cyan-500 to-blue-500 rounded-full flex items-center justify-center text-white font-bold">
                                                    {payslip.employee?.name?.charAt(0)?.toUpperCase() || '?'}
                                                </div>
                                                <span className="font-medium text-slate-900 dark:text-white">{payslip.employee?.name || '-'}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-slate-600">
                                            {new Date(payslip.pay_period_start).toLocaleDateString('fr-FR')} - {new Date(payslip.pay_period_end).toLocaleDateString('fr-FR')}
                                        </td>
                                        <td className="px-6 py-4 text-slate-700">{formatCurrency(payslip.employee?.base_salary)}</td>
                                        <td className="px-6 py-4 text-emerald-600 font-medium">+{formatCurrency(payslip.bonuses)}</td>
                                        <td className="px-6 py-4 text-red-600 font-medium">-{formatCurrency(payslip.deductions)}</td>
                                        <td className="px-6 py-4 font-bold text-slate-900 dark:text-white">{formatCurrency(payslip.net_salary)}</td>
                                        <td className="px-6 py-4">{getStatusBadge(payslip.status)}</td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-1">
                                                <button
                                                    onClick={() => { setSelectedPayslip(payslip); setShowDetailModal(true); }}
                                                    className="p-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                                                >
                                                    <span className="material-symbols-outlined text-xl">visibility</span>
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(payslip.id)}
                                                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                >
                                                    <span className="material-symbols-outlined text-xl">delete</span>
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Create Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-lg">
                        <div className="p-6 border-b border-slate-200 dark:border-slate-800">
                            <h3 className="text-xl font-bold text-slate-900 dark:text-white">Nouvelle Fiche de Paie</h3>
                        </div>
                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Employé</label>
                                <select
                                    value={formData.employee_id}
                                    onChange={(e) => setFormData({ ...formData, employee_id: e.target.value })}
                                    required
                                    className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:ring-2 focus:ring-purple-500"
                                >
                                    <option value="">Sélectionner un employé</option>
                                    {employees.map((e) => (
                                        <option key={e.id} value={e.id}>{e.name} - {e.job_title}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Début période</label>
                                    <input
                                        type="date"
                                        value={formData.pay_period_start}
                                        onChange={(e) => setFormData({ ...formData, pay_period_start: e.target.value })}
                                        required
                                        className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:ring-2 focus:ring-purple-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Fin période</label>
                                    <input
                                        type="date"
                                        value={formData.pay_period_end}
                                        onChange={(e) => setFormData({ ...formData, pay_period_end: e.target.value })}
                                        required
                                        className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:ring-2 focus:ring-purple-500"
                                    />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Bonus (FCFA)</label>
                                    <input
                                        type="number"
                                        value={formData.bonuses}
                                        onChange={(e) => setFormData({ ...formData, bonuses: parseFloat(e.target.value) || 0 })}
                                        min="0"
                                        step="0.01"
                                        className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:ring-2 focus:ring-purple-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Déductions (FCFA)</label>
                                    <input
                                        type="number"
                                        value={formData.deductions}
                                        onChange={(e) => setFormData({ ...formData, deductions: parseFloat(e.target.value) || 0 })}
                                        min="0"
                                        step="0.01"
                                        className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:ring-2 focus:ring-purple-500"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Statut</label>
                                <select
                                    value={formData.status}
                                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                                    className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:ring-2 focus:ring-purple-500"
                                >
                                    <option value="pending">En attente</option>
                                    <option value="approved">Approuvée</option>
                                    <option value="paid">Payée</option>
                                </select>
                            </div>
                            <div className="flex gap-3 pt-4">
                                <button
                                    type="button"
                                    onClick={() => setShowModal(false)}
                                    className="flex-1 px-4 py-3 border border-slate-200 dark:border-slate-700 rounded-xl font-medium hover:bg-slate-50 transition-colors"
                                >
                                    Annuler
                                </button>
                                <button
                                    type="submit"
                                    disabled={submitting}
                                    className="flex-1 px-4 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl font-semibold disabled:opacity-50"
                                >
                                    {submitting ? 'Création...' : 'Générer'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Detail Modal */}
            {showDetailModal && selectedPayslip && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-md">
                        <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
                            <h3 className="text-xl font-bold text-slate-900 dark:text-white">Fiche de Paie</h3>
                            <button onClick={() => setShowDetailModal(false)} className="p-2 hover:bg-slate-100 rounded-lg">
                                <span className="material-symbols-outlined">close</span>
                            </button>
                        </div>
                        <div className="p-6 space-y-4">
                            <div className="flex items-center gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
                                <div className="w-14 h-14 bg-gradient-to-br from-cyan-500 to-blue-500 rounded-full flex items-center justify-center text-white text-xl font-bold">
                                    {selectedPayslip.employee?.name?.charAt(0)?.toUpperCase()}
                                </div>
                                <div>
                                    <h4 className="font-bold text-lg text-slate-900 dark:text-white">{selectedPayslip.employee?.name}</h4>
                                    <p className="text-sm text-slate-500">{selectedPayslip.employee?.job_title}</p>
                                </div>
                            </div>
                            <div className="space-y-3">
                                <div className="flex justify-between">
                                    <span className="text-slate-500">Période</span>
                                    <span className="font-medium">
                                        {new Date(selectedPayslip.pay_period_start).toLocaleDateString('fr-FR')} - {new Date(selectedPayslip.pay_period_end).toLocaleDateString('fr-FR')}
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-slate-500">Salaire brut</span>
                                    <span className="font-medium">{formatCurrency(selectedPayslip.employee?.base_salary)}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-slate-500">Bonus</span>
                                    <span className="font-medium text-emerald-600">+{formatCurrency(selectedPayslip.bonuses)}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-slate-500">Déductions</span>
                                    <span className="font-medium text-red-600">-{formatCurrency(selectedPayslip.deductions)}</span>
                                </div>
                                <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-between">
                                    <span className="font-bold text-slate-900 dark:text-white">Net à payer</span>
                                    <span className="font-bold text-xl text-purple-600">{formatCurrency(selectedPayslip.net_salary)}</span>
                                </div>
                            </div>
                            <div className="pt-4 flex justify-center">
                                {getStatusBadge(selectedPayslip.status)}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default Payslips;
