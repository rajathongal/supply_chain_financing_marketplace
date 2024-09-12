import React, { createContext, useEffect, useReducer } from "react";
import { AuthClient } from "@dfinity/auth-client";
import {
  canisterId,
  createActor,
} from "../../../declarations/supply_chain_marketplace_backend";

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
  admin: ""
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
        admin
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
        admin
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
    if(currentAdmin.length != 0) {

      admin = currentAdmin[0].toText();
    }

    let role = ""
    try {
      const roleResult = await actor.getUserRole();
      if ('ok' in roleResult) {
        const AnsArr = Object.keys(roleResult.ok)
        role = AnsArr[0];
      } else {
        console.error("Error getting user role:", roleResult.err);
      }
    } catch (error) {
      console.error("Error calling getUserRole:", error);
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
        admin
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
      if ('ok' in result) {
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
      if ('ok' in result) {
        console.log('User registered successfully!');
      } else {
        console.log(`Registration failed: ${result.err}`);
      }
    } catch (error) {
      console.error('Error registering user:', error);
    }
    await updateClient(state.authClient);
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
        registerUserRole
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
