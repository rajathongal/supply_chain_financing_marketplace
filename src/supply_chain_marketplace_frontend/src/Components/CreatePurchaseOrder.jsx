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
import { useLocation } from "react-router-dom";
import { Chip } from "@mui/material";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFnsV3";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";

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
const CreatePurchaseOrder = () => {
  const [isDisabled, setIsDisabled] = React.useState(false);
  const [message, setMessage] = React.useState("");
  const [selectedDate, setSelectedDate] = React.useState(null);

  const location = useLocation();
  const data = location.state;

  const navigate = useNavigate();
  const { createPurchaseOrderFn } = useAuth();

  const toggleDisabled = () => {
    setIsDisabled((prev) => !prev);
  };

  const handleDateChange = (date) => {
    setSelectedDate(date);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    toggleDisabled();
    const fdData = new FormData(event.currentTarget);

    createPurchaseOrderFn(
      fdData.get("price"),
      fdData.get("dueDate"),
      fdData.get("description"),
      data.principal,
      setMessage
    );
    setTimeout(() => {
      setMessage("");
      toggleDisabled();
      navigate("/dashboard");
    }, 5000); // Reset after 2 seconds
  };

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
          Create Purchase Order
        </Typography>
        <Typography
          component="h5"
          sx={{ width: "100%", fontSize: "clamp(2rem, 10vw, 2.15rem)" }}
        >
          Seller Name - {data.name}
        </Typography>
        <Box display="flex" flexWrap="wrap" gap={1}>
          {data.categories.map((category, idx) => (
            <Chip key={idx} label={category} size="small" />
          ))}
        </Box>
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
            <FormLabel htmlFor="price">Price</FormLabel>
            <TextField
              id="price"
              name="price"
              placeholder="150 ICP"
              autoFocus
              required
              fullWidth
              variant="outlined"
              color={"primary"}
              type="number"
            />
          </FormControl>
          <FormControl>
            <FormLabel htmlFor="description">Description</FormLabel>
            <TextField
              id="description"
              name="description"
              placeholder="100 quantities of kids bicycles"
              autoFocus
              required
              fullWidth
              variant="outlined"
              color={"primary"}
            />
          </FormControl>
          <LocalizationProvider dateAdapter={AdapterDateFns}>
            <FormControl>
              <FormLabel htmlFor="dueDate">Due Date</FormLabel>
              <DatePicker
                id="dueDate"
                name="dueDate"
                views={["year", "month", "day"]}
                inputFormat="dd/MM/yyyy"
                format="dd/MM/yyyy"
                value={selectedDate}
                onChange={handleDateChange}
              />
            </FormControl>
          </LocalizationProvider>
          <Button
            type="submit"
            fullWidth
            variant="contained"
            disabled={isDisabled}
          >
            Register
          </Button>
          <Typography sx={{ textAlign: "center" }}>{message}</Typography>
        </Box>
      </Card>
    </SetPOContainer>
  );
};

export default CreatePurchaseOrder;
