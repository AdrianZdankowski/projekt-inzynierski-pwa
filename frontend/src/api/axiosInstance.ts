import axios from "axios";

const axiosInstance = axios.create({
    baseURL: 'http://localhost:5105/api'
});

export default axiosInstance;