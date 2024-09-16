import React, { createContext, useEffect, useReducer } from "react";
import { AuthClient } from "@dfinity/auth-client";
import {
  canisterId,
  createActor,
} from "../../../declarations/supply_chain_marketplace_backend";
import { Principal } from "@dfinity/principal";

export const getIdentityProvider = () => {
  let idpProvider;
  // Safeguard against server rendering
  if (typeof window !== "undefined") {
    const isLocal = process.env.DFX_NETWORK !== "ic";
    // Safari does not support localhost subdomains
    const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
    if (isLocal && isSafari) {
      idpProvider = `http://localhost:${process.env.CANISTER_LOCAL_ICP_PORT}/?canisterId=${process.env.CANISTER_ID_INTERNET_IDENTITY}`;
    } else if (isLocal) {
      idpProvider = `http://${process.env.CANISTER_ID_INTERNET_IDENTITY}.localhost:${process.env.CANISTER_LOCAL_ICP_PORT}`;
    }
  }
  return idpProvider;
};

const initialAuthState = {
  isAuthenticated: false,
  isInitialised: false,
  authClient: false,
  identity: null,
  principal: null,
  marketplaceActor: null,
  role: "",
  admin: "",
  balance: 0,
  buyerIdentity: "",
  supplierProfile: null,
  supplierProfiles: [],
  purchaseOrders: [],
  invoices: [],
  buyerInvoices: []
};

export const defaultOptions = {
  /**
   *  @type {import("@dfinity/auth-client").AuthClientCreateOptions}
   */
  createOptions: {
    idleOptions: {
      // Set to true if you do not want idle functionality
      disableIdle: true,
    },
  },
  /**
   * @type {import("@dfinity/auth-client").AuthClientLoginOptions}
   */
  loginOptions: {
    identityProvider: getIdentityProvider(),
  },
};

const reducer = (state, action) => {
  switch (action.type) {
    case "INITIALISE": {
      const {
        isAuthenticated,
        identity,
        principal,
        marketplaceActor,
        authClient,
        isInitialised,
        role,
        admin,
        balance,
        buyerIdentity,
        supplierProfile,
      } = action.payload;

      return {
        ...state,
        isAuthenticated,
        identity,
        principal,
        marketplaceActor,
        authClient,
        isInitialised,
        role,
        admin,
        balance,
        buyerIdentity,
        supplierProfile,
      };
    }

    case "UPDATE_BALANCE": {
      const { balance } = action.payload;
      return {
        ...state,
        balance,
      };
    }

    case "GET_BUYER_INFO": {
      const { buyerIdentity } = action.payload;
      return {
        ...state,
        buyerIdentity,
      };
    }

    case "GET_SUPPLIER_INFO": {
      const { supplierProfile } = action.payload;
      return {
        ...state,
        supplierProfile,
      };
    }

    case "GET_SUPPLIER_PROFILES": {
      const { supplierProfiles } = action.payload;
      return {
        ...state,
        supplierProfiles,
      };
    }

    case "GET_PURCHASE_ORDERS": {
      const { purchaseOrders } = action.payload;
      return {
        ...state,
        purchaseOrders,
      };
    }

    case "GET_INVOICES": {
      const { invoices } = action.payload;
      return {
        ...state,
        invoices,
      };
    }
    case "GET_BUYER_INVOICES": {
      const { buyerInvoices } = action.payload;
      return {
        ...state,
        buyerInvoices,
      };
    }

    default: {
      return { ...state };
    }
  }
};

const AuthContext = createContext({
  ...initialAuthState,
  method: "JWT",
  login: () => Promise.resolve(),
  logout: () => Promise.resolve(),
  updateClient: () => Promise.resolve(),
  setAdminFirstTime: () => Promise.resolve(),
  registerUserRole: () => Promise.resolve(),
  getTokenBalance: () => Promise.resolve(),
  mintTokens: () => Promise.resolve(),
  getBuyer: () => Promise.resolve(),
  registerBuyer: () => Promise.resolve(),
  registerSupplierProfile: () => Promise.resolve(),
  getSupplier: () => Promise.resolve(),
  getSupplierProfiles: () => Promise.resolve(),
  createPurchaseOrderFn: () => Promise.resolve(),
  getPurchaseOrders: () => Promise.resolve(),
  getBuyerByPP: () => Promise.resolve(),
  createInvoice: () => Promise.resolve(),
  getInvoices: () => Promise.resolve(),
  getBuyerInvoices: () => Promise.resolve(),
});

