import React from 'react';
import PropTypes from 'prop-types';
import { useAuth } from "../Context/useAuthClient";
import { Navigate } from "react-router-dom";

const NoGuard = ({ children }) => {
  const { isAuthenticated } = useAuth();

  if(isAuthenticated) {
    return <Navigate to="/dashboard"/>
  } else {
    return <>{children}</>;
  }
};

NoGuard.propTypes = {
  children: PropTypes.node
};

export default NoGuard;
