import HashMap "mo:base/HashMap";
import Nat "mo:base/Nat";
import Nat32 "mo:base/Nat32";
import Principal "mo:base/Principal";
import Iter "mo:base/Iter";
import Result "mo:base/Result";
import Array "mo:base/Array";
import Buffer "mo:base/Buffer";
import Cycles "mo:base/ExperimentalCycles";

actor SupplyChainMarketplace {
    // Custom hash function for Nat

    public shared(msg) func getCaller() : async Principal {
        msg.caller
    };
    
    private func natHash(n : Nat) : Nat32 {
        var x = Nat32.fromNat(n);
        x := (x ^ (x >> 16)) *% 0x85ebca6b;
        x := (x ^ (x >> 13)) *% 0xc2b2ae35;
        x := x ^ (x >> 16);
        return x
    };

    // Invoice type definition
    public type Invoice = {
        invoiceId: Nat;
        amount: Nat;
        dueDate: Nat;
        supplier: Principal;
        buyer: Principal;
        isFunded: Bool;
    };

    // Investment type definition
    public type Investment = {
        invoiceId: Nat;
        investor: Principal;
        amount: Nat;
    };

    private var invoiceId : Nat = 0;
    private var invoices = HashMap.HashMap<Nat, Invoice>(10, Nat.equal, natHash);
    private var investments = Buffer.Buffer<Investment>(0);

    // Create a new invoice
    public shared(msg) func createInvoice(amount: Nat, dueDate: Nat, buyer: Principal) : async Nat {
        invoiceId += 1;
        let supplier = msg.caller;
        invoices.put(invoiceId, { invoiceId; amount; dueDate; supplier; buyer; isFunded = false });
        invoiceId
    };

    // Get a specific invoice
    public query func getInvoice(id: Nat) : async ?Invoice {
        invoices.get(id)
    };

    // List all invoices
    public query func getAllInvoices() : async [Invoice] {
        Iter.toArray(Iter.map(invoices.entries(), func (entry: (Nat, Invoice)): Invoice { entry.1 }))
    };

    // List available (unfunded) invoices
    public query func listAvailableInvoices() : async [Invoice] {
        let allInvoices = Iter.toArray(Iter.map(invoices.entries(), func (entry: (Nat, Invoice)): Invoice { entry.1 }));
        Array.filter(allInvoices, func (i: Invoice) : Bool { not i.isFunded })
    };

    // Fund an invoice
    public shared(msg) func fundInvoice(invoiceId: Nat) : async Result.Result<(), Text> {
        switch (invoices.get(invoiceId)) {
            case (?invoice) {
                if (invoice.isFunded) {
                    return #err("Invoice is already funded");
                };
                
                let updatedInvoice = {
                    invoiceId = invoice.invoiceId;
                    amount = invoice.amount;
                    dueDate = invoice.dueDate;
                    supplier = invoice.supplier;
                    buyer = invoice.buyer;
                    isFunded = true;
                };
                invoices.put(invoiceId, updatedInvoice);
                
                investments.add({
                    invoiceId = invoiceId;
                    investor = msg.caller;
                    amount = invoice.amount;
                });
                
                #ok()
            };
            case (null) {
                #err("Invoice not found")
            };
        }
    };

    // Get investment details for an investor
    public query func getInvestmentDetails(investor: Principal) : async [Investment] {
        Array.filter(Buffer.toArray(investments), func (i: Investment) : Bool { i.investor == investor })
    };

    // Accept cycles (ICP tokens)
    public func acceptCycles() : async () {
        let available = Cycles.available();
        let accepted = Cycles.accept<system>(available);
        assert (accepted == available);
    };

    // Greet function (keeping it for compatibility)
    public func greet(name : Text) : async Text {
        return "Hello, " # name # "! Welcome to the Supply Chain Marketplace.";
    };
}