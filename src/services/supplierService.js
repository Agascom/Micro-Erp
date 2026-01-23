import API from '../api/axios';

const getAll = async () => {
    const response = await API.get('/suppliers');
    return response.data;
};

const create = async (data) => {
    const response = await API.post('/suppliers', data);
    return response.data;
};

const update = async (id, data) => {
    const response = await API.put(`/suppliers/${id}`, data);
    return response.data;
};

const remove = async (id) => {
    const response = await API.delete(`/suppliers/${id}`);
    return response.data;
};

export const supplierService = {
    getAll,
    create,
    update,
    delete: remove
};
