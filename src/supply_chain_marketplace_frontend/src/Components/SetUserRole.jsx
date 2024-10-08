import * as React from "react";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
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

const SetUserRoleContainer = styled(Stack)(({ theme }) => ({
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

const SetUserRole = () => {
  const [isDisabled, setIsDisabled] = React.useState(false);

  const { role, registerUserRole } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const toggleDisabled = () => {
    setIsDisabled(!isDisabled);
  };

  const registerAsInvestor = async() => {
    toggleDisabled();

     await registerUserRole({Investor: null});
    toggleDisabled();

  }

  const registerAsSupplier = async() => {
    toggleDisabled();

     await registerUserRole({Supplier: null})
    toggleDisabled();

  }

  const registerAsBuyer = async() => {
    toggleDisabled();

    await registerUserRole({Buyer: null})
    toggleDisabled();

 }

  React.useEffect(() => {
    if (role && location.pathname == "/setuserrole") {
      navigate("/dashboard");
    }
  }, [role]);

  return (
    <SetUserRoleContainer direction="column" justifyContent="space-between" width={{xs: "40vh", md: "80vh"}}>
      <Card variant="outlined">
        <SitemarkIcon />
        <Typography
          component="h1"
          variant="h4"
          sx={{ width: "100%", fontSize: "clamp(2rem, 10vw, 2.15rem)" }}
        >
          Sign up as
        </Typography>
        <Box
          component="form"
          noValidate
          sx={{
            display: "flex",
            flexDirection: {
              xs: "column",
              md: "row",
              lg: "row",
            },
            width: "100%",
            gap: 2,
          }}
        >

          <Button
            fullWidth
            variant="contained"
            disabled={isDisabled}
            onClick={registerAsSupplier}
          >
            As Supplier
          </Button>
          <Button
            fullWidth
            variant="contained"
            disabled={isDisabled}
            onClick={registerAsInvestor}
          >
            As Investor
          </Button>
          <Button
            fullWidth
            variant="contained"
            disabled={isDisabled}
            onClick={registerAsBuyer}
          >
            As Buyer
          </Button>
        </Box>
        <Typography sx={{ textAlign: "center" }}>
          Choose how you want to signup
        </Typography>
      </Card>
    </SetUserRoleContainer>
  );
};

export default SetUserRole;
