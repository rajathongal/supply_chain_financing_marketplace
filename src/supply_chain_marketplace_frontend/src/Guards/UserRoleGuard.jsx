import React from "react";
import PropTypes from "prop-types";
import { useAuth } from "../Context/useAuthClient";
import { Navigate } from "react-router-dom";

const UserRoleGuard = ({ children }) => {
  const { isAuthenticated, admin, role } = useAuth();

  if (isAuthenticated && !role) {
    return <>{children}</>;
  } else if (isAuthenticated && role) {
    return <Navigate to="/dashboard" />;
  } else {
    return <Navigate to="/" />;
  }
};

UserRoleGuard.propTypes = {
  children: PropTypes.node,
};

export default UserRoleGuard;
