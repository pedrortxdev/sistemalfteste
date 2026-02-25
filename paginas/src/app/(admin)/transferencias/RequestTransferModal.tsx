"use client";

import { useState, useTransition } from "react";
import { Send, MapPin, X } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Select } from "@/components/ui/Select";
import { requestTransfer } from "./actions";

interface RequestTransferModalProps {
    machineId: string;
    machineName: string;
    currentCityId: string | undefined;
    cities: { id: string; name: string }[];
}

export function RequestTransferModal({ machineId, machineName, currentCityId, cities }: RequestTransferModalProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [targetCityId, setTargetCityId] = useState("");
    const [errorMsg, setErrorMsg] = useState("");
    const [isPending, startTransition] = useTransition();

    const availableCities = cities.filter(c => c.id !== currentCityId);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setErrorMsg("");

        if (!targetCityId) {
            setErrorMsg("Selecione a cidade destino.");
            return;
        }

        startTransition(async () => {
            try {
                // Como essa action hoje manda 'para a cidade do request', a lógica que fizemos:
                // O Operador pede a máquina para a FILIAL DELE
                // Na action o toCityId é o ID destino
                await requestTransfer(machineId, targetCityId);
                setIsOpen(false);
            } catch (err: any) {
                setErrorMsg(err.message || "Erro ao solicitar máquina.");
            }
        });
    };

    if (!isOpen) {
        return (
            <button
                onClick={() => setIsOpen(true)}
                title="Transferir / Solicitar"
                className="p-2 text-[#0066cc] hover:text-white bg-blue-50 hover:bg-[#0066cc] rounded-lg transition-colors ml-2"
            >
                <Send size={16} />
            </button>
        );
    }

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl w-full max-w-md shadow-xl overflow-hidden flex flex-col">
                <div className="flex justify-between items-center p-4 md:p-6 border-b border-gray-100">
                    <div>
                        <h2 className="text-xl font-bold text-gray-900">Transferir Máquina</h2>
                        <p className="text-sm text-gray-500 font-medium">{machineName}</p>
                    </div>
                    <button onClick={() => setIsOpen(false)} className="text-gray-400 hover:text-gray-900 p-1">
                        <X size={24} />
                    </button>
                </div>

                <div className="p-4 md:p-6">
                    <form onSubmit={handleSubmit} className="space-y-4">
                        {errorMsg && (
                            <div className="p-3 rounded-xl text-sm font-semibold bg-red-100 text-red-800">
                                {errorMsg}
                            </div>
                        )}

                        <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-xl">
                            <MapPin className="text-[#0066cc] shrink-0 mt-0.5" size={20} />
                            <div>
                                <h4 className="font-semibold text-gray-900 leading-tight">Mudar localização p/ Aluguel</h4>
                                <p className="text-sm text-gray-500 mt-1">
                                    Se você for Operador, pessa para sua própria Filial e o Dono aprovará.
                                    Se for Dono, a transferência será pré-aprovada na versão 2 do painel.
                                </p>
                            </div>
                        </div>

                        <Select
                            label="Unidade (Filial) Destino *"
                            name="cityId"
                            value={targetCityId}
                            onChange={(e) => setTargetCityId(e.target.value)}
                            options={[
                                { value: "", label: "Selecione o destino..." },
                                ...availableCities.map(c => ({ value: c.id, label: c.name }))
                            ]}
                            required
                        />

                        <div className="flex gap-3 pt-4 justify-end mt-4">
                            <Button type="button" variant="ghost" onClick={() => setIsOpen(false)}>
                                Cancelar
                            </Button>
                            <Button type="submit" variant="primary" disabled={isPending}>
                                {isPending ? "Processando..." : "Confirmar Envio"}
                            </Button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
