// src/pages/Invoices.jsx
import { useState, useEffect } from 'react';
import { invoiceService } from '../services/invoiceService';
import { clientService } from '../services/clientService';
import { productService } from '../services/productService';
import { formatCurrency } from '../utils/currency';
import { useToast } from '../contexts/ToastContext';
import InvoiceTemplate from '../components/InvoiceTemplate';
import PrintInvoice from '../components/PrintInvoice';

const Invoices = () => {
    const { addToast } = useToast();
    const [invoices, setInvoices] = useState([]);
    const [clients, setClients] = useState([]);
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [showDetailModal, setShowDetailModal] = useState(false);
    const [showPreviewModal, setShowPreviewModal] = useState(false);
    const [selectedInvoice, setSelectedInvoice] = useState(null);
    const [formData, setFormData] = useState({
        invoice_number: '',
        client_id: '',
        issue_date: new Date().toISOString().split('T')[0],
        due_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        status: 'pending',
        items: [{ product_id: '', quantity: 1, unit_price: 0 }]
    });
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [invoicesRes, clientsRes, productsRes] = await Promise.all([
                invoiceService.getAll(),
                clientService.getAll(),
                productService.getAll()
            ]);
            setInvoices(invoicesRes.data || invoicesRes || []);
            setClients(clientsRes.data || clientsRes || []);
            setProducts(productsRes.data || productsRes || []);
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
            // Calculer le total avant d'envoyer
            const total = formData.items.reduce((sum, item) => {
                return sum + (parseFloat(item.quantity) || 0) * (parseFloat(item.unit_price) || 0);
            }, 0);
            
            // Envoyer la facture avec le total
            await invoiceService.create({
                ...formData,
                total: total
            });
            setShowModal(false);
            setFormData({
                invoice_number: '',
                client_id: '',
                issue_date: new Date().toISOString().split('T')[0],
                due_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                status: 'pending',
                items: [{ product_id: '', quantity: 1, unit_price: 0 }]
            });
            fetchData();
            addToast('Facture créée avec succès', 'success');
        } catch (err) {
            setError(err.response?.data?.message || 'Erreur lors de la création');
            addToast('Erreur lors de la création de la facture', 'error');
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async (id) => {
        if (confirm('Êtes-vous sûr de vouloir supprimer cette facture ?')) {
            try {
                await invoiceService.delete(id);
                fetchData();
                addToast('Facture supprimée avec succès', 'info');
            } catch (err) {
                setError('Erreur lors de la suppression');
                addToast('Impossible de supprimer la facture', 'error');
            }
        }
    };

    const handleStatusChange = async (invoice, newStatus) => {
        try {
            // On envoie l'objet entier pour éviter d'écraser les autres champs avec le PUT
            await invoiceService.update(invoice.id, { ...invoice, status: newStatus });
            fetchData();
            addToast(`Statut mis à jour : ${newStatus}`, 'success');
        } catch (err) {
            setError('Erreur lors du changement de statut');
            addToast('Erreur lors de la mise à jour du statut', 'error');
        }
    };

    const handlePreview = (invoice) => {
        setSelectedInvoice(invoice);
        setShowPreviewModal(true);
    };

    const handlePrint = () => {
        window.print();
    };

    const addItem = () => {
        setFormData({
            ...formData,
            items: [...formData.items, { product_id: '', quantity: 1, unit_price: 0 }]
        });
    };

    const removeItem = (index) => {
        const newItems = formData.items.filter((_, i) => i !== index);
        setFormData({ ...formData, items: newItems.length ? newItems : [{ product_id: '', quantity: 1, unit_price: 0 }] });
    };

    const updateItem = (index, field, value) => {
        const newItems = [...formData.items];
        newItems[index][field] = value;
        if (field === 'product_id') {
            const product = products.find(p => p.id === parseInt(value));
            if (product) {
                newItems[index].unit_price = product.sale_price;
            }
        }
        setFormData({ ...formData, items: newItems });
    };

    // Calcul du total des articles (pour le formulaire)
    const calculateTotal = () => {
        return formData.items.reduce((sum, item) => {
            return sum + (parseFloat(item.quantity) || 0) * (parseFloat(item.unit_price) || 0);
        }, 0);
    };

    // Calcul du total d'une facture (pour l'affichage dans la liste)
    const getInvoiceTotal = (invoice) => {
        // Si le total est défini et supérieur à 0, l'utiliser
        if (invoice.total && parseFloat(invoice.total) > 0) {
            return parseFloat(invoice.total);
        }
        // Sinon, calculer à partir des items
        if (invoice.items && invoice.items.length > 0) {
            return invoice.items.reduce((sum, item) => {
                return sum + (parseFloat(item.quantity) || 0) * (parseFloat(item.unit_price) || 0);
            }, 0);
        }
        return 0;
    };

    const getStatusBadge = (status) => {
        const styles = {
            pending: 'bg-amber-100 text-amber-600',
            paid: 'bg-emerald-100 text-emerald-600',
            overdue: 'bg-red-100 text-red-600',
            cancelled: 'bg-slate-100 text-slate-600'
        };
        const labels = {
            pending: 'En attente',
            paid: 'Payée',
            overdue: 'En retard',
            cancelled: 'Annulée'
        };
        return (
            <span className={`px-3 py-1 rounded-full text-xs font-bold ${styles[status] || styles.pending}`}>
                {labels[status] || status}
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
                        <span>Finance</span>
                        <span>/</span>
                        <span className="text-slate-800 dark:text-slate-200">Factures</span>
                    </nav>
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Gestion des Factures</h2>
                </div>
                <button
                    onClick={() => setShowModal(true)}
                    className="flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl text-sm font-semibold shadow-lg hover:shadow-xl transition-all"
                >
                    <span className="material-symbols-outlined">add</span>
                    Nouvelle Facture
                </button>
            </div>

            {error && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-600 flex items-center gap-2">
                    <span className="material-symbols-outlined">error</span>
                    {error}
                    <button onClick={() => setError('')} className="ml-auto"><span className="material-symbols-outlined">close</span></button>
                </div>
            )}

            {/* Invoices Table */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800">
                                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase">N° Facture</th>
                                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase">Client</th>
                                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase">Date</th>
                                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase">Échéance</th>
                                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase">Total</th>
                                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase">Statut</th>
                                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                            {invoices.length === 0 ? (
                                <tr>
                                    <td colSpan="7" className="px-6 py-12 text-center text-slate-500">Aucune facture trouvée</td>
                                </tr>
                            ) : (
                                invoices.map((invoice) => (
                                    <tr key={invoice.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                                        <td className="px-6 py-4 font-mono text-sm text-purple-600">{invoice.invoice_number}</td>
                                        <td className="px-6 py-4 font-medium text-slate-900 dark:text-white">{invoice.client?.name || '-'}</td>
                                        <td className="px-6 py-4 text-slate-600">{new Date(invoice.issue_date).toLocaleDateString('fr-FR')}</td>
                                        <td className="px-6 py-4 text-slate-600">{new Date(invoice.due_date).toLocaleDateString('fr-FR')}</td>
                                        <td className="px-6 py-4 font-semibold">{formatCurrency(getInvoiceTotal(invoice))}</td>
                                        <td className="px-6 py-4">
                                            <select
                                                value={invoice.status}
                                                onChange={(e) => handleStatusChange(invoice, e.target.value)}
                                                className={`px-3 py-1 rounded-full text-xs font-bold border-0 cursor-pointer ${
                                                    invoice.status === 'pending' ? 'bg-amber-100 text-amber-600' :
                                                    invoice.status === 'paid' ? 'bg-emerald-100 text-emerald-600' :
                                                    invoice.status === 'overdue' ? 'bg-red-100 text-red-600' :
                                                    'bg-slate-100 text-slate-600'
                                                }`}
                                            >
                                                <option value="pending">En attente</option>
                                                <option value="paid">Payée</option>
                                                <option value="overdue">En retard</option>
                                                <option value="cancelled">Annulée</option>
                                            </select>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-1">
                                                <button
                                                    onClick={() => handlePreview(invoice)}
                                                    className="p-2 text-purple-600 hover:bg-purple-50 dark:hover:bg-purple-900/20 rounded-lg transition-colors"
                                                    title="Télécharger / Imprimer"
                                                >
                                                    <span className="material-symbols-outlined text-xl">print</span>
                                                </button>
                                                {invoice.status !== 'paid' && (
                                                    <button
                                                        onClick={() => handleStatusChange(invoice, 'paid')}
                                                        className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                                                        title="Marquer comme payée"
                                                    >
                                                        <span className="material-symbols-outlined text-xl">check_circle</span>
                                                    </button>
                                                )}
                                                <button
                                                    onClick={() => { setSelectedInvoice(invoice); setShowDetailModal(true); }}
                                                    className="p-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                                                    title="Voir détails"
                                                >
                                                    <span className="material-symbols-outlined text-xl">visibility</span>
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(invoice.id)}
                                                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                    title="Supprimer"
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
                    <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                        <div className="p-6 border-b border-slate-200 dark:border-slate-800 sticky top-0 bg-white dark:bg-slate-900">
                            <h3 className="text-xl font-bold text-slate-900 dark:text-white">Nouvelle Facture</h3>
                        </div>
                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">N° Facture</label>
                                    <input
                                        type="text"
                                        value={formData.invoice_number}
                                        onChange={(e) => setFormData({ ...formData, invoice_number: e.target.value })}
                                        required
                                        className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:ring-2 focus:ring-purple-500"
                                        placeholder="F-2024-001"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Client</label>
                                    <select
                                        value={formData.client_id}
                                        onChange={(e) => setFormData({ ...formData, client_id: e.target.value })}
                                        required
                                        className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:ring-2 focus:ring-purple-500"
                                    >
                                        <option value="">Sélectionner un client</option>
                                        {clients.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                                    </select>
                                </div>
                            </div>
                            <div className="grid grid-cols-3 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Date d'émission</label>
                                    <input
                                        type="date"
                                        value={formData.issue_date}
                                        onChange={(e) => setFormData({ ...formData, issue_date: e.target.value })}
                                        required
                                        className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:ring-2 focus:ring-purple-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Date d'échéance</label>
                                    <input
                                        type="date"
                                        value={formData.due_date}
                                        onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
                                        required
                                        className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:ring-2 focus:ring-purple-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Statut</label>
                                    <select
                                        value={formData.status}
                                        onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                                        className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:ring-2 focus:ring-purple-500"
                                    >
                                        <option value="pending">En attente</option>
                                        <option value="paid">Payée</option>
                                        <option value="overdue">En retard</option>
                                        <option value="cancelled">Annulée</option>
                                    </select>
                                </div>
                            </div>

                            {/* Items */}
                            <div>
                                <div className="flex items-center justify-between mb-3">
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Articles</label>
                                    <button type="button" onClick={addItem} className="text-sm text-purple-600 font-semibold flex items-center gap-1">
                                        <span className="material-symbols-outlined text-lg">add</span> Ajouter
                                    </button>
                                </div>
                                <div className="space-y-3">
                                    {formData.items.map((item, index) => (
                                        <div key={index} className="flex gap-3 items-end p-4 bg-slate-50 dark:bg-slate-800 rounded-xl">
                                            <div className="flex-1">
                                                <label className="block text-xs text-slate-500 mb-1">Produit</label>
                                                <select
                                                    value={item.product_id}
                                                    onChange={(e) => updateItem(index, 'product_id', e.target.value)}
                                                    required
                                                    className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm"
                                                >
                                                    <option value="">Sélectionner</option>
                                                    {products.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
                                                </select>
                                            </div>
                                            <div className="w-24">
                                                <label className="block text-xs text-slate-500 mb-1">Quantité</label>
                                                <input
                                                    type="number"
                                                    value={item.quantity}
                                                    onChange={(e) => updateItem(index, 'quantity', parseInt(e.target.value))}
                                                    min="1"
                                                    required
                                                    className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm"
                                                />
                                            </div>
                                            <div className="w-32">
                                                <label className="block text-xs text-slate-500 mb-1">Prix unitaire</label>
                                                <input
                                                    type="number"
                                                    value={item.unit_price}
                                                    onChange={(e) => updateItem(index, 'unit_price', parseFloat(e.target.value))}
                                                    step="0.01"
                                                    required
                                                    className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm"
                                                />
                                            </div>
                                            <button type="button" onClick={() => removeItem(index)} className="p-2 text-red-500 hover:bg-red-100 rounded-lg">
                                                <span className="material-symbols-outlined">close</span>
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Total calculé */}
                            <div className="bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 rounded-xl p-4 flex justify-between items-center">
                                <span className="text-lg font-semibold text-slate-700 dark:text-slate-300">Total de la facture</span>
                                <span className="text-2xl font-bold text-purple-600">{formatCurrency(calculateTotal())}</span>
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
                                    {submitting ? 'Création...' : 'Créer la facture'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Detail Modal */}
            {showDetailModal && selectedInvoice && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-2xl">
                        <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
                            <h3 className="text-xl font-bold text-slate-900 dark:text-white">Facture {selectedInvoice.invoice_number}</h3>
                            <button onClick={() => setShowDetailModal(false)} className="p-2 hover:bg-slate-100 rounded-lg">
                                <span className="material-symbols-outlined">close</span>
                            </button>
                        </div>
                        <div className="p-6 space-y-4">
                            <div className="grid grid-cols-3 gap-4">
                                <div>
                                    <p className="text-sm text-slate-500">Client</p>
                                    <p className="font-semibold">{selectedInvoice.client?.name}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-slate-500">Date d'émission</p>
                                    <p className="font-semibold">{new Date(selectedInvoice.issue_date).toLocaleDateString('fr-FR')}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-slate-500">Échéance</p>
                                    <p className="font-semibold">{new Date(selectedInvoice.due_date).toLocaleDateString('fr-FR')}</p>
                                </div>
                            </div>
                            <div>
                                <p className="text-sm text-slate-500 mb-2">Articles</p>
                                <div className="bg-slate-50 dark:bg-slate-800 rounded-xl overflow-hidden">
                                    <table className="w-full text-sm">
                                        <thead>
                                            <tr className="border-b border-slate-200 dark:border-slate-700">
                                                <th className="px-4 py-3 text-left font-medium text-slate-500">Produit</th>
                                                <th className="px-4 py-3 text-right font-medium text-slate-500">Qté</th>
                                                <th className="px-4 py-3 text-right font-medium text-slate-500">Prix</th>
                                                <th className="px-4 py-3 text-right font-medium text-slate-500">Total</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {(selectedInvoice.items || []).map((item, i) => (
                                                <tr key={i} className="border-b border-slate-100 dark:border-slate-700">
                                                    <td className="px-4 py-3">{item.product?.name || `Produit #${item.product_id}`}</td>
                                                    <td className="px-4 py-3 text-right">{item.quantity}</td>
                                                    <td className="px-4 py-3 text-right">{formatCurrency(item.unit_price)}</td>
                                                    <td className="px-4 py-3 text-right font-semibold">{formatCurrency(item.quantity * item.unit_price)}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                            <div className="flex justify-between items-center pt-4 border-t border-slate-200 dark:border-slate-700">
                                <div>{getStatusBadge(selectedInvoice.status)}</div>
                                <div className="text-right">
                                    <p className="text-sm text-slate-500">Total</p>
                                    <p className="text-2xl font-bold text-purple-600">{formatCurrency(selectedInvoice.total)}</p>
                                </div>
                            </div>
                            <div className="pt-4 flex justify-end">
                                <button
                                    onClick={() => handleDownloadPdf(selectedInvoice)}
                                    className="flex items-center gap-2 px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors bg-purple-50 text-purple-600 hover:bg-purple-100"
                                >
                                    <span className="material-symbols-outlined">download</span>
                                    Télécharger PDF
                                </button>
                                <button
                                    onClick={() => {
                                        setShowDetailModal(false);
                                        handlePreview(selectedInvoice);
                                    }}
                                    className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors ml-2"
                                >
                                    <span className="material-symbols-outlined">print</span>
                                    Version Imprimable
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Preview / Print Modal */}
            {showPreviewModal && selectedInvoice && (
                <div className="fixed inset-0 bg-slate-900/90 backdrop-blur-sm flex justify-center z-[100] overflow-y-auto">
                    <div className="min-h-screen w-full relative pt-16 pb-12 px-4 flex justify-center bg-transparent">
                        
                        {/* Toolbar */}
                        <div className="fixed top-0 left-0 right-0 bg-white/10 backdrop-blur-md border-b border-white/10 p-4 flex justify-between items-center z-50 no-print text-white">
                            <h3 className="font-bold text-lg">Aperçu Facture {selectedInvoice.invoice_number}</h3>
                            <div className="flex gap-4">
                                <button onClick={handlePrint} className="flex items-center gap-2 px-5 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-bold shadow-lg transition-all">
                                    <span className="material-symbols-outlined">print</span>
                                    Imprimer / Enregistrer PDF
                                </button>
                                <button onClick={() => setShowPreviewModal(false)} className="flex items-center gap-2 px-5 py-2 bg-white/20 hover:bg-white/30 text-white rounded-xl font-bold backdrop-blur-sm transition-all">
                                    <span className="material-symbols-outlined">close</span>
                                    Fermer
                                </button>
                            </div>
                        </div>

                        {/* Invoice Content - Screen Preview */}
                        <div className="w-full max-w-4xl mx-auto my-8 print:hidden">
                            <InvoiceTemplate invoice={selectedInvoice} />
                        </div>

                        {/* Hidden Print Content */}
                        <div className="hidden print:block print:w-full print:m-0">
                            <PrintInvoice invoice={selectedInvoice} />
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default Invoices;
