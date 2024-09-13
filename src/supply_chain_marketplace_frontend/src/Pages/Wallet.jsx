import React, { useState, useEffect } from "react";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import Stack from "@mui/material/Stack";
import MuiCard from "@mui/material/Card";
import { styled } from "@mui/material/styles";
import SitemarkIcon from "../Components/SitemarkIcon";
import { useAuth } from "../Context/useAuthClient";
import { IconButton, Avatar, Tooltip, Paper } from "@mui/material";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import CheckIcon from "@mui/icons-material/Check";
import AccountBalanceWalletIcon from "@mui/icons-material/AccountBalanceWallet";

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
  paddingTop: "10vh",
  backgroundImage:
    "radial-gradient(ellipse at 50% 50%, hsl(210, 100%, 97%), hsl(0, 0%, 100%))",
  backgroundRepeat: "no-repeat",
  ...theme.applyStyles("dark", {
    backgroundImage:
      "radial-gradient(at 50% 50%, hsla(210, 100%, 16%, 0.5), hsl(220, 30%, 5%))",
  }),
}));

const Wallet = () => {
  const { principal, getTokenBalance, balance, mintTokens } = useAuth();
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(principal.toText());
      setCopied(true);
      setTimeout(() => setCopied(false), 2000); // Reset after 2 seconds
    } catch (err) {
      console.error("Failed to copy: ", err);
    }
  };

  const handleMintTokens = async () => {
    await mintTokens();
  };

  useEffect(() => {
    getTokenBalance();
  }, [])

  return (
    <SetUserRoleContainer
      direction="column"
      justifyContent="space-between"
      width={{ xs: "40vh", md: "50vh" }}
    >
      <Card variant="outlined">
        <SitemarkIcon />
        <Typography
          component="h1"
          variant="h4"
          sx={{ width: "100%", fontSize: "clamp(2rem, 10vw, 2.15rem)" }}
        >
          Wallet
        </Typography>
        <Typography
          component="h3"
          variant="h4"
          sx={{ width: "100%", fontSize: "clamp(1rem, 5vw, 1.15rem)" }}
        >
          Your Wallet Address
        </Typography>
        <Box
          display="flex"
          alignItems="center"
          bgcolor="#f5f5f5"
          p={1}
          borderRadius={1}
        >
          <Typography
            variant="body2"
            sx={{
              mr: {
                xs: "17vh",
                md: "27vh",
              }
            }}
          >
            {principal.toText().slice(0, 10)}...{principal.toText().slice(-4)}
          </Typography>
          <Tooltip title={copied ? "Copied!" : "Copy to clipboard"}>
            <IconButton onClick={handleCopy} size="small">
              {copied ? <CheckIcon color="success" /> : <ContentCopyIcon />}
            </IconButton>
          </Tooltip>
        </Box>
        <Typography
          component="h3"
          variant="h4"
          sx={{ width: "100%", fontSize: "clamp(1rem, 5vw, 1.15rem)" }}
        >
          Balance
        </Typography>
        <Paper elevation={1}>
          <Box display="flex" alignItems="center" p={2}>
            <Avatar sx={{ bgcolor: "primary.main", mr: 2 }}>
              <AccountBalanceWalletIcon />
            </Avatar>
            <Box>
              <Typography variant="h6" fontWeight="bold">
                {balance} {"ICP"}
              </Typography>
            </Box>
          </Box>
        </Paper>
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
          <Button fullWidth variant="contained" onClick={handleMintTokens}>
            Mint Tokens
          </Button>
        </Box>
        <Typography sx={{ textAlign: "center" }}>
          Mint tokens for free (for testing)
        </Typography>
      </Card>
    </SetUserRoleContainer>
  );
};

export default Wallet;
