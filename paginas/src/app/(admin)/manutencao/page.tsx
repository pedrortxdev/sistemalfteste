import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { MaintenanceListClient } from "./MaintenanceListClient";

export const metadata = {
    title: "Manutenção e Oficina | LF Aluguel",
};

export default async function ManutencaoPage() {
    const session = await auth();

    if (!session?.user) {
        redirect("/login");
    }

    // Busca todas as manutenções da cidade
    const maintenanceLogs = await prisma.maintenanceLog.findMany({
        where: {
            machine: {
                cityId: session.user.cityId
            }
        },
        include: {
            machine: {
                select: { id: true, name: true, model: true, serialNumber: true, status: true }
            },
            resolvedBy: {
                select: { name: true }
            }
        },
        orderBy: {
            date: "desc"
        }
    });

    // Precisamos buscar as máquinas da filial que estao disponiveis pra colocar na Oficina
    const availableMachines = await prisma.machine.findMany({
        where: {
            cityId: session.user.cityId,
            status: { in: ["DISPONIVEL", "ALUGADA"] } // Embora nao devesse mandar alugada pra oficina, na vida real as vezes avaria no cliente e precisa trocar.
        },
        select: { id: true, name: true, model: true }
    });

    // Status Board Numerico
    const activeMaintenance = maintenanceLogs.filter((log: any) => !log.resolvedAt).length;
    const totalCostValue = maintenanceLogs.reduce((acc: number, curr: any) => acc + curr.cost, 0);

    return (
        <div className="p-4 md:p-8 space-y-6 max-w-7xl mx-auto h-full flex flex-col">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h2 className="text-2xl font-black text-gray-900 tracking-tight">Painel de Manutenção</h2>
                    <p className="text-sm font-semibold text-gray-500 mt-1">
                        Gerencie consertos, preventivas e despesas da filial {session.user.cityName}.
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-red-50 border border-red-100 rounded-2xl p-5 shadow-sm">
                    <h3 className="text-red-600 font-bold text-sm tracking-tight mb-2 uppercase">Na Oficina</h3>
                    <p className="text-3xl font-black text-red-700">{activeMaintenance}</p>
                </div>
                <div className="bg-orange-50 border border-orange-100 rounded-2xl p-5 shadow-sm">
                    <h3 className="text-orange-600 font-bold text-sm tracking-tight mb-2 uppercase">Custo Total Acumulado</h3>
                    <p className="text-3xl font-black text-orange-700">
                        {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(totalCostValue)}
                    </p>
                </div>
            </div>

            <MaintenanceListClient logs={maintenanceLogs} machines={availableMachines} />
        </div>
    );
}
