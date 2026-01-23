// src/pages/Payments.jsx
import { useState, useEffect, useCallback } from 'react';
import { paymentService, paymentMethodService, paymentReminderService } from '../services/paymentService';
import { invoiceService } from '../services/invoiceService';
import { formatCurrency } from '../utils/currency';
import { useToast } from '../contexts/ToastContext';

const Payments = () => {
    const [payments, setPayments] = useState([]);
    const [methods, setMethods] = useState([]);
    const [pendingInvoices, setPendingInvoices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('payments');
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [showMethodModal, setShowMethodModal] = useState(false);
    const [formData, setFormData] = useState({
        invoice_id: '',
        payment_method_id: '',
        amount: '',
        payment_date: new Date().toISOString().split('T')[0],
        reference: '',
        notes: ''
    });
    const [methodForm, setMethodForm] = useState({ name: '', code: '', description: '' });
    const { showToast } = useToast();

    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            const [paymentsRes, methodsRes, invoicesRes] = await Promise.allSettled([
                paymentService.getAll(),
                paymentMethodService.getAll(),
                invoiceService.getAll()
            ]);

            if (paymentsRes.status === 'fulfilled') {
                setPayments(paymentsRes.value.data || paymentsRes.value || []);
            }
            if (methodsRes.status === 'fulfilled') {
                setMethods(methodsRes.value.data || methodsRes.value || []);
            }
            if (invoicesRes.status === 'fulfilled') {
                const invoices = invoicesRes.value.data || invoicesRes.value || [];
                setPendingInvoices(invoices.filter(inv => inv.status === 'pending' || inv.status === 'partial'));
            }
        } catch (err) {
            showToast('Erreur lors du chargement', 'error');
        } finally {
            setLoading(false);
        }
    }, [showToast]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handlePaymentSubmit = async (e) => {
        e.preventDefault();
        try {
            await paymentService.create(formData);
            showToast('Paiement enregistré avec succès', 'success');
            setShowPaymentModal(false);
            setFormData({
                invoice_id: '',
                payment_method_id: '',
                amount: '',
                payment_date: new Date().toISOString().split('T')[0],
                reference: '',
                notes: ''
            });
            fetchData();
        } catch (err) {
            showToast(err.response?.data?.message || 'Erreur lors de l\'enregistrement', 'error');
        }
    };

    const handleMethodSubmit = async (e) => {
        e.preventDefault();
        try {
            await paymentMethodService.create(methodForm);
            showToast('Méthode de paiement créée', 'success');
            setShowMethodModal(false);
            setMethodForm({ name: '', code: '', description: '' });
            fetchData();
        } catch (err) {
            showToast('Erreur lors de la création', 'error');
        }
    };

    const handleDeletePayment = async (id) => {
        if (!window.confirm('Supprimer ce paiement ?')) return;
        try {
            await paymentService.delete(id);
            showToast('Paiement supprimé', 'success');
            fetchData();
        } catch (err) {
            showToast('Erreur lors de la suppression', 'error');
        }
    };

    const handleAutoCreateReminders = async () => {
        try {
            const res = await paymentReminderService.autoCreate();
            showToast(`${res.created || 0} relance(s) créée(s)`, 'success');
        } catch (err) {
            showToast('Erreur lors de la création des relances', 'error');
        }
    };

    const totalReceived = payments.reduce((sum, p) => sum + parseFloat(p.amount || 0), 0);
    const totalPending = pendingInvoices.reduce((sum, inv) => sum + parseFloat(inv.total || 0), 0);

    return (
        <>
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <nav className="flex items-center gap-2 text-xs font-medium text-slate-400 mb-1">
                        <span>Finance</span>
                        <span>/</span>
                        <span className="text-slate-800 dark:text-slate-200">Paiements</span>
                    </nav>
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Gestion des Paiements</h2>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={handleAutoCreateReminders}
                        className="flex items-center gap-2 px-4 py-2 bg-amber-500 text-white rounded-xl text-sm font-semibold hover:bg-amber-600 transition-colors"
                    >
                        <span className="material-symbols-outlined text-lg">notifications_active</span>
                        Créer Relances Auto
                    </button>
                    <button
                        onClick={() => setShowPaymentModal(true)}
                        className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl text-sm font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
                    >
                        <span className="material-symbols-outlined text-lg">add</span>
                        Nouveau Paiement
                    </button>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
                    <div className="flex items-center gap-4">
                        <span className="material-symbols-outlined text-3xl text-emerald-600 bg-emerald-100 dark:bg-emerald-900/30 p-3 rounded-xl">
                            payments
                        </span>
                        <div>
                            <p className="text-sm text-slate-500">Total Encaissé</p>
                            <p className="text-2xl font-bold text-emerald-600">{formatCurrency(totalReceived)}</p>
                        </div>
                    </div>
                </div>
                <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
                    <div className="flex items-center gap-4">
                        <span className="material-symbols-outlined text-3xl text-amber-600 bg-amber-100 dark:bg-amber-900/30 p-3 rounded-xl">
                            pending
                        </span>
                        <div>
                            <p className="text-sm text-slate-500">En Attente</p>
                            <p className="text-2xl font-bold text-amber-600">{formatCurrency(totalPending)}</p>
                        </div>
                    </div>
                </div>
                <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
                    <div className="flex items-center gap-4">
                        <span className="material-symbols-outlined text-3xl text-blue-600 bg-blue-100 dark:bg-blue-900/30 p-3 rounded-xl">
                            receipt_long
                        </span>
                        <div>
                            <p className="text-sm text-slate-500">Factures en Attente</p>
                            <p className="text-2xl font-bold text-blue-600">{pendingInvoices.length}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-2 border-b border-slate-200 dark:border-slate-800">
                {[
                    { id: 'payments', label: 'Paiements', icon: 'payments' },
                    { id: 'methods', label: 'Méthodes', icon: 'credit_card' }
                ].map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                            activeTab === tab.id
                                ? 'border-purple-600 text-purple-600'
                                : 'border-transparent text-slate-500 hover:text-slate-700'
                        }`}
                    >
                        <span className="material-symbols-outlined text-lg">{tab.icon}</span>
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Content */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
                {loading ? (
                    <div className="flex items-center justify-center h-64">
                        <div className="w-10 h-10 border-4 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
                    </div>
                ) : activeTab === 'payments' ? (
                    payments.length === 0 ? (
                        <div className="text-center py-16">
                            <span className="material-symbols-outlined text-6xl text-slate-300 mb-4">payments</span>
                            <p className="text-slate-500 text-lg">Aucun paiement enregistré</p>
                        </div>
                    ) : (
                        <table className="w-full">
                            <thead className="bg-slate-50 dark:bg-slate-800">
                                <tr>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase">Date</th>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase">Facture</th>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase">Méthode</th>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase">Référence</th>
                                    <th className="px-6 py-4 text-right text-xs font-bold text-slate-500 uppercase">Montant</th>
                                    <th className="px-6 py-4 text-center text-xs font-bold text-slate-500 uppercase">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                                {payments.map((payment) => (
                                    <tr key={payment.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                                        <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-400">
                                            {new Date(payment.payment_date).toLocaleDateString('fr-FR')}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="text-sm font-medium text-slate-900 dark:text-white">
                                                {payment.invoice?.invoice_number || `#${payment.invoice_id}`}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-400">
                                            {payment.payment_method?.name || '-'}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-slate-500">{payment.reference || '-'}</td>
                                        <td className="px-6 py-4 text-right">
                                            <span className="font-bold text-emerald-600">{formatCurrency(payment.amount)}</span>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <button
                                                onClick={() => handleDeletePayment(payment.id)}
                                                className="p-2 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg text-red-600 transition-colors"
                                            >
                                                <span className="material-symbols-outlined">delete</span>
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )
                ) : (
                    <div className="p-6">
                        <div className="flex justify-end mb-4">
                            <button
                                onClick={() => setShowMethodModal(true)}
                                className="flex items-center gap-2 px-4 py-2 bg-purple-100 text-purple-600 rounded-lg hover:bg-purple-200 transition-colors"
                            >
                                <span className="material-symbols-outlined text-lg">add</span>
                                Nouvelle Méthode
                            </button>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {methods.map((method) => (
                                <div key={method.id} className="p-4 bg-slate-50 dark:bg-slate-800 rounded-xl">
                                    <div className="flex items-center gap-3">
                                        <span className="material-symbols-outlined text-2xl text-purple-600">credit_card</span>
                                        <div>
                                            <h4 className="font-semibold text-slate-900 dark:text-white">{method.name}</h4>
                                            <p className="text-sm text-slate-500">{method.code}</p>
                                        </div>
                                    </div>
                                    {method.description && (
                                        <p className="text-sm text-slate-500 mt-2">{method.description}</p>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* Payment Modal */}
            {showPaymentModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
                    <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-lg mx-4">
                        <div className="p-6 border-b border-slate-200 dark:border-slate-800">
                            <h3 className="text-xl font-bold text-slate-900 dark:text-white">Enregistrer un Paiement</h3>
                        </div>
                        <form onSubmit={handlePaymentSubmit} className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Facture</label>
                                <select
                                    value={formData.invoice_id}
                                    onChange={(e) => setFormData({ ...formData, invoice_id: e.target.value })}
                                    className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-purple-500 dark:bg-slate-800"
                                    required
                                >
                                    <option value="">Sélectionner une facture</option>
                                    {pendingInvoices.map((inv) => (
                                        <option key={inv.id} value={inv.id}>
                                            {inv.invoice_number} - {formatCurrency(inv.total)} ({inv.client?.name || 'Client'})
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Méthode</label>
                                    <select
                                        value={formData.payment_method_id}
                                        onChange={(e) => setFormData({ ...formData, payment_method_id: e.target.value })}
                                        className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-purple-500 dark:bg-slate-800"
                                        required
                                    >
                                        <option value="">Sélectionner</option>
                                        {methods.map((m) => (
                                            <option key={m.id} value={m.id}>{m.name}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Date</label>
                                    <input
                                        type="date"
                                        value={formData.payment_date}
                                        onChange={(e) => setFormData({ ...formData, payment_date: e.target.value })}
                                        className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-purple-500 dark:bg-slate-800"
                                        required
                                    />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Montant</label>
                                    <input
                                        type="number"
                                        value={formData.amount}
                                        onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                                        className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-purple-500 dark:bg-slate-800"
                                        required
                                        min="0"
                                        step="0.01"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Référence</label>
                                    <input
                                        type="text"
                                        value={formData.reference}
                                        onChange={(e) => setFormData({ ...formData, reference: e.target.value })}
                                        className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-purple-500 dark:bg-slate-800"
                                        placeholder="VIR-2026-001"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Notes</label>
                                <textarea
                                    value={formData.notes}
                                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                                    className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-purple-500 dark:bg-slate-800"
                                    rows="2"
                                ></textarea>
                            </div>
                            <div className="flex gap-3 pt-4">
                                <button
                                    type="button"
                                    onClick={() => setShowPaymentModal(false)}
                                    className="flex-1 px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg"
                                >
                                    Annuler
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg font-semibold"
                                >
                                    Enregistrer
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Method Modal */}
            {showMethodModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
                    <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-md mx-4">
                        <div className="p-6 border-b border-slate-200 dark:border-slate-800">
                            <h3 className="text-xl font-bold text-slate-900 dark:text-white">Nouvelle Méthode de Paiement</h3>
                        </div>
                        <form onSubmit={handleMethodSubmit} className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Nom</label>
                                <input
                                    type="text"
                                    value={methodForm.name}
                                    onChange={(e) => setMethodForm({ ...methodForm, name: e.target.value })}
                                    className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-purple-500 dark:bg-slate-800"
                                    required
                                    placeholder="ex: Mobile Money"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Code</label>
                                <input
                                    type="text"
                                    value={methodForm.code}
                                    onChange={(e) => setMethodForm({ ...methodForm, code: e.target.value })}
                                    className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-purple-500 dark:bg-slate-800"
                                    required
                                    placeholder="ex: MOMO"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Description</label>
                                <textarea
                                    value={methodForm.description}
                                    onChange={(e) => setMethodForm({ ...methodForm, description: e.target.value })}
                                    className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-purple-500 dark:bg-slate-800"
                                    rows="2"
                                ></textarea>
                            </div>
                            <div className="flex gap-3 pt-4">
                                <button
                                    type="button"
                                    onClick={() => setShowMethodModal(false)}
                                    className="flex-1 px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg"
                                >
                                    Annuler
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg font-semibold"
                                >
                                    Créer
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </>
    );
};

export default Payments;
