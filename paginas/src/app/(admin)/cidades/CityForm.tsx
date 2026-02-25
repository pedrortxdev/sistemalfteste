"use client";

import { useActionState, useEffect, useState } from "react";
import { createCity, updateCity } from "./actions";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

interface CityFormProps {
    initialData?: {
        id: string;
        name: string;
        address: string | null;
        cnpj: string | null;
        inscricaoEstadual: string | null;
    } | null;
    onSuccess?: () => void;
    onCancel?: () => void;
}

export function CityForm({ initialData, onSuccess, onCancel }: CityFormProps) {
    const isEditing = !!initialData;
    const action = isEditing ? updateCity.bind(null, initialData.id) : createCity;
    const [state, formAction, isPending] = useActionState(action, { success: false });
    const [cnpj, setCnpj] = useState(initialData?.cnpj || "");

    // Mascara simples de CNPJ client-side
    const handleCnpjChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        let value = e.target.value.replace(/\D/g, "");
        if (value.length > 14) value = value.slice(0, 14);
        value = value.replace(/^(\d{2})(\d)/, "$1.$2");
        value = value.replace(/^(\d{2})\.(\d{3})(\d)/, "$1.$2.$3");
        value = value.replace(/\.(\d{3})(\d)/, ".$1/$2");
        value = value.replace(/(\d{4})(\d)/, "$1-$2");
        setCnpj(value);
    };

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

            <Input
                label="Nome da Unidade *"
                name="name"
                defaultValue={initialData?.name || ""}
                placeholder="Ex: Matriz São Paulo"
                error={state.errors?.name?.[0]}
                required
            />

            <Input
                label="CNPJ *"
                name="cnpj"
                value={cnpj}
                onChange={handleCnpjChange}
                placeholder="00.000.000/0001-00"
                error={state.errors?.cnpj?.[0]}
                required
                maxLength={18}
            />

            <Input
                label="Inscrição Estadual"
                name="inscricaoEstadual"
                defaultValue={initialData?.inscricaoEstadual || ""}
                placeholder="Opcional"
                error={state.errors?.inscricaoEstadual?.[0]}
            />

            <Input
                label="Endereço"
                name="address"
                defaultValue={initialData?.address || ""}
                placeholder="Rua Exemplo, 123"
                error={state.errors?.address?.[0]}
            />

            <div className="flex gap-3 pt-4 border-t border-gray-100 justify-end">
                {onCancel && (
                    <Button type="button" variant="ghost" onClick={onCancel}>
                        Cancelar
                    </Button>
                )}
                <Button type="submit" variant="primary" disabled={isPending}>
                    {isPending ? "Salvando..." : "Salvar Unidade"}
                </Button>
            </div>
        </form>
    );
}
