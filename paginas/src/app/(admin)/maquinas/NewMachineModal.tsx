"use client";

import { useState } from "react";
import { Plus, X } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { MachineForm } from "./MachineForm";

interface Props {
    cities: { id: string; name: string }[];
    userRole: string;
}

export function NewMachineModal({ cities, userRole }: Props) {
    const [isOpen, setIsOpen] = useState(false);

    if (!isOpen) {
        return (
            <Button variant="primary" onClick={() => setIsOpen(true)}>
                <Plus size={18} className="mr-2" />
                Nova Máquina
            </Button>
        );
    }

    return (
        <>
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                <div className="bg-white rounded-2xl w-full max-w-2xl shadow-xl overflow-hidden flex flex-col max-h-[90vh]">
                    <div className="flex justify-between items-center p-4 md:p-6 border-b border-gray-100">
                        <div>
                            <h2 className="text-xl font-bold text-gray-900">Cadastrar Nova Máquina</h2>
                            <p className="text-sm text-gray-500 font-medium">Insira no sistema os detalhes para aluguel.</p>
                        </div>
                        <button
                            onClick={() => setIsOpen(false)}
                            className="text-gray-400 hover:text-gray-900 transition-colors p-1"
                        >
                            <X size={24} />
                        </button>
                    </div>

                    <div className="p-4 md:p-6 overflow-y-auto hide-scroll">
                        <MachineForm userRole={userRole} cities={cities} onSuccess={() => setIsOpen(false)} onCancel={() => setIsOpen(false)} />
                    </div>
                </div>
            </div>
        </>
    );
}
