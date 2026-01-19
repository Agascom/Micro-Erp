// src/utils/currency.js
// Utilitaire centralisé pour le formatage des devises en Franc CFA

/**
 * Formate un montant en Franc CFA (XAF)
 * @param {number} amount - Le montant à formater
 * @returns {string} Le montant formaté avec le symbole FCFA
 */
export const formatCurrency = (amount) => {
    const value = parseFloat(amount) || 0;
    return new Intl.NumberFormat('fr-FR', {
        style: 'decimal',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    }).format(value) + ' FCFA';
};

/**
 * Formate un montant en version compacte (K, M, etc.)
 * @param {number} amount - Le montant à formater
 * @returns {string} Le montant formaté de manière compacte
 */
export const formatCurrencyCompact = (amount) => {
    const value = parseFloat(amount) || 0;
    if (value >= 1000000) {
        return (value / 1000000).toFixed(1) + 'M FCFA';
    } else if (value >= 1000) {
        return (value / 1000).toFixed(0) + 'K FCFA';
    }
    return value.toFixed(0) + ' FCFA';
};

/**
 * Code ISO de la devise
 */
export const CURRENCY_CODE = 'XAF';

/**
 * Symbole de la devise
 */
export const CURRENCY_SYMBOL = 'FCFA';
