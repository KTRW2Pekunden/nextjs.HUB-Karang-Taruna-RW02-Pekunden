import Link from "next/link";
import { ChevronLeft, Plus } from "lucide-react";
import { PRIMARY_COLOR, TEXT_PRIMARY, TEXT_SECONDARY } from "../constants";

interface Props {
  onAdd: () => void;
}

export default function CashHeader({ onAdd }: Props) {
  return (
    <div className="sticky top-0 z-40 border-b" style={{ backgroundColor: "#1C1F24", borderColor: "#2a2e35" }}>
      <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="inline-flex items-center justify-center p-2 rounded-lg hover:bg-opacity-10 transition"
            style={{ backgroundColor: "rgba(231, 126, 79, 0.1)" }}
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
          onClick={onAdd}
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
  );
}