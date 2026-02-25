"use client";

import { useTransition } from "react";
import { processTransfer } from "./actions";
import { Check, X } from "lucide-react";

export function ProcessTransferButtons({ requestId }: { requestId: string }) {
    const [isPending, startTransition] = useTransition();

    const handleProcess = (approve: boolean) => {
        startTransition(() => {
            processTransfer(requestId, approve);
        });
    };

    return (
        <div className="flex gap-2 w-full pt-1">
            <button
                onClick={() => handleProcess(false)}
                disabled={isPending}
                className="flex-1 flex justify-center items-center gap-1 bg-red-50 text-red-600 hover:bg-red-100 font-bold py-2 px-3 rounded-xl transition-colors text-sm"
            >
                <X size={16} /> Rejeitar
            </button>
            <button
                onClick={() => handleProcess(true)}
                disabled={isPending}
                className="flex-1 flex justify-center items-center gap-1 bg-green-50 text-green-600 hover:bg-green-100 font-bold py-2 px-3 rounded-xl transition-colors text-sm"
            >
                <Check size={16} /> Aprovar
            </button>
        </div>
    );
}
