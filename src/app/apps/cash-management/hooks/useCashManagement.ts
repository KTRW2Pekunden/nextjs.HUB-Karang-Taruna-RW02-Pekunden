import { useState, useEffect } from "react";
import {
  getAllTransactionsFromSheet,
  addTransactionToSheet,
  updateTransactionToSheet,
  deleteTransactionFromSheet,
} from "../lib/google-sheets-service";
import { getTodayDate } from "../constants";

export interface Transaction {
  id: string;
  date: string;
  type: "income" | "expense";
  amount: number;
  description: string;
}

interface TransactionFormData {
  type: "income" | "expense";
  amount: number;
  description: string;
}

export const useCashManagement = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [currentBalance, setCurrentBalance] = useState(0);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [transactionDate, setTransactionDate] = useState(getTodayDate());

  const [newTransaction, setNewTransaction] = useState<TransactionFormData>({
    type: "income",
    amount: 0,
    description: "",
  });

  useEffect(() => {
    const balance = transactions.reduce(
      (acc, t) => (t.type === "income" ? acc + t.amount : acc - t.amount),
      0
    );
    setCurrentBalance(balance);
  }, [transactions]);

  useEffect(() => {
    const fetch = async () => {
      try {
        const data = await getAllTransactionsFromSheet();
        setTransactions(data);
      } catch {
        alert("Gagal memuat data transaksi");
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  const resetForm = () => {
    setNewTransaction({ type: "income", amount: 0, description: "" });
    setTransactionDate(getTodayDate());
    setEditingTransaction(null);
  };

  const openAdd = () => {
    resetForm();
    setShowForm(true);
  };

  const handleEdit = (t: Transaction) => {
    setEditingTransaction(t);
    setNewTransaction({
      type: t.type,
      amount: t.amount,
      description: t.description,
    });
    setTransactionDate(t.date);
    setShowForm(true);
  };

  const handleSubmit = async () => {
    if (!transactionDate || newTransaction.amount <= 0 || !newTransaction.description.trim()) {
      alert("Harap isi semua field dengan benar.");
      return;
    }

    const payload = {
      Tanggal: transactionDate,
      Jenis: newTransaction.type,
      Keterangan: newTransaction.description.trim(),
      Jumlah: newTransaction.amount,
    };

    try {
      if (editingTransaction) {
        await updateTransactionToSheet(editingTransaction.id, payload);
      } else {
        await addTransactionToSheet(payload);
      }
      const fresh = await getAllTransactionsFromSheet();
      setTransactions(fresh);
      setShowForm(false);
      resetForm();
    } catch {
      alert("Gagal menyimpan transaksi");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Yakin hapus transaksi ini?")) return;
    await deleteTransactionFromSheet(id);
    const fresh = await getAllTransactionsFromSheet();
    setTransactions(fresh);
  };

  return {
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
  };
};