import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { CashFlowClient } from "./CashFlowClient";

export const metadata = {
    title: "Fluxo de Caixa | LF Aluguel",
};

export default async function CaixaPage() {
    const session = await auth();

    if (!session?.user) {
        redirect("/login");
    }

    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();

    const allTransactions = await prisma.cashFlow.findMany({
        where: {
            cityId: session.user.cityId
        },
        orderBy: {
            date: "desc"
        }
    });

    const monthTransactions = allTransactions.filter((tx: any) => {
        const txDate = new Date(tx.date);
        return txDate.getMonth() === currentMonth && txDate.getFullYear() === currentYear;
    });

    // Totals Gerais Cidade (Para o Saldo Atual)
    const totalIn = allTransactions.filter((t: any) => t.type === "ENTRADA").reduce((acc: number, curr: any) => acc + curr.amount, 0);
    const totalOut = allTransactions.filter((t: any) => t.type === "SAIDA").reduce((acc: number, curr: any) => acc + curr.amount, 0);
    const balance = totalIn - totalOut;

    // Totals Mês Aberto
    const monthIn = monthTransactions.filter((t: any) => t.type === "ENTRADA").reduce((acc: number, curr: any) => acc + curr.amount, 0);
    const monthOut = monthTransactions.filter((t: any) => t.type === "SAIDA").reduce((acc: number, curr: any) => acc + curr.amount, 0);

    // Serializar datas para o Cliente
    const serializedTransactions = allTransactions.map(tx => ({
        ...tx,
        date: tx.date.toISOString(),
        createdAt: tx.createdAt.toISOString(),
    }));

    return (
        <div className="p-4 md:p-8 space-y-6 max-w-7xl mx-auto h-full flex flex-col">
            <div>
                <h2 className="text-2xl font-black text-gray-900 tracking-tight">Fluxo de Caixa</h2>
                <p className="text-sm font-semibold text-gray-500 mt-1">
                    Gestão financeira e extrato completo ({session.user.cityName}).
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className={`border rounded-2xl p-5 shadow-sm ${balance >= 0 ? "bg-green-50/50 border-green-100" : "bg-red-50/50 border-red-100"}`}>
                    <h3 className={`font-bold text-sm tracking-tight mb-2 uppercase ${balance >= 0 ? "text-green-600" : "text-red-600"}`}>
                        Saldo Filial Acumulado
                    </h3>
                    <p className={`text-4xl font-black ${balance >= 0 ? "text-green-700" : "text-red-700"}`}>
                        {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(balance)}
                    </p>
                </div>

                <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm">
                    <h3 className="text-gray-500 font-bold text-sm tracking-tight mb-2 uppercase">Ganhos no Mês</h3>
                    <p className="text-2xl font-black text-gray-900">
                        {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(monthIn)}
                    </p>
                </div>

                <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm">
                    <h3 className="text-gray-500 font-bold text-sm tracking-tight mb-2 uppercase">Despesas no Mês</h3>
                    <p className="text-2xl font-black text-gray-900">
                        {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(monthOut)}
                    </p>
                </div>
            </div>

            <CashFlowClient transactions={serializedTransactions} userRole={session.user.role} />
        </div>
    );
}
