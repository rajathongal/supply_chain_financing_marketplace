import React, { useEffect } from "react";
import BuyerDashboard from "../Components/BuyerDashboard";
import SupplierDashboard from "../Components/SupplierDashboard";
import InvestorDashboard from "../Components/InvestorDashboard";
import SetUpBuyer from "../Components/SetUpBuyer";
import SetUpSupplier from "../Components/SetUpSupplier";
import { useAuth } from "../Context/useAuthClient";

const Dashboard = ({ role }) => {
  const { buyerIdentity, getBuyer, supplierProfile, getSupplier } = useAuth();

  useEffect(() => {
    if (role === "Buyer" && !buyerIdentity) {
      getBuyer();
    } else if (role === "Supplier" && !supplierProfile) {
      getSupplier();
    }
  }, [role]);

  switch (role) {
    case "Buyer": {
      if (!buyerIdentity) {
        return <SetUpBuyer />;
      } else {
        return <BuyerDashboard buyerIdentity />;
      }
    }
    case "Supplier": {
      if (!supplierProfile) {
        return <SetUpSupplier />;
      } else {
        return <SupplierDashboard />;
      }
    }
    case "Investor": {
      return <InvestorDashboard />;
    }
  }
};

export default Dashboard;
