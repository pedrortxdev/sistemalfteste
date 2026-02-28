"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { machineSchema, type MachineState } from "@/lib/validations/machine";
import { createAuditLog } from "@/lib/audit";
import { uploadFile } from "@/lib/supabase";

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

    // --- LÓGICA DE STORAGE PARA FOTO ---
    let photoUrl = null;
    const photoFile = formData.get("photo") as File;
    if (photoFile && photoFile.size > 0) {
        try {
            const fileName = `machine_${Date.now()}_${name.replace(/\s+/g, '_')}.png`;
            const arrayBuffer = await photoFile.arrayBuffer();
            photoUrl = await uploadFile('machines', fileName, Buffer.from(arrayBuffer));
        } catch (storageError) {
            console.error("Erro ao salvar foto no Storage:", storageError);
        }
    }

    try {
        const result = await prisma.machine.create({
            data: {
                name,
                model: model || null,
                category,
                dailyPrice: pricePerDay,
                status,
                cityId,
                photoUrl: photoUrl // Salva a URL do Storage
            },
        });

        await createAuditLog({
            userId: session.user.id!,
            action: "CREATE",
            entity: "MACHINE",
            entityId: result.id,
            details: `Máquina cadastrada: ${name} (${model})`
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

    // --- LÓGICA DE STORAGE PARA ATUALIZAÇÃO DE FOTO ---
    let photoUrlUpdate: string | undefined = undefined;
    const photoFile = formData.get("photo") as File;
    if (photoFile && photoFile.size > 0) {
        try {
            const fileName = `machine_${Date.now()}_${name.replace(/\s+/g, '_')}.png`;
            const arrayBuffer = await photoFile.arrayBuffer();
            photoUrlUpdate = await uploadFile('machines', fileName, Buffer.from(arrayBuffer));
        } catch (storageError) {
            console.error("Erro ao salvar nova foto no Storage:", storageError);
        }
    }

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
                ...(photoUrlUpdate ? { photoUrl: photoUrlUpdate } : {})
            },
        });

        await createAuditLog({
            userId: session.user.id!,
            action: "UPDATE",
            entity: "MACHINE",
            entityId: id,
            details: `Máquina atualizada: ${name} (${model})`
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

        await createAuditLog({
            userId: session.user.id!,
            action: "STATUS_CHANGE",
            entity: "MACHINE",
            entityId: id,
            details: `Status alterado de ${machine.status} para ${newStatus}`
        });

        refreshCaches();
    } catch (error) {
        console.error("Database Error:", error);
        throw new Error("Erro ao atualizar o status da máquina.");
    }
}
