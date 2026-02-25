import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { ClientListClient } from "./ClientListClient";

export const metadata = {
    title: "Clientes | LF Aluguel",
};

export default async function ClientesPage() {
    const session = await auth();

    if (!session?.user) {
        redirect("/login");
    }

    // Busca todos os clientes, pois clientes são globais na rede LF
    const clients = await prisma.client.findMany({
        orderBy: { name: "asc" },
        include: {
            _count: {
                select: { orders: true }
            }
        }
    });

    return (
        <div className="p-4 md:p-8 space-y-6 max-w-7xl mx-auto h-full flex flex-col">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h2 className="text-2xl font-black text-gray-900 tracking-tight">Base de Clientes</h2>
                    <p className="text-sm font-semibold text-gray-500 mt-1">
                        Gerencie clientes globais que podem alugar em qualquer filial da rede.
                    </p>
                </div>
            </div>

            {/* Client Component que contém o estado de Busca e Form Modals */}
            <ClientListClient initialClients={clients} />
        </div>
    );
}
