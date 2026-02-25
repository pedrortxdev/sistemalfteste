import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { RentalWizard } from "./RentalWizard";

export const metadata = {
    title: "Novo Pedido de Locação | LF Aluguel",
};

export default async function NovoAluguelPage() {
    const session = await auth();

    if (!session?.user) {
        redirect("/login");
    }

    // Busca clientes ativos para popular o select do Wizard
    // Neste momento carregaremos todos os clientes pois não há filtro de filial por cliente no schema atual
    const clients = await prisma.client.findMany({
        select: {
            id: true,
            name: true,
            cpfCnpj: true,
            homeAddress: true,
            phone: true
        },
        orderBy: { name: "asc" }
    });

    // Busca máquinas disponíveis da filial atual do Operador
    // O Dono também fará pedidos no nome de uma cidade (a dele primária configurada, que é cityId)
    const availableMachines = await prisma.machine.findMany({
        where: {
            cityId: session.user.cityId,
            status: "DISPONIVEL"
        },
        select: {
            id: true,
            name: true,
            model: true,
            category: true,
            dailyPrice: true
        },
        orderBy: { name: "asc" }
    });

    return (
        <div className="p-4 md:p-8 space-y-6 max-w-5xl mx-auto h-full flex flex-col">
            <div className="mb-2">
                <h2 className="text-2xl font-black text-gray-900 tracking-tight">Novo Pedido de Locação</h2>
                <p className="text-sm font-semibold text-gray-500 mt-1">
                    Preencha os dados abaixo similares ao talão físico para emitir um contrato.
                </p>
            </div>

            <RentalWizard
                clients={clients}
                availableMachines={availableMachines}
                userCityId={session.user.cityId}
            />
        </div>
    );
}
