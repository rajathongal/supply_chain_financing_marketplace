import React from "react";
import { redirect } from "react-router-dom";
import PropTypes from "prop-types";

const GuestGuard = ({ children }) => {
  const authenticated = false;

  if (authenticated) {
    return <>{children}</>;
  } else {
    return <redirect to="/" />
  }
};

export default GuestGuard