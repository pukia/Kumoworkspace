import { Lock } from "lucide-react";

interface ReadOnlyBannerProps {
  message?: string;
}

export function ReadOnlyBanner({ message = "您目前為唯讀模式，無法進行新增或編輯操作" }: ReadOnlyBannerProps) {
  return (
    <div
      className="flex items-center gap-2.5 px-4 py-2.5 rounded-lg mb-4"
      style={{ background: "#FEF9C3", borderWidth: "1px", borderStyle: "solid", borderColor: "#FDE68A" }}
    >
      <Lock className="w-4 h-4 flex-shrink-0" style={{ color: "#A16207" }} />
      <span style={{ fontSize: "14px", color: "#92400E", fontWeight: 500 }}>{message}</span>
    </div>
  );
}