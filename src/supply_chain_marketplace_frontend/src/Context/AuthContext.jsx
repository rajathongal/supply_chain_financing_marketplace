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
      } = action.payload;

      return {
        ...state,
        isAuthenticated,
        identity,
        principal,
        marketplaceActor,
        authClient,
        isInitialised,
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
});

export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(reducer, initialAuthState);

  async function updateClient(client) {
    const isAuthenticated = await client.isAuthenticated();
    const identity = client.getIdentity();
    const principal = identity.getPrincipal();
    const actor = createActor(canisterId, {
      agentOptions: {
        identity,
      },
    });

    dispatch({
      type: "INITIALISE",
      payload: {
        isAuthenticated: isAuthenticated,
        identity: identity,
        principal: principal,
        marketplaceActor: actor,
        authClient: client,
        isInitialised: true,
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

  useEffect(() => {
    // Initialize AuthClient
    AuthClient.create(defaultOptions.createOptions).then(async (client) => {
      updateClient(client);
    });
  }, []);

  return (
    <AuthContext.Provider
      value={{
        ...state,
        method: "ICP_AUTH",
        login,
        logout,
        updateClient,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
