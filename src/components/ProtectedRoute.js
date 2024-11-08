import React from "react";
import { Navigate, Outlet } from "react-router-dom";

const ProtectedRoute = () => {
  const djangoToken = localStorage.getItem("django_token"); // Verifica el token JWT de Django

  return djangoToken ? <Outlet /> : <Navigate to="/login" />;
};

export default ProtectedRoute;