import API from '../api/axios';

const getAll = async (params) => {
    const response = await API.get('/tasks', { params });
    return response.data;
};

const create = async (data) => {
    const response = await API.post('/tasks', data);
    return response.data;
};

const update = async (id, data) => {
    const response = await API.put(`/tasks/${id}`, data);
    return response.data;
};

const updateStatus = async (id, status) => {
    const response = await API.patch(`/tasks/${id}/status`, { status });
    return response.data;
};

const remove = async (id) => {
    const response = await API.delete(`/tasks/${id}`);
    return response.data;
};

export const taskService = {
    getAll,
    create,
    update,
    updateStatus,
    delete: remove
};
