import React from "react";
import { Route, Navigate } from "react-router-dom";

const ProtectedRoute = ({ element: Component, ...rest }) => {
    const djangoToken = localStorage.getItem("django_token"); // Verifica el token JWT de Django

    return (
        <Route
            {...rest}
            element={djangoToken ? Component : <Navigate to="/login" />}
        />
    );
};

export default ProtectedRoute;