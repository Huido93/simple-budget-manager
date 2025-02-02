import axios from 'axios';

// Define your Axios instance
const axiosInstance = axios.create({
  baseURL: 'http://localhost:5000', // Adjust this according to your backend's URL
  headers: {
    'Content-Type': 'application/json',
  },
});

export default axiosInstance;
