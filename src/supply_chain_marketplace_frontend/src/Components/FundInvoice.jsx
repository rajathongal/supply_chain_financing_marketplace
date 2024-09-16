import React, { useEffect } from "react";
import SitemarkIcon from "./SitemarkIcon";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import { styled } from "@mui/material/styles";
import MuiCard from "@mui/material/Card";
import Stack from "@mui/material/Stack";
import Button from "@mui/material/Button";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../Context/useAuthClient";
import { useLocation } from "react-router-dom";
import FormLabel from "@mui/material/FormLabel";
import FormControl from "@mui/material/FormControl";
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

const SetPOContainer = styled(Stack)(({ theme }) => ({
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
const FundInvoice = () => {
  const [isDisabled, setIsDisabled] = React.useState(false);
  const [message, setMessage] = React.useState("");
  const [buyerName, setBuyerName] = React.useState("");
  const [supplierName, setSupplierName] = React.useState("");

  const location = useLocation();
  const data = location.state;

  const navigate = useNavigate();
  const { getBuyerByPP, fundInvoice, getSupplierByPP } = useAuth();

  const toggleDisabled = () => {
    setIsDisabled((prev) => !prev);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    toggleDisabled();
    const fdData = new FormData(event.currentTarget);
    if(fdData.get("fundingAmount") >= Number(data.amount)) {
      setMessage("Enter Less than the amount on invoice to gain profits");
      setTimeout(() => {
        setMessage("");
        toggleDisabled();
      }, 5000);
      return;
    }
    fundInvoice(data.invoiceId, fdData.get("fundingAmount"), setMessage)
    setTimeout(() => {
      setMessage("");
      toggleDisabled();
      navigate("/dashboard");
    }, 5000); // Reset after 5 seconds
  };

  const getNames = async () => {
    const buyer = await getBuyerByPP(data.buyer);
    setBuyerName(buyer);
    const supplier = await getSupplierByPP(data.supplier)
    setSupplierName(supplier)
  };

  useEffect(() => {
    getNames();
  }, []);

  return (
    <SetPOContainer
      direction="column"
      justifyContent="space-between"
      width={{ xs: "40vh", sm: "80vh", md: "100vh", lg: "120vh" }}
      mt={{ xs: "30vh" }}
    >
      <Card variant="outlined">
        <SitemarkIcon />
        <Typography
          component="h1"
          variant="h4"
          sx={{ width: "100%", fontSize: "clamp(2rem, 10vw, 2.15rem)" }}
        >
          Fund Invoice
        </Typography>
        <Typography
          component="h5"
          sx={{ width: "100%", fontSize: "clamp(1rem, 10vw, 0.15rem)" }}
        >
          Buyer Name - {buyerName}
        </Typography>
        <Typography
          component="h5"
          sx={{ width: "100%", fontSize: "clamp(1rem, 10vw, 0.15rem)" }}
        >
          Seller Name - {supplierName}
        </Typography>
        <Typography
          component="h5"
          sx={{ width: "100%", fontSize: "clamp(1rem, 10vw, 0.15rem)" }}
        >
          Price - {Number(data.amount)}
        </Typography>
        <Typography
          component="h5"
          sx={{ width: "100%", fontSize: "clamp(1rem, 10vw, 0.15rem)" }}
        >
          Due Date -
          {new Date(Number(data.dueDate) / 1000000).toLocaleDateString()}
        </Typography>
        <Typography
          component="h5"
          sx={{ width: "100%", fontSize: "clamp(1rem, 10vw, 0.15rem)" }}
        >
          Invoice Id - 
          {Number(data.invoiceId)}
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
          <Typography sx={{ textAlign: "left" }}>Funding amount can be less than or equal to price</Typography>
          <FormControl>
            <FormLabel htmlFor="fundingAmount">Funding Amount</FormLabel>
            <TextField
              id="fundingAmount"
              name="fundingAmount"
              placeholder="150 ICP"
              autoFocus
              required
              fullWidth
              variant="outlined"
              color={"primary"}
              type="number"
            />
          </FormControl>
          <Button
            type="submit"
            fullWidth
            variant="contained"
            disabled={isDisabled}
          >
            Fund Invoice
          </Button>
          <Typography sx={{ textAlign: "center" }}>{message}</Typography>
        </Box>
      </Card>
    </SetPOContainer>
  );
};

export default FundInvoice;
