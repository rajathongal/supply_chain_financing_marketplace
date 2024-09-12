import HashMap "mo:base/HashMap";
import Nat "mo:base/Nat";
import Nat32 "mo:base/Nat32";
import Principal "mo:base/Principal";
import Iter "mo:base/Iter";
import Result "mo:base/Result";
import Array "mo:base/Array";
import Buffer "mo:base/Buffer";
import Cycles "mo:base/ExperimentalCycles";
import Option "mo:base/Option";

actor SupplyChainMarketplace {

    // RBAC User types
    type Role = {
        #Admin;
        #Supplier;
        #Investor;
        #Buyer;
    };

    type User = {
        principal : Principal;
        role : Role;
    };

    type Buyer = {
        principal : Principal;
        name : Text;
    };

    type PurchaseOrder = {
        id : Nat;
        buyerPrincipal : Principal;
        supplierPrincipal : Principal;
        description: Text;
        amount : Nat;
        dueDate : Nat;
        status : { #Created; #Invoiced; #Paid };
    };

    // Invoice type definition
    public type Invoice = {
        invoiceId : Nat;
        purchaseOrderId : Nat;
        amount : Nat;
        dueDate : Nat;
        supplier : Principal;
        buyer : Principal;
        isFunded : Bool;
        status : { #Created; #Funded; #Paid };
    };

    type SupplierProfile = {
        principal : Principal;
        name : Text;
        description : Text;
        categories : [Text];
    };

    // Investment type definition
    public type Investment = {
        invoiceId : Nat;
        investor : Principal;
        amount : Nat;
        expectedReturn : Nat;
    };

    // Caller to get Principal
    public shared (msg) func getCaller() : async Principal {
        msg.caller;
    };

    // Custom hash function for Nat
    private func natHash(n : Nat) : Nat32 {
        var x = Nat32.fromNat(n);
        x := (x ^ (x >> 16)) *% 0x85ebca6b;
        x := (x ^ (x >> 13)) *% 0xc2b2ae35;
        x := x ^ (x >> 16);
        return x;
    };

    private var invoiceId : Nat = 0;
    private var nextPurchaseOrderId : Nat = 1;
    private var invoices = HashMap.HashMap<Nat, Invoice>(10, Nat.equal, natHash);
    private var investments = Buffer.Buffer<Investment>(0);
    private var users = HashMap.HashMap<Principal, User>(10, Principal.equal, Principal.hash);
    private var adminPrincipal : ?Principal = null;
    private var buyers = HashMap.HashMap<Principal, Buyer>(10, Principal.equal, Principal.hash);
    private var purchaseOrders = HashMap.HashMap<Nat, PurchaseOrder>(10, Nat.equal, natHash);
    private var supplierProfiles = HashMap.HashMap<Principal, SupplierProfile>(10, Principal.equal, Principal.hash);

    public shared(msg) func registerSupplierProfile(name: Text, description: Text, categories: [Text]) : async Result.Result<(), Text> {
        if (not hasRole(msg.caller, #Supplier)) {
            return #err("Only suppliers can register a profile");
        };
        let profile : SupplierProfile = {
            principal = msg.caller;
            name = name;
            description = description;
            categories = categories;
        };
        supplierProfiles.put(msg.caller, profile);
        #ok()
    };

    public query func getSupplierProfiles() : async [SupplierProfile] {
        Iter.toArray(supplierProfiles.vals())
    };

    public query func searchSuppliers(category: Text) : async [SupplierProfile] {
        Iter.toArray(Iter.filter(supplierProfiles.vals(), func (profile: SupplierProfile) : Bool {
            Array.find<Text>(profile.categories, func (c: Text) : Bool { c == category }) != null
        }))
    };

    // Function to set the initial admin
    public shared (msg) func setInitialAdmin() : async Result.Result<(), Text> {
        switch (adminPrincipal) {
            case (?adminPrincipal) {
                #err("Admin already set");
            };
            case (null) {
                adminPrincipal := ?msg.caller;
                users.put(msg.caller, { principal = msg.caller; role = #Admin });
                #ok();
            };
        };
    };

    // Function to get the current admin
    public query func getAdmin() : async ?Principal {
        adminPrincipal;
    };

    // Helper function to check if the caller is the admin
    private func isAdmin(caller : Principal) : Bool {
        switch (adminPrincipal) {
            case (?admin) { Principal.equal(caller, admin) };
            case (null) { false };
        };
    };

    // User registration and role management
    public shared (msg) func registerUser(role : Role) : async Result.Result<(), Text> {
        if (users.get(msg.caller) != null) {
            return #err("User already registered");
        };
        if (role == #Admin) {
            return #err("Role Admin Not Allowed");
        };
        users.put(msg.caller, { principal = msg.caller; role = role });
        #ok();
    };

    public shared (msg) func registerBuyer(name : Text) : async Result.Result<(), Text> {
        if (not hasRole(msg.caller, #Buyer)) {
            return #err("Only users with Buyer role can register as buyers");
        };
        buyers.put(msg.caller, { principal = msg.caller; name = name });
        #ok();
    };

    public shared (msg) func changeUserRole(userPrincipal : Principal, newRole : Role) : async Result.Result<(), Text> {
        if (not isAdmin(msg.caller)) {
            return #err("Only admin can change roles");
        };
        switch (users.get(userPrincipal)) {
            case (null) { #err("User not found") };
            case (?user) {
                users.put(userPrincipal, { principal = user.principal; role = newRole });
                #ok();
            };
        };
    };

    // Helper function to check roles
    private func hasRole(userPrincipal : Principal, requiredRole : Role) : Bool {
        switch (users.get(userPrincipal)) {
            case (null) { false };
            case (?user) {
                user.role == requiredRole or isAdmin(userPrincipal);
            };
        };
    };

    // Create Purchase order
    public shared (msg) func createPurchaseOrder(supplierPrincipal : Principal, amount : Nat, dueDate : Nat, description: Text) : async Result.Result<Nat, Text> {
        if (not hasRole(msg.caller, #Buyer)) {
            return #err("Only buyers can create purchase orders");
        };

        switch (supplierProfiles.get(supplierPrincipal)) {
            case (null) { #err("Supplier not found") };
            case (?_) {
                let id = nextPurchaseOrderId;
                nextPurchaseOrderId += 1;
                let po : PurchaseOrder = {
                    id = id;
                    buyerPrincipal = msg.caller;
                    supplierPrincipal = supplierPrincipal;
                    amount = amount;
                    dueDate = dueDate;
                    description = description;
                    status = #Created;
                };
                purchaseOrders.put(id, po);
                #ok(id)
            };
        }
    };

    // Create a new invoice
    public shared (msg) func createInvoice(purchaseOrderId : Nat) : async Result.Result<Nat, Text> {
        if (not hasRole(msg.caller, #Supplier)) {
            return #err("Only suppliers can create invoices");
        };
        switch (purchaseOrders.get(purchaseOrderId)) {
            case (null) {
                #err("Purchase order not found");
            };
            case (?po) {
                if (po.supplierPrincipal != msg.caller) {
                    return #err("You are not the supplier for this purchase order");
                };
                if (po.status != #Created) {
                    return #err("Purchase order is not in Created status");
                };
                let id = invoiceId;
                invoiceId += 1;
                let invoice : Invoice = {
                    invoiceId = id;
                    purchaseOrderId = purchaseOrderId;
                    amount = po.amount;
                    dueDate = po.dueDate;
                    supplier = msg.caller;
                    buyer = po.buyerPrincipal;
                    status = #Created;
                    isFunded = false;
                };
                invoices.put(id, invoice);
                purchaseOrders.put(purchaseOrderId, { po with status = #Invoiced });
                #ok(id);
            };
        };
    };

    // Get a specific invoice
    public query func getInvoice(id : Nat) : async ?Invoice {
        invoices.get(id);
    };

    // List all invoices
    public shared (msg) func getAllInvoices() : async Result.Result<[Invoice], Text> {
        if (not isAdmin(msg.caller)) {
            return #err("Only admin can view all users");
        };
        #ok(Iter.toArray(Iter.map(invoices.entries(), func(entry : (Nat, Invoice)) : Invoice { entry.1 })));
    };

    // List available (unfunded) invoices
    public query func listAvailableInvoices() : async [Invoice] {
        let allInvoices = Iter.toArray(Iter.map(invoices.entries(), func(entry : (Nat, Invoice)) : Invoice { entry.1 }));
        Array.filter(allInvoices, func(i : Invoice) : Bool { not i.isFunded });
    };

    // Fund an invoice
    public shared (msg) func fundInvoice(invoiceId : Nat, fundingAmount : Nat) : async Result.Result<(), Text> {
        if (not hasRole(msg.caller, #Investor)) {
            return #err("Only investors can fund invoices");
        };
        switch (invoices.get(invoiceId)) {
            case (null) {
                #err("Invoice not found");
            };
            case (?invoice) {
                if (invoice.status != #Created) {
                    return #err("Invoice is not available for funding");
                };
                if (fundingAmount > invoice.amount) {
                    return #err("Funding amount cannot be greater than invoice amount");
                };
                let transferResult = transferTokens(msg.caller, invoice.supplier, fundingAmount);
                switch (transferResult) {
                    case (#err(e)) { return #err(e) };
                    case (#ok()) {
                        let investment : Investment = {
                            invoiceId = invoiceId;
                            investor = msg.caller;
                            amount = fundingAmount;
                            expectedReturn = invoice.amount;
                        };
                        investments.add(investment);
                        invoices.put(invoiceId, { invoice with status = #Funded });
                        #ok();
                    };
                };
            };
        };
    };

    public shared (msg) func payInvoice(invoiceId : Nat) : async Result.Result<(), Text> {
        switch (invoices.get(invoiceId)) {
            case (null) {
                #err("Invoice not found");
            };
            case (?invoice) {
                if (invoice.buyer != msg.caller) {
                    return #err("Only the buyer can pay this invoice");
                };
                if (invoice.status != #Funded) {
                    return #err("Invoice is not funded");
                };
                let transferResult = transferTokens(msg.caller, invoice.supplier, invoice.amount);
                switch (transferResult) {
                    case (#err(e)) { return #err(e) };
                    case (#ok()) {
                        invoices.put(invoiceId, { invoice with status = #Paid });
                        // Transfer funds to the investor
                        for (investment in investments.vals()) {
                            if (investment.invoiceId == invoiceId) {
                                ignore transferTokens(invoice.supplier, investment.investor, investment.expectedReturn);
                            };
                        };
                        #ok();
                    };
                };
            };
        };
    };

    // Get investment details for an investor
    public query func getInvestmentDetails(investor : Principal) : async [Investment] {
        Array.filter(Buffer.toArray(investments), func(i : Investment) : Bool { i.investor == investor });
    };

    public query func getBuyers() : async [Buyer] {
        Iter.toArray(buyers.vals());
    };

    public query func getPurchaseOrders(supplierPrincipal : Principal) : async [PurchaseOrder] {
        Iter.toArray(Iter.filter(purchaseOrders.vals(), func(po : PurchaseOrder) : Bool { po.supplierPrincipal == supplierPrincipal }));
    };

    // Accept cycles (ICP tokens)
    public func acceptCycles() : async () {
        let available = Cycles.available();
        let accepted = Cycles.accept<system>(available);
        assert (accepted == available);
    };

    // Function to get all users (admin only)
    public shared (msg) func getAllUsers() : async Result.Result<[User], Text> {
        if (not isAdmin(msg.caller)) {
            return #err("Only admin can view all users");
        };
        #ok(Iter.toArray(users.vals()));
    };

    public query func getInvoices(supplierPrincipal : Principal) : async [Invoice] {
        Iter.toArray(Iter.filter(invoices.vals(), func(inv : Invoice) : Bool { inv.supplier == supplierPrincipal }));
    };

    // Get the role of a user
    public shared query (msg) func getUserRole() : async Result.Result<Role, Text> {
        switch (users.get(msg.caller)) {
            case (?user) {
                #ok(user.role);
            };
            case (null) {
                #err("User not registered");
            };
        };
    };

    // A private token for easy of use real world contracts might have actual tokens
    private var tokenBalances = HashMap.HashMap<Principal, Nat>(10, Principal.equal, Principal.hash);
    public shared (msg) func mintTokens(amount : Nat) : async Result.Result<(), Text> {
        let currentBalance = Option.get(tokenBalances.get(msg.caller), 0);
        tokenBalances.put(msg.caller, currentBalance + amount);
        #ok();
    };
    public query func getTokenBalance(user : Principal) : async Nat {
        Option.get(tokenBalances.get(user), 0);
    };

    private func transferTokens(from : Principal, to : Principal, amount : Nat) : Result.Result<(), Text> {
        let fromBalance = Option.get(tokenBalances.get(from), 0);
        if (fromBalance < amount) {
            return #err("Insufficient balance");
        };
        let toBalance = Option.get(tokenBalances.get(to), 0);
        tokenBalances.put(from, fromBalance - amount);
        tokenBalances.put(to, toBalance + amount);
        #ok();
    };
};
