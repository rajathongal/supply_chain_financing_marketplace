import Invoice "invoice";
import Principal "mo:base/Principal";

actor Main {
    let invoiceSystem = Invoice.InvoiceSystem();

    public func greet(name : Text) : async Text {
        return "Hello, " # name # "!";
    };

    public shared(msg) func createInvoice(amount: Nat, dueDate: Nat, buyer: Principal) : async Nat {
        let supplier = msg.caller;
        invoiceSystem.createInvoice(amount, dueDate, supplier, buyer)
    };

    public query func getInvoice(id: Nat) : async ?Invoice.Invoice {
        invoiceSystem.getInvoice(id)
    };
}