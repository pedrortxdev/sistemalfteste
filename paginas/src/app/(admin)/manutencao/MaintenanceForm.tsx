"use client";

import { useActionState, useEffect } from "react";
import { useFormStatus } from "react-dom";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { createMaintenance } from "./actions";
import { MaintenanceState } from "@/lib/validations/maintenance";
import { Wrench, Settings2, FileText, BadgeDollarSign, Loader2, PackageSearch } from "lucide-react";

interface MaintenanceFormProps {
    machines: { id: string; name: string; model: string | null }[];
    onSuccess: () => void;
    onCancel: () => void;
}

const initialState: MaintenanceState = {
    message: null,
    errors: {}
};

function SubmitButton() {
    const { pending } = useFormStatus();

    return (
        <Button
            type="submit"
            disabled={pending}
            className="w-full bg-red-600 hover:bg-red-700 text-white font-bold h-12 rounded-xl transition-all shadow-sm"
        >
            {pending ? (
                <div className="flex items-center justify-center gap-2">
                    <Loader2 className="animate-spin" size={20} />
                    <span>Lançando Oficina...</span>
                </div>
            ) : "Registrar Oficina"}
        </Button>
    );
}

export function MaintenanceForm({ machines, onSuccess, onCancel }: MaintenanceFormProps) {
    const [state, formAction] = useActionState(createMaintenance, initialState);

    useEffect(() => {
        if (state.success) {
            onSuccess();
        }
    }, [state.success, onSuccess]);

    return (
        <form action={formAction} className="space-y-6">
            {state.message && !state.success && (
                <div className="p-4 bg-red-50 border border-red-100 text-red-600 rounded-xl text-sm font-semibold flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-red-600"></div>
                    {state.message}
                </div>
            )}

            <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                    <PackageSearch size={14} /> Selecionar Máquina (Pátio atual) *
                </label>
                <div className="relative">
                    <select
                        name="machineId"
                        className={`w-full bg-white border border-gray-200 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-[#0066cc]/20 focus:border-[#0066cc] transition-all text-sm font-semibold appearance-none cursor-pointer ${state.errors?.machineId ? "border-red-500 bg-red-50" : ""}`}
                        defaultValue=""
                    >
                        <option value="" disabled>--- Escolha a Máquina ---</option>
                        {machines.map((mac) => (
                            <option key={mac.id} value={mac.id} className="font-medium text-gray-900">
                                {mac.name} {mac.model ? `- ${mac.model}` : ""}
                            </option>
                        ))}
                    </select>
                </div>
                {state.errors?.machineId && <span className="text-xs font-semibold text-red-600">{state.errors.machineId[0]}</span>}
            </div>

            <div className="grid md:grid-cols-2 gap-5">
                <div className="space-y-1.5">
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-1.5">
                        <Settings2 size={14} /> Tipo de Problema *
                    </label>
                    <div className="relative">
                        <select
                            name="type"
                            className={`w-full bg-white border border-gray-200 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-[#0066cc]/20 focus:border-[#0066cc] transition-all text-sm font-semibold appearance-none cursor-pointer ${state.errors?.type ? "border-red-500 bg-red-50" : ""}`}
                            defaultValue="CORRETIVA"
                        >
                            <option value="CORRETIVA" className="font-bold text-red-600">⚠ QUEBRA / CORRETIVA</option>
                            <option value="PREVENTIVA" className="font-bold text-blue-600">⚙ REVISÃO PREVENTIVA</option>
                        </select>
                    </div>
                </div>

                <div className="space-y-1.5">
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-1.5 text-red-600">
                        <BadgeDollarSign size={14} /> Custo Conserto (R$) *
                    </label>
                    <Input
                        name="cost"
                        type="number"
                        step="0.01"
                        min="0"
                        defaultValue="0"
                        placeholder="Ex: 250.00"
                        error={state.errors?.cost?.[0]}
                        required
                    />
                    <p className="text-[10px] text-gray-400 font-semibold mt-1">Gera uma Saída (Despesa) automática no Caixa.</p>
                </div>
            </div>

            <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-1.5">
                    <FileText size={14} /> Descrição da Ocorrência/Peça
                </label>
                <textarea
                    name="description"
                    placeholder="Ex: Troca de escovas do motor. Máquina raspando carcaça."
                    className={`w-full bg-gray-50 border border-gray-200 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-[#0066cc]/20 focus:border-[#0066cc] transition-all resize-none min-h-[90px] text-sm ${state.errors?.description ? "border-red-500 bg-red-50" : ""}`}
                ></textarea>
                {state.errors?.description && <span className="text-xs font-semibold text-red-600">{state.errors.description[0]}</span>}
            </div>

            <div className="pt-4 flex gap-3">
                <Button variant="ghost" type="button" onClick={onCancel} className="flex-1 font-bold">
                    Cancelar
                </Button>
                <div className="flex-[2]">
                    <SubmitButton />
                </div>
            </div>
        </form>
    );
}
