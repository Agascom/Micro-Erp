// src/services/warehouseService.js
import API from '../api/axios';

export const warehouseService = {
    // Liste des entrepôts
    async getAll() {
        const response = await API.get('/warehouses');
        return response.data;
    },

    // Détails d'un entrepôt
    async getById(id) {
        const response = await API.get(`/warehouses/${id}`);
        return response.data;
    },

    // Créer un entrepôt
    async create(warehouse) {
        const response = await API.post('/warehouses', warehouse);
        return response.data;
    },

    // Modifier un entrepôt
    async update(id, warehouse) {
        const response = await API.put(`/warehouses/${id}`, warehouse);
        return response.data;
    },

    // Supprimer un entrepôt
    async delete(id) {
        const response = await API.delete(`/warehouses/${id}`);
        return response.data;
    },

    // Stock par entrepôt pour un produit
    async getProductStock(productId) {
        const response = await API.get(`/products/${productId}/warehouse-stock`);
        return response.data;
    },

    // Transfert inter-dépôt
    async transferStock(data) {
        const response = await API.post('/warehouses/transfer', data);
        return response.data;
    }
};

export const productBatchService = {
    // Liste des lots
    async getAll(productId = null, warehouseId = null, expiringDays = null) {
        const params = new URLSearchParams();
        if (productId) params.append('product_id', productId);
        if (warehouseId) params.append('warehouse_id', warehouseId);
        if (expiringDays) params.append('expiring_days', expiringDays);
        const response = await API.get(`/product-batches?${params}`);
        return response.data;
    },

    // Créer un lot
    async create(batch) {
        const response = await API.post('/product-batches', batch);
        return response.data;
    },

    // Détails d'un lot
    async getById(id) {
        const response = await API.get(`/product-batches/${id}`);
        return response.data;
    },

    // Modifier un lot
    async update(id, batch) {
        const response = await API.put(`/product-batches/${id}`, batch);
        return response.data;
    },

    // Lots bientôt périmés
    async getExpiring(days = 30) {
        const response = await API.get(`/product-batches/expiring?days=${days}`);
        return response.data;
    },

    // Lots périmés
    async getExpired() {
        const response = await API.get('/product-batches/expired');
        return response.data;
    }
};

export const barcodeService = {
    // Liste des codes-barres
    async getAll(productId = null) {
        const params = new URLSearchParams();
        if (productId) params.append('product_id', productId);
        const response = await API.get(`/barcodes?${params}`);
        return response.data;
    },

    // Ajouter un code-barres
    async create(barcode) {
        const response = await API.post('/barcodes', barcode);
        return response.data;
    },

    // Rechercher par code-barres
    async lookup(barcode) {
        const response = await API.get(`/barcodes/lookup/${barcode}`);
        return response.data;
    },

    // Générer un code-barres
    async generate(productId, type = 'ean13') {
        const response = await API.post('/barcodes/generate', { product_id: productId, type });
        return response.data;
    },

    // Supprimer un code-barres
    async delete(id) {
        const response = await API.delete(`/barcodes/${id}`);
        return response.data;
    }
};
