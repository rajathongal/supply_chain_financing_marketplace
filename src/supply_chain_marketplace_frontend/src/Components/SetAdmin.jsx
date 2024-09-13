import * as React from "react";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Divider from "@mui/material/Divider";
import Typography from "@mui/material/Typography";
import Stack from "@mui/material/Stack";
import MuiCard from "@mui/material/Card";
import { styled } from "@mui/material/styles";
import SitemarkIcon from "./SitemarkIcon";
import { useAuth } from "../Context/useAuthClient";
import { useNavigate } from "react-router-dom";
import { useLocation } from 'react-router-dom';

const Card = styled(MuiCard)(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  alignSelf: "center",
  width: "100%",
  padding: theme.spacing(4),
  gap: theme.spacing(2),
  margin: "auto",
  [theme.breakpoints.up("sm")]: {
    maxWidth: "750px",
  },
  boxShadow:
    "hsla(220, 30%, 5%, 0.05) 0px 5px 15px 0px, hsla(220, 25%, 10%, 0.05) 0px 15px 35px -5px",
  ...theme.applyStyles("dark", {
    boxShadow:
      "hsla(220, 30%, 5%, 0.5) 0px 5px 15px 0px, hsla(220, 25%, 10%, 0.08) 0px 15px 35px -5px",
  }),
}));

const SetAdminContainer = styled(Stack)(({ theme }) => ({
  height: "100%",
  padding: 20,
  paddingTop: "20vh",
  backgroundImage:
    "radial-gradient(ellipse at 50% 50%, hsl(210, 100%, 97%), hsl(0, 0%, 100%))",
  backgroundRepeat: "no-repeat",
  ...theme.applyStyles("dark", {
    backgroundImage:
      "radial-gradient(at 50% 50%, hsla(210, 100%, 16%, 0.5), hsl(220, 30%, 5%))",
  }),
}));


const SetAdmin = () => {
  const { admin, setAdminFirstTime } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const handleSetAdmin = async(e) => {
    e.preventDefault();
    await setAdminFirstTime();
  }

  React.useEffect(() => {
    if(admin && location.pathname == "/setadmin") {
      navigate('/');
    }
  }, [admin])

  return (
    <SetAdminContainer direction="column" justifyContent="space-between">
    <Card variant="outlined">
      <SitemarkIcon />
      <Typography
        component="h1"
        variant="h4"
        sx={{ width: "100%", fontSize: "clamp(2rem, 10vw, 2.15rem)" }}
      >
        Set Admin
      </Typography>
      <Box
        component="form"
        noValidate
        sx={{
          display: "flex",
          flexDirection: "column",
          width: "100%",
          gap: 2,
        }}
      >
        <Divider></Divider>

        <Button type="submit" fullWidth variant="contained" onClick={handleSetAdmin}>
          Proceed
        </Button>
        <Typography sx={{ textAlign: "center" }}>
          Click Proceed to set you as admin
        </Typography>
      </Box>
    </Card>
  </SetAdminContainer>
  )
}

export default SetAdmin