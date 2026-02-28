import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { NewMachineModal } from "./NewMachineModal";
import { MachineCard } from "./MachineCard";

export const dynamic = 'force-dynamic';

export const metadata = {
    title: "Estoque de Máquinas | LF Aluguel",
};

export default async function MaquinasPage() {
    const session = await auth();

    if (!session?.user) {
        redirect("/login");
    }

    // Operadores precisam puxar todas as cidades para o modal de transferência
    // Entao buscar global
    const allCities = await prisma.city.findMany({
        where: { active: true },
        select: { id: true, name: true },
        orderBy: { name: "asc" }
    });

    // Filtra máquinas (Dono ver todas; Operador vê apenas as da sua filial)
    const machinesRaw = await prisma.machine.findMany({
        where: session.user.role === "DONO" ? {} : { cityId: session.user.cityId },
        include: { city: true },
        orderBy: { createdAt: "desc" },
    });

    // Serializar datas para o Cliente
    const machines = machinesRaw.map(m => ({
        ...m,
        createdAt: m.createdAt.toISOString(),
        updatedAt: m.updatedAt.toISOString(),
    }));

    return (
        <div className="p-4 md:p-8 space-y-6 max-w-7xl mx-auto h-full flex flex-col">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h2 className="text-2xl font-black text-gray-900 tracking-tight">Estoque de Máquinas</h2>
                    <p className="text-sm font-semibold text-gray-500 mt-1">
                        {session.user.role === "DONO"
                            ? "Gerencie todas as máquinas da rede."
                            : `Gerencie as máquinas da unidade ${session.user.cityName}.`}
                    </p>
                </div>

                <NewMachineModal cities={allCities} userRole={session.user.role} />
            </div>

            {machines.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center bg-white rounded-2xl border border-dashed border-gray-300 p-8 text-center h-64">
                    <p className="text-gray-500 font-medium">Você ainda não tem máquinas cadastradas no estoque local.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-6 pb-8">
                    {machines.map((machine: any) => (
                        <MachineCard key={machine.id} machine={machine} userRole={session.user.role} allCities={allCities} />
                    ))}
                </div>
            )}
        </div>
    );
}
