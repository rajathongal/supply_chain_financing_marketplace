import React, { useState } from 'react';
import { Principal } from '@dfinity/principal';
import { supply_chain_marketplace_backend } from '../../declarations/supply_chain_marketplace_backend/index';

function InvoiceTest() {
  const [amount, setAmount] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [buyer, setBuyer] = useState('');
  const [result, setResult] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const buyerPrincipal = Principal.fromText(buyer);
      const invoiceId = await supply_chain_marketplace_backend.createInvoice(
        parseInt(amount),
        parseInt(Math.floor(new Date(dueDate).getTime() / 1000)),
        buyerPrincipal
      );
      setResult(`Invoice created with ID: ${invoiceId}`);

      // Fetch and display the created invoice
      let invoice = await supply_chain_marketplace_backend.getInvoice(invoiceId);
      if (invoice) {
        invoice = invoice[0]
        invoice.amount = Number(invoice.amount);

        const timestampNumber = Number((invoice.dueDate * BigInt(1000)));
        const date = new Date(timestampNumber);
        invoice.dueDate = date.toLocaleDateString();

        invoice.supplier = invoice.supplier.toText();
        invoice.buyer = invoice.buyer.toText();

        setResult(prevResult => `${prevResult}\n\nInvoice details:\n${JSON.stringify(invoice, null, 2)}`);
      }
    } catch (error) {
      console.log(error)
      setResult(`Error: ${error.message}`);
    }
  };

  return (
    <div>
      <h2>Create Invoice</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Amount:</label>
          <input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} required />
        </div>
        <div>
          <label>Due Date:</label>
          <input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} required />
        </div>
        <div>
          <label>Buyer Principal:</label>
          <input type="text" value={buyer} onChange={(e) => setBuyer(e.target.value)} required />
        </div>
        <button type="submit">Create Invoice</button>
      </form>
      {result && (
        <div>
          <h3>Result:</h3>
          <pre>{result}</pre>
        </div>
      )}
    </div>
  );
}

export default InvoiceTest;