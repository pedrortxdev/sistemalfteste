"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { cashflowSchema, CashFlowState } from "@/lib/validations/cashflow";
import { createAuditLog } from "@/lib/audit";

export async function createManualTransaction(prevState: CashFlowState, formData: FormData): Promise<CashFlowState> {
    const session = await auth();
    if (!session?.user) {
        return { message: "Não autorizado." };
    }

    const rawData = {
        type: formData.get("type"),
        category: formData.get("category"),
        amount: formData.get("amount"),
        description: formData.get("description"),
    };

    const validatedFields = cashflowSchema.safeParse(rawData);

    if (!validatedFields.success) {
        return {
            errors: validatedFields.error.flatten().fieldErrors,
            message: "Verifique os campos obrigatórios.",
        };
    }

    const { type, category, amount, description } = validatedFields.data;

    try {
        const result = await prisma.cashFlow.create({
            data: {
                cityId: session.user.cityId,
                type,
                category,
                amount,
                description,
            }
        });

        await createAuditLog({
            userId: session.user.id!,
            action: "CREATE",
            entity: "CASHFLOW",
            entityId: result.id,
            details: `Lançamento manual de R$ ${amount.toLocaleString()} - ${category} (${type})`
        });

        revalidatePath("/caixa");
        revalidatePath("/dashboard");

        return { success: true, message: "Movimentação registrada com sucesso!" };
    } catch (error: any) {
        console.error("Erro ao registrar no caixa:", error);
        return { message: "Ocorreu um erro ao salvar o lançamento." };
    }
}

export async function deleteTransaction(id: string) {
    const session = await auth();
    // Somente DONO pode deletar linhas de caixa, por segurança.
    if (!session?.user || session.user.role !== "DONO") {
        return { success: false, message: "Apenas administradores (DONO) podem excluir registros financeiros." };
    }

    try {
        const transaction = await prisma.cashFlow.findUnique({
            where: { id }
        });

        await prisma.cashFlow.delete({
            where: { id }
        });

        await createAuditLog({
            userId: session.user.id!,
            action: "DELETE",
            entity: "CASHFLOW",
            entityId: id,
            details: `Exclusão de registro de R$ ${transaction?.amount.toLocaleString()} (${transaction?.category})`
        });

        revalidatePath("/caixa");
        revalidatePath("/dashboard");

        return { success: true, message: "Registro extornado com sucesso." };
    } catch (error) {
        return { success: false, message: "Erro ao tentar apagar o registro." };
    }
}
