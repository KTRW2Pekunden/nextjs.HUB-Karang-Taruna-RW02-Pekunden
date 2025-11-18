import TransactionItem from "./TransactionItem";
import type { Transaction } from "../hooks/useCashManagement";

interface Props {
  transactions: Transaction[];
  onEdit: (t: Transaction) => void;
  onDelete: (id: string) => void;
}

export default function TransactionList({ transactions, onEdit, onDelete }: Props) {
  if (transactions.length === 0) {
    return <p className="italic" style={{ color: "#b8a88e" }}>Belum ada transaksi.</p>;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {transactions
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
        .map((t) => (
          <TransactionItem key={t.id} t={t} onEdit={onEdit} onDelete={onDelete} />
        ))}
    </div>
  );
}