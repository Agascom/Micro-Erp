import API from '../api/axios';

const getAll = async () => {
    const response = await API.get('/roles');
    return response.data;
};

const create = async (data) => {
    const response = await API.post('/roles', data);
    return response.data;
};

const update = async (id, data) => {
    const response = await API.put(`/roles/${id}`, data);
    return response.data;
};

const remove = async (id) => {
    const response = await API.delete(`/roles/${id}`);
    return response.data;
};

export const roleService = {
    getAll,
    create,
    update,
    delete: remove
};