export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(reducer, initialAuthState);

  useEffect(() => {
    // Initialize AuthClient
    AuthClient.create(defaultOptions.createOptions).then(async (client) => {
      updateClient(client);
    });
  }, []);

  async function updateClient(client) {
    const isAuthenticated = await client.isAuthenticated();
    const identity = client.getIdentity();
    const principal = identity.getPrincipal();
    const actor = createActor(canisterId, {
      agentOptions: {
        identity,
      },
    });

    // Get current admin
    const currentAdmin = await actor.getAdmin();
    let admin = "";
    if (currentAdmin.length != 0) {
      admin = currentAdmin[0].toText();
    }

    let role = "";
    try {
      const roleResult = await actor.getUserRole();
      if ("ok" in roleResult) {
        const AnsArr = Object.keys(roleResult.ok);
        role = AnsArr[0];
      } else {
        console.error("Error getting user role:", roleResult.err);
      }
    } catch (error) {
      console.error("Error calling getUserRole:", error);
    }

    let balance = await actor.getTokenBalance(principal);
    if (Number(balance) === 0) {
      await actor.mintTokens(BigInt(100));
      balance = await actor.getTokenBalance(principal);
    }

    let buyerIdentity = "";
    try {
      const result = await actor.getBuyer(principal);

      if ("ok" in result) {
        buyerIdentity = result.ok.name;
      } else {
        console.error(`Error: ${result.err}`);
      }
    } catch (error) {
      console.error("Error getting buyer:", error);
    }

    let supplierProfile = null;
    try {
      const result = await actor.getSupplier(principal);

      if ("ok" in result) {
        supplierProfile = result.ok;
      } else {
        console.error(`Error: ${result.err}`);
      }
    } catch (error) {
      console.error("Error getting buyer:", error);
    }

    dispatch({
      type: "INITIALISE",
      payload: {
        isAuthenticated: isAuthenticated,
        identity: identity,
        principal: principal,
        marketplaceActor: actor,
        authClient: client,
        isInitialised: true,
        role: role,
        admin,
        balance,
        buyerIdentity,
        supplierProfile,
      },
    });
  }

  async function logout() {
    await state.authClient?.logout();
    await updateClient(state.authClient);
  }

  async function login() {
    state.authClient.login({
      ...defaultOptions.loginOptions,
      onSuccess: async () => {
        await updateClient(state.authClient);
      },
    });
  }

  async function setAdminFirstTime() {
    if (!state.marketplaceActor) {
      return;
    }
    try {
      const result = await state.marketplaceActor.setInitialAdmin();
      if ("ok" in result) {
        console.log("You are now set as the admin!");
      } else {
        console.log(`Failed to set admin: ${result.err}`);
      }
    } catch (error) {
      console.error("Error setting admin:", error);
    }
    await updateClient(state.authClient);
  }

  async function registerUserRole(role) {
    if (!state.marketplaceActor) {
      return;
    }
    try {
      const result = await state.marketplaceActor.registerUser(role);
      if ("ok" in result) {
        console.log("User registered successfully!");
      } else {
        console.log(`Registration failed: ${result.err}`);
      }
    } catch (error) {
      console.error("Error registering user:", error);
    }
    await updateClient(state.authClient);
  }

  async function getTokenBalance() {
    if (!state.marketplaceActor) {
      return;
    }
    try {
      const balance = await state.marketplaceActor.getTokenBalance(
        state.principal
      );

      dispatch({
        type: "UPDATE_BALANCE",
        payload: {
          balance: Number(balance),
        },
      });
    } catch (error) {
      console.error("Error getting token balance:", error);
    }
  }

  async function mintTokens() {
    if (!state.marketplaceActor) {
      return;
    }
    try {
      const result = await state.marketplaceActor.mintTokens(BigInt(100));
      if ("ok" in result) {
        getTokenBalance();
      } else {
        console.error(`Failed to mint tokens: ${result.err}`);
      }
    } catch (error) {
      console.error("Error minting tokens:", error);
    }
  }

  async function getBuyer() {
    if (!state.marketplaceActor) {
      return;
    }
    try {
      const result = await state.marketplaceActor.getBuyer(state.principal);

      if ("ok" in result) {
        dispatch({
          type: "GET_BUYER_INFO",
          payload: {
            buyerIdentity: result.ok.name,
          },
        });
      } else {
        console.error(`Error: ${result.err}`);
      }
    } catch (error) {
      console.error("Error getting buyer:", error);
    }
  }

  async function getBuyerByPP(principal) {
    if (!state.marketplaceActor) {
      return;
    }
    try {
      const result = await state.marketplaceActor.getBuyer(
        Principal.fromText(principal)
      );

      if ("ok" in result) {
        return result.ok.name;
      } else {
        console.error(`Error: ${result.err}`);
      }
    } catch (error) {
      console.error("Error getting buyer:", error);
    }
  }

  async function registerBuyer(
    buyerName,
    setBuyerNameError,
    setbuyerNameErrorMessage
  ) {
    if (!state.marketplaceActor) {
      return;
    }
    try {
      const result = await state.marketplaceActor.registerBuyer(buyerName);
      if ("ok" in result) {
        console.log("Buyer registered successfully");
        return;
      } else {
        console.error(`Failed to register buyer: ${result.err}`);
        setBuyerNameError(true);
        setbuyerNameErrorMessage(`Failed to register buyer: ${result.err}`);
      }
    } catch (error) {
      console.error("Error registering buyer:", error);
      setBuyerNameError(true);
      setbuyerNameErrorMessage(`Error registering buyer: ${error}`);
    }
  }

  async function registerSupplierProfile(name, description, categories) {
    if (!state.marketplaceActor) {
      return;
    }
    try {
      const result = await state.marketplaceActor.registerSupplierProfile(
        name,
        description,
        categories
      );
      if ("ok" in result) {
        console.log("Supplier profile registered successfully");
        return;
      } else {
        console.error(`Failed to register supplier profile: ${result.err}`);
      }
    } catch (error) {
      console.error("Error registering supplier profile:", error);
    }
  }

  async function getSupplier() {
    if (!state.marketplaceActor) {
      return;
    }
    try {
      const result = await state.marketplaceActor.getSupplier(state.principal);

      if ("ok" in result) {
        dispatch({
          type: "GET_SUPPLIER_INFO",
          payload: {
            supplierProfile: result.ok,
          },
        });
      } else {
        console.error(`Error: ${result.err}`);
      }
    } catch (error) {
      console.error("Error getting buyer:", error);
    }
  }

  async function getSupplierProfiles() {
    if (!state.marketplaceActor) {
      return;
    }
    try {
      const profiles = await state.marketplaceActor.getSupplierProfiles();

      dispatch({
        type: "GET_SUPPLIER_PROFILES",
        payload: {
          supplierProfiles: profiles,
        },
      });
    } catch (error) {
      console.error("Error getting supplier profiles:", error);
    }
  }
  async function getPurchaseOrders() {
    if (!state.marketplaceActor) {
      return;
    }
    try {
      const profiles = await state.marketplaceActor.getPurchaseOrders(
        state.principal
      );

      dispatch({
        type: "GET_PURCHASE_ORDERS",
        payload: {
          purchaseOrders: profiles,
        },
      });
    } catch (error) {
      console.error("Error getting supplier profiles:", error);
    }
  }
  async function getInvoices() {
    if (!state.marketplaceActor) {
      return;
    }
    try {
      const profiles = await state.marketplaceActor.getInvoices(
        state.principal
      );

      dispatch({
        type: "GET_INVOICES",
        payload: {
          invoices: profiles,
        },
      });
    } catch (error) {
      console.error("Error getting supplier profiles:", error);
    }
  }
  async function getBuyerInvoices() {
    if (!state.marketplaceActor) {
      return;
    }
    try {
      const profiles = await state.marketplaceActor.getBuyerInvoices(
        state.principal
      );

      dispatch({
        type: "GET_BUYER_INVOICES",
        payload: {
          buyerInvoices: profiles,
        },
      });
    } catch (error) {
      console.error("Error getting supplier profiles:", error);
    }
  }

  function parseDate(dateString) {
    const [day, month, year] = dateString.split("/");
    return new Date(year, month - 1, day); // month is 0-indexed in JS Date
  }

  function getAdjustedTime(dateString) {
    const date = parseDate(dateString);
    return date.getTime(); // This gives milliseconds since epoch
  }

  async function createPurchaseOrderFn(
    amount,
    dueDate,
    description,
    principal,
    setMessage
  ) {
    if (!state.marketplaceActor) {
      return;
    }
    try {
      const adjustedTime = getAdjustedTime(dueDate);
      const result = await state.marketplaceActor.createPurchaseOrder(
        Principal.fromText(principal),
        BigInt(amount),
        BigInt(adjustedTime * 1000000),
        description
      );
      if ("ok" in result) {
        console.log(`Purchase Order created with ID: ${result.ok}`);
        setMessage(`Purchase Order created with ID: ${result.ok}`);
      } else {
        console.log(`Failed to create Purchase Order: ${result.err}`);
        setMessage(`Failed to create Purchase Order: ${result.err}`);
      }
    } catch (error) {
      console.error("Error creating Purchase Order:", error);
      setMessage(`Error creating Purchase Order:${error}`);
    }
    return;
  }

  async function createInvoice(id, setMessage) {
    if (!state.marketplaceActor) {
      return;
    }
    try {
      const result = await state.marketplaceActor.createInvoice(id);
      if ("ok" in result) {
        console.log(`Invoice created with ID: ${result.ok}`);
        setMessage(`Invoice created with ID: ${result.ok}`);
      } else {
        console.log(`Failed to create Invoice: ${result.err}`);
        setMessage(`Failed to create Invoice: ${result.err}`);
      }
    } catch (error) {
      console.error("Error creating Invoice:", error);
      setMessage(`Error creating Invoice:${error}`);
    }
    return;
  }

  return (
    <AuthContext.Provider
      value={{
        ...state,
        method: "ICP_AUTH",
        login,
        logout,
        updateClient,
        setAdminFirstTime,
        registerUserRole,
        getTokenBalance,
        mintTokens,
        getBuyer,
        registerBuyer,
        registerSupplierProfile,
        getSupplier,
        getSupplierProfiles,
        createPurchaseOrderFn,
        getPurchaseOrders,
        getBuyerByPP,
        createInvoice,
        getInvoices,
        getBuyerInvoices
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
