import React from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Container,
  Grid,
  Paper,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Button,
  Box,
  useTheme,
  useMediaQuery
} from '@mui/material';
import {
  CheckCircleOutline,
  TrendingUp,
  Security,
  Speed
} from '@mui/icons-material';
import { useNavigate } from "react-router-dom";

const Home = () => {
  const navigate = useNavigate();
  const handleNav =() => {
    navigate("/signin")
  }
  const features = [
    { icon: <Security />, text: 'Blockchain-based secure transactions' },
    { icon: <Speed />, text: 'Smart contract automation' },
    { icon: <TrendingUp />, text: 'Real-time tracking of invoices and payments' },
    { icon: <CheckCircleOutline />, text: 'Transparent and immutable record-keeping' },
  ];

  return (
      <Box sx={{ flexGrow: 1, bgcolor: 'background.default', minHeight: '100vh', mt: {xs: "40vh", md: "40vh",lg: "60vh", xl: "20vh"} }}>
        

        <Container maxWidth="lg">
          <Box sx={{ my: 4 }}>
            <Typography variant="h2" align="center" color="textPrimary" gutterBottom>
              Supply Chain Financing Marketplace
            </Typography>
            <Typography variant="h5" align="center" color="textSecondary" paragraph>
              Revolutionizing supply chain finance with blockchain technology
            </Typography>
            <Box sx={{ mt: 4, display: 'flex', justifyContent: 'center' }}>
              <Button variant="contained" color="primary" size="large" onClick={handleNav}>
                Get Started
              </Button>
            </Box>
          </Box>

          <Grid container spacing={4} sx={{ mt: 4 }}>
            <Grid item xs={12} md={4}>
              <Paper elevation={3} sx={{ p: 3, height: '100%' }}>
                <Typography variant="h4">For Suppliers</Typography>
                <Typography>Improve cash flow with early payment options. Create and manage invoices seamlessly.</Typography>
              </Paper>
            </Grid>
            <Grid item xs={12} md={4}>
              <Paper elevation={3} sx={{ p: 3, height: '100%' }}>
                <Typography variant="h4">For Investors</Typography>
                <Typography>Access new investment opportunities with attractive returns. Fund invoices securely.</Typography>
              </Paper>
            </Grid>
            <Grid item xs={12} md={4}>
              <Paper elevation={3} sx={{ p: 3, height: '100%' }}>
                <Typography variant="h4">For Buyers</Typography>
                <Typography>Strengthen supplier relationships and optimize working capital. Manage payments efficiently.</Typography>
              </Paper>
            </Grid>
          </Grid>

          <Box sx={{ my: 6 }}>
            <Typography variant="h4" gutterBottom>Key Features</Typography>
            <Grid container spacing={2}>
              {features.map((feature, index) => (
                <Grid item xs={12} sm={6} key={index}>
                  <Paper elevation={1} sx={{ p: 2 }}>
                    <ListItem>
                      <ListItemIcon>{feature.icon}</ListItemIcon>
                      <ListItemText primary={feature.text} />
                    </ListItem>
                  </Paper>
                </Grid>
              ))}
            </Grid>
          </Box>
        </Container>

      </Box>
  );
};

export default Home;
