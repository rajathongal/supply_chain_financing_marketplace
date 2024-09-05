import React from 'react';
import PropTypes from 'prop-types';

const NoGuard = ({ children }) => {
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
