import { CARD_BG_COLOR, BORDER_COLOR, TEXT_SECONDARY } from "../constants";
import { formatCurrency } from "../constants";

interface Props {
  balance: number;
}

export default function BalanceCard({ balance }: Props) {
  return (
    <div
      className="shadow-lg rounded-xl p-6 mb-8 border"
      style={{ backgroundColor: CARD_BG_COLOR, borderColor: BORDER_COLOR }}
    >
      <h2 className="text-xl font-semibold" style={{ color: TEXT_SECONDARY }}>
        Saldo Kas Saat Ini:
      </h2>
      <p
        className="text-4xl font-extrabold mt-2"
        style={{ color: balance >= 0 ? "#81C784" : "#E57373" }}
      >
        {formatCurrency(balance)}
      </p>
    </div>
  );
}
