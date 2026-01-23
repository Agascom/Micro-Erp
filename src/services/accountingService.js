import API from '../api/axios';

const getStats = async (period = 'month') => {
    const response = await API.get('/accounting/stats', { params: { period } });
    return response.data;
};

const getTransactions = async (params) => {
    const response = await API.get('/accounting/transactions', { params });
    return response.data;
};

const getBalanceSheet = async () => {
    const response = await API.get('/accounting/balance-sheet');
    return response.data;
};

export const accountingService = {
    getStats,
    getTransactions,
    getBalanceSheet
};
