"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function requestTransfer(machineId: string, destinationCityId: string) {
    const session = await auth();
    if (!session?.user || session.user.role !== "OPERADOR") {
        throw new Error("Apenas Operadores podem solicitar transferência de outras filiais.");
    }

    // Valida se a máquina existe e não está já na mesma filial destino
    const machine = await prisma.machine.findUnique({ where: { id: machineId } });
    if (!machine) throw new Error("Máquina não encontrada.");
    if (machine.cityId === destinationCityId) throw new Error("A máquina já pertence a sua Filial.");

    // Verifica se já não existe um request pendente para ela
    const pendingRequest = await prisma.transferRequest.findFirst({
        where: { machineId, status: "PENDING" }
    });

    if (pendingRequest) throw new Error("Já existe uma solicitação pendente para esta máquina.");

    try {
        await prisma.transferRequest.create({
            data: {
                machineId,
                fromCityId: machine.cityId,
                toCityId: destinationCityId,
                requestedById: session.user.id,
                status: "PENDING"
            }
        });

        revalidatePath("/transferencias");
        revalidatePath("/dashboard");
        return { success: true };
    } catch (error) {
        console.error("Erro no TransferRequest:", error);
        throw new Error("Erro ao criar a solicitação de transferência.");
    }
}

export async function processTransfer(requestId: string, approve: boolean) {
    const session = await auth();
    if (!session?.user || session.user.role !== "DONO") {
        throw new Error("Apenas o DONO pode aprovar e rejeitar transferências de unidades.");
    }

    const request = await prisma.transferRequest.findUnique({ where: { id: requestId } });
    if (!request || request.status !== "PENDING") {
        throw new Error("Solicitação inválida ou já resolvida.");
    }

    try {
        if (approve) {
            // Approving Transfer
            // 1. Atualizar a localização da Maquina
            await prisma.machine.update({
                where: { id: request.machineId },
                data: { cityId: request.toCityId }
            });

            // 2. Atualizar o status final do request
            await prisma.transferRequest.update({
                where: { id: requestId },
                data: {
                    status: "APPROVED",
                    approvedById: session.user.id,
                }
            });
        } else {
            // Rejecting Transfer (Machine status unchanged)
            await prisma.transferRequest.update({
                where: { id: requestId },
                data: {
                    status: "REJECTED",
                    approvedById: session.user.id,
                }
            });
        }

        revalidatePath("/transferencias");
        revalidatePath("/maquinas");
        return { success: true };

    } catch (error) {
        console.error("Erro no Process TransferRequest:", error);
        throw new Error("Erro ao processar a solicitação.");
    }
}
