import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { isDono } from "@/lib/permissions";
import { redirect } from "next/navigation";
import { NewCityModal } from "./NewCityModal";
import { CityCard } from "./CityCard";

export const metadata = {
    title: "Unidades | LF Aluguel",
};

export default async function CidadesPage() {
    const session = await auth();

    if (!session?.user || !isDono(session.user.role)) {
        redirect("/dashboard");
    }

    const cities = await prisma.city.findMany({
        orderBy: { createdAt: "desc" },
    });

    return (
        <div className="p-4 md:p-8 space-y-6 max-w-7xl mx-auto h-full flex flex-col">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h2 className="text-2xl font-black text-gray-900 tracking-tight">Unidades</h2>
                    <p className="text-sm font-semibold text-gray-500 mt-1">
                        Gerencie as filiais cadastradas no sistema.
                    </p>
                </div>

                <NewCityModal />
            </div>

            {cities.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center bg-white rounded-2xl border border-dashed border-gray-300 p-8 text-center h-64">
                    <p className="text-gray-500 font-medium">Nenhuma unidade cadastrada ainda.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6 pb-8">
                    {cities.map((city: any) => (
                        <CityCard key={city.id} city={city} />
                    ))}
                </div>
            )}
        </div>
    );
}
