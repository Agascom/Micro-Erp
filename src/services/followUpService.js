import API from '../api/axios';

const getFollowUps = async (params) => {
    const response = await API.get('/client-follow-ups', { params });
    return response.data;
};

const getById = async (id) => {
    const response = await API.get(`/client-follow-ups/${id}`);
    return response.data;
};

const createFollowUp = async (data) => {
    const response = await API.post('/client-follow-ups', data);
    return response.data;
};

const updateFollowUp = async (id, data) => {
    const response = await API.put(`/client-follow-ups/${id}`, data);
    return response.data;
};

const deleteFollowUp = async (id) => {
    const response = await API.delete(`/client-follow-ups/${id}`);
    return response.data;
};

export const followUpService = {
    getFollowUps,
    getById,
    createFollowUp,
    updateFollowUp,
    delete: deleteFollowUp
};
