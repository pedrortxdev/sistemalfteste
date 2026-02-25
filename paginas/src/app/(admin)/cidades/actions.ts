"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { isDono } from "@/lib/permissions";
import { citySchema, type CityState } from "@/lib/validations/city";

// Helper para validar permissão
async function checkDonoPermission() {
    const session = await auth();
    if (!session?.user || !isDono(session.user.role)) {
        throw new Error("Acesso negado. Apenas o DONO pode gerenciar cidades.");
    }
}

export async function createCity(prevState: CityState, formData: FormData): Promise<CityState> {
    await checkDonoPermission();

    const validatedFields = citySchema.safeParse({
        name: formData.get("name"),
        address: formData.get("address"),
        cnpj: formData.get("cnpj"),
        inscricaoEstadual: formData.get("inscricaoEstadual"),
    });

    if (!validatedFields.success) {
        return {
            errors: validatedFields.error.flatten().fieldErrors,
            message: "Falha na validação dos campos.",
            success: false,
        };
    }

    const { name, address, cnpj, inscricaoEstadual } = validatedFields.data;

    try {
        await prisma.city.create({
            data: {
                name,
                address: address || "",
                cnpj: cnpj || "",
                inscricaoEstadual: inscricaoEstadual || "",
            },
        });

        revalidatePath("/cidades");
        return { message: "Unidade cadastrada com sucesso.", success: true };
    } catch (error) {
        console.error("Database Error:", error);
        return { message: "Erro no banco ao cadastrar a unidade.", success: false };
    }
}

export async function updateCity(
    id: string,
    prevState: CityState,
    formData: FormData
): Promise<CityState> {
    await checkDonoPermission();

    const validatedFields = citySchema.safeParse({
        name: formData.get("name"),
        address: formData.get("address"),
        cnpj: formData.get("cnpj"),
        inscricaoEstadual: formData.get("inscricaoEstadual"),
    });

    if (!validatedFields.success) {
        return {
            errors: validatedFields.error.flatten().fieldErrors,
            message: "Falha na validação dos campos.",
            success: false,
        };
    }

    const { name, address, cnpj, inscricaoEstadual } = validatedFields.data;

    try {
        await prisma.city.update({
            where: { id },
            data: {
                name,
                address: address || "",
                cnpj: cnpj || "",
                inscricaoEstadual: inscricaoEstadual || "",
            },
        });

        revalidatePath("/cidades");
        return { message: "Unidade atualizada com sucesso.", success: true };
    } catch (error) {
        console.error("Database Error:", error);
        return { message: "Erro no banco ao atualizar a unidade.", success: false };
    }
}

export async function toggleCityActive(id: string, currentStatus: boolean) {
    await checkDonoPermission();

    try {
        await prisma.city.update({
            where: { id },
            data: { active: !currentStatus },
        });
        revalidatePath("/cidades");
    } catch (error) {
        console.error("Database Error:", error);
        throw new Error("Erro ao alterar o status da unidade.");
    }
}
