import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Badge } from "@/components/ui/Badge";
import { Plus, Search, FileText } from "lucide-react";

export const metadata = {
    title: "Aluguéis | LF Aluguel",
};

export default async function AluguelPage() {
    const session = await auth();

    if (!session?.user) {
        redirect("/login");
    }

    const isDono = session.user.role === "DONO";

    // Dono vê todos os pedidos. Operador vê apenas os da sua cidade.
    const whereClause = isDono ? {} : { cityId: session.user.cityId };

    const orders = await prisma.rentalOrder.findMany({
        where: whereClause,
        include: {
            client: true,
            city: true,
            _count: {
                select: { items: true }
            }
        },
        orderBy: { createdAt: "desc" }
    });

    const getStatusColor = (status: string) => {
        switch (status) {
            case "RASCUNHO": return "default";
            case "AGUARDANDO_ASSINATURA": return "warning";
            case "ATIVO": return "success";
            case "FINALIZADO": return "default";
            case "CANCELADO": return "danger";
            default: return "default";
        }
    };

    return (
        <div className="p-4 md:p-8 space-y-6 max-w-7xl mx-auto h-full flex flex-col">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h2 className="text-2xl font-black text-gray-900 tracking-tight">Pedidos de Locação</h2>
                    <p className="text-sm font-semibold text-gray-500 mt-1">
                        Visualize e gerencie os aluguéis e contratos assemelhados ao talão físico.
                    </p>
                </div>

                <Link
                    href="/aluguel/novo"
                    className="bg-[#0066cc] hover:bg-[#0052a3] text-white font-bold py-2.5 px-5 rounded-xl transition-colors shadow-sm flex items-center gap-2 text-sm"
                >
                    <Plus size={18} /> Novo Pedido (Talão)
                </Link>
            </div>

            <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm flex-1">
                <div className="p-4 border-b border-gray-100 flex gap-2">
                    <div className="relative flex-1 max-w-md">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <input
                            type="text"
                            placeholder="Buscar por cliente ou endereço de obra..."
                            className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0066cc]/20 focus:border-[#0066cc] transition-all text-sm"
                        />
                    </div>
                </div>

                {orders.length === 0 ? (
                    <div className="flex flex-col items-center justify-center p-12 text-center">
                        <div className="bg-gray-50 p-4 rounded-full mb-4">
                            <FileText size={32} className="text-gray-400" />
                        </div>
                        <h3 className="text-lg font-bold text-gray-900 mb-1">Nenhum pedido encontrado.</h3>
                        <p className="text-gray-500 text-sm max-w-sm">
                            Ainda não existem locações registradas nesta unidade. Crie o primeiro pedido clicando no botão acima.
                        </p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-gray-50 text-gray-500 font-bold uppercase text-[10px]">
                                <tr>
                                    <th className="px-6 py-4">Status</th>
                                    <th className="px-6 py-4">Cliente / Obra</th>
                                    <th className="px-6 py-4">Data Início</th>
                                    <th className="px-6 py-4">Dev. Prevista</th>
                                    <th className="px-6 py-4">R$ Total</th>
                                    {isDono && <th className="px-6 py-4">Filial</th>}
                                    <th className="px-6 py-4 text-right">Ação</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {orders.map((order) => (
                                    <tr key={order.id} className="hover:bg-gray-50 transition-colors cursor-pointer block sm:table-row">
                                        <td className="px-6 py-4">
                                            <Badge variant={getStatusColor(order.status) as any}>{order.status}</Badge>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="font-bold text-gray-900">{order.client.name}</div>
                                            <div className="text-xs text-gray-500 truncate max-w-[200px]">Obra: {order.jobSiteAddress || order.client.homeAddress || 'Não informado'}</div>
                                        </td>
                                        <td className="px-6 py-4 text-gray-600 font-medium">
                                            {new Date(order.startDate).toLocaleDateString('pt-BR')}
                                        </td>
                                        <td className="px-6 py-4 text-gray-600 font-medium">
                                            {new Date(order.endDate).toLocaleDateString('pt-BR')}
                                        </td>
                                        <td className="px-6 py-4 font-bold text-gray-900">
                                            {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(order.totalValue)}
                                        </td>
                                        {isDono && (
                                            <td className="px-6 py-4 text-gray-500 font-semibold text-xs">
                                                {order.city.name}
                                            </td>
                                        )}
                                        <td className="px-6 py-4 text-right">
                                            <Link
                                                href={`/aluguel/${order.id}/imprimir`}
                                                className="inline-flex items-center justify-center bg-gray-100 hover:bg-gray-200 text-gray-800 text-xs font-bold py-1.5 px-3 rounded transition-colors"
                                            >
                                                Talão PDF
                                            </Link>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}
