"use client";

import { useActionState, useEffect } from "react";
import { createUser, updateUser } from "./actions";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";

interface UserFormProps {
    initialData?: {
        id: string;
        name: string;
        email: string;
        role: string;
        cityId: string;
    } | null;
    cities: { id: string; name: string }[];
    onSuccess?: () => void;
    onCancel?: () => void;
}

export function UserForm({ initialData, cities, onSuccess, onCancel }: UserFormProps) {
    const isEditing = !!initialData;
    const action = isEditing ? updateUser.bind(null, initialData.id) : createUser;
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

            <Input
                label="Nome Completo *"
                name="name"
                defaultValue={initialData?.name || ""}
                placeholder="João da Silva"
                error={state.errors?.name?.[0]}
                required
            />

            <Input
                label="E-mail *"
                name="email"
                type="email"
                defaultValue={initialData?.email || ""}
                placeholder="joao@lfaluguel.com"
                error={state.errors?.email?.[0]}
                required
            />

            <Input
                label={isEditing ? "Nova Senha (deixe em branco para manter)" : "Senha Inicial *"}
                name="password"
                type="password"
                placeholder="********"
                error={state.errors?.password?.[0]}
                required={!isEditing}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Select
                    label="Papel / Permissão *"
                    name="role"
                    defaultValue={initialData?.role || "OPERADOR"}
                    error={state.errors?.role?.[0]}
                    required
                    options={[
                        { value: "OPERADOR", label: "Operador (Restrito)" },
                        { value: "DONO", label: "Dono (Acesso Total)" }
                    ]}
                />

                <Select
                    label="Unidade (Cidade) *"
                    name="cityId"
                    defaultValue={initialData?.cityId || ""}
                    error={state.errors?.cityId?.[0]}
                    required
                    options={cities.map(city => ({ value: city.id, label: city.name }))}
                />
            </div>

            <div className="flex gap-3 pt-4 border-t border-gray-100 justify-end">
                {onCancel && (
                    <Button type="button" variant="ghost" onClick={onCancel}>
                        Cancelar
                    </Button>
                )}
                <Button type="submit" variant="primary" disabled={isPending}>
                    {isPending ? "Salvando..." : "Salvar Usuário"}
                </Button>
            </div>
        </form>
    );
}
