"use client";

import { useTransition, useState } from "react";
import { Wrench, Edit, ArrowRightLeft, Send } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { updateMachineStatus } from "./actions";
import { RequestTransferModal } from "../transferencias/RequestTransferModal";

interface MachineCardProps {
    machine: {
        id: string;
        name: string;
        model: string | null;
        category: string;
        dailyPrice: number;
        status: string;
        city: { name: string } | null;
    };
    userRole: string;
    allCities: { id: string; name: string }[];
}

const statusColorMap: Record<string, "success" | "danger" | "warning" | "default"> = {
    DISPONIVEL: "success",
    ALUGADA: "default",
    MANUTENCAO: "warning",
    ESTRAGADA: "danger",
};

export function MachineCard({ machine, userRole, allCities }: MachineCardProps) {
    const [isPending, startTransition] = useTransition();

    // Temporary hardcoded toggler for demo / logic testing
    const handleToggleStatus = (newStatus: string) => {
        startTransition(() => {
            updateMachineStatus(machine.id, newStatus);
        });
    };

    return (
        <Card className="hover:shadow-md transition-shadow">
            <div className="p-5 flex flex-col h-full gap-4">

                <div className="flex justify-between items-start">
                    <div className="p-3 rounded-xl bg-orange-50 text-orange-600">
                        <Wrench size={24} />
                    </div>

                    <div className="flex flex-col items-end gap-1">
                        <Badge variant={statusColorMap[machine.status] || "default"}>
                            {machine.status}
                        </Badge>
                        <span className="text-xs font-bold text-gray-400 bg-gray-100 px-2 py-0.5 rounded uppercase">
                            {machine.category}
                        </span>
                    </div>
                </div>

                <div>
                    <h3 className="font-bold text-lg text-gray-900 leading-tight mb-1">{machine.name}</h3>
                    <p className="text-sm font-medium text-gray-500">{machine.model || "Sem modelo descrito"}</p>
                </div>

                <div className="mt-2 pt-4 border-t border-gray-100 grid grid-cols-2 gap-2 text-sm">
                    <div className="flex flex-col">
                        <span className="text-xs font-bold text-gray-400 uppercase">Preço / Dia</span>
                        <span className="font-semibold text-gray-900">
                            {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(machine.dailyPrice)}
                        </span>
                    </div>
                    <div className="flex flex-col items-end">
                        <span className="text-xs font-bold text-gray-400 uppercase">Filial Atual</span>
                        <span className="font-semibold text-gray-700">{machine.city?.name || "N/A"}</span>
                    </div>
                </div>

                {/* Quick actions row */}
                <div className="mt-auto pt-4 flex items-center justify-end gap-2">
                    {machine.status === "ESTRAGADA" && (
                        <button
                            onClick={() => handleToggleStatus("MANUTENCAO")}
                            disabled={isPending}
                            className="text-xs font-bold text-orange-600 bg-orange-50 px-3 py-1.5 rounded-lg hover:bg-orange-100 transition-colors"
                        >
                            Enviar Manutenção
                        </button>
                    )}

                    {machine.status === "MANUTENCAO" && (
                        <button
                            onClick={() => handleToggleStatus("DISPONIVEL")}
                            disabled={isPending}
                            className="text-xs font-bold text-green-600 bg-green-50 px-3 py-1.5 rounded-lg hover:bg-green-100 transition-colors"
                        >
                            Finalizar Manutenção
                        </button>
                    )}

                    {machine.status === "DISPONIVEL" && (
                        <button
                            onClick={() => handleToggleStatus("ESTRAGADA")}
                            disabled={isPending}
                            className="text-xs font-bold text-red-600 bg-red-50 px-3 py-1.5 rounded-lg hover:bg-red-100 transition-colors"
                        >
                            Marcar Estragada
                        </button>
                    )}

                    {/* In future updates, this goes to explicit Machine details/edit page */}
                    <button className="p-2 text-gray-400 hover:text-gray-900 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors ml-2">
                        <Edit size={16} />
                    </button>

                    <RequestTransferModal
                        machineId={machine.id}
                        machineName={machine.name}
                        currentCityId={machine.city?.name ? machine.city.name : undefined} // Nao tenho o ID puro populado aqui facilmente, preciso puxar no form
                        cities={allCities}
                    />
                </div>
            </div>
        </Card>
    );
}
