import React from "react";
import SitemarkIcon from "./SitemarkIcon";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import FormLabel from "@mui/material/FormLabel";
import FormControl from "@mui/material/FormControl";
import { styled } from "@mui/material/styles";
import MuiCard from "@mui/material/Card";
import Stack from "@mui/material/Stack";
import Button from "@mui/material/Button";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../Context/useAuthClient";
import TextField from "@mui/material/TextField";

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

const SetBuyerRoleContainer = styled(Stack)(({ theme }) => ({
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

const SetUpBuyer = () => {
  const [buyerNameError, setBuyerNameError] = React.useState(false);
  const [buyerNameErrorMessage, setbuyerNameErrorMessage] = React.useState("");
  const [isDisabled, setIsDisabled] = useState(false);

  const navigate = useNavigate();
  const { registerBuyer } = useAuth();

  const toggleDisabled = () => {
    setIsDisabled(!isDisabled);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    toggleDisabled();
    setbuyerNameErrorMessage("")
    setBuyerNameError(false)

    const data = new FormData(event.currentTarget);
    await registerBuyer(
      data.get("buyerName"),
      setBuyerNameError,
      setbuyerNameErrorMessage
    );
    toggleDisabled();
    navigate(0);

  };

  return (
    <SetBuyerRoleContainer
      direction="column"
      justifyContent="space-between"
      width={{ xs: "40vh", md: "80vh" }}
    >
      <Card variant="outlined">
        <SitemarkIcon />
        <Typography
          component="h1"
          variant="h4"
          sx={{ width: "100%", fontSize: "clamp(2rem, 10vw, 2.15rem)" }}
        >
          Set Your Organization Name
        </Typography>
        <Box
          component="form"
          onSubmit={handleSubmit}
          noValidate
          sx={{
            display: "flex",
            flexDirection: "column",
            width: "100%",
            gap: 2,
          }}
        >
          <FormControl>
            <FormLabel htmlFor="buyerName">Organization Name</FormLabel>
            <TextField
              id="buyerName"
              name="buyerName"
              placeholder="Walmart"
              autoFocus
              required
              fullWidth
              variant="outlined"
              color={"primary"}
              error={buyerNameError}
              helperText={buyerNameErrorMessage}
            />
          </FormControl>
          <Button type="submit" fullWidth variant="contained" disabled={isDisabled}>
            Register
          </Button>
        </Box>
      </Card>
    </SetBuyerRoleContainer>
  );
};

export default SetUpBuyer;
