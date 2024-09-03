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

    // RBAC User types
    type Role = {
        #Admin;
        #Supplier;
        #Investor;
    };

    type User = {
        principal : Principal;
        role : Role;
    };

    // Invoice type definition
    public type Invoice = {
        invoiceId : Nat;
        amount : Nat;
        dueDate : Nat;
        supplier : Principal;
        buyer : Principal;
        isFunded : Bool;
    };

    // Investment type definition
    public type Investment = {
        invoiceId : Nat;
        investor : Principal;
        amount : Nat;
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
    private var invoices = HashMap.HashMap<Nat, Invoice>(10, Nat.equal, natHash);
    private var investments = Buffer.Buffer<Investment>(0);

    private var users = HashMap.HashMap<Principal, User>(10, Principal.equal, Principal.hash);
    private var adminPrincipal : ?Principal = null;

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

    // Create a new invoice
    public shared (msg) func createInvoice(amount : Nat, dueDate : Nat, buyer : Principal) : async Result.Result<Nat, Text> {
        if (not hasRole(msg.caller, #Supplier)) {
            return #err("Only suppliers can create invoices");
        };
        invoiceId += 1;
        let supplier = msg.caller;
        invoices.put(invoiceId, { invoiceId; amount; dueDate; supplier; buyer; isFunded = false });
        #ok(invoiceId);
    };

    // Get a specific invoice
    public query func getInvoice(id : Nat) : async ?Invoice {
        invoices.get(id);
    };

    // List all invoices
    public shared(msg) func getAllInvoices() :  async Result.Result<[Invoice], Text> {
        if (not isAdmin(msg.caller)) {
            return #err("Only admin can view all users");
        };
        #ok(Iter.toArray(Iter.map(invoices.entries(), func (entry: (Nat, Invoice)): Invoice { entry.1 })))
    };

    // List available (unfunded) invoices
    public query func listAvailableInvoices() : async [Invoice] {
        let allInvoices = Iter.toArray(Iter.map(invoices.entries(), func(entry : (Nat, Invoice)) : Invoice { entry.1 }));
        Array.filter(allInvoices, func(i : Invoice) : Bool { not i.isFunded });
    };

    // Fund an invoice
    public shared (msg) func fundInvoice(invoiceId : Nat) : async Result.Result<(), Text> {
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

                #ok();
            };
            case (null) {
                #err("Invoice not found");
            };
        };
    };

    // Get investment details for an investor
    public query func getInvestmentDetails(investor : Principal) : async [Investment] {
        Array.filter(Buffer.toArray(investments), func(i : Investment) : Bool { i.investor == investor });
    };

    // Accept cycles (ICP tokens)
    public func acceptCycles() : async () {
        let available = Cycles.available();
        let accepted = Cycles.accept<system>(available);
        assert (accepted == available);
    };

    // Function to get all users (admin only)
    public shared(msg) func getAllUsers() : async Result.Result<[User], Text> {
        if (not isAdmin(msg.caller)) {
            return #err("Only admin can view all users");
        };
        #ok(Iter.toArray(users.vals()))
    };

    // Get the role of a user
    public shared query (msg) func getUserRole() : async Result.Result<Role, Text> {
        switch (users.get(msg.caller)) {
            case (?user) {
                #ok(user.role)
            };
            case (null) {
                #err("User not registered")
            };
        };
    };

    // Greet function (keeping it for compatibility)
    public func greet(name : Text) : async Text {
        return "Hello, " # name # "! Welcome to the Supply Chain Marketplace.";
    };
};
