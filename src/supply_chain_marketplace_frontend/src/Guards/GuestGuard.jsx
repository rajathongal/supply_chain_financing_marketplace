import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../Context/useAuthClient";

const GuestGuard = ({ children }) => {
  const { isAuthenticated, admin } = useAuth();

  if (isAuthenticated) {
    if (!admin) {
      return <Navigate to="/setadmin" replace={true}/>;
    } else {
      return <>{children}</>;
    }
  } else {
    return <Navigate to="/" replace={true} />;
  }
};

export default GuestGuard;
