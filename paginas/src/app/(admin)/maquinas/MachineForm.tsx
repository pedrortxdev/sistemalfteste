"use client";

import { useActionState, useEffect } from "react";
import { createMachine, updateMachine } from "./actions";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";

interface MachineFormProps {
    initialData?: {
        id: string;
        name: string;
        model: string | null;
        category: string;
        dailyPrice: number;
        status: string;
        cityId: string;
    } | null;
    cities: { id: string; name: string }[];
    userRole: string;
    onSuccess?: () => void;
    onCancel?: () => void;
}

export function MachineForm({ initialData, cities, userRole, onSuccess, onCancel }: MachineFormProps) {
    const isEditing = !!initialData;
    const action = isEditing ? updateMachine.bind(null, initialData.id) : createMachine;
    const [state, formAction, isPending] = useActionState(action, { success: false });

    useEffect(() => {
        if (state.success && onSuccess) {
            onSuccess();
        }
    }, [state.success, onSuccess]);

    return (
        <form action={formAction} className="space-y-4">
            {state.message && (
                <div className={`p-3 rounded-xl text-sm font-semibold ${state.success ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}>
                    {state.message}
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                    label="Nome da Máquina / Equipamento *"
                    name="name"
                    defaultValue={initialData?.name || ""}
                    placeholder="Ex: Escavadeira Hidráulica"
                    error={state.errors?.name?.[0]}
                    required
                />

                <Input
                    label="Modelo / Marca"
                    name="model"
                    defaultValue={initialData?.model || ""}
                    placeholder="Ex: CAT 320"
                    error={state.errors?.model?.[0]}
                />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Select
                    label="Categoria *"
                    name="category"
                    defaultValue={initialData?.category || ""}
                    error={state.errors?.category?.[0]}
                    required
                    options={[
                        { value: "", label: "Selecione uma categoria" },
                        { value: "ESCAVACAO", label: "Escavação" },
                        { value: "ELEVACAO", label: "Elevação" },
                        { value: "CONCRETO", label: "Concreto" },
                        { value: "FERRAMENTAS", label: "Ferramentas" },
                        { value: "GERADORES", label: "Geradores" },
                        { value: "OUTROS", label: "Outros" }
                    ]}
                />

                <Input
                    label="Preço Diária (R$) *"
                    name="pricePerDay"
                    type="number"
                    step="0.01"
                    min="0.01"
                    defaultValue={initialData?.dailyPrice || ""}
                    placeholder="150.00"
                    error={state.errors?.pricePerDay?.[0]}
                    required
                />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {isEditing && (
                    <Select
                        label="Status Atual"
                        name="status"
                        defaultValue={initialData?.status || "DISPONIVEL"}
                        error={state.errors?.status?.[0]}
                        options={[
                            { value: "DISPONIVEL", label: "Disponível" },
                            { value: "ALUGADA", label: "Alugada" },
                            { value: "MANUTENCAO", label: "Em Manutenção" },
                            { value: "ESTRAGADA", label: "Estragada (Aguardando)" }
                        ]}
                    />
                )}

                {userRole === "DONO" && (
                    <Select
                        label="Unidade (Filial) *"
                        name="cityId"
                        defaultValue={initialData?.cityId || ""}
                        error={state.errors?.cityId?.[0]}
                        required
                        options={cities.map(city => ({ value: city.id, label: city.name }))}
                    />
                )}

                {userRole === "OPERADOR" && !isEditing && (
                    <div className="flex flex-col justify-end text-sm text-gray-500 font-medium pb-2">
                        * Máquina será salva na sua filial origem automaticamente.
                    </div>
                )}
            </div>

            <div className="flex gap-3 pt-4 border-t border-gray-100 justify-end">
                {onCancel && (
                    <Button type="button" variant="ghost" onClick={onCancel}>
                        Cancelar
                    </Button>
                )}
                <Button type="submit" variant="primary" disabled={isPending}>
                    {isPending ? "Salvando..." : "Salvar Máquina"}
                </Button>
            </div>
        </form>
    );
}
