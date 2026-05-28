import { ShieldX, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router";
import { useAuth } from "../context/AuthContext";

export function AccessDenied() {
  const navigate = useNavigate();
  const { homePath } = useAuth();

  return (
    <div className="flex items-center justify-center" style={{ minHeight: "60vh" }}>
      <div className="flex flex-col items-center text-center px-6 py-12" style={{ maxWidth: 420 }}>
        <div
          className="w-16 h-16 rounded-2xl flex items-center justify-center mb-6"
          style={{ background: "#FEF2F2" }}
        >
          <ShieldX className="w-8 h-8" style={{ color: "#DC2626" }} />
        </div>

        <h1 style={{ fontSize: "24px", fontWeight: 700, color: "#111827", marginBottom: 8 }}>
          權限不足
        </h1>
        <p style={{ fontSize: "15px", color: "#6B7280", lineHeight: 1.7, marginBottom: 24 }}>
          您目前的角色沒有存取此頁面的權限。如需開通權限，請聯繫系統管理者。
        </p>

        <button
          className="flex items-center gap-2 px-5 py-2.5 rounded-lg transition-colors duration-150"
          style={{ background: "#111827", color: "#FFFFFF", fontSize: "14px", fontWeight: 600 }}
          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = "#1F2937"; }}
          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "#111827"; }}
          onClick={() => navigate(homePath)}
        >
          <ArrowLeft className="w-4 h-4" />
          返回首頁
        </button>
      </div>
    </div>
  );
}
