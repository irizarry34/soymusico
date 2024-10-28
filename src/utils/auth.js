// src/utils/auth.js

export const validateToken = async (token, navigate) => {
    if (!token) {
        console.warn("No se ha proporcionado un token para validar.");
        return false;
    }

    try {
        const response = await fetch('http://localhost:8000/api/token/verify/', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ token }),
        });

        if (response.ok) {
            return true;
        } else {
            console.warn("El token es inválido o ha expirado. Intentando refrescar.");
            const newToken = await refreshAccessToken(navigate);
            return !!newToken;
        }
    } catch (error) {
        console.error("Error validando el token:", error);
        return false;
    }
};

export const refreshAccessToken = async (navigate) => {
    const refreshToken = localStorage.getItem('refresh_token');
    
    if (!refreshToken) {
        console.warn("No se encontró un refresh token. Inicia sesión nuevamente.");
        if (navigate) navigate('/login');  // Evita redirigir si navigate no está disponible
        return null;
    }

    try {
        const response = await fetch('http://localhost:8000/api/token/refresh/', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ refresh: refreshToken }),
        });

        if (response.ok) {
            const data = await response.json();
            localStorage.setItem('token', data.access);
            console.log("Token de acceso actualizado.");
            return data.access;
        } else {
            const errorData = await response.json();
            console.error("Error al refrescar el token:", errorData);
            if (navigate) navigate('/login');
            return null;
        }
    } catch (error) {
        console.error("Error al intentar refrescar el token:", error);
        if (navigate) navigate('/login');
        return null;
    }
};