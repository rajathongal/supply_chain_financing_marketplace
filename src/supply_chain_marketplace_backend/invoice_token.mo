import HashMap "mo:base/HashMap";
import Nat "mo:base/Nat";
import Nat32 "mo:base/Nat32";
import Principal "mo:base/Principal";
import Hash "mo:base/Hash";

actor InvoiceToken {
    private type Invoice = {
        amount: Nat;
        dueDate: Nat;
        supplier: Principal;
        buyer: Principal;
    };

    private var tokenId : Nat = 0;

    // Custom hash function for Nat
    private func natHash(n : Nat) : Hash.Hash {
        var x = Nat32.fromNat(n);
        x := (x ^ (x >> 16)) *% 0x85ebca6b;
        x := (x ^ (x >> 13)) *% 0xc2b2ae35;
        x := x ^ (x >> 16);
        return x
    };

    private var invoices = HashMap.HashMap<Nat, Invoice>(10, Nat.equal, natHash);

    public func createInvoice(amount: Nat, dueDate: Nat, buyer: Principal) : async Nat {
        tokenId += 1;
        let supplier = Principal.fromActor(InvoiceToken);
        invoices.put(tokenId, { amount; dueDate; supplier; buyer });
        tokenId
    };

    public query func getInvoice(id: Nat) : async ?Invoice {
        invoices.get(id)
    };
}