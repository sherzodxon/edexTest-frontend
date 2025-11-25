"use client";

import toast, { Toast } from "react-hot-toast";

export default function useConfirmToast() {
  const showConfirm = (message: string): Promise<boolean> => {
    return new Promise((resolve) => {
      const tId = toast.custom((t: Toast) => (
        <div className="bg-white shadow-lg p-4 rounded-lg border w-72">
          <p className="text-gray-700">{message}</p>

          <div className="flex justify-end gap-2 mt-4">
            <button
              onClick={() => {
                toast.dismiss(t.id);
                resolve(true); 
              }}
              className="px-3 py-1 rounded bg-red-600 hover:bg-red-700 text-white cursor-pointer"
            >
              Ha
            </button>
            <button
              onClick={() => {
                toast.dismiss(t.id);
                resolve(false); 
              }}
              className="px-3 py-1 rounded bg-gray-200 hover:bg-gray-300 text-gray-800 cursor-pointer"
            >
              Bekor qilish
            </button>

            
          </div>
        </div>
      ), { duration: Infinity });
    });
  };

  return { showConfirm };
}
