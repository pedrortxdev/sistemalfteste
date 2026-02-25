"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { rentalOrderSchema } from "@/lib/validations/rental";

export async function createRentalOrder(data: any) {
    const session = await auth();
    if (!session?.user) {
        return { success: false, message: "Não autorizado." };
    }

    try {
        // Validação dos Dados Recebidos pelo Zod
        const parsed = rentalOrderSchema.safeParse(data);

        if (!parsed.success) {
            console.error("Zod Validation Erros:", parsed.error.flatten());
            return { success: false, message: "Campos obrigatórios inválidos." };
        }

        const validData = parsed.data;

        // Validar no BD se as maquinas ainda estao disponiveis (Concorrencia)
        const machineIds = validData.items.map(i => i.machineId);
        const machinesInDB = await prisma.machine.findMany({
            where: { id: { in: machineIds } }
        });

        const unavailableList = machinesInDB.filter((m: any) => m.status !== "DISPONIVEL");
        if (unavailableList.length > 0) {
            return { success: false, message: `Uma das máquinas selecionadas não está mais disponível.` };
        }

        // Fazer a transação:
        // 1. Criar a RentalOrder
        // 2. Inserir os RentalItems
        // 3. Modificar o status de todas as máquinas para ALUGADA
        // 4. Inserir no log de máquinas a troca
        // 5. Inserir o Registro de CashFlow (Sinal) se houver

        const totalValue = validData.items.reduce((acc, curr) => acc + curr.subtotal, 0) + validData.freightValue;

        const result = await prisma.$transaction(async (tx: any) => {

            // Cria o pedido principal
            const order = await tx.rentalOrder.create({
                data: {
                    clientId: validData.clientId,
                    cityId: session.user.cityId,
                    createdById: session.user.id,
                    status: "ATIVO",
                    totalValue: totalValue,
                    startDate: new Date(validData.startDate),
                    endDate: new Date(validData.endDate),
                    freightValue: validData.freightValue,
                    jobSiteAddress: validData.jobSiteAddress || null,
                    notes: validData.notes || null,
                    signatureUrl: data.signatureUrl || null
                }
            });

            // Cria itens e atualiza Maquinas
            for (const item of validData.items) {
                // RentalItem
                await tx.rentalItem.create({
                    data: {
                        orderId: order.id,
                        machineId: item.machineId,
                        dailyPrice: item.dailyPrice,
                        days: item.days,
                        subtotal: item.subtotal
                    }
                });

                const actMachine = machinesInDB.find((m: any) => m.id === item.machineId);
                await tx.machine.update({
                    where: { id: item.machineId },
                    data: { status: "ALUGADA", totalRentals: { increment: 1 } }
                });

                // Historico
                await tx.machineStatusHistory.create({
                    data: {
                        machineId: item.machineId,
                        oldStatus: actMachine!.status,
                        newStatus: "ALUGADA",
                        changedBy: session.user.id,
                        notes: `Alocada via Pedido de Locação #${order.id.slice(-5).toUpperCase()}`
                    }
                });
            }

            // Registrar Fluxo de Caixa caso exista Sinal ou Frete?
            // Dependendo da regra financeira. No plano, "Adicionar o adiantamento como Sinal no CashFlow"
            if (validData.advancePayment > 0) {
                await tx.cashFlow.create({
                    data: {
                        cityId: session.user.cityId,
                        type: "ENTRADA",
                        category: "ALUGUEL",
                        amount: validData.advancePayment,
                        description: `Sinal Adiantamento - Pedido #${order.id.slice(-5).toUpperCase()}`,
                        orderId: order.id
                    }
                });
            }

            return order;
        });

        revalidatePath("/aluguel");
        revalidatePath("/maquinas");
        revalidatePath("/dashboard");

        return { success: true, orderId: result.id };

    } catch (error) {
        console.error("Transation Error Aluguel:", error);
        return { success: false, message: "Erro de transação ao finalizar operação." };
    }
}
