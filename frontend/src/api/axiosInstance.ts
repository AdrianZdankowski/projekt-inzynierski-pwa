import axios from "axios";
import { API_BASE_URL } from "./axiosConfig";

const axiosInstance = axios.create({
    baseURL: API_BASE_URL
});

export default axiosInstance;