import Principal "mo:base/Principal";

module {
  public type Invoice = {
    invoiceId: Nat;
    amount: Nat;
    dueDate: Nat;
    supplier: Principal;
    buyer: Principal;
    isFunded: Bool;
  };
}