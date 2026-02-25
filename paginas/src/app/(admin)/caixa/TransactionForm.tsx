"use client";

import { useActionState, useEffect } from "react";
import { useFormStatus } from "react-dom";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { createManualTransaction } from "./actions";
import { CashFlowState } from "@/lib/validations/cashflow";
import { Loader2, ArrowDownCircle, ArrowUpCircle, Tag, AlignLeft, BadgeDollarSign } from "lucide-react";

interface TransactionFormProps {
    onSuccess: () => void;
    onCancel: () => void;
}

const initialState: CashFlowState = {
    message: null,
    errors: {}
};

function SubmitButton() {
    const { pending } = useFormStatus();

    return (
        <Button
            type="submit"
            disabled={pending}
            className="w-full bg-[#0066cc] hover:bg-[#0052a3] text-white font-bold h-12 rounded-xl transition-all shadow-sm"
        >
            {pending ? (
                <div className="flex items-center justify-center gap-2">
                    <Loader2 className="animate-spin" size={20} />
                    <span>Registrando...</span>
                </div>
            ) : "Salvar Lançamento"}
        </Button>
    );
}

export function TransactionForm({ onSuccess, onCancel }: TransactionFormProps) {
    const [state, formAction] = useActionState(createManualTransaction, initialState);

    useEffect(() => {
        if (state.success) {
            onSuccess();
        }
    }, [state.success, onSuccess]);

    return (
        <form action={formAction} className="space-y-6 mt-4">
            {state.message && !state.success && (
                <div className="p-4 bg-red-50 border border-red-100 text-red-600 rounded-xl text-sm font-semibold flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-red-600"></div>
                    {state.message}
                </div>
            )}

            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                        <ArrowUpCircle size={14} className="text-green-600" /> / <ArrowDownCircle size={14} className="text-red-600" /> Tipo *
                    </label>
                    <div className="relative">
                        <select
                            name="type"
                            className={`w-full bg-white border border-gray-200 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-[#0066cc]/20 focus:border-[#0066cc] transition-all text-sm font-bold appearance-none cursor-pointer ${state.errors?.type ? "border-red-500 bg-red-50" : ""}`}
                            defaultValue="SAIDA"
                        >
                            <option value="ENTRADA" className="text-green-600">ENTRADA (+)</option>
                            <option value="SAIDA" className="text-red-600">SAÍDA (-)</option>
                        </select>
                    </div>
                </div>

                <div className="space-y-1.5">
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-1.5">
                        <BadgeDollarSign size={14} /> Valor (R$) *
                    </label>
                    <Input
                        name="amount"
                        type="number"
                        step="0.01"
                        min="0.01"
                        placeholder="Ex: 150.00"
                        error={state.errors?.amount?.[0]}
                        required
                    />
                </div>
            </div>

            <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-1.5">
                    <Tag size={14} /> Categoria *
                </label>
                <div className="relative">
                    <select
                        name="category"
                        className={`w-full bg-white border border-gray-200 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-[#0066cc]/20 focus:border-[#0066cc] transition-all text-sm font-medium appearance-none cursor-pointer ${state.errors?.category ? "border-red-500 bg-red-50" : ""}`}
                        defaultValue="OUTROS"
                    >
                        <option value="APORTE_SOCIOS">APORTE DE SÓCIOS</option>
                        <option value="PAGAMENTO_CONTAS">PAGAMENTO CONTAS (Luz, Água, Net)</option>
                        <option value="ALIMENTACAO">ALIMENTAÇÃO</option>
                        <option value="COMBUSTIVEL">COMBUSTÍVEL</option>
                        <option value="RETIRADA_LUCRO">RETIRADA DE LUCRO</option>
                        <option value="OUTROS">OUTROS</option>
                    </select>
                </div>
            </div>

            <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-1.5">
                    <AlignLeft size={14} /> Descrição / Referência *
                </label>
                <Input
                    name="description"
                    type="text"
                    placeholder="Ex: Compra de tintas para escritório"
                    error={state.errors?.description?.[0]}
                    required
                />
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
