import API from '../api/axios';

const getAttendances = async (params) => {
    const response = await API.get('/attendances', { params });
    return response.data;
};

const createAttendance = async (data) => {
    const response = await API.post('/attendances', data);
    return response.data;
};

const updateAttendance = async (id, data) => {
    const response = await API.put(`/attendances/${id}`, data);
    return response.data;
};

// Bonus: Get current user attendance status if API supports it
const getMyAttendance = async () => {
    // This might not exist yet, but logic suggests we might need it.
    // customized endpoint for current user status
    return null;
};

export default {
    getAttendances,
    createAttendance,
    updateAttendance,
    getMyAttendance
};
