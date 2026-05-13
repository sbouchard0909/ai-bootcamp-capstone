interface DeleteConfirmationDialogProps {
  open: boolean;
  planName: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export function DeleteConfirmationDialog({
  open,
  planName,
  onConfirm,
  onCancel,
}: DeleteConfirmationDialogProps) {
  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-label="Delete confirmation">
      <div className="w-full max-w-md bg-white rounded-lg p-6 shadow-lg">
        <h2 className="text-xl font-semibold">Delete plan?</h2>
        <p className="mt-2 text-gray-700">
          This action will permanently delete <strong>{planName}</strong>.
        </p>

        <div className="mt-6 flex items-center justify-end gap-2">
          <button type="button" onClick={onCancel} className="px-3 py-2 rounded bg-gray-100 hover:bg-gray-200">
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="px-3 py-2 rounded bg-red-600 text-white hover:bg-red-700"
          >
            Confirm delete
          </button>
        </div>
      </div>
    </div>
  );
}
