import React from "react";
import PropTypes from "prop-types";

const HomeGuard = ({ children }) => {
  return <>{children}</>;
};

HomeGuard.propTypes = {
  children: PropTypes.node,
};

export default HomeGuard;
