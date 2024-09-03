import React, { useState, useEffect } from 'react';
import { Principal } from '@dfinity/principal';
import { Actor, HttpAgent } from '@dfinity/agent';
import { idlFactory } from '../../declarations/supply_chain_marketplace_backend/supply_chain_marketplace_backend.did.js';

const SupplyChainMarketplace = () => {
  const [actor, setActor] = useState(null);
  const [invoices, setInvoices] = useState([]);
  const [investments, setInvestments] = useState([]);
  const [amount, setAmount] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [buyer, setBuyer] = useState('');

  useEffect(() => {
    const agent = new HttpAgent();
    const actor = Actor.createActor(idlFactory, { agent, canisterId: process.env.CANISTER_ID_SUPPLY_CHAIN_MARKETPLACE_BACKEND });
    setActor(actor);
  }, []);

  const createInvoice = async () => {
    if (!actor) return;
    try {
      const result = await actor.createInvoice(BigInt(amount), BigInt(new Date(dueDate).getTime() * 1000000), Principal.fromText(buyer));
      console.log('Invoice created:', result.toString());
      listInvoices();
    } catch (error) {
      console.error('Error creating invoice:', error);
    }
  };

  const listInvoices = async () => {
    if (!actor) return;
    try {
      const result = await actor.listAvailableInvoices();
      setInvoices(result);
    } catch (error) {
      console.error('Error listing invoices:', error);
    }
  };

  const fundInvoice = async (invoiceId) => {
    if (!actor) return;
    try {
      const result = await actor.fundInvoice(invoiceId);
      console.log('Invoice funded:', result);
      listInvoices();
    } catch (error) {
      console.error('Error funding invoice:', error);
    }
  };

  const getInvestmentDetails = async () => {
    if (!actor) return;
    try {
      const principal = await actor.getInvestmentDetails();
      const result = await actor.getInvestmentDetails(principal);
      setInvestments(result);
    } catch (error) {
      console.error('Error getting investment details:', error);
    }
  };

  return (
    <div>
      <h1>Supply Chain Marketplace</h1>
      
      <h2>Create Invoice</h2>
      <input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="Amount" />
      <input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
      <input type="text" value={buyer} onChange={(e) => setBuyer(e.target.value)} placeholder="Buyer Principal" />
      <button onClick={createInvoice}>Create Invoice</button>

      <h2>Available Invoices</h2>
      <button onClick={listInvoices}>Refresh Invoices</button>
      <ul>
        {invoices.map((invoice, index) => (
          <li key={index}>
            Amount: {invoice.amount.toString()}, Due Date: {new Date(Number(invoice.dueDate) / 1000000).toLocaleDateString()}
            <button onClick={() => fundInvoice(invoice.invoiceId)}>Fund</button>
          </li>
        ))}
      </ul>

      <h2>Investment Details</h2>
      <button onClick={getInvestmentDetails}>Get Investment Details</button>
      <ul>
        {investments.map((investment, index) => (
          <li key={index}>
            Invoice ID: {investment.invoiceId.toString()}, Amount: {investment.amount.toString()}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default SupplyChainMarketplace;