// src/utils/auth.js

// Validar el token de Django
export const validateToken = async (token, navigate) => {
  if (!token) {
      console.warn("No se ha proporcionado un token de Django para validar.");
      return false;
  }

  try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/token/verify/`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token }),
      });

      if (response.ok) {
          return true;
      } else {
          console.warn("El token de Django es inválido o ha expirado. Intentando refrescar.");
          const newToken = await refreshAccessToken(navigate);
          return !!newToken;
      }
  } catch (error) {
      console.error("Error validando el token de Django:", error);
      return false;
  }
};

// Refrescar el token de Django
export const refreshAccessToken = async (navigate) => {
  const refreshToken = localStorage.getItem('django_refresh_token');
  
  if (!refreshToken) {
      console.warn("No se encontró un refresh token de Django. Inicia sesión nuevamente.");
      if (navigate) navigate('/login');  // Evita redirigir si navigate no está disponible
      return null;
  }

  try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/token/refresh/`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ refresh: refreshToken }),
      });

      if (response.ok) {
          const data = await response.json();
          localStorage.setItem('django_token', data.access); // Guarda el nuevo token de acceso de Django
          console.log("Token de acceso de Django actualizado.");
          return data.access;
      } else {
          const errorData = await response.json();
          console.error("Error al refrescar el token de Django:", errorData);
          if (navigate) navigate('/login');
          return null;
      }
  } catch (error) {
      console.error("Error al intentar refrescar el token de Django:", error);
      if (navigate) navigate('/login');
      return null;
  }
};