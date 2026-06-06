import React from 'react';

interface ConfirmDeleteModalProps {
  title: string;
  description: string;
  warning?: string;
  confirmLabel?: string;
  isBusy?: boolean;
  error?: string | null;
  onConfirm: () => void;
  onClose: () => void;
}

const ConfirmDeleteModal: React.FC<ConfirmDeleteModalProps> = ({
  title,
  description,
  warning,
  confirmLabel = 'Delete',
  isBusy = false,
  error = null,
  onConfirm,
  onClose,
}) => (
  <div className="fixed inset-0 z-1000 flex items-center justify-center bg-black/70 px-4 backdrop-blur-sm">
    <div className="glass-card w-full max-w-lg p-6">
      <div className="mb-4">
        <h3 className="text-xl font-semibold">{title}</h3>
        <p className="text-muted mt-2 text-sm">{description}</p>
        {warning && <p className="mt-2 text-sm text-[#FFB36B]">{warning}</p>}
      </div>

      {error && (
        <div className="mb-4 rounded-lg border border-[#FF4C6A]/30 bg-[#FF4C6A]/10 px-4 py-3 text-sm text-[#FF4C6A]">
          {error}
        </div>
      )}

      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          className="btn-ghost px-5 py-2 text-sm"
          onClick={onClose}
          disabled={isBusy}
        >
          Cancel
        </button>
        <button
          type="button"
          className="rounded-lg bg-[#FF4C6A] px-5 py-2 text-sm font-semibold text-white transition hover:bg-[#E0435B] disabled:cursor-not-allowed disabled:opacity-70"
          onClick={onConfirm}
          disabled={isBusy}
        >
          {isBusy ? 'Deleting...' : confirmLabel}
        </button>
      </div>
    </div>
  </div>
);

export default ConfirmDeleteModal;
