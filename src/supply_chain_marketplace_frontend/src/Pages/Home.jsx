import React from "react";
import NavBar from "../Components/NavBar";

const Home = () => {
  return (
    <NavBar
      position="fixed"
      sx={{
        boxShadow: 0,
        bgcolor: "transparent",
        backgroundImage: "none",
        mt: 10,
      }}
    >
      <div>
        <h1>Welcome to Home</h1>
      </div>
    </NavBar>
  );
};

export default Home;
