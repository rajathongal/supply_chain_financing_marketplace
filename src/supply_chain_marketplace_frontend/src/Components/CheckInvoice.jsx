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
const CheckInvoice = () => {
  const [isDisabled, setIsDisabled] = React.useState(false);
  const [message, setMessage] = React.useState("");
  const [invoice, setInvoice] = React.useState(null);
  const [buyerName, setBuyerName] = React.useState("");
  const [supplierName, setSupplierName] = React.useState("");
  const location = useLocation();
  const data = location.state;

  const navigate = useNavigate();
  const { getInvoiceByPP, getBuyerByPP, getSupplierByPP } = useAuth();

  const toggleDisabled = () => {
    setIsDisabled((prev) => !prev);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    navigate("/dashboard");
  };

  const getInvoiceName = async () => {
    const invoice = await getInvoiceByPP(data.invoiceId);
    setInvoice(invoice);

    const buyer = await getBuyerByPP(invoice.buyer.toString());
    setBuyerName(buyer);
    const supplier = await getSupplierByPP(invoice.supplier.toString())
    setSupplierName(supplier)
  };
  useEffect(() => {
    getInvoiceName();
  }, []);

  return (
    <SetPOContainer
      direction="column"
      justifyContent="space-between"
      width={{ xs: "40vh", sm: "80vh", md: "100vh", lg: "120vh" }}
      mt={{ xs: "30vh" }}
    >
      {invoice ? (
        <Card variant="outlined">
        <SitemarkIcon />
        <Typography
          component="h1"
          variant="h4"
          sx={{ width: "100%", fontSize: "clamp(2rem, 10vw, 2.15rem)" }}
        >
          Invoice Details
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
          Price - {Number(invoice.amount)}
        </Typography>
        <Typography
          component="h5"
          sx={{ width: "100%", fontSize: "clamp(1rem, 10vw, 0.15rem)" }}
        >
          Due Date -
          {new Date(Number(invoice.dueDate) / 1000000).toLocaleDateString()}
        </Typography>
        <Typography
          component="h5"
          sx={{ width: "100%", fontSize: "clamp(1rem, 10vw, 0.15rem)" }}
        >
          Invoice Id -  
          {Number(invoice.invoiceId)}
        </Typography>
        <Typography
          component="h5"
          sx={{ width: "100%", fontSize: "clamp(1rem, 10vw, 0.15rem)" }}
        >
          Status -  
          {Object.keys(invoice.status)[0]} <br></br>
          {Object.keys(invoice.status)[0] !== "Paid" && Object.keys(invoice.status)[0] !== "Created" ? "Awaiting Payment from Buyer" : ""}
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
          <Button
            type="submit"
            fullWidth
            variant="contained"
            disabled={isDisabled}
          >
            Go Back
          </Button>
          <Typography sx={{ textAlign: "center" }}>{message}</Typography>
        </Box>
      </Card>
      ): (
        <Typography sx={{ textAlign: "center" }}>Invoice Not Found</Typography>

      )}
    </SetPOContainer>
  );
};

export default CheckInvoice;
