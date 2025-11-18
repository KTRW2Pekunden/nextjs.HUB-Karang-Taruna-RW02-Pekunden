"use client";

import { useState, useEffect } from "react";
import { ChevronLeft, Plus, Trash2, Edit2 } from "lucide-react";
import TransactionFormModal from "./components/TransactionFormModal";
import {
  getAllTransactionsFromSheet,
  addTransactionToSheet,
  updateTransactionToSheet,
  deleteTransactionFromSheet,
} from "./lib/google-sheets-service";
import Link from "next/link";

interface Transaction {
  id: string;
  date: string;
  type: "income" | "expense";
  amount: number;
  description: string;
}

const PRIMARY_COLOR = "#E77E4F";
const TEXT_PRIMARY = "#F5E9D6";
const TEXT_SECONDARY = "#b8a88e";
const BG_MAIN = "#1C1F24";
const BORDER_COLOR = "#2a2e35";
const CARD_BG_COLOR = "#25282d";

const getTodayDate = () => new Date().toISOString().split("T")[0];

const LoadingSpinner = () => (
  <div className="flex flex-col items-center justify-center min-h-screen bg-linear-to-br from-[#1C1F24] via-[#2a2d32] to-[#1C1F24]">
    <div
      className="animate-spin rounded-full h-14 w-14 border-t-4 border-b-4 mb-6"
      style={{ borderColor: PRIMARY_COLOR + " transparent transparent transparent" }}
    ></div>
    <p className="text-lg font-medium" style={{ color: TEXT_SECONDARY }}>
      Memuat data transaksi...
    </p>
  </div>
);

