import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../Context/useAuthClient";

const GuestGuard = ({ children }) => {
  const { isAuthenticated, admin, role } = useAuth();

  if (isAuthenticated) {
    if (!admin) {
      return <Navigate to="/setadmin" replace={true} />;
    } else if (!role) {
      return <Navigate to="/setuserrole" replace={true} />;
    } else {
      return <>{children}</>;
    }
  }
};

export default GuestGuard;
