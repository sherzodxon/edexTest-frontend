"use client";

import { useState } from "react";
import Flatpickr from "react-flatpickr";
import api from "@/lib/axios";
import toast from "react-hot-toast";
import { X } from "lucide-react";
import { CustomLocale } from "flatpickr/dist/types/locale";
const Uzbek : CustomLocale = {
    weekdays: {
        shorthand: [
            "Yak",
            "Du",
            "Se",
            "Ch",
            "Pa",
            "Ju",
            "Sh"
        ],
        longhand: [
            "Yakshanba",
            "Dushanba",
            "Seshanba",
            "Chorshanba",
            "Payshanba",
            "Juma",
            "Shanba"
        ]
    },
    months: {
        shorthand: [
            "Yan",
            "Fev",
            "Mar",
            "Apr",
            "May",
            "Iyn",
            "Iyl",
            "Avg",
            "Sen",
            "Okt",
            "Noy",
            "Dek"
        ],
        longhand: [
            "Yanvar",
            "Fevral",
            "Mart",
            "Aprel",
            "May",
            "Iyun",
            "Iyul",
            "Avgust",
            "Sentabr",
            "Oktabr",
            "Noyabr",
            "Dekabr"
        ]
    },
    firstDayOfWeek: 1,
    rangeSeparator: " dan ",
    time_24hr: true
};


export default function EditTestTimeModal({
  test,
  onClose,
  onUpdated,
}: {
  test: any;
  onClose: () => void;
  onUpdated: () => void;
}) {
  const [startTime, setStartTime] = useState<Date | null>(
    test.startTime ? new Date(test.startTime) : null
  );
  const [endTime, setEndTime] = useState<Date | null>(
    test.endTime ? new Date(test.endTime) : null
  );
  const [loading, setLoading] = useState(false);

  const now = new Date();
  const hasStarted = startTime ? now >= startTime : false;
  const hasEnded = endTime ? now > endTime : false;

  const handleSave = async () => {
    if (!startTime || !endTime) {
      toast.error("Iltimos, boshlanish va tugash vaqtini kiriting");
      return;
    }

    if (startTime >= endTime) {
      toast.error("Boshlanish vaqti tugash vaqtidan oldin bo‘lishi kerak");
      return;
    }

    try {
      setLoading(true);
      await api.put(`/tests/admin/${test.id}/time`, {
        startTime: startTime.toISOString(),
        endTime: endTime.toISOString(),
      });
      toast.success("Test vaqti yangilandi");
      onUpdated();
      onClose();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Vaqtni yangilashda xatolik");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
      <div className="bg-gray-900 border border-gray-700 rounded-lg p-4 w-full max-w-md">
        {/* Header */}
        <div className="flex justify-between items-center mb-4">
          <h2 className="font-semibold text-lg">Test vaqtini o‘zgartirish</h2>
          <button onClick={onClose}>
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Inputs */}
        <div className="space-y-3">
          <div>
            <label className="text-sm text-gray-400">Boshlanish vaqti</label>
            <Flatpickr
              value={startTime || undefined}
              onChange={(date: Date[]) => setStartTime(date[0])}
              options={{
                enableTime: true,
                dateFormat: "Y-m-d H:i",
                locale: Uzbek,
                minDate: now,
                maxDate: endTime || undefined,
                time_24hr: true,
              }}
              className={`w-full p-2 rounded ${
                hasStarted ? "bg-gray-700 cursor-not-allowed" : "bg-gray-800"
              }`}
              disabled={hasStarted || hasEnded}
              placeholder="Boshlanish vaqtini tanlang"
            />
          </div>

          <div>
            <label className="text-sm text-gray-400">Tugash vaqti</label>
            <Flatpickr
              value={endTime || undefined}
              onChange={(date: Date[]) => setEndTime(date[0])}
              options={{
                enableTime: true,
                dateFormat: "Y-m-d H:i",
                locale: Uzbek,
                minDate: startTime || now,
                time_24hr: true,
              }}
              className={`w-full p-2 rounded ${
                hasEnded ? "bg-gray-700 cursor-not-allowed" : "bg-gray-800"
              }`}
              disabled={hasEnded}
              placeholder="Tugash vaqtini tanlang"
            />
          </div>

          <button
            onClick={handleSave}
            disabled={loading || hasStarted || hasEnded}
            className={`w-full p-2 rounded ${
              loading || hasStarted || hasEnded
                ? "bg-gray-600 cursor-not-allowed"
                : "bg-indigo-600 hover:bg-indigo-500"
            }`}
          >
            Saqlash
          </button>
        </div>
      </div>
    </div>
  );
}
