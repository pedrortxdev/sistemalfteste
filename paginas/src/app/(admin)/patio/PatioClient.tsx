"use client";

import { useState } from "react";
import { Search, Wrench, CheckCircle2, AlertCircle } from "lucide-react";
import { updateMachineStatus } from "../maquinas/actions";
import { useToast } from "@/components/ui/Toast";

interface Machine {
  id: string;
  name: string;
  model: string | null;
  status: string;
  serialNumber?: string | null;
}

export function PatioClient({ initialMachines }: { initialMachines: any[] }) {
  const [machines, setMachines] = useState(initialMachines);
  const [searchTerm, setSearchTerm] = useState("");
  const { toast } = useToast();

  const filtered = machines.filter(m => 
    m.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    m.model?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleStatusChange = async (id: string, newStatus: string, machineName: string) => {
    try {
      await updateMachineStatus(id, newStatus);
      setMachines(prev => prev.map(m => m.id === id ? { ...m, status: newStatus } : m));
      toast(`Máquina ${machineName} agora está ${newStatus}`, "success");
    } catch (err) {
      toast("Erro ao atualizar status", "error");
    }
  };

  return (
    <div className="space-y-4">
      {/* Busca */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
        <input 
          type="text"
          placeholder="Buscar máquina (Ex: Compactador)..."
          className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Lista de Máquinas */}
      <div className="space-y-3">
        {filtered.map((machine) => (
          <div key={machine.id} className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm flex flex-col gap-3">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-bold text-gray-900 uppercase text-sm">{machine.name}</h3>
                <p className="text-xs text-gray-500">{machine.model || 'Sem modelo'}</p>
              </div>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                machine.status === 'DISPONIVEL' ? 'bg-green-100 text-green-700' :
                machine.status === 'ALUGADA' ? 'bg-blue-100 text-blue-700' :
                'bg-red-100 text-red-700'
              }`}>
                {machine.status}
              </span>
            </div>

            {/* Ações Rápidas do Funcionário */}
            <div className="flex gap-2 border-t border-gray-50 pt-3">
              {machine.status === 'DISPONIVEL' && (
                <button 
                  onClick={() => handleStatusChange(machine.id, 'ESTRAGADA', machine.name)}
                  className="flex-1 flex items-center justify-center gap-2 bg-red-50 text-red-600 py-2 rounded-xl text-xs font-bold hover:bg-red-100"
                >
                  <AlertCircle size={14} /> Marcar Defeito
                </button>
              )}
              
              {machine.status === 'ESTRAGADA' && (
                <button 
                  onClick={() => handleStatusChange(machine.id, 'DISPONIVEL', machine.name)}
                  className="flex-1 flex items-center justify-center gap-2 bg-green-50 text-green-600 py-2 rounded-xl text-xs font-bold hover:bg-green-100"
                >
                  <CheckCircle2 size={14} /> Consertada
                </button>
              )}

              {machine.status === 'ALUGADA' && (
                <button 
                  onClick={() => handleStatusChange(machine.id, 'DISPONIVEL', machine.name)}
                  className="flex-1 flex items-center justify-center gap-2 bg-gray-100 text-gray-600 py-2 rounded-xl text-xs font-bold hover:bg-gray-200"
                >
                  <CheckCircle2 size={14} /> Receber Devolução
                </button>
              )}
            </div>
          </div>
        ))}

        {filtered.length === 0 && (
          <p className="text-center text-gray-400 py-10 text-sm">Nenhuma máquina encontrada.</p>
        )}
      </div>
    </div>
  );
}
