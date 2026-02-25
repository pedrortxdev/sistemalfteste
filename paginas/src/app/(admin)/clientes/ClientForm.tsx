"use client";

import { useActionState, useEffect } from "react";
import { useFormStatus } from "react-dom";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { createClient, updateClient } from "./actions";
import { ClientState } from "@/lib/validations/client";
import { User, FileText, Phone, MapPin, Mail, Loader2 } from "lucide-react";

interface ClientFormProps {
    initialData?: {
        id: string;
        name: string;
        cpfCnpj: string;
        phone: string;
        homeAddress: string | null;
        email: string | null;
    } | null;
    onSuccess: () => void;
    onCancel: () => void;
}

const initialState: ClientState = {
    message: null,
    errors: {}
};

function SubmitButton({ isEditing }: { isEditing: boolean }) {
    const { pending } = useFormStatus();

    return (
        <Button
            type="submit"
            disabled={pending}
            className={`w-full ${isEditing ? 'bg-orange-500 hover:bg-orange-600' : 'bg-[#0066cc] hover:bg-[#0052a3]'} text-white font-bold h-12 rounded-xl transition-all shadow-sm`}
        >
            {pending ? (
                <div className="flex items-center justify-center gap-2">
                    <Loader2 className="animate-spin" size={20} />
                    <span>{isEditing ? "Salvando Alterações..." : "Cadastrando Cliente..."}</span>
                </div>
            ) : (
                isEditing ? "Salvar Alterações" : "Cadastrar Cliente"
            )}
        </Button>
    );
}

export function ClientForm({ initialData, onSuccess, onCancel }: ClientFormProps) {
    const isEditing = !!initialData;

    // Se tiver initialData, usamos update, senão create
    const actionToUse = isEditing
        ? updateClient.bind(null, initialData.id)
        : createClient;

    const [state, formAction] = useActionState(actionToUse, initialState);

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

            <div className="grid md:grid-cols-2 gap-5">
                <div className="space-y-1.5">
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                        <User size={14} /> Nome Completo *
                    </label>
                    <Input
                        name="name"
                        defaultValue={initialData?.name}
                        placeholder="Ex: João Silva Const. Ltda"
                        error={state.errors?.name?.[0]}
                        required
                    />
                </div>

                <div className="space-y-1.5">
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-1.5">
                        <FileText size={14} /> CPF ou CNPJ *
                    </label>
                    <Input
                        name="cpfCnpj"
                        defaultValue={initialData?.cpfCnpj}
                        placeholder="Somente Números"
                        error={state.errors?.cpfCnpj?.[0]}
                        required
                    />
                </div>
            </div>

            <div className="grid md:grid-cols-2 gap-5">
                <div className="space-y-1.5">
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-1.5">
                        <Phone size={14} /> Telefone / WhatsApp *
                    </label>
                    <Input
                        name="phone"
                        defaultValue={initialData?.phone}
                        placeholder="(00) 00000-0000"
                        error={state.errors?.phone?.[0]}
                        required
                    />
                </div>

                <div className="space-y-1.5">
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-1.5">
                        <Mail size={14} /> E-mail (Opcional)
                    </label>
                    <Input
                        name="email"
                        type="email"
                        defaultValue={initialData?.email || ""}
                        placeholder="contato@empresa.com"
                        error={state.errors?.email?.[0]}
                    />
                </div>
            </div>

            <div className="space-y-1.5 pt-2">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-1.5">
                    <MapPin size={14} /> Endereço Residencial/Sede Principal
                </label>
                <textarea
                    name="homeAddress"
                    defaultValue={initialData?.homeAddress || ""}
                    placeholder="Rua, Número, Bairro, Cidade - Estado"
                    className={`w-full bg-gray-50 border border-gray-200 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-[#0066cc]/20 focus:border-[#0066cc] transition-all resize-none min-h-[90px] text-sm ${state.errors?.homeAddress ? "border-red-500 bg-red-50" : ""}`}
                ></textarea>
                {state.errors?.homeAddress && <span className="text-xs font-semibold text-red-600">{state.errors.homeAddress[0]}</span>}
            </div>

            <div className="pt-4 flex gap-3">
                <Button variant="ghost" type="button" onClick={onCancel} className="flex-1 font-bold">
                    Cancelar
                </Button>
                <div className="flex-[2]">
                    <SubmitButton isEditing={isEditing} />
                </div>
            </div>
        </form>
    );
}
