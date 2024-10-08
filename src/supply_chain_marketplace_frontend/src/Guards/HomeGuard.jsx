import React from "react";
import PropTypes from "prop-types";
import { useAuth } from "../Context/useAuthClient";
import { Navigate } from "react-router-dom";

const HomeGuard = ({ children }) => {
  const { isAuthenticated, role } = useAuth();

  if (isAuthenticated) {
    if (!role) {
      return <Navigate to="/setuserrole" replace={true} />;
    } else {
      return <>{children}</>;
    }
  } else {
    return <>{children}</>;
  }
};

HomeGuard.propTypes = {
  children: PropTypes.node,
};

export default HomeGuard;
