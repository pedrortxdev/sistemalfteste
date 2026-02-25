import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Badge } from "@/components/ui/Badge";
import { ProcessTransferButtons } from "./ProcessTransferButtons";
import { ArrowLeftRight, Clock, CheckCircle, XCircle } from "lucide-react";

export const metadata = {
    title: "Transferências | LF Aluguel",
};

export default async function TransferenciasPage() {
    const session = await auth();

    if (!session?.user) {
        redirect("/login");
    }

    const isDono = session.user.role === "DONO";

    // Se Dono, mostra os Pendentes que ele tem que aprovar, e historico.
    // Se Operador, mostra o historico das suas solicitacoes (destino = cidade dele)
    const whereClause = isDono
        ? {}
        : { toCityId: session.user.cityId };

    const requests = await prisma.transferRequest.findMany({
        where: whereClause,
        include: {
            machine: true,
            fromCity: true,
            toCity: true,
        },
        orderBy: { createdAt: 'desc' }
    });

    const pendingRequests = requests.filter((r: any) => r.status === "PENDING");
    const historyRequests = requests.filter((r: any) => r.status !== "PENDING");

    return (
        <div className="p-4 md:p-8 space-y-8 max-w-7xl mx-auto">
            <div>
                <h2 className="text-2xl font-black text-gray-900 tracking-tight">Solicitações de Transferência</h2>
                <p className="text-sm font-semibold text-gray-500 mt-1">
                    {isDono
                        ? "Aprove ou rejeite envios de máquinas entre filiais."
                        : "Acompanhe as solicitações de máquinas para sua filial."}
                </p>
            </div>

            {/* PENDENTES */}
            <div className="space-y-4">
                <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                    <Clock className="text-orange-500" size={20} /> Aguardando Análise ({pendingRequests.length})
                </h3>

                {pendingRequests.length === 0 ? (
                    <div className="bg-white border rounded-2xl p-6 text-center text-sm font-semibold text-gray-500">
                        Nenhuma solicitação pendente no momento.
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {pendingRequests.map((req: any) => (
                            <div key={req.id} className="bg-white rounded-2xl border border-gray-200 p-5 hover:shadow-sm transition-shadow">
                                <div className="flex justify-between items-start mb-4">
                                    <div>
                                        <h4 className="font-bold text-gray-900">{req.machine.name}</h4>
                                    </div>
                                    <Badge variant="warning">Pendente</Badge>
                                </div>

                                <div className="flex items-center gap-3 text-sm font-medium bg-gray-50 p-3 rounded-xl mb-4 text-gray-700">
                                    <div className="flex-1 truncate">{req.fromCity.name}</div>
                                    <ArrowLeftRight size={16} className="text-gray-400 shrink-0" />
                                    <div className="flex-1 truncate text-right text-[#0066cc] font-bold">{req.toCity.name}</div>
                                </div>

                                {isDono ? (
                                    <ProcessTransferButtons requestId={req.id} />
                                ) : (
                                    <div className="text-xs text-center font-bold text-gray-400 pt-2">
                                        Aguardando aprovação do Dono.
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* HISTORICO */}
            {historyRequests.length > 0 && (
                <div className="space-y-4 pt-6 border-t border-gray-100">
                    <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">Histórico de Resoluções</h3>

                    <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
                        <div className="overflow-x-auto hide-scroll">
                            <table className="w-full text-sm text-left">
                                <thead className="bg-gray-50 text-gray-500 font-bold uppercase text-[10px]">
                                    <tr>
                                        <th className="px-4 py-3">Máquina</th>
                                        <th className="px-4 py-3">Rota</th>
                                        <th className="px-4 py-3">Status</th>
                                        <th className="px-4 py-3">Data/Hora</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {historyRequests.map((req: any) => (
                                        <tr key={req.id} className="hover:bg-gray-50 transition-colors">
                                            <td className="px-4 py-4 font-semibold text-gray-900 border-l-4 border-l-transparent">
                                                {req.machine.name}
                                            </td>
                                            <td className="px-4 py-4 text-gray-600 font-medium">
                                                {req.fromCity.name} <ArrowLeftRight className="inline mx-1 text-gray-300" size={12} /> {req.toCity.name}
                                            </td>
                                            <td className="px-4 py-4">
                                                {req.status === "APPROVED" ? (
                                                    <Badge variant="success" className="gap-1 flex w-fit"><CheckCircle size={14} /> Aprovado</Badge>
                                                ) : (
                                                    <Badge variant="danger" className="gap-1 flex w-fit"><XCircle size={14} /> Rejeitado</Badge>
                                                )}
                                            </td>
                                            <td className="px-4 py-4 text-gray-500 font-medium">
                                                {new Date(req.updatedAt).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' })}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
