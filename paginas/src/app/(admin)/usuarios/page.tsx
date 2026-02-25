import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { isDono } from "@/lib/permissions";
import { redirect } from "next/navigation";
import { NewUserModal } from "./NewUserModal";
import { UserCard } from "./UserCard";

export const metadata = {
    title: "Usuários | LF Aluguel",
};

export default async function UsuariosPage() {
    const session = await auth();

    if (!session?.user || !isDono(session.user.role)) {
        redirect("/dashboard");
    }

    // Busca cidades para preencher o select do Modal
    const cities = await prisma.city.findMany({
        where: { active: true },
        select: { id: true, name: true },
        orderBy: { name: "asc" },
    });

    const users = await prisma.user.findMany({
        include: { city: true },
        orderBy: { createdAt: "desc" },
    });

    return (
        <div className="p-4 md:p-8 space-y-6 max-w-7xl mx-auto h-full flex flex-col">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h2 className="text-2xl font-black text-gray-900 tracking-tight">Usuários do Sistema</h2>
                    <p className="text-sm font-semibold text-gray-500 mt-1">
                        Gerencie os acessos, operadores e donos.
                    </p>
                </div>

                <NewUserModal cities={cities} />
            </div>

            {users.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center bg-white rounded-2xl border border-dashed border-gray-300 p-8 text-center h-64">
                    <p className="text-gray-500 font-medium">Nenhum usuário cadastrado.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6 pb-8">
                    {users.map((user: any) => (
                        <UserCard key={user.id} user={user} currentUserEmail={session.user?.email} />
                    ))}
                </div>
            )}
        </div>
    );
}
