import React, { useState } from "react";
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
import TagFacesIcon from "@mui/icons-material/TagFaces";
import { Chip, Paper } from "@mui/material";

const ListItem = styled("li")(({ theme }) => ({
  margin: theme.spacing(0.5),
}));

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

const SetsupplierRoleContainer = styled(Stack)(({ theme }) => ({
  height: "100%",
  padding: 20,
  paddingTop: "40vh",
  backgroundImage:
    "radial-gradient(ellipse at 50% 50%, hsl(210, 100%, 97%), hsl(0, 0%, 100%))",
  backgroundRepeat: "no-repeat",
  ...theme.applyStyles("dark", {
    backgroundImage:
      "radial-gradient(at 50% 50%, hsla(210, 100%, 16%, 0.5), hsl(220, 30%, 5%))",
  }),
}));

const SetUpSupplier = () => {
  const [chipData, setChipData] = React.useState([]);
  const [supplierNameError, setsupplierNameError] = React.useState(false);
  const [supplierNameErrorMessage, setsupplierNameErrorMessage] =
    React.useState("");
  const [isDisabled, setIsDisabled] = useState(false);
  const [newCategory, setNewCategory] = useState("");

  const navigate = useNavigate();
  const { registerSupplierProfile } = useAuth();

  const toggleDisabled = () => {
    setIsDisabled(!isDisabled);
  };
  const getLabelArray = () => chipData.map(chip => chip.label);

  const handleDelete = (chipToDelete) => () => {
    setChipData((chips) =>
      chips.filter((chip) => chip.key !== chipToDelete.key)
    );
  };

  const handleAddCategory = () => {
    if (newCategory.trim() !== "") {
      setChipData((prevChips) => [
        ...prevChips,
        { key: prevChips.length, label: newCategory.trim() },
      ]);
      setNewCategory("");
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    toggleDisabled();
    setsupplierNameErrorMessage("");
    setsupplierNameError(false);
    const data = new FormData(event.currentTarget);
    const labels = getLabelArray();
    await registerSupplierProfile(
      data.get("supplierName"),
      data.get("description"),
      labels
    );
    toggleDisabled();
    navigate(0);
  };

  return (
    <SetsupplierRoleContainer
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
          Set Your Supplier Profile
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
            <FormLabel htmlFor="supplierName">Organization Name</FormLabel>
            <TextField
              id="supplierName"
              name="supplierName"
              placeholder="Ikea"
              autoFocus
              required
              fullWidth
              variant="outlined"
              color={"primary"}
              error={supplierNameError}
              helperText={supplierNameErrorMessage}
            />
          </FormControl>
          <FormControl>
            <FormLabel htmlFor="description">Description</FormLabel>
            <TextField
              id="description"
              name="description"
              placeholder="We provide home and office furniture"
              autoFocus
              required
              fullWidth
              variant="outlined"
              color={"primary"}
            />
          </FormControl>
          <Box>
            <Box sx={{ mb: 2, display: "flex", gap: 1, alignItems: "end" }}>
              <FormControl>
                <FormLabel htmlFor="NewCategory">New Category</FormLabel>

                <TextField
                  variant="outlined"
                  placeholder="Sports, Kitchenware etc."
                  autoFocus
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  color={"primary"}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleAddCategory();
                    }
                  }}
                />
              </FormControl>

              <Button
                variant="contained"
                color={"info"}
                onClick={handleAddCategory}
                disabled={!newCategory.trim()}
              >
                Add
              </Button>
            </Box>
            <Paper
              sx={{
                display: "flex",
                justifyContent: "center",
                flexWrap: "wrap",
                listStyle: "none",
                p: 0.5,
                m: 0,
              }}
              component="ul"
            >
              {chipData.map((data) => {
                let icon;
                if (data.label === "React") {
                  icon = <TagFacesIcon />;
                }
                return (
                  <ListItem key={data.key}>
                    <Chip
                      icon={icon}
                      label={data.label}
                      onDelete={handleDelete(data)}
                    />
                  </ListItem>
                );
              })}
            </Paper>
          </Box>
          <Button
            type="submit"
            fullWidth
            variant="contained"
            disabled={isDisabled}
          >
            Register
          </Button>
        </Box>
      </Card>
    </SetsupplierRoleContainer>
  );
};

export default SetUpSupplier;
