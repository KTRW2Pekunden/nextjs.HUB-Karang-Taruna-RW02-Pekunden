import { PRIMARY_COLOR, TEXT_SECONDARY } from "../constants";

export default function LoadingSpinner() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-linear-to-br from-[#1C1F24] via-[#2a2d32] to-[#1C1F24]">
      <div
        className="animate-spin rounded-full h-14 w-14 border-t-4 border-b-4 mb-6"
        style={{ borderColor: PRIMARY_COLOR + " transparent transparent transparent" }}
      />
      <p className="text-lg font-medium" style={{ color: TEXT_SECONDARY }}>
        Memuat data kas...
      </p>
    </div>
  );
}