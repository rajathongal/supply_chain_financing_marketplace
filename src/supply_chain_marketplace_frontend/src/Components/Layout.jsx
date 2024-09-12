import React from "react";
import PropTypes from "prop-types";
import Stack from "@mui/material/Stack";
import Box from "@mui/material/Box";
import NavBar from "./NavBar";
import Footer from "./Footer";

const Layout = ({ children }) => {
  return (
    <Stack
      direction="column"
      spacing={0}
      alignItems={"start"}
      minHeight={"100vh"}
      sx={{
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <Box w={"full"} marginBottom={"20vh"}>
        <NavBar />
      </Box>

      <Stack direction="column" spacing={0} alignItems={"start"} flex={1} w={"full"}>
        {children}
      </Stack>

      <Box w={"full"}>
        <Footer />
      </Box>
    </Stack>
  );
};

Layout.propTypes = {
  children: PropTypes.node.isRequired,
};

export default Layout;
