import Nat64 "mo:base/Nat64";
import Principal "mo:base/Principal";
import Result "mo:base/Result";
import Buffer "mo:base/Buffer";
import Array "mo:base/Array";
import InvoiceToken "../invoice/invoiceSystem";
import Invoice "../invoice/invoice";
import Error "mo:base/Error";
import Cycles "mo:base/ExperimentalCycles";

actor Marketplace {
    let invoiceSystem = InvoiceToken.InvoiceSystem();

    public type Investment = {
        invoiceId: Nat;
        investor: Principal;
        amount: Nat;
    };

    private let investments = Buffer.Buffer<Investment>(0);

    public shared(msg) func fundInvoice(invoiceId: Nat) : async Result.Result<(), Text> {
        let invoice = await invoiceSystem.getInvoice(invoiceId);
        switch (invoice) {
            case (?i) {
                if (i.isFunded) {
                    return #err("Invoice is already funded");
                };
                
                try {
                    await invoiceSystem.updateInvoiceStatus(invoiceId, true);
                    investments.add({
                        invoiceId = invoiceId;
                        investor = msg.caller;
                        amount = i.amount
                    });
                    #ok()
                } catch (e) {
                    #err("Failed to update invoice status: " # Error.message(e))
                }
            };
            case (null) {
                #err("Invoice not found")
            };
        }
    };

   public func listAvailableInvoices() : async [Invoice.Invoice] {
        let allInvoices = invoiceSystem.getAllInvoices();
        Array.filter(allInvoices, func (i: Invoice.Invoice) : Bool { not i.isFunded })
    };

    public query func getInvestmentDetails(investor: Principal) : async [Investment] {
        Array.filter(Buffer.toArray(investments), func (i: Investment) : Bool { i.investor == investor })
    };

    public func acceptCycles() : async () {
        let available = Cycles.available();
        let accepted = Cycles.accept<system>(available);
        assert (accepted == available);
    };
}