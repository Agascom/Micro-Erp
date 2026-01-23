import API from '../api/axios';

const getAll = async (params) => {
    const response = await API.get('/purchase-orders', { params });
    return response.data;
};

const getById = async (id) => {
    const response = await API.get(`/purchase-orders/${id}`);
    return response.data;
};

const create = async (data) => {
    const response = await API.post('/purchase-orders', data);
    return response.data;
};

const markAsReceived = async (id) => {
    const response = await API.post(`/purchase-orders/${id}/received`);
    return response.data;
};

export const purchaseOrderService = {
    getAll,
    getById,
    create,
    markAsReceived
};
