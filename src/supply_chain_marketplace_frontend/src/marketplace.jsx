import React, { useState, useEffect } from "react";
import { Actor, HttpAgent } from "@dfinity/agent";
import { Principal } from "@dfinity/principal";
import { idlFactory } from "../../declarations/supply_chain_marketplace_backend/supply_chain_marketplace_backend.did.js";

const SupplyChainMarketplace = () => {
  const [actor, setActor] = useState(null);
  const [invoices, setInvoices] = useState([]);
  const [investments, setInvestments] = useState([]);
  const [amount, setAmount] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [buyer, setBuyer] = useState("");
  const [invoiceId, setInvoiceId] = useState("");
  const [greetName, setGreetName] = useState("");
  const [greetResult, setGreetResult] = useState("");
  const [generatedPrincipal, setGeneratedPrincipal] = useState("");
  const [userRole, setUserRole] = useState(null);
  const [admin, setAdmin] = useState(null);

  useEffect(() => {
    const initActor = async () => {
      const isLocal = process.env.NODE_ENV !== "production";
      const host = isLocal ? "http://localhost:50261" : "https://ic0.app";
      const agent = new HttpAgent({ host });

      if (isLocal) {
        await agent.fetchRootKey();
      }

      const canisterId =
        process.env.CANISTER_ID_SUPPLY_CHAIN_MARKETPLACE_BACKEND ||
        "be2us-64aaa-aaaaa-qaabq-cai";
      const newActor = Actor.createActor(idlFactory, { agent, canisterId });
      setActor(newActor);

      // Get current admin
      const currentAdmin = await newActor.getAdmin();
      if(currentAdmin.length != 0) {
        setAdmin(currentAdmin);

      }

      // Get user role

      try {
        const roleResult = await newActor.getUserRole();
        if ('ok' in roleResult) {
          const AnsArr = Object.keys(roleResult.ok)
          setUserRole(AnsArr[0]);
        } else {
          console.error("Error getting user role:", roleResult.err);
        }
      } catch (error) {
        console.error("Error calling getUserRole:", error);
      }

    };

    initActor();
  }, []);

  const setInitialAdmin = async () => {
    if (!actor) {
      return;
    }
    try {
      const result = await actor.setInitialAdmin();
      if ('ok' in result) {
        alert("You are now set as the admin!");
        setUserRole({ Admin: null });
        const currentAdmin = await actor.getAdmin();
        setAdmin(currentAdmin);
      } else {
        alert(`Failed to set admin: ${result.err}`);
      }
    } catch (error) {
      console.error("Error setting admin:", error);
    }
  };

  const generateRandomPrincipal = async () => {
    const randomBytes = new Uint8Array(29);
    window.crypto.getRandomValues(randomBytes);
    const principal = Principal.fromUint8Array(randomBytes);
    setGeneratedPrincipal(principal.toText());
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text).then(
      () => {
        alert("Copied to clipboard!");
      },
      (err) => {
        console.error("Could not copy text: ", err);
      }
    );
  };

  const createInvoice = async () => {
    if (!actor) {
      return;
    }
    try {
      const result = await actor.createInvoice(
        BigInt(amount),
        BigInt(new Date(dueDate).getTime() * 1000000),
        Principal.fromText(buyer)
      );
      if ('ok' in result) {
        console.log('Invoice created:', result.ok.toString());
        alert(`Invoice created successfully with ID: ${result.ok.toString()}`);
        listInvoices();
      } else {
        alert(`Failed to create invoice: ${result.err}`);
      }
    } catch (error) {
      console.error('Error creating invoice:', error);
      alert(`Error creating invoice: ${error.message}`);
    }
  };

  const listInvoices = async () => {
    if (!actor) {
      return;
    }
    try {
      const result = await actor.getAllInvoices();

      setInvoices(result["ok"]);
    } catch (error) {
      console.error("Error listing invoices:", error);
    }
  };

  const fundInvoice = async () => {
    if (!actor) {
      return;
    }
    try {
      const result = await actor.fundInvoice(BigInt(invoiceId));
      console.log("Invoice funded:", result);
      listInvoices();
    } catch (error) {
      console.error("Error funding invoice:", error);
    }
  };

  const getInvestmentDetails = async () => {
    if (!actor) {
      return;
    }
    try {
      const callerPrincipal = await actor.getCaller();
      const result = await actor.getInvestmentDetails(callerPrincipal);

      setInvestments(result);
    } catch (error) {
      console.error("Error getting investment details:", error);
    }
  };

  const greet = async () => {
    if (!actor) {
      return;
    }
    try {
      const greeting = await actor.greet(greetName);
      setGreetResult(greeting);
    } catch (error) {
      console.error("Error greeting:", error);
    }
  };

  return (
    <div>
      <h1>Supply Chain Marketplace</h1>

      {!admin && (
        <div>
          <h2>Set Initial Admin</h2>
          <button onClick={setInitialAdmin}>Set Me as Admin</button>
        </div>
      )}

      {admin && !userRole && (
        <div>
          <h2>Register User</h2>
          <button onClick={() => registerUser({ Supplier: null })}>
            Register as Supplier
          </button>
          <button onClick={() => registerUser({ Investor: null })}>
            Register as Investor
          </button>
        </div>
      )}

      {userRole && (
        <div>
          <p> Your role: {JSON.stringify(userRole)}</p>
          <h2>Generate Test Principal</h2>
          <button onClick={generateRandomPrincipal}>Generate Principal</button>
          {generatedPrincipal && (
            <div>
              <input type="text" value={generatedPrincipal} readOnly />
              <button onClick={() => copyToClipboard(generatedPrincipal)}>
                Copy
              </button>
            </div>
          )}

          <h2>Create Invoice</h2>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="Amount"
          />
          <input
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
          />
          <input
            type="text"
            value={buyer}
            onChange={(e) => setBuyer(e.target.value)}
            placeholder="Buyer Principal"
          />
          <button onClick={createInvoice}>Create Invoice</button>

          <h2>List Invoices</h2>
          <button onClick={listInvoices}>Refresh Invoices</button>
          <ul>
            {invoices.map((invoice, index) => (
              <li key={index}>
                ID: {invoice.invoiceId.toString()}
                <button
                  onClick={() => copyToClipboard(invoice.invoiceId.toString())}
                >
                  Copy ID
                </button>
                <br />
                Amount: {invoice.amount.toString()}, Due Date:{" "}
                {new Date(
                  Number(invoice.dueDate) / 1000000
                ).toLocaleDateString()}
                , Funded: {invoice.isFunded.toString()}
              </li>
            ))}
          </ul>

          <h2>Fund Invoice</h2>
          <input
            type="number"
            value={invoiceId}
            onChange={(e) => setInvoiceId(e.target.value)}
            placeholder="Invoice ID"
          />
          <button onClick={fundInvoice}>Fund Invoice</button>

          <h2>Investment Details</h2>
          <button onClick={getInvestmentDetails}>Get Investment Details</button>
          <ul>
            {investments.map((investment, index) => (
              <li key={index}>
                Invoice ID: {investment.invoiceId.toString()}, Amount:{" "}
                {investment.amount.toString()}
              </li>
            ))}
          </ul>

          <h2>Greet</h2>
          <input
            type="text"
            value={greetName}
            onChange={(e) => setGreetName(e.target.value)}
            placeholder="Your Name"
          />
          <button onClick={greet}>Greet</button>
          {greetResult && <p>{greetResult}</p>}
        </div>
      )}
    </div>
  );
};

export default SupplyChainMarketplace;
