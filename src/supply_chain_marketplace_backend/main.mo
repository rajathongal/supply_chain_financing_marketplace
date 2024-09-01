import InvoiceToken "invoice/invoiceSystem";
import Principal "mo:base/Principal";
import Invoice "invoice/invoice";
import Marketplace "marketplace/marketplace";

actor Main {
    let invoiceSystem = InvoiceToken.InvoiceSystem();
    let marketplace = Marketplace.Marketplace();

    public func greet(name : Text) : async Text {
        return "Hello, " # name # "!";
    };

    public shared(msg) func createInvoice(amount: Nat, dueDate: Nat, buyer: Principal) : async Nat {
        let supplier = msg.caller;
        invoiceSystem.createInvoice(amount, dueDate, supplier, buyer)
    };

    public func getInvoice(id: Nat) : async ?Invoice.Invoice {
        await invoiceSystem.getInvoice(id)
    };

    public func fundInvoice(invoiceId: Nat) : async Result.Result<(), Text> {
        await marketplace.fundInvoice(invoiceId)
    };

    public func listAvailableInvoices() : async [Invoice.Invoice] {
        await marketplace.listAvailableInvoices()
    };

    public func getInvestmentDetails(investor: Principal) : async [Marketplace.Investment] {
        await marketplace.getInvestmentDetails(investor)
    };
}