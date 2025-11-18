import React from "react";
import { X } from "lucide-react";

const PRIMARY_COLOR = "#E77E4F";
const TEXT_PRIMARY = "#F5E9D6";
const TEXT_SECONDARY = "#b8a88e";
const BG_MAIN = "#1C1F24";
const BG_INPUT_FIELD = "#2a2e35";
const BORDER_COLOR = "#2a2e35";

interface TransactionFormModalProps {
  showForm: boolean;
  onClose: () => void;
  transactionDate: string;
  setTransactionDate: (date: string) => void;
  newTransaction: {
    type: "income" | "expense";
    amount: number;
    description: string;
  };
  setNewTransaction: React.Dispatch<
    React.SetStateAction<{
      type: "income" | "expense";
      amount: number;
      description: string;
    }>
  >;
  onSubmitTransaction: () => Promise<void>;
  isEditing: boolean;
}

const TransactionFormModal: React.FC<TransactionFormModalProps> = ({
  showForm,
  onClose,
  transactionDate,
  setTransactionDate,
  newTransaction,
  setNewTransaction,
  onSubmitTransaction,
  isEditing,
}) => {
  if (!showForm) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="fixed inset-0 backdrop-blur-sm"
        style={{ backgroundColor: "rgba(28, 31, 36, 0.8)" }}
        onClick={onClose}
      ></div>
      <div
        className="relative w-full max-w-md rounded-xl p-6 shadow-2xl animate-fade-in-up border"
        style={{ backgroundColor: BG_MAIN, borderColor: BORDER_COLOR }}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full hover:bg-opacity-10 transition"
        >
          <X className="w-5 h-5" style={{ color: TEXT_PRIMARY }} />
        </button>
        <h2 className="text-2xl font-bold mb-6" style={{ color: TEXT_PRIMARY }}>
          {isEditing ? "Edit Transaksi" : "Input Transaksi Baru"}
        </h2>
        <form
          onSubmit={async (e) => {
            e.preventDefault();
            await onSubmitTransaction();
          }}
          className="space-y-4"
        >
          <div>
            <label
              className="block text-sm font-medium mb-1"
              style={{ color: TEXT_SECONDARY }}
            >
              Tanggal:
            </label>
            <input
              type="date"
              value={transactionDate}
              onChange={(e) => setTransactionDate(e.target.value)}
              className="mt-1 block w-full rounded-lg shadow-sm px-3 py-2.5 text-sm focus:outline-none"
              style={{ backgroundColor: BG_INPUT_FIELD, color: TEXT_PRIMARY }}
              required
            />
          </div>

          <div>
            <label
              className="block text-sm font-medium mb-1"
              style={{ color: TEXT_SECONDARY }}
            >
              Jenis:
            </label>
            <select
              value={newTransaction.type}
              onChange={(e) =>
                setNewTransaction((prev) => ({
                  ...prev,
                  type: e.target.value as "income" | "expense",
                }))
              }
              className="mt-1 block w-full rounded-lg shadow-sm px-3 py-2.5 text-sm focus:outline-none"
              style={{ backgroundColor: BG_INPUT_FIELD, color: TEXT_PRIMARY }}
            >
              <option value="income">Pemasukan (Income)</option>
              <option value="expense">Pengeluaran (Expense)</option>
            </select>
          </div>

          <div>
            <label
              className="block text-sm font-medium mb-1"
              style={{ color: TEXT_SECONDARY }}
            >
              Keterangan:
            </label>
            <input
              type="text"
              value={newTransaction.description}
              onChange={(e) =>
                setNewTransaction((prev) => ({
                  ...prev,
                  description: e.target.value,
                }))
              }
              placeholder="Misalnya: Gaji Bulanan atau Beli Kopi"
              className="mt-1 block w-full rounded-lg shadow-sm px-3 py-2.5 text-sm focus:outline-none"
              style={{ backgroundColor: BG_INPUT_FIELD, color: TEXT_PRIMARY }}
              required
            />
          </div>

          <div>
            <label
              className="block text-sm font-medium mb-1"
              style={{ color: TEXT_SECONDARY }}
            >
              Jumlah ({newTransaction.type === "income" ? "Masuk" : "Keluar"}):
            </label>
            <input
              type="number"
              value={newTransaction.amount || ""}
              onChange={(e) =>
                setNewTransaction((prev) => ({
                  ...prev,
                  amount: parseInt(e.target.value) || 0,
                }))
              }
              min="1"
              placeholder="0"
              className="mt-1 block w-full rounded-lg shadow-sm px-3 py-2.5 text-sm focus:outline-none"
              style={{ backgroundColor: BG_INPUT_FIELD, color: TEXT_PRIMARY }}
              required
            />
          </div>

          <button
            type="submit"
            className="w-full py-3 px-4 rounded-lg shadow-sm text-base font-medium transition duration-150 ease-in-out mt-6"
            style={{ backgroundColor: PRIMARY_COLOR, color: TEXT_PRIMARY }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.backgroundColor = "#d86d3f")
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.backgroundColor = PRIMARY_COLOR)
            }
          >
            {isEditing ? "Update Transaksi" : "Tambahkan Transaksi"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default TransactionFormModal;
