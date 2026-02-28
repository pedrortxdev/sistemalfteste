import { prisma } from "@/lib/prisma";
import { notFound, redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import Image from "next/image";
import { PrintButton } from "@/components/ui/PrintButton";

export const metadata = {
    title: "Imprimir Locação | LF Aluguel",
};

export default async function PrintRentalPage({ params }: { params: Promise<{ id: string }> }) {
    const session = await auth();

    if (!session?.user) {
        redirect("/login");
    }

    const { id } = await params;

    const order = await prisma.rentalOrder.findUnique({
        where: { id },
        include: {
            client: true,
            city: true,
            items: {
                include: {
                    machine: true
                }
            }
        }
    });

    if (!order) {
        return notFound();
    }

    return (
        <div className="bg-gray-200 min-h-screen p-4 flex flex-col items-center">
            {/* Action Bar for Non-Print context */}
            <div className="w-full max-w-4xl bg-white p-4 rounded-xl shadow-sm mb-6 flex justify-between items-center print:hidden border border-gray-300">
                <div className="text-sm font-semibold text-gray-600">
                    Pré-visualização do Talão. Use <kbd className="bg-gray-100 border px-1 rounded">Ctrl+P</kbd> para imprimir.
                </div>
                <div className="flex gap-2">
                    <a href="/aluguel" className="px-4 py-2 border rounded-lg text-sm font-bold text-gray-700 hover:bg-gray-50">Voltar</a>
                    <PrintButton />
                </div>
            </div>

            {/* A4 Sheet Container */}
            <div
                className="bg-white w-full max-w-[210mm] min-h-[297mm] shadow-xl border border-gray-300 p-8 text-black print:shadow-none print:border-none print:p-0 print:m-0"
                style={{ fontFamily: "'Inter', sans-serif" }}
            >
                {/* Header similar to the physical receipt */}
                <div className="flex justify-between items-start border-b-2 border-black pb-4 mb-4">
                    <div>
                        <h1 className="text-3xl font-black uppercase tracking-tighter">LF ALUGUEL</h1>
                        <p className="text-[10px] font-bold mt-1 uppercase text-gray-700">Equipamentos e Máquinas p/ Construção Civil</p>
                        <p className="text-[10px] text-gray-600 font-medium">CNPJ: {order.city.cnpj} | <strong>{order.city.name}</strong></p>
                        <p className="text-[10px] text-gray-600 font-medium max-w-xs">{order.city.address || "Endereço matriz cadastrado"}</p>
                    </div>

                    <div className="text-right border-l-2 border-black pl-4">
                        <div className="text-[10px] font-bold uppercase mb-1">Pedido de Locação</div>
                        <div className="text-2xl font-black text-red-600">Nº {order.id.slice(-6).toUpperCase()}</div>
                    </div>
                </div>

                {/* Dates Ribbon */}
                <div className="flex divide-x-2 divide-black border-2 border-black mb-4 bg-gray-50">
                    <div className="flex-1 p-2 flex justify-between items-center text-xs">
                        <span className="font-bold">Retirada:</span>
                        <span className="font-mono">{new Date(order.startDate).toLocaleDateString('pt-BR')}</span>
                    </div>
                    <div className="flex-1 p-2 flex justify-between items-center text-xs">
                        <span className="font-bold">Devolução Prev.:</span>
                        <span className="font-mono">{new Date(order.endDate).toLocaleDateString('pt-BR')}</span>
                    </div>
                </div>

                {/* Client Info */}
                <div className="border border-black rounded p-2 mb-4 text-xs space-y-1.5 align-middle">
                    <div className="flex border-b border-gray-300 pb-1">
                        <span className="font-bold w-24">Locatário(a):</span>
                        <span className="flex-1 uppercase font-semibold">{order.client.name}</span>
                        <span className="font-bold w-16 text-right pr-2">CPF/CNPJ:</span>
                        <span className="w-32 uppercase font-semibold text-right">{order.client.cpfCnpj}</span>
                    </div>
                    <div className="flex border-b border-gray-300 pb-1 pt-1">
                        <span className="font-bold w-24">Telefone:</span>
                        <span className="flex-1 uppercase">{order.client.phone}</span>
                    </div>
                    <div className="flex border-b border-gray-300 pb-1 pt-1">
                        <span className="font-bold w-24">End. Res.:</span>
                        <span className="flex-1 uppercase">{order.client.homeAddress || "Não informado"}</span>
                    </div>
                    <div className="flex pt-1">
                        <span className="font-bold w-24">Local Obra:</span>
                        <span className="flex-1 uppercase">{order.jobSiteAddress || "Idêntico ao endereço principal"}</span>
                    </div>
                </div>

                {/* Machine Table */}
                <div className="border-2 border-black min-h-[300px] mb-4 flex flex-col">
                    <table className="w-full text-xs text-left">
                        <thead className="border-b-2 border-black font-bold uppercase">
                            <tr className="divide-x-2 divide-black">
                                <th className="p-2 w-12 text-center">ITEM</th>
                                <th className="p-2">Equipamentos Locados</th>
                                <th className="p-2 w-16 text-center">Dias</th>
                                <th className="p-2 w-24 text-right">R$ Diária</th>
                                <th className="p-2 w-24 text-right">R$ Subtotal</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-black/30 font-semibold font-mono">
                            {order.items.map((item: any, index: number) => (
                                <tr key={item.id} className="divide-x-2 divide-black">
                                    <td className="p-2 text-center">0{index + 1}</td>
                                    <td className="p-2 uppercase">{item.machine.name} {item.machine.model && `- ${item.machine.model}`}</td>
                                    <td className="p-2 text-center">{item.days}</td>
                                    <td className="p-2 text-right">{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(item.dailyPrice)}</td>
                                    <td className="p-2 text-right">{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(item.subtotal)}</td>
                                </tr>
                            ))}

                            {/* Blank filler rows to make it look like a block */}
                            {Array.from({ length: Math.max(0, 5 - order.items.length) }).map((_, i) => (
                                <tr key={`filler-${i}`} className="divide-x-2 divide-black text-transparent select-none">
                                    <td className="p-2 text-center">-</td>
                                    <td className="p-2">-</td>
                                    <td className="p-2">-</td>
                                    <td className="p-2">-</td>
                                    <td className="p-2">-</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Financial Summary */}
                <div className="flex justify-end gap-2 text-sm font-bold mb-8">
                    <div className="border-2 border-black px-4 py-2 flex gap-4 bg-gray-50">
                        <span>FRETE R$</span>
                        <span className="font-mono">{new Intl.NumberFormat('pt-BR', { minimumFractionDigits: 2 }).format(order.freightValue)}</span>
                    </div>
                    <div className="border-2 border-black px-4 py-2 flex gap-4">
                        <span>TOTAL R$</span>
                        <span className="font-mono">{new Intl.NumberFormat('pt-BR', { minimumFractionDigits: 2 }).format(order.totalValue)}</span>
                    </div>
                </div>

                {/* Signature Panel */}
                <div className="mt-20 pt-16 flex flex-col items-center">
                    {order.signatureUrl ? (
                        <div className="w-64 h-24 mb-2 flex justify-center border-b border-black">
                            <img src={order.signatureUrl} alt="Assinatura Locatário" className="max-h-full object-contain mix-blend-multiply" />
                        </div>
                    ) : (
                        <div className="w-64 h-24 mb-2 border-b border-black"></div>
                    )}
                    <span className="text-xs font-bold uppercase">Assinatura do Locatário(a) / Responsável</span>

                    {order.notes && (
                        <div className="w-full text-xs border border-dashed border-gray-400 p-3 mt-12 text-gray-600">
                            <strong>Notas e Observações:</strong> {order.notes}
                        </div>
                    )}
                </div>

                <style dangerouslySetInnerHTML={{
                    __html: `
                    @media print {
                        body * { visibility: hidden; }
                        .print\\:hidden { display: none !important; }
                        .max-w-\\[210mm\\] {
                            visibility: visible;
                            position: absolute;
                            left: 0;
                            top: 0;
                            width: 100% !important;
                            box-shadow: none !important;
                        }
                        .max-w-\\[210mm\\] * {
                            visibility: visible;
                        }
                    }
                ` }} />
            </div>
        </div>
    );
}
