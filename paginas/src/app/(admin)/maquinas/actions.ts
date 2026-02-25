"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { machineSchema, type MachineState } from "@/lib/validations/machine";

// Auxilia para revalidar paths associados
function refreshCaches() {
    revalidatePath("/maquinas");
    revalidatePath("/dashboard");
}

export async function createMachine(prevState: MachineState, formData: FormData): Promise<MachineState> {
    const session = await auth();
    if (!session?.user) {
        throw new Error("Não autorizado.");
    }

    // Operadores e Donos podem criar. Se for dono, aceitamos o cityId do form se tentar em outra unidade
    // Mas por padrão (v1), criaremos sempre na cidade do usuário logado por segurança, ou usamos o form dropdown pro dono
    const baseCityId = session.user.role === "DONO"
        ? formData.get("cityId")?.toString() || session.user.cityId
        : session.user.cityId;

    const validatedFields = machineSchema.safeParse({
        name: formData.get("name"),
        model: formData.get("model"),
        category: formData.get("category"),
        pricePerDay: formData.get("pricePerDay"),
        status: formData.get("status") || "DISPONIVEL",
        cityId: baseCityId,
    });

    if (!validatedFields.success) {
        return {
            errors: validatedFields.error.flatten().fieldErrors,
            message: "Falha na validação dos campos.",
            success: false,
        };
    }

    const { name, model, category, pricePerDay, status, cityId } = validatedFields.data;

    try {
        await prisma.machine.create({
            data: {
                name,
                model: model || null,
                category,
                dailyPrice: pricePerDay,
                status,
                cityId,
                // imageUrl: Implementação de imagem futuramente via S3 ou Blob
            },
        });

        refreshCaches();
        return { message: "Máquina cadastrada com sucesso.", success: true };
    } catch (error) {
        console.error("Database Error:", error);
        return { message: "Erro no banco ao cadastrar a máquina.", success: false };
    }
}

export async function updateMachine(
    id: string,
    prevState: MachineState,
    formData: FormData
): Promise<MachineState> {
    const session = await auth();
    if (!session?.user) {
        throw new Error("Não autorizado.");
    }

    // Mesmo controle de cidade
    const baseCityId = session.user.role === "DONO"
        ? formData.get("cityId")?.toString() || session.user.cityId
        : session.user.cityId;

    const validatedFields = machineSchema.safeParse({
        name: formData.get("name"),
        model: formData.get("model"),
        category: formData.get("category"),
        pricePerDay: formData.get("pricePerDay"),
        status: formData.get("status"),
        cityId: baseCityId,
    });

    if (!validatedFields.success) {
        return {
            errors: validatedFields.error.flatten().fieldErrors,
            message: "Falha na validação dos campos.",
            success: false,
        };
    }

    const { name, model, category, pricePerDay, status, cityId } = validatedFields.data;

    try {
        await prisma.machine.update({
            where: { id },
            data: {
                name,
                model: model || null,
                category,
                dailyPrice: pricePerDay,
                status,
                cityId,
            },
        });

        refreshCaches();
        return { message: "Máquina atualizada com sucesso.", success: true };
    } catch (error) {
        console.error("Database Error:", error);
        return { message: "Erro no banco ao atualizar a máquina.", success: false };
    }
}

export async function updateMachineStatus(id: string, newStatus: string) {
    const session = await auth();
    if (!session?.user) {
        throw new Error("Não autorizado.");
    }

    // Validate custom enum on string incoming
    if (!["DISPONIVEL", "ALUGADA", "MANUTENCAO", "ESTRAGADA"].includes(newStatus)) {
        throw new Error("Status inválido");
    }

    const machine = await prisma.machine.findUnique({ where: { id } });
    if (!machine) throw new Error("Máquina não encontrada");

    try {
        await prisma.machine.update({
            where: { id },
            data: { status: newStatus },
        });

        // Historico de status da maquina
        await prisma.machineStatusHistory.create({
            data: {
                machineId: id,
                oldStatus: machine.status,
                newStatus: newStatus,
                changedBy: session.user.id,
                notes: "Alteração manual via sistema",
            }
        });

        refreshCaches();
    } catch (error) {
        console.error("Database Error:", error);
        throw new Error("Erro ao atualizar o status da máquina.");
    }
}
