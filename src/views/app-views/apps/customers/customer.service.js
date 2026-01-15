import axios from "axios";

const API = "https://test.happypay.live";

export const getAllCustomers = (token) =>
    axios.get(`${API}/customer/getAll`, {
        headers: { Authorization: token }
    });

export const addCustomer = (data, token) =>
    axios.post(`${API}/customer`, data, {
        headers: { Authorization: token }
    });
