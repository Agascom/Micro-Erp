// src/services/companyService.js
import API from '../api/axios';

export const companyService = {
    // Liste des entreprises
    async getAll() {
        const response = await API.get('/companies');
        return response.data;
    },

    // Entreprise active
    async getCurrent() {
        const response = await API.get('/companies/current');
        return response.data;
    },

    // Détails d'une entreprise
    async getById(id) {
        const response = await API.get(`/companies/${id}`);
        return response.data;
    },

    // Créer une entreprise
    async create(company) {
        const response = await API.post('/companies', company);
        return response.data;
    },

    // Modifier une entreprise
    async update(id, company) {
        const response = await API.put(`/companies/${id}`, company);
        return response.data;
    },

    // Supprimer une entreprise
    async delete(id) {
        const response = await API.delete(`/companies/${id}`);
        return response.data;
    },

    // Ajouter un utilisateur
    async addUser(companyId, userId, roleId) {
        const response = await API.post(`/companies/${companyId}/users`, { user_id: userId, role_id: roleId });
        return response.data;
    },

    // Retirer un utilisateur
    async removeUser(companyId, userId) {
        const response = await API.delete(`/companies/${companyId}/users/${userId}`);
        return response.data;
    },

    // Changer d'entreprise active
    async switchCompany(id) {
        const response = await API.post(`/companies/${id}/switch`);
        return response.data;
    }
};
