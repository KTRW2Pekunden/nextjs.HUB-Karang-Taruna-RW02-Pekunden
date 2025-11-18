export const PRIMARY_COLOR = "#E77E4F";
export const TEXT_PRIMARY = "#F5E9D6";
export const TEXT_SECONDARY = "#b8a88e";
export const BG_MAIN = "#1C1F24";
export const BORDER_COLOR = "#2a2e35";
export const CARD_BG_COLOR = "#25282d";

export const getTodayDate = () => new Date().toISOString().split("T")[0];

export const formatCurrency = (amount: number) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(amount);