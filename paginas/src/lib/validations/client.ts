import { z } from "zod";

export const clientSchema = z.object({
    name: z.string().min(3, { message: "O nome deve ter pelo menos 3 caracteres." }),
    cpfCnpj: z.string().min(11, { message: "Documento inválido. Informe CPF ou CNPJ." }),
    phone: z.string().min(10, { message: "Telefone inválido. Inclua o DDD." }),
    homeAddress: z.string().optional(),
    email: z.string().email({ message: "E-mail inválido." }).optional().or(z.literal('')),
});

export type ClientState = {
    errors?: {
        name?: string[];
        cpfCnpj?: string[];
        phone?: string[];
        homeAddress?: string[];
        email?: string[];
        _form?: string[];
    };
    message?: string | null;
    success?: boolean;
};
