import { useState, useEffect } from 'react';
import { purchaseOrderService } from '../services/purchaseOrderService';
import { supplierService } from '../services/supplierService';
import { productService } from '../services/productService';
import { formatCurrency } from '../utils/currency';
import { useToast } from '../contexts/ToastContext';

const PurchaseOrders = () => {
    const { addToast } = useToast();
    const [orders, setOrders] = useState([]);
    const [suppliers, setSuppliers] = useState([]);
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    // Form data
    const [formData, setFormData] = useState({
        supplier_id: '',
        date: new Date().toISOString().split('T')[0],
        status: 'pending',
        items: [] // { product_id, quantity, unit_price }
    });

    // Helper for adding lines
    const addItemLine = () => {
        setFormData({
            ...formData,
            items: [...formData.items, { product_id: '', quantity: 1, unit_price: 0 }]
        });
    };

    const removeItemLine = (index) => {
        const newItems = formData.items.filter((_, i) => i !== index);
        setFormData({ ...formData, items: newItems });
    };

    const updateItemLine = (index, field, value) => {
        const newItems = [...formData.items];
        newItems[index][field] = value;
        
        // Auto-fill price if product selected
        if (field === 'product_id') {
            const product = products.find(p => p.id === parseInt(value));
            if (product) {
                // Assuming we might have a cost_price, otherwise using sale_price as placeholder
                newItems[index].unit_price = product.cost_price || product.sale_price || 0; 
            }
        }

        setFormData({ ...formData, items: newItems });
    };

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [ordersRes, suppRes, prodRes] = await Promise.all([
                purchaseOrderService.getAll(),
                supplierService.getAll(),
                productService.getAll()
            ]);
            setOrders(ordersRes.data || ordersRes || []);
            setSuppliers(suppRes.data || suppRes || []);
            setProducts(prodRes.data || prodRes || []);
        } catch (err) {
            console.error(err);
            setError('Erreur lors du chargement des données.');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            await purchaseOrderService.create(formData);
            setShowModal(false);
            setFormData({
                supplier_id: '',
                date: new Date().toISOString().split('T')[0],
                status: 'pending',
                items: []
            });
            fetchData();
            addToast('Commande créée avec succès', 'success');
        } catch (err) {
            setError(err.response?.data?.message || 'Erreur lors de la création de la commande.');
            addToast('Erreur lors de la création de la commande', 'error');
        } finally {
            setSubmitting(false);
        }
    };

    const handleReceiveOrder = async (id) => {
        if (!window.confirm('Confirmer la réception de cette commande ? Cela mettra à jour le stock.')) return;
        
        try {
            await purchaseOrderService.markAsReceived(id);
            fetchData();
            addToast('Commande réceptionnée et stock mis à jour', 'success');
        } catch (err) {
            setError('Erreur lors de la réception de la commande.');
            addToast('Erreur lors de la réception de la commande', 'error');
        }
    };

    const calculateTotal = (items) => {
        return items.reduce((sum, item) => sum + (item.quantity * item.unit_price), 0);
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
                        <span>Achats & Stock</span>
                        <span>/</span>
                        <span className="text-slate-800 dark:text-slate-200">Commandes</span>
                    </nav>
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Commandes Fournisseurs</h2>
                </div>
                
                <button
                    onClick={() => { addItemLine(); setShowModal(true); }}
                    className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl text-sm font-semibold shadow-lg hover:shadow-purple-500/20 transition-all hover:scale-105 active:scale-95"
                >
                    <span className="material-symbols-outlined text-lg">add_shopping_cart</span>
                    Nouvelle Commande
                </button>
            </div>

            {error && (
                <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl text-red-600 flex items-center gap-2 animate-fadeIn mt-4">
                    <span className="material-symbols-outlined">error</span>
                    {error}
                </div>
            )}

            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden mt-6">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800">
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Ref</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Fournisseur</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Date</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Montant</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Statut</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                            {orders.length === 0 ? (
                                <tr>
                                    <td colSpan="6" className="px-6 py-12 text-center text-slate-500">
                                        Aucune commande trouvée.
                                    </td>
                                </tr>
                            ) : (
                                orders.map((order) => (
                                    <tr key={order.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                                        <td className="px-6 py-4 font-mono text-sm text-purple-600 font-medium">
                                            #{order.reference || order.id}
                                        </td>
                                        <td className="px-6 py-4 font-medium text-slate-900 dark:text-white">
                                            {order.supplier?.name || 'Fournisseur Inconnu'}
                                        </td>
                                        <td className="px-6 py-4 text-slate-600 dark:text-slate-400 text-sm">
                                            {new Date(order.date).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4 font-bold text-slate-900 dark:text-white">
                                            {formatCurrency(order.total_amount || 0)}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${
                                                order.status === 'received' ? 'bg-emerald-100 text-emerald-700' :
                                                order.status === 'pending' ? 'bg-amber-100 text-amber-700' :
                                                'bg-slate-100 text-slate-700'
                                            }`}>
                                                {order.status === 'received' ? 'Reçue' : 'En attente'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            {order.status !== 'received' && (
                                                <button
                                                    onClick={() => handleReceiveOrder(order.id)}
                                                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 text-emerald-600 hover:bg-emerald-100 rounded-lg transition-colors text-xs font-bold uppercase tracking-wide"
                                                >
                                                    <span className="material-symbols-outlined text-sm">inventory</span>
                                                    Réceptionner
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fadeIn">
                    <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col scale-100 animate-scaleIn">
                        <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-800/50">
                            <div>
                                <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                                    Nouvelle Commande d'Achat
                                </h3>
                                <p className="text-sm text-slate-500">Remplissez les détails et ajoutez les produits</p>
                            </div>
                            <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600 transition-colors">
                                <span className="material-symbols-outlined">close</span>
                            </button>
                        </div>
                        
                        <div className="overflow-y-auto p-6 flex-1">
                            <form id="po-form" onSubmit={handleSubmit} className="space-y-8">
                                {/* Header Info */}
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Fournisseur</label>
                                        <select
                                            value={formData.supplier_id}
                                            onChange={(e) => setFormData({ ...formData, supplier_id: e.target.value })}
                                            required
                                            className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:ring-2 focus:ring-purple-500 outline-none transition-all"
                                        >
                                            <option value="">Sélectionner...</option>
                                            {suppliers.map(s => (
                                                <option key={s.id} value={s.id}>{s.name}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Date</label>
                                        <input
                                            type="date"
                                            value={formData.date}
                                            onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                                            required
                                            className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:ring-2 focus:ring-purple-500 outline-none transition-all"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Statut</label>
                                        <select
                                            value={formData.status}
                                            onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                                            className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:ring-2 focus:ring-purple-500 outline-none transition-all"
                                        >
                                            <option value="pending">Brouillon / En attente</option>
                                            <option value="ordered">Commandée</option>
                                        </select>
                                    </div>
                                </div>

                                {/* Product Lines */}
                                <div>
                                    <div className="flex items-center justify-between mb-4">
                                        <h4 className="text-lg font-bold text-slate-900 dark:text-white">Lignes de commande</h4>
                                        <button 
                                            type="button" 
                                            onClick={addItemLine}
                                            className="text-sm font-semibold text-purple-600 hover:text-purple-700 flex items-center gap-1"
                                        >
                                            <span className="material-symbols-outlined text-lg">add</span>
                                            Ajouter un produit
                                        </button>
                                    </div>

                                    <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden">
                                        <table className="w-full">
                                            <thead>
                                                <tr className="border-b border-slate-200 dark:border-slate-800 text-left">
                                                    <th className="px-4 py-3 text-xs font-bold text-slate-500 uppercase w-1/2">Produit</th>
                                                    <th className="px-4 py-3 text-xs font-bold text-slate-500 uppercase w-24">Qté</th>
                                                    <th className="px-4 py-3 text-xs font-bold text-slate-500 uppercase w-32">Prix Unitaire</th>
                                                    <th className="px-4 py-3 text-xs font-bold text-slate-500 uppercase w-32">Total</th>
                                                    <th className="px-4 py-3 w-10"></th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                                                {formData.items.map((item, index) => (
                                                    <tr key={index}>
                                                        <td className="p-2">
                                                            <select
                                                                value={item.product_id}
                                                                onChange={(e) => updateItemLine(index, 'product_id', e.target.value)}
                                                                required
                                                                className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-sm focus:ring-2 focus:ring-purple-500 outline-none"
                                                            >
                                                                <option value="">Sélectionner...</option>
                                                                {products.map(p => (
                                                                    <option key={p.id} value={p.id}>{p.name}</option>
                                                                ))}
                                                            </select>
                                                        </td>
                                                        <td className="p-2">
                                                            <input
                                                                type="number"
                                                                min="1"
                                                                value={item.quantity}
                                                                onChange={(e) => updateItemLine(index, 'quantity', parseInt(e.target.value))}
                                                                className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-sm focus:ring-2 focus:ring-purple-500 outline-none"
                                                            />
                                                        </td>
                                                        <td className="p-2">
                                                            <input
                                                                type="number"
                                                                min="0"
                                                                value={item.unit_price}
                                                                onChange={(e) => updateItemLine(index, 'unit_price', parseFloat(e.target.value))}
                                                                className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-sm focus:ring-2 focus:ring-purple-500 outline-none"
                                                            />
                                                        </td>
                                                        <td className="p-2 text-sm font-bold text-slate-700 dark:text-slate-300 text-right pr-4">
                                                            {formatCurrency(item.quantity * item.unit_price)}
                                                        </td>
                                                        <td className="p-2 text-center">
                                                            <button 
                                                                type="button" 
                                                                onClick={() => removeItemLine(index)}
                                                                className="text-red-500 hover:text-red-700"
                                                            >
                                                                <span className="material-symbols-outlined text-lg">delete</span>
                                                            </button>
                                                        </td>
                                                    </tr>
                                                ))}
                                                {formData.items.length === 0 && (
                                                    <tr>
                                                        <td colSpan="5" className="p-8 text-center text-slate-500 italic">
                                                            Ajoutez des produits à la commande
                                                        </td>
                                                    </tr>
                                                )}
                                            </tbody>
                                            {formData.items.length > 0 && (
                                                <tfoot>
                                                    <tr className="bg-slate-100 dark:bg-slate-800">
                                                        <td colSpan="3" className="px-4 py-3 text-right font-bold text-slate-600 dark:text-slate-400">TOTAL ESTIMÉ</td>
                                                        <td className="px-4 py-3 text-right font-bold text-purple-600 text-lg">
                                                            {formatCurrency(calculateTotal(formData.items))}
                                                        </td>
                                                        <td></td>
                                                    </tr>
                                                </tfoot>
                                            )}
                                        </table>
                                    </div>
                                </div>
                            </form>
                        </div>

                        <div className="p-6 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex justify-end gap-3 z-10">
                            <button
                                type="button"
                                onClick={() => setShowModal(false)}
                                className="px-6 py-3 border border-slate-200 dark:border-slate-700 rounded-xl font-medium hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                            >
                                Annuler
                            </button>
                            <button
                                type="submit"
                                form="po-form"
                                disabled={submitting || formData.items.length === 0}
                                className="px-8 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl font-bold shadow-lg hover:shadow-purple-500/20 transition-all disabled:opacity-50"
                            >
                                {submitting ? 'Création...' : 'Créer la commande'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default PurchaseOrders;
