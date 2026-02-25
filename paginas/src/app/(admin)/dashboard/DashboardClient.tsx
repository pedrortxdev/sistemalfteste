"use client";

import { PieChart, ArrowUpRight, ArrowDownRight, Package, Wrench, AlertTriangle, KeyRound, Bell } from "lucide-react";
import Link from "next/link";

type OrderSimp = {
    id: string;
    clientId: string;
    totalValue: number;
    startDate: Date;
    endDate: Date;
    client: { name: string };
};

type DashboardProps = {
    stats: {
        totalMachines: number;
        statusCounts: { DISPONIVEL: number, ALUGADA: number, MANUTENCAO: number, ESTRAGADA: number };
        monthIn: number;
        monthOut: number;
        activeOrders: OrderSimp[];
        pendingTransfers: number;
    };
    isOwner: boolean;
};

export function DashboardClient({ stats, isOwner }: DashboardProps) {
    const balance = stats.monthIn - stats.monthOut;
    const utilizationRate = stats.totalMachines > 0
        ? Math.round((stats.statusCounts.ALUGADA / stats.totalMachines) * 100)
        : 0;

    return (
        <div className="space-y-6">

            {isOwner && stats.pendingTransfers > 0 && (
                <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-center justify-between shadow-sm">
                    <div className="flex items-center gap-3">
                        <div className="bg-amber-100 p-2 rounded-lg text-amber-600">
                            <Bell size={20} />
                        </div>
                        <div>
                            <h4 className="text-amber-900 font-bold text-sm">Transferências Pendentes</h4>
                            <p className="text-amber-700 font-medium text-xs">Existem {stats.pendingTransfers} solicitações de envio de máquinas entre filiais aguardando sua autorização.</p>
                        </div>
                    </div>
                    <Link href="/transferencias" className="bg-amber-600 hover:bg-amber-700 text-white font-bold py-2 px-4 rounded-xl text-xs transition-colors shadow-sm whitespace-nowrap">
                        Analisar Agora
                    </Link>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {/* Desempenho Financeiro do Mes */}
                <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm md:col-span-2 flex flex-col justify-between relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-gray-50 rounded-bl-full -z-10 transition-transform group-hover:scale-110"></div>
                    <div>
                        <h3 className="text-gray-500 font-bold text-xs tracking-wider mb-1 uppercase flex items-center gap-1.5">
                            <PieChart size={14} /> Balanço do Mês Atual
                        </h3>
                        <p className={`text-3xl font-black ${balance >= 0 ? "text-green-600" : "text-red-600"}`}>
                            {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(balance)}
                        </p>
                    </div>
                    <div className="flex gap-4 mt-6 pt-4 border-t border-gray-100/60">
                        <div>
                            <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wide">Receita</p>
                            <p className="text-sm font-black text-gray-900 flex items-center gap-1">
                                <ArrowUpRight size={14} className="text-green-500" />
                                {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(stats.monthIn)}
                            </p>
                        </div>
                        <div>
                            <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wide">Despesa</p>
                            <p className="text-sm font-black text-gray-900 flex items-center gap-1">
                                <ArrowDownRight size={14} className="text-red-500" />
                                {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(stats.monthOut)}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Taxa de Ocupacao */}
                <div className="bg-[#0066cc] border border-[#0052a3] text-white rounded-2xl p-5 shadow-sm flex flex-col justify-between relative overflow-hidden">
                    <div className="absolute -top-4 -right-4 text-white/10">
                        <KeyRound size={80} />
                    </div>
                    <div>
                        <h3 className="text-blue-200 font-bold text-xs tracking-wider mb-1 uppercase">Ocupação / Locadas</h3>
                        <p className="text-4xl font-black tracking-tight">{utilizationRate}%</p>
                    </div>
                    <div className="mt-4">
                        <div className="w-full bg-blue-900/50 rounded-full h-2 mb-1.5 overflow-hidden">
                            <div className="bg-white h-2 rounded-full transition-all duration-1000" style={{ width: `${utilizationRate}%` }}></div>
                        </div>
                        <p className="text-[10px] text-blue-100 font-semibold">{stats.statusCounts.ALUGADA} de {stats.totalMachines} máquinas em clientes</p>
                    </div>
                </div>

                {/* Frota Parada */}
                <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm flex flex-col justify-between">
                    <div>
                        <h3 className="text-gray-500 font-bold text-xs tracking-wider mb-1 uppercase">Frota Parada</h3>
                        <p className="text-4xl font-black text-gray-900 tracking-tight">{stats.statusCounts.DISPONIVEL}</p>
                    </div>
                    <div className="mt-4 flex gap-3 text-[10px] font-bold">
                        <span className="bg-red-50 text-red-600 px-2.5 py-1 rounded flex items-center gap-1">
                            <AlertTriangle size={12} /> {stats.statusCounts.ESTRAGADA} Quebras
                        </span>
                        <span className="bg-orange-50 text-orange-600 px-2.5 py-1 rounded flex items-center gap-1">
                            <Wrench size={12} /> {stats.statusCounts.MANUTENCAO} Recapagem
                        </span>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                {/* Ultimos Pedidos */}
                <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden flex flex-col">
                    <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                        <h3 className="font-bold text-sm text-gray-800 flex items-center gap-2">
                            <KeyRound size={16} className="text-[#0066cc]" /> Últimas Locações Ativas
                        </h3>
                        <Link href="/aluguel" className="text-xs font-bold text-[#0066cc] hover:underline">Ver Todos</Link>
                    </div>
                    <div className="p-0">
                        {stats.activeOrders.length === 0 ? (
                            <div className="p-8 text-center text-sm text-gray-500 font-medium">
                                Nenhuma máquina alugada no momento.
                            </div>
                        ) : (
                            <div className="divide-y divide-gray-100">
                                {stats.activeOrders.map(order => (
                                    <div key={order.id} className="p-4 hover:bg-gray-50/50 transition-colors flex justify-between items-center">
                                        <div>
                                            <p className="font-bold text-gray-900 text-sm">{order.client.name.split(" ")[0]} {order.client.name.split(" ")[1] || ""}</p>
                                            <p className="text-xs text-gray-500 font-medium mt-0.5">Retorno: {new Date(order.endDate).toLocaleDateString('pt-BR')}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-black text-green-600 text-sm">
                                                {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(order.totalValue)}
                                            </p>
                                            <span className="inline-block mt-0.5 px-2 py-0.5 bg-blue-50 text-blue-600 text-[9px] font-bold rounded uppercase">
                                                Vigente
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Grafico Placeholder ou Outras Metricas */}
                <div className="bg-gray-50 border border-gray-200 border-dashed rounded-2xl shadow-sm flex flex-col items-center justify-center p-8 text-center min-h-[300px]">
                    <Package size={48} className="text-gray-300 mb-4" />
                    <h3 className="font-bold text-gray-700 mb-2">Espaço para Expansões</h3>
                    <p className="text-sm text-gray-500 max-w-sm">Este bloco pode receber um gráfico avançado de faturamento no futuro utilizando Recharts.</p>
                </div>
            </div>

        </div>
    );
}
