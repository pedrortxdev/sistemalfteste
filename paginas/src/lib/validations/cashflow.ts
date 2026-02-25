import { z } from "zod";

export const cashflowSchema = z.object({
    type: z.enum(["ENTRADA", "SAIDA"]),
    category: z.string().min(2, { message: "A categoria deve ter pelo menos 2 caracteres." }),
    amount: z.coerce.number().min(0.01, { message: "O valor deve ser maior que zero." }),
    description: z.string().min(3, { message: "Forneça uma descrição curta da movimentação." }),
});

export type CashFlowState = {
    errors?: {
        type?: string[];
        category?: string[];
        amount?: string[];
        description?: string[];
        _form?: string[];
    };
    message?: string | null;
    success?: boolean;
};
