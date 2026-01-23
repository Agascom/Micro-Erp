import API from '../api/axios';

const getAppointments = async (params) => {
    const response = await API.get('/appointments', { params });
    return response.data;
};

const createAppointment = async (data) => {
    const response = await API.post('/appointments', data);
    return response.data;
};

const updateAppointment = async (id, data) => {
    const response = await API.put(`/appointments/${id}`, data);
    return response.data;
};

const deleteAppointment = async (id) => {
    const response = await API.delete(`/appointments/${id}`);
    return response.data;
};

export const appointmentService = {
    getAppointments,
    createAppointment,
    updateAppointment,
    delete: deleteAppointment
};
