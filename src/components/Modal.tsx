import React from "react";
import { X } from "lucide-react";

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  children: React.ReactNode;
  width?: number; // px 단위, 기본 360
  height?: number; // px 단위, 기본 auto
}

export default function Modal({
  open,
  onClose,
  title,
  description,
  children,
  width = 500,
  height = 300,
}: ModalProps) {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ background: "rgba(0,0,0,0.35)" }}
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl p-6 shadow-xl relative"
        style={{ width, height }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* 닫기 버튼 */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 p-1 rounded-lg hover:bg-zinc-100 text-zinc-400 hover:text-zinc-700 transition-colors border-0 bg-transparent cursor-pointer"
        >
          <X size={15} />
        </button>

        {/* 타이틀 */}
        {title && (
          <h3 className="text-sm font-bold text-zinc-900 mb-1 pr-6">{title}</h3>
        )}

        {/* 설명 */}
        {description && (
          <p className="text-xs text-zinc-500 mb-4 leading-relaxed">
            {description}
          </p>
        )}

        {/* 내용 */}
        {children}
      </div>
    </div>
  );
}

// ── 모달 하단 버튼 공통 ───────────────────────────────────────────────────
export function ModalActions({
  onCancel,
  onConfirm,
  confirmLabel,
}: {
  onCancel: () => void;
  onConfirm: () => void;
  confirmLabel: string;
}) {
  return (
    <div className="flex gap-2">
      <button
        type="button"
        onClick={onCancel}
        className="flex-1 py-2 rounded-xl text-xs font-semibold border"
        style={{ borderColor: "#eaeaea", color: "#555", background: "#fafafa" }}
      >
        취소
      </button>
      <button
        type="button"
        onClick={onConfirm}
        className="flex-1 py-2 rounded-xl text-xs font-bold text-white"
        style={{ background: "linear-gradient(135deg, #16A34A, #22C55E)" }}
      >
        {confirmLabel}
      </button>
    </div>
  );
}
