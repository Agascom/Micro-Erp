import API from '../api/axios';

export const userService = {
    async getAll() {
        const response = await API.get('/users');
        return response.data;
    },

    async getById(id) {
        const response = await API.get(`/users/${id}`);
        return response.data;
    },

    async create(user) {
        const response = await API.post('/users', user);
        return response.data;
    },

    async update(id, user) {
        const response = await API.put(`/users/${id}`, user);
        return response.data;
    },

    async delete(id) {
        const response = await API.delete(`/users/${id}`);
        return response.data;
    }
};
