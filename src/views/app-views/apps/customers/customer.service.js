import axios from "axios";

const API = "https://test.happypay.live";

export const getAllCustomers = (token) =>
    axios.get(`${API}/customer/getAll`, {
        headers: { Authorization: `Bearer ${token}` }
    });

export const addCustomer = (data, token, customerId) =>
    // Send POST body with optional customer_id field.
    axios.post(`${API}/customer`, { ...data, ...(customerId ? { customer_id: customerId } : {}) }, {
        headers: { Authorization: `Bearer ${token}` }
    });
