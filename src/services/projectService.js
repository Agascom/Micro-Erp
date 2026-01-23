import API from '../api/axios';

const getAll = async (params) => {
    const response = await API.get('/projects', { params });
    return response.data;
};

const getById = async (id) => {
    const response = await API.get(`/projects/${id}`);
    return response.data;
};

const create = async (data) => {
    const response = await API.post('/projects', data);
    return response.data;
};

const update = async (id, data) => {
    const response = await API.put(`/projects/${id}`, data);
    return response.data;
};

const remove = async (id) => {
    const response = await API.delete(`/projects/${id}`);
    return response.data;
};

export const projectService = {
    getAll,
    getById,
    create,
    update,
    delete: remove
};