export default function CashManagement() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [currentBalance, setCurrentBalance] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [showForm, setShowForm] = useState<boolean>(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [transactionDate, setTransactionDate] = useState(getTodayDate());
  const [newTransaction, setNewTransaction] = useState({
    type: "income" as "income" | "expense",
    amount: 0,
    description: "",
  });

  useEffect(() => {
    const balance = transactions.reduce((acc, t) => {
      return t.type === "income" ? acc + t.amount : acc - t.amount;
    }, 0);
    setCurrentBalance(balance);
  }, [transactions]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await getAllTransactionsFromSheet();
        setTransactions(data);
      } catch (err) {
        alert("Gagal memuat data transaksi: "+err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const resetForm = () => {
    setNewTransaction({ type: "income", amount: 0, description: "" });
    setTransactionDate(getTodayDate());
    setEditingTransaction(null);
  };

  const handleSubmit = async () => {
    if (!transactionDate || newTransaction.amount <= 0 || !newTransaction.description.trim()) {
      alert("Harap isi semua field dengan benar.");
      return;
    }
    const data = {
      Tanggal: transactionDate,
      Jenis: newTransaction.type,
      Keterangan: newTransaction.description.trim(),
      Jumlah: newTransaction.amount,
    };
    try {
      if (editingTransaction) {
        await updateTransactionToSheet(editingTransaction.id, data);
      } else {
        await addTransactionToSheet(data);
      }
      const updated = await getAllTransactionsFromSheet();
      setTransactions(updated);
    } catch (error) {
      alert("Gagal menyimpan transaksi: "+error);
    }
    resetForm();
    setShowForm(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Yakin ingin menghapus transaksi ini?")) return;
    await deleteTransactionFromSheet(id);
    const updated = await getAllTransactionsFromSheet();
    setTransactions(updated);
  };

  const handleEdit = (transaction: Transaction) => {
    setEditingTransaction(transaction);
    setNewTransaction({
      type: transaction.type,
      amount: transaction.amount,
      description: transaction.description,
    });
    setTransactionDate(transaction.date);
    setShowForm(true);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  if (loading) return <LoadingSpinner />;

  return (
    <main className="min-h-screen" style={{ backgroundColor: BG_MAIN }}>
      <div className="sticky top-0 z-40 border-b" style={{ backgroundColor: BG_MAIN, borderColor: BORDER_COLOR }}>
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="inline-flex items-center justify-center p-2 rounded-lg hover:bg-opacity-10 transition"
              style={{ backgroundColor: `rgba(231, 126, 79, 0.1)` }}
            >
              <ChevronLeft className="w-5 h-5" style={{ color: TEXT_PRIMARY }} />
            </Link>
            <div>
              <h1 className="text-lg md:text-xl font-bold" style={{ color: TEXT_PRIMARY }}>
                Pencatatan kas
              </h1>
              <p className="text-xs md:text-sm" style={{ color: TEXT_SECONDARY }}>
                Kelola pemasukan dan pengeluaran Karang Taruna RW 02 Pekunden
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              resetForm();
              setShowForm(true);
            }}
            className="flex items-center gap-2 px-3 md:px-4 py-2 rounded-lg transition text-sm md:text-base font-medium"
            style={{ backgroundColor: PRIMARY_COLOR, color: TEXT_PRIMARY }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#d86d3f")}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = PRIMARY_COLOR)}
          >
            <Plus className="w-4 h-4 md:w-5 md:h-5" />
            <span className="hidden sm:inline">Transaksi Baru</span>
          </button>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-6">
        <div className="shadow-lg rounded-xl p-6 mb-8 border" style={{ backgroundColor: CARD_BG_COLOR, borderColor: BORDER_COLOR }}>
          <h2 className="text-xl font-semibold" style={{ color: TEXT_SECONDARY }}>
            Saldo Kas Saat Ini:
          </h2>
          <p className="text-4xl font-extrabold mt-2" style={{ color: currentBalance >= 0 ? "#81C784" : "#E57373" }}>
            {formatCurrency(currentBalance)}
          </p>
        </div>

        <div className="shadow-lg rounded-xl p-6 border" style={{ backgroundColor: CARD_BG_COLOR, borderColor: BORDER_COLOR }}>
          <h2 className="text-2xl font-semibold mb-4" style={{ color: TEXT_PRIMARY }}>
            Riwayat Transaksi
          </h2>

          {transactions.length === 0 ? (
            <p style={{ color: TEXT_SECONDARY }} className="italic">
              Belum ada transaksi.
            </p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {transactions
                .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                .map((t) => (
                  <div
                    key={t.id}
                    className="p-4 rounded-lg shadow-sm border"
                    style={{ backgroundColor: BG_MAIN, borderColor: BORDER_COLOR }}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <p className="text-sm" style={{ color: TEXT_SECONDARY }}>
                        {new Date(t.date).toLocaleDateString("id-ID")}
                      </p>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEdit(t)}
                          className="p-1 rounded-full hover:bg-opacity-20 transition"
                          style={{ backgroundColor: `rgba(231, 126, 79, 0.1)` }}
                          title="Edit Transaksi"
                        >
                          <Edit2 className="w-4 h-4" style={{ color: PRIMARY_COLOR }} />
                        </button>
                        <button
                          onClick={() => handleDelete(t.id)}
                          className="p-1 rounded-full hover:bg-opacity-20 transition"
                          style={{ backgroundColor: `rgba(229, 115, 115, 0.1)` }}
                          title="Hapus Transaksi"
                        >
                          <Trash2 className="w-4 h-4" style={{ color: "#E57373" }} />
                        </button>
                      </div>
                    </div>
                    <h3 className="text-lg font-medium mb-1" style={{ color: TEXT_PRIMARY }}>
                      {t.description}
                    </h3>
                    <p
                      className={`text-xl font-bold ${t.type === "income" ? "text-green-500" : "text-red-500"}`}
                      style={{ color: t.type === "income" ? "#81C784" : "#E57373" }}
                    >
                      {t.type === "expense" ? "-" : "+"}{" "}
                      {formatCurrency(t.amount)}
                    </p>
                    <p className="text-xs mt-2" style={{ color: TEXT_SECONDARY }}>
                      Jenis:{" "}
                      <span className="font-semibold">
                        {t.type === "income" ? "Pemasukan" : "Pengeluaran"}
                      </span>
                    </p>
                  </div>
                ))}
            </div>
          )}
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