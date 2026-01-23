// src/services/pricingService.js
import API from '../api/axios';

export const pricingService = {
    // Devises
    async getCurrencies() {
        const response = await API.get('/pricing/currencies');
        return response.data;
    },

    async createCurrency(currency) {
        const response = await API.post('/pricing/currencies', currency);
        return response.data;
    },

    async updateCurrency(id, currency) {
        const response = await API.put(`/pricing/currencies/${id}`, currency);
        return response.data;
    },

    // Grilles tarifaires
    async getPriceLists() {
        const response = await API.get('/pricing/price-lists');
        return response.data;
    },

    async createPriceList(priceList) {
        const response = await API.post('/pricing/price-lists', priceList);
        return response.data;
    },

    // Prix par produit
    async getProductPrices(productId) {
        const response = await API.get(`/pricing/products/${productId}/prices`);
        return response.data;
    },

    async createProductPrice(data) {
        const response = await API.post('/pricing/product-prices', data);
        return response.data;
    },

    // Remises client
    async getClientDiscounts(clientId) {
        const response = await API.get(`/pricing/clients/${clientId}/discounts`);
        return response.data;
    },

    async createClientDiscount(discount) {
        const response = await API.post('/pricing/client-discounts', discount);
        return response.data;
    },

    async deleteClientDiscount(id) {
        const response = await API.delete(`/pricing/client-discounts/${id}`);
        return response.data;
    },

    // Promotions
    async getPromotions() {
        const response = await API.get('/pricing/promotions');
        return response.data;
    },

    async createPromotion(promotion) {
        const response = await API.post('/pricing/promotions', promotion);
        return response.data;
    },

    async deletePromotion(id) {
        const response = await API.delete(`/pricing/promotions/${id}`);
        return response.data;
    }
};
