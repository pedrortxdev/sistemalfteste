import { z } from "zod";

export const maintenanceSchema = z.object({
    machineId: z.string().min(1, { message: "Selecione a máquina." }),
    type: z.enum(["PREVENTIVA", "CORRETIVA"]),
    description: z.string().min(5, { message: "A descrição deve ter pelo menos 5 caracteres." }),
    cost: z.coerce.number().min(0, { message: "O custo não pode ser negativo." }).default(0),
});

export type MaintenanceState = {
    errors?: {
        machineId?: string[];
        type?: string[];
        description?: string[];
        cost?: string[];
        _form?: string[];
    };
    message?: string | null;
    success?: boolean;
};
