"use client";

function MachineDeleteModal({
  open,
  onClose,
  machineId,
  onConfirm,
}: {
  open: boolean;
  onClose: () => void;
  machineId: string;
  onConfirm: () => void;
}) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-xl w-full max-w-md border dark:border-gray-700">
        <h3 className="text-xl font-bold text-gray-800 dark:text-gray-200 mb-4">
          Confirm Delete
        </h3>

        <p className="text-gray-700 dark:text-gray-300 mb-6">
          Are you sure you want to delete machine <strong>{machineId}</strong>?  
          This action cannot be undone.
        </p>

        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-gray-300 dark:bg-gray-700 text-gray-800 dark:text-gray-200"
          >
            Cancel
          </button>

          <button
            onClick={onConfirm}
            className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white"
          >
            Delete Machine
          </button>
        </div>
      </div>
    </div>
  );
}

export default MachineDeleteModal;
