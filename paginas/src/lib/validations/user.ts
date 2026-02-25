import { z } from "zod";

export const userSchema = z.object({
    id: z.string().optional(),
    name: z.string().min(3, "O nome precisa ter no mínimo 3 caracteres."),
    email: z.string().email("E-mail inválido."),
    password: z.string().min(6, "A senha deve ter no mínimo 6 caracteres.").optional().or(z.literal('')),
    role: z.enum(["DONO", "OPERADOR"]),
    cityId: z.string().min(1, "A cidade é obrigatória."),
    active: z.boolean().default(true),
});

export type UserState = {
    errors?: {
        name?: string[];
        email?: string[];
        password?: string[];
        role?: string[];
        cityId?: string[];
    };
    message?: string | null;
    success?: boolean;
};
