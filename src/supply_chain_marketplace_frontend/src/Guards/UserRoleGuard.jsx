import React from "react";
import PropTypes from "prop-types";
import { useAuth } from "../Context/useAuthClient";
import { Navigate } from "react-router-dom";

const UserRoleGuard = ({ children }) => {
  const { isAuthenticated, admin, role } = useAuth();

  if (isAuthenticated && admin && !role) {
    return <>{children}</>;
  } else if (isAuthenticated && admin && role) {
    return <Navigate to="/dashboard" />;
  } else {
    return <Navigate to="/signin" />;
  }
};

UserRoleGuard.propTypes = {
  children: PropTypes.node,
};

export default UserRoleGuard;
