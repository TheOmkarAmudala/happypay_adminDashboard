import axios from "axios";

const instance = axios.create({
    baseURL: "https://test.happypay.live",
    headers: {
        "Content-Type": "application/json",
    },
});


instance.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem("auth_token"); // same key as login
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        console.log(token);
        return config;
    },
    (error) => Promise.reject(error)
);

export default instance;
