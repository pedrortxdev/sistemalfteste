"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { isDono } from "@/lib/permissions";
import { userSchema, type UserState } from "@/lib/validations/user";
import bcrypt from "bcryptjs";
import { createAuditLog } from "@/lib/audit";

async function checkDonoPermission() {
    const session = await auth();
    if (!session?.user || !isDono(session.user.role)) {
        throw new Error("Acesso negado. Apenas o DONO pode gerenciar usuários.");
    }
    return session;
}

export async function createUser(prevState: UserState, formData: FormData): Promise<UserState> {
    const session = await checkDonoPermission();

    const validatedFields = userSchema.safeParse({
        name: formData.get("name"),
        email: formData.get("email"),
        password: formData.get("password"),
        role: formData.get("role"),
        cityId: formData.get("cityId"),
    });

    if (!validatedFields.success) {
        return {
            errors: validatedFields.error.flatten().fieldErrors,
            message: "Falha na validação dos campos.",
            success: false,
        };
    }

    const { name, email, password, role, cityId } = validatedFields.data;

    // Ao criar, uma senha é OBRIGATÓRIA apesar do optional no schema (que atende o update)
    if (!password) {
        return {
            errors: { password: ["Senha é obrigatória no cadastro"] },
            message: "Preencha a senha para o novo usuário.",
            success: false,
        };
    }

    try {
        const existingUser = await prisma.user.findUnique({ where: { email } });
        if (existingUser) {
            return { message: "Já existe um usuário com esse e-mail.", success: false };
        }

        const passwordHash = await bcrypt.hash(password, 10);

        const result = await prisma.user.create({
            data: {
                name,
                email,
                passwordHash,
                role,
                cityId,
            },
        });

        await createAuditLog({
            userId: session.user.id!,
            action: "CREATE",
            entity: "USER",
            entityId: result.id,
            details: `Usuário criado: ${name} (${role}) na cidade ${cityId}`
        });

        revalidatePath("/usuarios");
        return { message: "Usuário cadastrado com sucesso.", success: true };
    } catch (error) {
        console.error("Database Error:", error);
        return { message: "Erro no banco ao cadastrar o usuário.", success: false };
    }
}

export async function updateUser(
    id: string,
    prevState: UserState,
    formData: FormData
): Promise<UserState> {
    const session = await checkDonoPermission();

    const validatedFields = userSchema.safeParse({
        name: formData.get("name"),
        email: formData.get("email"),
        password: formData.get("password"),
        role: formData.get("role"),
        cityId: formData.get("cityId"),
    });

    if (!validatedFields.success) {
        return {
            errors: validatedFields.error.flatten().fieldErrors,
            message: "Falha na validação dos campos.",
            success: false,
        };
    }

    const { name, email, password, role, cityId } = validatedFields.data;

    try {
        const existingEmailUser = await prisma.user.findUnique({ where: { email } });
        if (existingEmailUser && existingEmailUser.id !== id) {
            return { message: "Já existe outro usuário com esse e-mail.", success: false };
        }

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const updateData: any = {
            name,
            email,
            role,
            cityId,
        };

        if (password) {
            updateData.passwordHash = await bcrypt.hash(password, 10);
        }

        await prisma.user.update({
            where: { id },
            data: updateData,
        });

        await createAuditLog({
            userId: session.user.id!,
            action: "UPDATE",
            entity: "USER",
            entityId: id,
            details: `Usuário atualizado: ${name} (${role})`
        });

        revalidatePath("/usuarios");
        return { message: "Usuário atualizado com sucesso.", success: true };
    } catch (error) {
        console.error("Database Error:", error);
        return { message: "Erro no banco ao atualizar o usuário.", success: false };
    }
}

export async function toggleUserActive(id: string, currentStatus: boolean) {
    const session = await checkDonoPermission();

    // Impede o dono de se desativar (segurança)
    if (session?.user?.id === id) {
        throw new Error("Você não pode desativar seu próprio usuário.");
    }

    try {
        await prisma.user.update({
            where: { id },
            data: { active: !currentStatus },
        });

        await createAuditLog({
            userId: session.user.id!,
            action: "STATUS_CHANGE",
            entity: "USER",
            entityId: id,
            details: `Status alterado de ${currentStatus ? 'Ativo' : 'Inativo'} para ${!currentStatus ? 'Ativo' : 'Inativo'}`
        });

        revalidatePath("/usuarios");
    } catch (error) {
        console.error("Database Error:", error);
        throw new Error("Erro ao alterar o status do usuário.");
    }
}
