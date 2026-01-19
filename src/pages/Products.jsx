// src/pages/Products.jsx
import { useState, useEffect } from 'react';
import { productService } from '../services/productService';
import { categoryService } from '../services/categoryService';
import { formatCurrency } from '../utils/currency';

const Products = () => {
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [editingProduct, setEditingProduct] = useState(null);
    const [formData, setFormData] = useState({
        code: '',
        name: '',
        stock_level: 0,
        sale_price: 0,
        category_id: ''
    });
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [productsRes, categoriesRes] = await Promise.all([
                productService.getAll(),
                categoryService.getAll()
            ]);
            setProducts(productsRes.data || productsRes || []);
            setCategories(categoriesRes.data || categoriesRes || []);
        } catch (err) {
            setError('Erreur lors du chargement des produits');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            if (editingProduct) {
                await productService.update(editingProduct.id, formData);
            } else {
                await productService.create(formData);
            }
            setShowModal(false);
            setEditingProduct(null);
            setFormData({ code: '', name: '', stock_level: 0, sale_price: 0, category_id: '' });
            fetchData();
        } catch (err) {
            setError(err.response?.data?.message || 'Erreur lors de la sauvegarde');
        } finally {
            setSubmitting(false);
        }
    };

    const handleEdit = (product) => {
        setEditingProduct(product);
        setFormData({
            code: product.code,
            name: product.name,
            stock_level: product.stock_level,
            sale_price: product.sale_price,
            category_id: product.category_id
        });
        setShowModal(true);
    };

    const handleDelete = async (id) => {
        if (confirm('Êtes-vous sûr de vouloir supprimer ce produit ?')) {
            try {
                await productService.delete(id);
                fetchData();
            } catch (err) {
                setError('Erreur lors de la suppression');
            }
        }
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
                        <span>Inventaire</span>
                        <span>/</span>
                        <span className="text-slate-800 dark:text-slate-200">Produits</span>
                    </nav>
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Gestion des Produits</h2>
                </div>
                <button
                    onClick={() => {
                        setEditingProduct(null);
                        setFormData({ code: '', name: '', stock_level: 0, sale_price: 0, category_id: '' });
                        setShowModal(true);
                    }}
                    className="flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl text-sm font-semibold shadow-lg hover:shadow-xl transition-all"
                >
                    <span className="material-symbols-outlined">add</span>
                    Nouveau Produit
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

            {/* Products Table */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800">
                                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase">Code</th>
                                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase">Nom</th>
                                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase">Catégorie</th>
                                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase">Stock</th>
                                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase">Prix</th>
                                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                            {products.length === 0 ? (
                                <tr>
                                    <td colSpan="6" className="px-6 py-12 text-center text-slate-500">
                                        Aucun produit trouvé
                                    </td>
                                </tr>
                            ) : (
                                products.map((product) => (
                                    <tr key={product.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                                        <td className="px-6 py-4 font-mono text-sm text-purple-600">{product.code}</td>
                                        <td className="px-6 py-4 font-medium text-slate-900 dark:text-white">{product.name}</td>
                                        <td className="px-6 py-4 text-slate-600 dark:text-slate-400">
                                            {product.category?.name || '-'}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                                                product.stock_level <= 5 
                                                    ? 'bg-red-100 text-red-600' 
                                                    : product.stock_level <= 20 
                                                        ? 'bg-amber-100 text-amber-600' 
                                                        : 'bg-emerald-100 text-emerald-600'
                                            }`}>
                                                {product.stock_level} unités
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 font-semibold text-slate-900 dark:text-white">
                                            {formatCurrency(product.sale_price)}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <button
                                                    onClick={() => handleEdit(product)}
                                                    className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                                                >
                                                    <span className="material-symbols-outlined text-xl">edit</span>
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(product.id)}
                                                    className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
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

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-md">
                        <div className="p-6 border-b border-slate-200 dark:border-slate-800">
                            <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                                {editingProduct ? 'Modifier le produit' : 'Nouveau produit'}
                            </h3>
                        </div>
                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Code</label>
                                <input
                                    type="text"
                                    value={formData.code}
                                    onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                                    required
                                    className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                                    placeholder="PROD-001"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Nom</label>
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    required
                                    className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                                    placeholder="Nom du produit"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Catégorie</label>
                                <select
                                    value={formData.category_id}
                                    onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
                                    required
                                    className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                                >
                                    <option value="">Sélectionner une catégorie</option>
                                    {categories.map((cat) => (
                                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Stock</label>
                                    <input
                                        type="number"
                                        value={formData.stock_level}
                                        onChange={(e) => setFormData({ ...formData, stock_level: parseInt(e.target.value) })}
                                        min="0"
                                        required
                                        className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Prix (FCFA)</label>
                                    <input
                                        type="number"
                                        value={formData.sale_price}
                                        onChange={(e) => setFormData({ ...formData, sale_price: parseFloat(e.target.value) })}
                                        min="0"
                                        step="0.01"
                                        required
                                        className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                                    />
                                </div>
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

export default Products;
