// src/pages/Companies.jsx
import { useState, useEffect, useCallback } from 'react';
import { companyService } from '../services/companyService';
import { useToast } from '../contexts/ToastContext';

const Companies = () => {
    const [companies, setCompanies] = useState([]);
    const [currentCompany, setCurrentCompany] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [formData, setFormData] = useState({
        name: '', legal_name: '', registration_number: '', tax_number: '',
        address: '', city: '', country: 'Guinée', phone: '', email: '', default_tax_rate: 18
    });
    const { showToast } = useToast();

    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            const [companiesRes, currentRes] = await Promise.allSettled([
                companyService.getAll(), companyService.getCurrent()
            ]);
            if (companiesRes.status === 'fulfilled') setCompanies(companiesRes.value.data || companiesRes.value || []);
            if (currentRes.status === 'fulfilled') setCurrentCompany(currentRes.value.data || currentRes.value);
        } catch (err) { showToast('Erreur', 'error'); }
        finally { setLoading(false); }
    }, [showToast]);

    useEffect(() => { fetchData(); }, [fetchData]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await companyService.create(formData);
            showToast('Entreprise créée', 'success');
            setShowModal(false);
            fetchData();
        } catch (err) { showToast('Erreur', 'error'); }
    };

    const handleSwitch = async (id) => {
        try {
            await companyService.switchCompany(id);
            showToast('Entreprise changée', 'success');
            fetchData();
        } catch (err) { showToast('Erreur', 'error'); }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Supprimer cette entreprise ?')) return;
        try { await companyService.delete(id); showToast('Supprimée', 'success'); fetchData(); }
        catch (err) { showToast('Erreur', 'error'); }
    };

    return (
        <>
            <div className="flex items-center justify-between">
                <div>
                    <nav className="flex items-center gap-2 text-xs font-medium text-slate-400 mb-1">
                        <span>Paramètres</span><span>/</span><span className="text-slate-800 dark:text-slate-200">Entreprises</span>
                    </nav>
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Gestion Multi-Entreprise</h2>
                </div>
                <button onClick={() => setShowModal(true)} className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl text-sm font-semibold shadow-lg">
                    <span className="material-symbols-outlined text-lg">add</span>Nouvelle Entreprise
                </button>
            </div>

            {currentCompany && (
                <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-2xl p-6 text-white">
                    <div className="flex items-center gap-4">
                        <span className="material-symbols-outlined text-4xl opacity-80">business</span>
                        <div>
                            <p className="text-sm opacity-80">Entreprise active</p>
                            <h3 className="text-2xl font-bold">{currentCompany.name}</h3>
                            <p className="text-sm opacity-80">{currentCompany.email}</p>
                        </div>
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {loading ? (
                    <div className="col-span-full flex items-center justify-center h-64"><div className="w-10 h-10 border-4 border-purple-600 border-t-transparent rounded-full animate-spin"></div></div>
                ) : companies.length === 0 ? (
                    <div className="col-span-full text-center py-16"><span className="material-symbols-outlined text-6xl text-slate-300 mb-4">business</span><p className="text-slate-500">Aucune entreprise</p></div>
                ) : (
                    companies.map((c) => (
                        <div key={c.id} className={`bg-white dark:bg-slate-900 rounded-2xl border-2 shadow-sm p-6 ${currentCompany?.id === c.id ? 'border-purple-500' : 'border-slate-200 dark:border-slate-800'}`}>
                            <div className="flex items-start justify-between mb-4">
                                <div>
                                    <h3 className="font-bold text-slate-900 dark:text-white">{c.name}</h3>
                                    <p className="text-sm text-slate-500">{c.legal_name}</p>
                                </div>
                                {currentCompany?.id === c.id && <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-medium">Active</span>}
                            </div>
                            <div className="space-y-2 text-sm text-slate-600 dark:text-slate-400">
                                {c.email && <p className="flex items-center gap-2"><span className="material-symbols-outlined text-lg">email</span>{c.email}</p>}
                                {c.phone && <p className="flex items-center gap-2"><span className="material-symbols-outlined text-lg">phone</span>{c.phone}</p>}
                                {c.city && <p className="flex items-center gap-2"><span className="material-symbols-outlined text-lg">location_on</span>{c.city}, {c.country}</p>}
                            </div>
                            <div className="flex gap-2 mt-4 pt-4 border-t border-slate-200 dark:border-slate-800">
                                {currentCompany?.id !== c.id && (
                                    <button onClick={() => handleSwitch(c.id)} className="flex-1 px-3 py-2 bg-purple-50 text-purple-600 rounded-lg text-sm font-medium hover:bg-purple-100">Activer</button>
                                )}
                                <button onClick={() => handleDelete(c.id)} className="p-2 hover:bg-red-50 rounded-lg text-red-600"><span className="material-symbols-outlined">delete</span></button>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
                    <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto">
                        <div className="p-6 border-b border-slate-200 dark:border-slate-800"><h3 className="text-xl font-bold">Nouvelle Entreprise</h3></div>
                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <input type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="w-full px-4 py-2 border rounded-lg dark:bg-slate-800" required placeholder="Nom commercial" />
                                <input type="text" value={formData.legal_name} onChange={(e) => setFormData({ ...formData, legal_name: e.target.value })} className="w-full px-4 py-2 border rounded-lg dark:bg-slate-800" placeholder="Raison sociale" />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <input type="text" value={formData.registration_number} onChange={(e) => setFormData({ ...formData, registration_number: e.target.value })} className="w-full px-4 py-2 border rounded-lg dark:bg-slate-800" placeholder="N° RCCM" />
                                <input type="text" value={formData.tax_number} onChange={(e) => setFormData({ ...formData, tax_number: e.target.value })} className="w-full px-4 py-2 border rounded-lg dark:bg-slate-800" placeholder="NIF" />
                            </div>
                            <input type="text" value={formData.address} onChange={(e) => setFormData({ ...formData, address: e.target.value })} className="w-full px-4 py-2 border rounded-lg dark:bg-slate-800" placeholder="Adresse" />
                            <div className="grid grid-cols-2 gap-4">
                                <input type="text" value={formData.city} onChange={(e) => setFormData({ ...formData, city: e.target.value })} className="w-full px-4 py-2 border rounded-lg dark:bg-slate-800" placeholder="Ville" />
                                <input type="text" value={formData.country} onChange={(e) => setFormData({ ...formData, country: e.target.value })} className="w-full px-4 py-2 border rounded-lg dark:bg-slate-800" placeholder="Pays" />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <input type="tel" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} className="w-full px-4 py-2 border rounded-lg dark:bg-slate-800" placeholder="Téléphone" />
                                <input type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} className="w-full px-4 py-2 border rounded-lg dark:bg-slate-800" placeholder="Email" />
                            </div>
                            <input type="number" value={formData.default_tax_rate} onChange={(e) => setFormData({ ...formData, default_tax_rate: e.target.value })} className="w-full px-4 py-2 border rounded-lg dark:bg-slate-800" placeholder="Taux TVA %" />
                            <div className="flex gap-3 pt-4">
                                <button type="button" onClick={() => setShowModal(false)} className="flex-1 px-4 py-2 border rounded-lg">Annuler</button>
                                <button type="submit" className="flex-1 px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg font-semibold">Créer</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </>
    );
};

export default Companies;
