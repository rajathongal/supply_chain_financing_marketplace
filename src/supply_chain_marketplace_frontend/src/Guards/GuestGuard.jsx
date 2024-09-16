import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../Context/useAuthClient";

const GuestGuard = ({ children }) => {
  const { isAuthenticated, role } = useAuth();

  if (isAuthenticated) {
    if (!role) {
      return <Navigate to="/setuserrole" replace={true} />;
    } else {
      return <>{children}</>;
    }
  }
};

export default GuestGuard;
