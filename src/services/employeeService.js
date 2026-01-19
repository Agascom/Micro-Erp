// src/services/employeeService.js
import API from '../api/axios';

export const employeeService = {
    async getAll() {
        const response = await API.get('/employees');
        return response.data;
    },

    async getById(id) {
        const response = await API.get(`/employees/${id}`);
        return response.data;
    },

    async create(employee) {
        const response = await API.post('/employees', employee);
        return response.data;
    },

    async update(id, employee) {
        const response = await API.put(`/employees/${id}`, employee);
        return response.data;
    },

    async delete(id) {
        const response = await API.delete(`/employees/${id}`);
        return response.data;
    },
};
