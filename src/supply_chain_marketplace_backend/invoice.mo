import HashMap "mo:base/HashMap";
import Nat "mo:base/Nat";
import Nat32 "mo:base/Nat32";
import Hash "mo:base/Hash";
import Principal "mo:base/Principal";

module {
  public type Invoice = {
    amount : Nat;
    dueDate : Nat;
    supplier : Principal;
    buyer : Principal;
  };

  public class InvoiceSystem() {

    // Custom hash function for Nat
    private func natHash(n : Nat) : Hash.Hash {
      var x = Nat32.fromNat(n);
      x := (x ^ (x >> 16)) *% 0x85ebca6b;
      x := (x ^ (x >> 13)) *% 0xc2b2ae35;
      x := x ^ (x >> 16);
      return x;
    };

    private var tokenId : Nat = 0;
    private var invoices = HashMap.HashMap<Nat, Invoice>(10, Nat.equal, natHash);

    public func createInvoice(amount : Nat, dueDate : Nat, supplier : Principal, buyer : Principal) : Nat {
      tokenId += 1;
      invoices.put(tokenId, { amount; dueDate; supplier; buyer });
      tokenId;
    };

    public func getInvoice(id : Nat) : ?Invoice {
      invoices.get(id);
    };
  };
};
