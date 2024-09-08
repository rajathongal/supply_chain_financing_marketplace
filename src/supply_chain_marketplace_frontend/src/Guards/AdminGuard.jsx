import React from "react";
import PropTypes from "prop-types";
import { useAuth } from "../Context/useAuthClient";
import { Navigate } from "react-router-dom";

const AdminGuard = ({ children }) => {
  const { isAuthenticated, admin } = useAuth();

  if (isAuthenticated && ! admin) {
    return <>{children}</>;
  } else if (isAuthenticated && admin) {
    return <Navigate to="/dashboard" />;
  } else {
    return <Navigate to="/signin" />;
  }
};

AdminGuard.propTypes = {
  children: PropTypes.node,
};

export default AdminGuard;
