import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Badge } from "@/components/ui/Badge";
import { Package, Wrench, CheckCircle2, AlertTriangle, Search } from "lucide-react";
import { PatioClient } from "./PatioClient";

export default async function PatioPage() {
  const session = await auth();
  if (!session) return null;

  // Carregar máquinas da cidade do funcionário
  const machinesRaw = await prisma.machine.findMany({
    where: { cityId: session.user.cityId },
    orderBy: { name: 'asc' }
  });

  // Serializar datas para evitar erro de renderização no Cliente
  const machines = machinesRaw.map(m => ({
    ...m,
    createdAt: m.createdAt.toISOString(),
    updatedAt: m.updatedAt.toISOString(),
  }));

  const stats = {
    disponiveis: machines.filter(m => m.status === 'DISPONIVEL').length,
    alugadas: machines.filter(m => m.status === 'ALUGADA').length,
    quebradas: machines.filter(m => m.status === 'ESTRAGADA').length,
  };

  return (
    <div className="p-4 md:p-6 space-y-6 pb-24">
      <header className="flex justify-between items-center">
        <div>
          <h1 className="text-xl font-bold">Visão do Pátio</h1>
          <p className="text-xs text-gray-500 uppercase font-bold">{session.user.cityName}</p>
        </div>
        <Badge variant="info" className="h-fit">Operador</Badge>
      </header>

      {/* Mini Cards de Status */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-green-50 border border-green-100 p-3 rounded-2xl text-center">
          <CheckCircle2 className="mx-auto text-green-600 mb-1" size={20} />
          <p className="text-xl font-black text-green-700">{stats.disponiveis}</p>
          <p className="text-[9px] font-bold text-green-600 uppercase">Prontas</p>
        </div>
        <div className="bg-blue-50 border border-blue-100 p-3 rounded-2xl text-center">
          <Package className="mx-auto text-blue-600 mb-1" size={20} />
          <p className="text-xl font-black text-blue-700">{stats.alugadas}</p>
          <p className="text-[9px] font-bold text-blue-600 uppercase">Na Obra</p>
        </div>
        <div className="bg-red-50 border border-red-100 p-3 rounded-2xl text-center">
          <AlertTriangle className="mx-auto text-red-600 mb-1" size={20} />
          <p className="text-xl font-black text-red-700">{stats.quebradas}</p>
          <p className="text-[9px] font-bold text-red-600 uppercase">Quebradas</p>
        </div>
      </div>

      <PatioClient initialMachines={machines} />
    </div>
  );
}
