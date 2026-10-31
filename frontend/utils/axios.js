// import axios from "axios";

// const api=axios.create({
//     baseURL:import.meta.env.VITE_SERVER_URL,
//     withCredentials:true
// })

// export default api


import axios from "axios";
import { auth } from "./firebase.js"; // Adjust path to your actual Firebase file

const api = axios.create({
    baseURL: import.meta.env.VITE_SERVER_URL,
    withCredentials: true
});

api.interceptors.request.use(async (config) => {
    const user = auth.currentUser;

    if (user) {
        const token = await user.getIdToken();
        config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
});

export default api;
