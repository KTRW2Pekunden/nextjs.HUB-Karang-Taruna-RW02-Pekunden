import { Edit2, Trash2 } from "lucide-react";
import { PRIMARY_COLOR, TEXT_PRIMARY, TEXT_SECONDARY, BG_MAIN, BORDER_COLOR } from "../constants";
import { formatCurrency } from "../constants";
import type { Transaction } from "../hooks/useCashManagement";

interface Props {
  t: Transaction;
  onEdit: (t: Transaction) => void;
  onDelete: (id: string) => void;
}

export default function TransactionItem({ t, onEdit, onDelete }: Props) {
  return (
    <div className="p-4 rounded-lg shadow-sm border" style={{ backgroundColor: BG_MAIN, borderColor: BORDER_COLOR }}>
      <div className="flex justify-between items-start mb-2">
        <p className="text-sm font-mono" style={{ color: TEXT_SECONDARY }}>
          {t.date}
        </p>
        <div className="flex gap-2">
          <button
            onClick={() => onEdit(t)}
            className="p-1 rounded-full hover:bg-opacity-20 transition"
            style={{ backgroundColor: "rgba(231, 126, 79, 0.1)" }}
          >
            <Edit2 className="w-4 h-4" style={{ color: PRIMARY_COLOR }} />
          </button>
          <button
            onClick={() => onDelete(t.id)}
            className="p-1 rounded-full hover:bg-opacity-20 transition"
            style={{ backgroundColor: "rgba(229, 115, 115, 0.1)" }}
          >
            <Trash2 className="w-4 h-4" style={{ color: "#E57373" }} />
          </button>
        </div>
      </div>
      <h3 className="text-lg font-medium mb-1" style={{ color: TEXT_PRIMARY }}>
        {t.description}
      </h3>
      <p style={{ color: t.type === "income" ? "#81C784" : "#E57373" }} className="text-xl font-bold">
        {t.type === "expense" ? "-" : "+"} {formatCurrency(t.amount)}
      </p>
      <p className="text-xs mt-2" style={{ color: TEXT_SECONDARY }}>
        Jenis: <span className="font-semibold">{t.type === "income" ? "Pemasukan" : "Pengeluaran"}</span>
      </p>
    </div>
  );
}