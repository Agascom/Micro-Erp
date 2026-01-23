// src/pages/Quotes.jsx
import { useState, useEffect } from 'react';
import { quoteService } from '../services/quoteService';
import { clientService } from '../services/clientService';
import { productService } from '../services/productService';
import { formatCurrency } from '../utils/currency';
import { useToast } from '../contexts/ToastContext';

const Quotes = () => {
    const { addToast } = useToast();
    const [quotes, setQuotes] = useState([]);
    const [clients, setClients] = useState([]);
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [showDetailModal, setShowDetailModal] = useState(false);
    const [selectedQuote, setSelectedQuote] = useState(null);
    const [formData, setFormData] = useState({
        quote_number: '',
        client_id: '',
        issue_date: new Date().toISOString().split('T')[0],
        status: 'draft',
        items: [{ product_id: '', quantity: 1, unit_price: 0 }]
    });
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [quotesRes, clientsRes, productsRes] = await Promise.all([
                quoteService.getAll(),
                clientService.getAll(),
                productService.getAll()
            ]);
            setQuotes(quotesRes.data || quotesRes || []);
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
            
            // Envoyer le devis avec le total
            await quoteService.create({
                ...formData,
                total: total
            });
            setShowModal(false);
            setFormData({
                quote_number: '',
                client_id: '',
                issue_date: new Date().toISOString().split('T')[0],
                status: 'draft',
                items: [{ product_id: '', quantity: 1, unit_price: 0 }]
            });
            fetchData();
            addToast('Devis créé avec succès', 'success');
        } catch (err) {
            setError(err.response?.data?.message || 'Erreur lors de la création');
            addToast('Erreur lors de la création du devis', 'error');
        } finally {
            setSubmitting(false);
        }
    };

    const handleConvertToInvoice = async (id) => {
        if (confirm('Convertir ce devis en facture ?')) {
            try {
                await quoteService.convertToInvoice(id);
                fetchData();
                addToast('Devis converti en facture avec succès', 'success');
            } catch (err) {
                setError('Erreur lors de la conversion');
                addToast('Erreur lors de la conversion en facture', 'error');
            }
        }
    };

    const handleDelete = async (id) => {
        if (confirm('Êtes-vous sûr de vouloir supprimer ce devis ?')) {
            try {
                await quoteService.delete(id);
                fetchData();
                addToast('Devis supprimé avec succès', 'info');
            } catch (err) {
                setError('Erreur lors de la suppression');
                addToast('Impossible de supprimer le devis', 'error');
            }
        }
    };

    const handleStatusChange = async (quote, newStatus) => {
        try {
            await quoteService.update(quote.id, { ...quote, status: newStatus });
            fetchData();
            addToast(`Statut mis à jour : ${newStatus}`, 'success');
        } catch (err) {
            setError('Erreur lors du changement de statut');
            addToast('Erreur lors de la mise à jour du statut', 'error');
        }
    };

    const handleDownloadPdf = async (quote) => {
        try {
            const blob = await quoteService.downloadPdf(quote.id);
            const url = window.URL.createObjectURL(new Blob([blob]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `Devis-${quote.quote_number}.pdf`);
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);
            addToast('Téléchargement lancé', 'success');
        } catch (err) {
            console.error(err);
            addToast('Erreur lors du téléchargement du PDF', 'error');
        }
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

    // Calcul du total d'un devis (pour l'affichage dans la liste)
    const getQuoteTotal = (quote) => {
        // Si le total est défini et supérieur à 0, l'utiliser
        if (quote.total && parseFloat(quote.total) > 0) {
            return parseFloat(quote.total);
        }
        // Sinon, calculer à partir des items
        if (quote.items && quote.items.length > 0) {
            return quote.items.reduce((sum, item) => {
                return sum + (parseFloat(item.quantity) || 0) * (parseFloat(item.unit_price) || 0);
            }, 0);
        }
        return 0;
    };

    const getStatusBadge = (status) => {
        const styles = {
            draft: 'bg-slate-100 text-slate-600',
            sent: 'bg-blue-100 text-blue-600',
            accepted: 'bg-emerald-100 text-emerald-600',
            rejected: 'bg-red-100 text-red-600'
        };
        const labels = {
            draft: 'Brouillon',
            sent: 'Envoyé',
            accepted: 'Accepté',
            rejected: 'Refusé'
        };
        return (
            <span className={`px-3 py-1 rounded-full text-xs font-bold ${styles[status] || styles.draft}`}>
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
                        <span>Ventes</span>
                        <span>/</span>
                        <span className="text-slate-800 dark:text-slate-200">Devis</span>
                    </nav>
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Gestion des Devis</h2>
                </div>
                <button
                    onClick={() => setShowModal(true)}
                    className="flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl text-sm font-semibold shadow-lg hover:shadow-xl transition-all"
                >
                    <span className="material-symbols-outlined">add</span>
                    Nouveau Devis
                </button>
            </div>

            {error && (
                <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl text-red-600 flex items-center gap-2">
                    <span className="material-symbols-outlined">error</span>
                    {error}
                    <button onClick={() => setError('')} className="ml-auto"><span className="material-symbols-outlined">close</span></button>
                </div>
            )}

            {success && (
                <div className="p-4 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-xl text-emerald-600 flex items-center gap-2">
                    <span className="material-symbols-outlined">check_circle</span>
                    {success}
                </div>
            )}

            {/* Quotes Table */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800">
                                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase">N° Devis</th>
                                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase">Client</th>
                                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase">Date</th>
                                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase">Total</th>
                                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase">Statut</th>
                                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                            {quotes.length === 0 ? (
                                <tr>
                                    <td colSpan="6" className="px-6 py-12 text-center text-slate-500">Aucun devis trouvé</td>
                                </tr>
                            ) : (
                                quotes.map((quote) => (
                                    <tr key={quote.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                                        <td className="px-6 py-4 font-mono text-sm text-purple-600">{quote.quote_number}</td>
                                        <td className="px-6 py-4 font-medium text-slate-900 dark:text-white">{quote.client?.name || '-'}</td>
                                        <td className="px-6 py-4 text-slate-600">{new Date(quote.issue_date).toLocaleDateString('fr-FR')}</td>
                                        <td className="px-6 py-4 font-semibold">{formatCurrency(getQuoteTotal(quote))}</td>
                                        <td className="px-6 py-4">
                                            <select
                                                value={quote.status}
                                                onChange={(e) => handleStatusChange(quote, e.target.value)}
                                                className={`px-3 py-1 rounded-full text-xs font-bold border-0 cursor-pointer ${
                                                    quote.status === 'draft' ? 'bg-slate-100 text-slate-600' :
                                                    quote.status === 'sent' ? 'bg-blue-100 text-blue-600' :
                                                    quote.status === 'accepted' ? 'bg-emerald-100 text-emerald-600' :
                                                    quote.status === 'rejected' ? 'bg-red-100 text-red-600' :
                                                    'bg-slate-100 text-slate-600'
                                                }`}
                                            >
                                                <option value="draft">Brouillon</option>
                                                <option value="sent">Envoyé</option>
                                                <option value="accepted">Accepté</option>
                                                <option value="rejected">Refusé</option>
                                            </select>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-1">
                                                <button
                                                    onClick={() => handleDownloadPdf(quote)}
                                                    className="p-2 text-purple-600 hover:bg-purple-50 dark:hover:bg-purple-900/20 rounded-lg transition-colors"
                                                    title="Télécharger PDF"
                                                >
                                                    <span className="material-symbols-outlined text-xl">download</span>
                                                </button>
                                                <button
                                                    onClick={() => { setSelectedQuote(quote); setShowDetailModal(true); }}
                                                    className="p-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                                                    title="Voir détails"
                                                >
                                                    <span className="material-symbols-outlined text-xl">visibility</span>
                                                </button>
                                                {quote.status === 'accepted' && (
                                                    <button
                                                        onClick={() => handleConvertToInvoice(quote.id)}
                                                        className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                                                        title="Convertir en facture"
                                                    >
                                                        <span className="material-symbols-outlined text-xl">receipt</span>
                                                    </button>
                                                )}
                                                <button
                                                    onClick={() => handleDelete(quote.id)}
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
                            <h3 className="text-xl font-bold text-slate-900 dark:text-white">Nouveau Devis</h3>
                        </div>
                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">N° Devis</label>
                                    <input
                                        type="text"
                                        value={formData.quote_number}
                                        onChange={(e) => setFormData({ ...formData, quote_number: e.target.value })}
                                        required
                                        className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:ring-2 focus:ring-purple-500"
                                        placeholder="D-2024-001"
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
                            <div className="grid grid-cols-2 gap-4">
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
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Statut</label>
                                    <select
                                        value={formData.status}
                                        onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                                        className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:ring-2 focus:ring-purple-500"
                                    >
                                        <option value="draft">Brouillon</option>
                                        <option value="sent">Envoyé</option>
                                        <option value="accepted">Accepté</option>
                                        <option value="rejected">Refusé</option>
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
                                            <button
                                                type="button"
                                                onClick={() => removeItem(index)}
                                                className="p-2 text-red-500 hover:bg-red-100 rounded-lg"
                                            >
                                                <span className="material-symbols-outlined">close</span>
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Total calculé */}
                            <div className="bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 rounded-xl p-4 flex justify-between items-center">
                                <span className="text-lg font-semibold text-slate-700 dark:text-slate-300">Total estimé</span>
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
                                    {submitting ? 'Création...' : 'Créer le devis'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Detail Modal */}
            {showDetailModal && selectedQuote && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-2xl">
                        <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
                            <h3 className="text-xl font-bold text-slate-900 dark:text-white">Devis {selectedQuote.quote_number}</h3>
                            <button onClick={() => setShowDetailModal(false)} className="p-2 hover:bg-slate-100 rounded-lg">
                                <span className="material-symbols-outlined">close</span>
                            </button>
                        </div>
                        <div className="p-6 space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-sm text-slate-500">Client</p>
                                    <p className="font-semibold">{selectedQuote.client?.name}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-slate-500">Date</p>
                                    <p className="font-semibold">{new Date(selectedQuote.issue_date).toLocaleDateString('fr-FR')}</p>
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
                                            {(selectedQuote.items || []).map((item, i) => (
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
                            <div className="flex justify-end">
                                <div className="text-right">
                                    <p className="text-sm text-slate-500">Total</p>
                                    <p className="text-2xl font-bold text-purple-600">{formatCurrency(selectedQuote.total)}</p>
                                </div>
                            </div>
                            <div className="pt-4 flex justify-end">
                                <button
                                    onClick={() => handleDownloadPdf(selectedQuote)}
                                    className="flex items-center gap-2 px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors bg-purple-50 text-purple-600 hover:bg-purple-100"
                                >
                                    <span className="material-symbols-outlined">download</span>
                                    Télécharger PDF
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default Quotes;
