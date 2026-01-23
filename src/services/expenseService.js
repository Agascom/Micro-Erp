import API from '../api/axios';

const getAll = async (params) => {
    const response = await API.get('/expenses', { params });
    return response.data;
};

const create = async (data) => {
    const response = await API.post('/expenses', data);
    return response.data;
};

const update = async (id, data) => {
    const response = await API.put(`/expenses/${id}`, data);
    return response.data;
};

const remove = async (id) => {
    const response = await API.delete(`/expenses/${id}`);
    return response.data;
};

const getCategories = async () => {
    const response = await API.get('/expense-categories');
    return response.data;
};

export const expenseService = {
    getAll,
    create,
    update,
    delete: remove,
    getCategories
};
