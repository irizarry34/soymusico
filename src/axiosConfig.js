// src/axiosConfig.js

import axios from 'axios';

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL, // Asegúrate de que esta variable esté en tu archivo .env
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para agregar el token de autorización en cada solicitud si está disponible
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

export default api;