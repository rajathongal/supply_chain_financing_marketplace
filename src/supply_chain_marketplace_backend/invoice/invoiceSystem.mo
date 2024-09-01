import HashMap "mo:base/HashMap";
import Nat "mo:base/Nat";
import Nat32 "mo:base/Nat32";
import Hash "mo:base/Hash";
import Principal "mo:base/Principal";
import Invoice "invoice";
import Error "mo:base/Error";
import Iter "mo:base/Iter";

module {

  public class InvoiceSystem() {

    // Custom hash function for Nat
    private func natHash(n : Nat) : Hash.Hash {
      var x = Nat32.fromNat(n);
      x := (x ^ (x >> 16)) *% 0x85ebca6b;
      x := (x ^ (x >> 13)) *% 0xc2b2ae35;
      x := x ^ (x >> 16);
      return x;
    };

    private var invoiceId : Nat = 0;
    private var invoices = HashMap.HashMap<Nat, Invoice.Invoice>(10, Nat.equal, natHash);
    private var isFunded : Bool = false;

    public func createInvoice(amount : Nat, dueDate : Nat, supplier : Principal, buyer : Principal) : Nat {
      invoiceId += 1;
      invoices.put(invoiceId, { invoiceId; amount; dueDate; supplier; buyer; isFunded });
      invoiceId;
    };

    public func getInvoice(invoiceId : Nat) : async ?Invoice.Invoice {
      invoices.get(invoiceId);
    };

     public func getAllInvoices() : [Invoice.Invoice] {
            Iter.toArray(Iter.map(invoices.entries(), func (entry: (Nat, Invoice.Invoice)): Invoice.Invoice { entry.1 }))
        };

    public func updateInvoiceStatus(invoiceId : Nat, isFunded : Bool) : async () {
      switch (invoices.get(invoiceId)) {
        case (?invoice) {
          let updatedInvoice = {
            invoiceId = invoice.invoiceId;
            supplier = invoice.supplier;
            amount = invoice.amount;
            dueDate = invoice.dueDate;
            buyer = invoice.buyer;
            isFunded = isFunded;
          };
          invoices.put(invoiceId, updatedInvoice);
        };
        case (null) {
          throw Error.reject("Invoice not found");
        };
      };
    };
  };
};
