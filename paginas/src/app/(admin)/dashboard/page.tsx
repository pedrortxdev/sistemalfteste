import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { DashboardClient } from "./DashboardClient";

export const dynamic = 'force-dynamic';

export const metadata = {
    title: "Dashboard | LF Aluguel",
};

export default async function DashboardPage() {
    const session = await auth();

    if (!session?.user) {
        redirect("/login");
    }

    const { cityId, role } = session.user;
    const isOwner = role === "DONO";

    // Filtros baseados no cargo
    const cityFilter = isOwner ? {} : { cityId };
    const machineCityFilter = isOwner ? {} : { cityId };

    // Executa as queries pesadas simultaneamente
    const [
        totalMachines,
        machinesByStatus,
        activeOrders,
        cashFlow,
        pendingTransfers
    ] = await Promise.all([
        prisma.machine.count({ where: machineCityFilter }),
        prisma.machine.groupBy({
            by: ['status'],
            where: machineCityFilter,
            _count: { status: true }
        }),
        prisma.rentalOrder.findMany({
            where: { ...cityFilter, status: "ATIVO" },
            include: {
                client: { select: { name: true } }
            },
            orderBy: { startDate: "desc" },
            take: 5
        }),
        prisma.cashFlow.findMany({
            where: cityFilter,
            select: { type: true, amount: true, date: true }
        }),
        // Se for DONO, busca ocorrencias de transferencias aguardando aprovação 
        isOwner ? prisma.transferRequest.count({ where: { status: "PENDENTE" } }) : Promise.resolve(0)
    ]);

    // Formatando Status de Máquinas
    let statusCounts = { DISPONIVEL: 0, ALUGADA: 0, MANUTENCAO: 0, ESTRAGADA: 0 };
    machinesByStatus.forEach((m: any) => {
        statusCounts[m.status as keyof typeof statusCounts] = m._count.status;
    });

    // Calculando Financeiro Mensal
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();

    let monthIn = 0;
    let monthOut = 0;

    cashFlow.forEach((tx: any) => {
        const txDate = new Date(tx.date);
        if (txDate.getMonth() === currentMonth && txDate.getFullYear() === currentYear) {
            if (tx.type === "ENTRADA") monthIn += tx.amount;
            else if (tx.type === "SAIDA") monthOut += tx.amount;
        }
    });

    // Serializar datas das ordens ativas para o Cliente
    const serializedOrders = activeOrders.map(order => ({
        ...order,
        startDate: order.startDate.toISOString(),
        endDate: order.endDate.toISOString(),
        createdAt: order.createdAt.toISOString(),
        updatedAt: order.updatedAt.toISOString(),
    }));

    return (
        <div className="p-4 md:p-8 space-y-6 max-w-7xl mx-auto h-full flex flex-col">
            <div>
                <h2 className="text-2xl font-black text-gray-900 tracking-tight">
                    {isOwner ? "Visão Panorama (Rede LF)" : `Resumo Operacional - ${session.user.cityName}`}
                </h2>
                <p className="text-sm font-semibold text-gray-500 mt-1">
                    Acompanhe os resultados {isOwner ? "de todas as filiais" : "da sua filial"} em tempo real.
                </p>
            </div>

            <DashboardClient
                stats={{
                    totalMachines,
                    statusCounts,
                    monthIn,
                    monthOut,
                    activeOrders: serializedOrders,
                    pendingTransfers
                }}
                isOwner={isOwner}
            />
        </div>
    );
}
