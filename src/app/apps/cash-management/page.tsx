"use client";

import CashHeader from "./components/CashHeader";
import BalanceCard from "./components/BalanceCard";
import TransactionList from "./components/TransactionList";
import TransactionFormModal from "./components/TransactionFormModal";
import LoadingSpinner from "./components/LoadingSpinner";
import { useCashManagement } from "./hooks/useCashManagement";

export default function CashManagementPage() {
  const {
    transactions,
    currentBalance,
    loading,
    showForm,
    setShowForm,
    editingTransaction,
    transactionDate,
    setTransactionDate,
    newTransaction,
    setNewTransaction,
    openAdd,
    handleEdit,
    handleSubmit,
    handleDelete,
  } = useCashManagement();

  if (loading) return <LoadingSpinner />;

  return (
    <main className="min-h-screen" style={{ backgroundColor: "#1C1F24" }}>
      <CashHeader onAdd={openAdd} />

      <div className="max-w-6xl mx-auto px-4 py-6">
        <BalanceCard balance={currentBalance} />
        <div className="shadow-lg rounded-xl p-6 border" style={{ backgroundColor: "#25282d", borderColor: "#2a2e35" }}>
          <h2 className="text-2xl font-semibold mb-4" style={{ color: "#F5E9D6" }}>
            Riwayat Transaksi
          </h2>
          <TransactionList transactions={transactions} onEdit={handleEdit} onDelete={handleDelete} />
        </div>
      </div>

      <TransactionFormModal
        showForm={showForm}
        onClose={() => setShowForm(false)}
        transactionDate={transactionDate}
        setTransactionDate={setTransactionDate}
        newTransaction={newTransaction}
        setNewTransaction={setNewTransaction}
        onSubmitTransaction={handleSubmit}
        isEditing={editingTransaction !== null}
      />
    </main>
  );
}