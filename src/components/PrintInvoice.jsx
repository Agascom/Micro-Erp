import React from 'react';
import { formatCurrency } from '../utils/currency';

// SVG Logo Component
const Logo = () => (
    <div className="flex items-center space-x-2">
        <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M20 0L40 20L20 40L0 20L20 0Z" fill="#06B6D4" />
            <path d="M12 28C16 24 24 24 28 28" stroke="white" strokeWidth="2" strokeLinecap="round" />
            <path d="M20 12V20" stroke="white" strokeWidth="2" strokeLinecap="round" />
        </svg>
        <span className="font-semibold text-lg text-gray-700">A&S Consulting</span>
    </div>
);

// Helper component for invoice detail rows
const DetailRow = ({ label, value }) => (
    <div className="flex justify-between py-1 flex-wrap">
        <p className="text-sm font-semibold text-gray-600 mr-2">{label}</p>
        <p className="text-sm text-gray-800 text-right flex-1">{value || '-'}</p>
    </div>
);

const PrintInvoice = ({ invoice }) => {
    if (!invoice) return null;

    const items = invoice.items || [];
    
    // Calculate totals if not provided or just rely on items
    const calculateSubtotal = () => {
        return items.reduce((sum, item) => sum + (parseFloat(item.quantity) || 0) * (parseFloat(item.unit_price) || 0), 0);
    };

    const subTotal = calculateSubtotal();
    const totalTVA = 0; // Assuming 0 for now as per current logic
    const shipping = 0;
    const totalTTC = subTotal + totalTVA + shipping; // Or use invoice.total

    return (
        <div className="bg-white h-full font-sans p-0" id="printable-invoice-area">
            <div className="w-full h-full bg-white shadow-none px-[2.5cm] py-[2.5cm] flex flex-col justify-between">
                <div className="flex-grow flex flex-col">
                    <div>
                        {/* Header */}
                        <header className="flex flex-row justify-between items-start pb-8 border-b border-gray-200">
                            <Logo />
                            <div className="mt-0 text-right">
                                <h1 className="text-3xl font-bold text-gray-800 tracking-wider uppercase">FACTURE N°:</h1>
                                <p className="text-2xl font-bold text-gray-600 tracking-wider mt-2">{invoice.invoice_number}</p>
                            </div>
                        </header>

                        {/* Invoice Details & Client Info */}
                        <section className="grid grid-cols-2 gap-8 my-8">
                            <div className="bg-cyan-50 p-6 rounded-lg print-color-exact">
                                <DetailRow label="Date :" value={new Date(invoice.issue_date).toLocaleDateString('fr-FR')} />
                                <DetailRow label="Bon de commande n° :" value={invoice.order_number || '-'} />
                                <DetailRow label="Conditions de Paiement :" value="30 Jours" />
                                <DetailRow label="Mode de paiement :" value="Virement Bancaire" />
                                <DetailRow label="Émis par :" value="Administration" />
                                <DetailRow label="Contact client :" value="+123-456-7890" />
                            </div>
                            <div className="pt-6">
                                <h2 className="text-sm font-bold uppercase text-cyan-600 tracking-widest pb-2 border-b-2 border-cyan-500 inline-block">CLIENT</h2>
                                <p className="font-bold text-lg text-gray-800 mt-4">{invoice.client?.name || 'Client Inconnu'}</p>
                                <p className="text-gray-600">{invoice.client?.address || 'Adresse non renseignée'}</p>
                                <p className="text-gray-600">{invoice.client?.phone || ''}</p>
                                <p className="text-gray-600">{invoice.client?.email || ''}</p>
                            </div>
                        </section>

                        {/* Additional Information */}
                        {invoice.notes && (
                            <section className="my-8">
                                <h3 className="font-bold text-gray-800 mb-2">Informations additionnelles</h3>
                                <p className="text-sm text-gray-600 leading-relaxed">
                                    {invoice.notes}
                                </p>
                            </section>
                        )}
                    </div>

                    <div className="flex-grow flex flex-col justify-center">
                        {/* Items Table */}
                        <section className="my-8">
                    <div className="overflow-x-auto rounded-lg border border-gray-200">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="bg-gray-100 print-color-exact">
                                    <th className="p-3 text-sm font-semibold text-gray-600 whitespace-nowrap">Référence</th>
                                    <th className="p-3 text-sm font-semibold text-gray-600 whitespace-nowrap">Description</th>
                                    <th className="p-3 text-sm font-semibold text-gray-600 text-center whitespace-nowrap">Quantité</th>
                                    <th className="p-3 text-sm font-semibold text-gray-600 text-right whitespace-nowrap">Prix Unit. HT</th>
                                    <th className="p-3 text-sm font-semibold text-gray-600 text-right whitespace-nowrap">Montant HT</th>
                                </tr>
                            </thead>
                            <tbody>
                                {items.map((item, index) => (
                                    <tr key={index} className="border-b border-gray-200 last:border-b-0 break-inside-avoid">
                                        <td className="p-3 text-gray-700">{item.product_id ? `#${item.product_id}` : '-'}</td>
                                        <td className="p-3 text-gray-700">{item.product?.name || item.description || 'Article'}</td>
                                        <td className="p-3 text-gray-700 text-center">{item.quantity}</td>
                                        <td className="p-3 text-gray-700 text-right">{formatCurrency(item.unit_price)}</td>
                                        <td className="p-3 text-gray-700 text-right font-medium">{formatCurrency(item.quantity * item.unit_price)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </section>

                {/* Totals */}
                <section className="flex justify-end my-8 break-inside-avoid">
                    <div className="w-full sm:w-1/2 md:w-2/5">
                        <div className="space-y-3">
                            <div className="flex justify-between text-gray-700">
                                <span>Total HT</span>
                                <span className="font-medium">{formatCurrency(subTotal)}</span>
                            </div>
                            <div className="flex justify-between text-gray-700">
                                <span>Total TVA (0%)</span>
                                <span className="font-medium">{formatCurrency(totalTVA)}</span>
                            </div>
                            <div className="flex justify-between text-gray-700">
                                <span>Livraison</span>
                                <span className="font-medium">{formatCurrency(shipping)}</span>
                            </div>
                            <div className="border-t border-gray-300 my-2"></div>
                            <div className="flex justify-between items-center text-cyan-600 font-bold text-2xl">
                                <span>Total TTC</span>
                                <span>{formatCurrency(totalTTC)}</span>
                            </div>
                        </div>
                    </div>
                </section>
                    </div>
                </div>
                
                {/* Footer Section Wrapper (Legal Only) */}
                <div>

                {/* Footer */}
                <footer className="pt-8 mt-8 border-t border-gray-200 text-sm text-gray-600 break-inside-avoid">
                    <div className="grid grid-cols-3 gap-8">
                        <div className="bg-gray-50 p-6 rounded-lg col-span-1 print-color-exact">
                            <h4 className="font-bold text-gray-800 mb-2">Banque:</h4>
                            <p>Numéro de compte: FR76 ....</p>
                            <p>IBAN: FR76 ....</p>
                            <p>SWIFT BIC: ....</p>
                        </div>
                        <div className="bg-gray-50 p-6 rounded-lg col-span-2 grid grid-cols-2 gap-8 print-color-exact">
                            <div>
                                <h4 className="font-bold text-gray-800 mb-2">Siège Social</h4>
                                <p>123 Avenue des Champs-Élysées</p>
                                <p>75008 Paris, France</p>
                                <p>SIRET : 123 456 789 00000</p>
                                <p>TVA : FR 12 3456789</p>
                            </div>
                            <div>
                                <h4 className="font-bold text-gray-800 mb-2">Coordonnées</h4>
                                <p>Service Compta</p>
                                <p>+33 1 23 45 67 89</p>
                                <p>contact@as-consulting.com</p>
                                <p>www.as-consulting.com</p>
                            </div>
                        </div>
                    </div>
                </footer>
                </div>
            </div>
        </div>
    );
};

export default PrintInvoice;
