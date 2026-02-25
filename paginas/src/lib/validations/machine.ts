import { z } from "zod";

export const machineSchema = z.object({
    id: z.string().optional(),
    name: z.string().min(3, "O nome da máquina precisa ter no mínimo 3 caracteres."),
    model: z.string().optional().nullable(),
    category: z.string().min(1, "A categoria é obrigatória."),
    status: z.enum(["DISPONIVEL", "ALUGADA", "MANUTENCAO", "ESTRAGADA"]).default("DISPONIVEL"),
    pricePerDay: z.coerce.number().positive("O valor da diária deve ser maior que zero."),
    cityId: z.string().min(1, "A unidade é obrigatória."),
    imageUrl: z.string().optional().nullable(),
});

export type MachineState = {
    errors?: {
        name?: string[];
        model?: string[];
        category?: string[];
        status?: string[];
        pricePerDay?: string[];
        cityId?: string[];
    };
    message?: string | null;
    success?: boolean;
};
