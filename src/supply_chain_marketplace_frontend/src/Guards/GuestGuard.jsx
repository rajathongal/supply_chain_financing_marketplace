import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../Context/useAuthClient";

const GuestGuard = ({ children }) => {
  const { isAuthenticated } = useAuth();


  if (isAuthenticated) {
    return <>{children}</>;
  } else {
    return <Navigate to="/" replace={true}/>
  }
};

export default GuestGuard