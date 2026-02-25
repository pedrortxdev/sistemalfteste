"use client";

import { useState } from "react";
import { Plus, Search, AlertTriangle, Settings2, Clock } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/Dialog";
import { MaintenanceForm } from "./MaintenanceForm";
import { resolveMaintenance } from "./actions";

type LogItem = {
    id: string;
    type: string;
    description: string;
    cost: number;
    date: Date;
    resolvedAt: Date | null;
    machine: { id: string; name: string; model: string | null; serialNumber: string | null, status: string };
    resolvedBy: { name: string } | null;
};

type MachineBasic = {
    id: string;
    name: string;
    model: string | null;
};

export function MaintenanceListClient({ logs, machines }: { logs: LogItem[], machines: MachineBasic[] }) {
    const [searchTerm, setSearchTerm] = useState("");
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [resolvingId, setResolvingId] = useState<string | null>(null);

    const filteredLogs = logs.filter(l =>
        l.machine.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        l.description.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleResolve = async (id: string, machineName: string) => {
        if (!confirm(`Confirma o recebimento da máquina ${machineName} da oficina? Ela voltará para Pátio Disponível.`)) return;

        setResolvingId(id);
        const res = await resolveMaintenance(id);
        if (!res.success) {
            alert(res.message);
        }
        setResolvingId(null);
    };

    return (
        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm flex-1 flex flex-col">
            <div className="p-4 border-b border-gray-100 flex flex-col sm:flex-row gap-3 justify-between items-center bg-gray-50/50">
                <div className="relative w-full sm:max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input
                        type="text"
                        placeholder="Buscar por máquina ou peças..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0066cc]/20 focus:border-[#0066cc] transition-all text-sm font-medium"
                    />
                </div>

                <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                    <DialogTrigger asChild>
                        <button className="w-full sm:w-auto bg-red-600 hover:bg-red-700 text-white font-bold py-2.5 px-5 rounded-xl transition-colors shadow-sm flex justify-center items-center gap-2 text-sm">
                            <Plus size={18} /> Lançar Oficina
                        </button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[550px]">
                        <DialogHeader>
                            <DialogTitle className="text-xl font-black text-red-600 flex items-center gap-2">
                                <AlertTriangle /> Nova Ordem de Manutenção
                            </DialogTitle>
                        </DialogHeader>
                        <MaintenanceForm
                            machines={machines}
                            onSuccess={() => setIsCreateOpen(false)}
                            onCancel={() => setIsCreateOpen(false)}
                        />
                    </DialogContent>
                </Dialog>
            </div>

            <div className="overflow-x-auto flex-1">
                {filteredLogs.length === 0 ? (
                    <div className="flex flex-col items-center justify-center p-12 text-center h-full">
                        <div className="bg-gray-100 p-4 rounded-full mb-4 text-gray-400">
                            <Settings2 size={32} />
                        </div>
                        <h3 className="text-lg font-bold text-gray-900 mb-1">Nenhum evento registrado</h3>
                        <p className="text-gray-500 text-sm max-w-sm">
                            {searchTerm ? "Tente buscar com outros termos." : "Seu pátio está limpo. As máquinas estão em bom estado!"}
                        </p>
                    </div>
                ) : (
                    <table className="w-full text-sm text-left">
                        <thead className="bg-gray-50 text-gray-500 font-bold uppercase text-[10px] border-b border-gray-200">
                            <tr>
                                <th className="px-6 py-4">Data/Hora</th>
                                <th className="px-6 py-4">Equipamento</th>
                                <th className="px-6 py-4">Ocorrência</th>
                                <th className="px-6 py-4">Custo</th>
                                <th className="px-6 py-4">Status / Liberação</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {filteredLogs.map((log) => (
                                <tr key={log.id} className="hover:bg-gray-50/50 transition-colors">
                                    <td className="px-6 py-4 text-xs font-semibold text-gray-500">
                                        {new Date(log.date).toLocaleDateString("pt-BR")} <br />
                                        <span className="text-[10px] text-gray-400 font-mono">{new Date(log.date).toLocaleTimeString("pt-BR", { hour: '2-digit', minute: '2-digit' })}</span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="font-bold text-gray-900 uppercase">{log.machine.name}</div>
                                        <div className="text-xs text-gray-500 font-mono">{log.machine.model || "S-MDL"} {log.machine.serialNumber ? `/ ${log.machine.serialNumber}` : ""}</div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className={`text-[10px] font-black uppercase tracking-wider mb-1 ${log.type === "CORRETIVA" ? "text-red-600" : "text-blue-600"}`}>
                                            {log.type === "CORRETIVA" ? "⚠️ Quebra" : "⚙️ Preventiva"}
                                        </div>
                                        <div className="text-xs font-medium text-gray-700 max-w-[200px] leading-tight">
                                            {log.description}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 font-bold text-gray-800">
                                        {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(log.cost)}
                                    </td>
                                    <td className="px-6 py-4">
                                        {log.resolvedAt ? (
                                            <div className="flex flex-col gap-1">
                                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] font-bold bg-green-50 text-green-700 w-fit">
                                                    👍 RESOLVIDO
                                                </span>
                                                <span className="text-[9px] text-gray-400 font-bold uppercase truncate max-w-[120px]">
                                                    Por: {log.resolvedBy?.name}
                                                </span>
                                            </div>
                                        ) : (
                                            <button
                                                onClick={() => handleResolve(log.id, log.machine.name)}
                                                disabled={resolvingId === log.id}
                                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-[#0066cc]/10 text-[#0066cc] hover:bg-[#0066cc] hover:text-white transition-all w-fit disabled:opacity-50"
                                            >
                                                {resolvingId === log.id ? <Clock size={14} className="animate-spin" /> : "Dar Baixa (Oficina)"}
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
}
