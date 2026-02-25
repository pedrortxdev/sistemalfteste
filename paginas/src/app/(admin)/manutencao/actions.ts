"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { maintenanceSchema, MaintenanceState } from "@/lib/validations/maintenance";

export async function createMaintenance(prevState: MaintenanceState, formData: FormData): Promise<MaintenanceState> {
    const session = await auth();
    if (!session?.user) {
        return { message: "Não autorizado." };
    }

    const rawData = {
        machineId: formData.get("machineId"),
        type: formData.get("type"),
        description: formData.get("description"),
        cost: formData.get("cost") ? formData.get("cost") : "0",
    };

    const validatedFields = maintenanceSchema.safeParse(rawData);

    if (!validatedFields.success) {
        return {
            errors: validatedFields.error.flatten().fieldErrors,
            message: "Preencha todos os campos obrigatórios corretamente.",
        };
    }

    const { machineId, type, description, cost } = validatedFields.data;

    try {
        await prisma.$transaction(async (tx: any) => {
            const machine = await tx.machine.findUnique({
                where: { id: machineId },
            });

            if (!machine) {
                throw new Error("Máquina não encontrada.");
            }

            const newStatus = type === "CORRETIVA" ? "ESTRAGADA" : "MANUTENCAO";

            // 1. Cria Log da Manutenção
            const log = await tx.maintenanceLog.create({
                data: {
                    machineId,
                    type,
                    description,
                    cost,
                },
            });

            // 2. Altera o status da máquina
            await tx.machine.update({
                where: { id: machineId },
                data: { status: newStatus },
            });

            // 3. Salva no Histórico
            await tx.machineStatusHistory.create({
                data: {
                    machineId,
                    oldStatus: machine.status,
                    newStatus: newStatus,
                    changedBy: session.user.id,
                    notes: `Enviada para Oficina: ${description} (Custo R$ ${cost})`,
                },
            });

            // 4. Se houver custo, lança no Fluxo de Caixa vinculando ao maintenanceId
            if (cost > 0) {
                await tx.cashFlow.create({
                    data: {
                        cityId: machine.cityId,
                        type: "SAIDA",
                        category: "MANUTENCAO",
                        amount: cost,
                        description: `Oficina ${type === 'CORRETIVA' ? 'Quebra' : 'Revisão'} - ${machine.name}`,
                        maintenanceId: log.id,
                    },
                });
            }
        });

        revalidatePath("/manutencao");
        revalidatePath("/maquinas");
        revalidatePath("/dashboard");
        revalidatePath("/caixa");

        return { success: true, message: "Manutenção registrada com sucesso!" };
    } catch (error: any) {
        console.error("Create Maintenance Error:", error);
        return { message: error.message || "Erro interno ao registrar manutenção." };
    }
}

export async function resolveMaintenance(id: string) {
    const session = await auth();
    if (!session?.user) {
        return { success: false, message: "Não autorizado." };
    }

    try {
        await prisma.$transaction(async (tx: any) => {
            const log = await tx.maintenanceLog.findUnique({
                where: { id },
                include: { machine: true },
            });

            if (!log) {
                throw new Error("Log não encontrado.");
            }

            if (log.resolvedAt) {
                throw new Error("Manutenção já foi resolvida.");
            }

            // 1. Marca Log como resolvido
            await tx.maintenanceLog.update({
                where: { id },
                data: {
                    resolvedAt: new Date(),
                    resolvedById: session.user.id,
                },
            });

            // 2. Retorna a Máquina para DISPONIVEL
            await tx.machine.update({
                where: { id: log.machineId },
                data: { status: "DISPONIVEL" },
            });

            // 3. Salva no Histórico
            await tx.machineStatusHistory.create({
                data: {
                    machineId: log.machineId,
                    oldStatus: log.machine.status,
                    newStatus: "DISPONIVEL",
                    changedBy: session.user.id,
                    notes: `Oficina Concluída e Devolvida.`,
                },
            });
        });

        revalidatePath("/manutencao");
        revalidatePath("/maquinas");
        revalidatePath("/dashboard");

        return { success: true, message: "Oficina finalizada e máquina liberada!" };
    } catch (error: any) {
        console.error("Resolve Maintenance Error:", error);
        return { success: false, message: error.message || "Erro ao processar liberação." };
    }
}
