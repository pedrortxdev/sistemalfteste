import { z } from "zod";

export const citySchema = z.object({
    id: z.string().optional(),
    name: z.string().min(3, "O nome da cidade precisa ter no mínimo 3 caracteres."),
    address: z.string().nullable().optional(),
    cnpj: z.string()
        .regex(/^\d{2}\.\d{3}\.\d{3}\/\d{4}\-\d{2}$/, "CNPJ inválido (Formato: 00.000.000/0001-00)")
        .nullable().optional(),
    inscricaoEstadual: z.string().nullable().optional(),
    active: z.boolean().default(true),
});

export type CityState = {
    errors?: {
        name?: string[];
        address?: string[];
        cnpj?: string[];
        inscricaoEstadual?: string[];
    };
    message?: string | null;
    success?: boolean;
};
