import React from "react";
import Box from "@mui/material/Box";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import Typography from "@mui/material/Typography";
import SupplierList from "./SupplierList";
import BuyerInvoiceList from "./BuyerInvoiceList";

function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`vertical-tabpanel-${index}`}
      aria-labelledby={`vertical-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box >
          <Typography>{children}</Typography>
        </Box>
      )}
    </div>
  );
}

function a11yProps(index) {
  return {
    id: `vertical-tab-${index}`,
    "aria-controls": `vertical-tabpanel-${index}`,
  };
}

const BuyerDashboard = ({ buyerIdentity }) => {
  const [value, setValue] = React.useState(0);

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  return (
    <Box
      sx={{
        flexGrow: 1,
        bgcolor: "background.paper",
        display: "flex",
        minHeight: "80vh",
        width: {sm: "110vh", md: '130vh'},
        mt: {sm: "40vh", md: "60vh", xl: "50vh", lg: "50vh"},
        padding: "1vh"
      }}
    >
      <Tabs
        orientation="vertical"
        variant="scrollable"
        value={value}
        onChange={handleChange}
        aria-label="BuyerPanel"
        sx={{ borderRight: 1, borderColor: "divider" }}
      >
        <Tab label="Supplier List" {...a11yProps(0)} />
        <Tab label="Invoices" {...a11yProps(1)} />
      </Tabs>
      <TabPanel value={value} index={0}>
        <SupplierList/>
      </TabPanel>
      <TabPanel value={value} index={1}>
        <BuyerInvoiceList/>
      </TabPanel>
    </Box>
  );
};

export default BuyerDashboard;
