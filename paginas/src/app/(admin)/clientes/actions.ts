"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { clientSchema, ClientState } from "@/lib/validations/client";

export async function createClient(prevState: ClientState, formData: FormData): Promise<ClientState> {
    const session = await auth();
    if (!session?.user) {
        return { message: "Não autorizado." };
    }

    const validatedFields = clientSchema.safeParse({
        name: formData.get("name"),
        cpfCnpj: formData.get("cpfCnpj"),
        phone: formData.get("phone"),
        homeAddress: formData.get("homeAddress"),
        email: formData.get("email") || undefined, // undefined para não dar erro no Zod se vazio via form
    });

    if (!validatedFields.success) {
        return {
            errors: validatedFields.error.flatten().fieldErrors,
            message: "Preencha todos os campos obrigatórios corretamente.",
        };
    }

    const { name, cpfCnpj, phone, homeAddress, email } = validatedFields.data;

    try {
        const existingClient = await prisma.client.findUnique({
            where: { cpfCnpj }
        });

        if (existingClient) {
            return {
                errors: { cpfCnpj: ["Este documento (CPF/CNPJ) já está cadastrado."] },
                message: "Conflito de documento.",
            };
        }

        await prisma.client.create({
            data: {
                name,
                cpfCnpj,
                phone,
                homeAddress: homeAddress || null,
                email: email || null,
            },
        });

        revalidatePath("/clientes");
        revalidatePath("/aluguel/novo"); // Revalida o select do aluguel
        return { success: true, message: "Cliente cadastrado com sucesso!" };

    } catch (error) {
        console.error("Create Client Error:", error);
        return { message: "Erro interno ao cadastrar cliente." };
    }
}

export async function updateClient(id: string, prevState: ClientState, formData: FormData): Promise<ClientState> {
    const session = await auth();
    if (!session?.user) {
        return { message: "Não autorizado." };
    }

    const validatedFields = clientSchema.safeParse({
        name: formData.get("name"),
        cpfCnpj: formData.get("cpfCnpj"),
        phone: formData.get("phone"),
        homeAddress: formData.get("homeAddress"),
        email: formData.get("email") || undefined,
    });

    if (!validatedFields.success) {
        return {
            errors: validatedFields.error.flatten().fieldErrors,
            message: "Preencha todos os campos obrigatórios corretamente.",
        };
    }

    const { name, cpfCnpj, phone, homeAddress, email } = validatedFields.data;

    try {
        const existingClient = await prisma.client.findUnique({
            where: { cpfCnpj }
        });

        if (existingClient && existingClient.id !== id) {
            return {
                errors: { cpfCnpj: ["Outro cliente já possui este CPF/CNPJ."] },
                message: "Conflito de documento.",
            };
        }

        await prisma.client.update({
            where: { id },
            data: {
                name,
                cpfCnpj,
                phone,
                homeAddress: homeAddress || null,
                email: email || null,
            },
        });

        revalidatePath("/clientes");
        revalidatePath("/aluguel/novo");
        return { success: true, message: "Cliente atualizado com sucesso!" };

    } catch (error) {
        console.error("Update Client Error:", error);
        return { message: "Erro interno ao atualizar cliente." };
    }
}
