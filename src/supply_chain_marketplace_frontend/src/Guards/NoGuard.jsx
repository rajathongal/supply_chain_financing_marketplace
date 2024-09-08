import React from 'react';
import PropTypes from 'prop-types';
import { useAuth } from "../Context/useAuthClient";

const NoGuard = ({ children }) => {
  const { isAuthenticated } = useAuth();

  return (
    <>
      {children}
    </>
  );
};

NoGuard.propTypes = {
  children: PropTypes.node
};

export default NoGuard;
