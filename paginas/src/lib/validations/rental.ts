import { z } from "zod";

export const rentalOrderSchema = z.object({
    clientId: z.string().min(1, { message: "Selecione um cliente." }),
    jobSiteAddress: z.string().optional(),
    startDate: z.string().min(1, { message: "Data de retirada é obrigatória." }),
    endDate: z.string().min(1, { message: "Data de devolução é obrigatória." }),
    freightValue: z.coerce.number().min(0).optional().default(0),
    notes: z.string().optional(),
    advancePayment: z.coerce.number().min(0).optional().default(0), // Sinal
    signatureUrl: z.string().optional(),
    items: z.array(z.object({
        machineId: z.string().min(1),
        days: z.coerce.number().min(1),
        dailyPrice: z.coerce.number().min(0),
        subtotal: z.coerce.number().min(0)
    })).min(1, { message: "Adicione pelo menos um equipamento." })
}).refine(data => {
    const start = new Date(data.startDate);
    const end = new Date(data.endDate);
    return end >= start;
}, {
    message: "A data de devolução deve ser igual ou posterior à data de retirada.",
    path: ["endDate"]
});

export type RentalState = {
    errors?: {
        clientId?: string[];
        jobSiteAddress?: string[];
        startDate?: string[];
        endDate?: string[];
        freightValue?: string[];
        notes?: string[];
        advancePayment?: string[];
        items?: string[];
        _form?: string[];
    };
    message?: string | null;
    success?: boolean;
    orderId?: string;
};
