"use client";

import { useState } from "react";
import { Plus, Download, Search, Trash2, ArrowUpRight, ArrowDownRight, Frown, Loader2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/Dialog";
import { TransactionForm } from "./TransactionForm";
import { deleteTransaction } from "./actions";

type Transaction = {
    id: string;
    type: string;
    category: string;
    amount: number;
    description: string | null;
    date: Date;
    orderId?: string | null;
    maintenanceId?: string | null;
};

export function CashFlowClient({ transactions, userRole }: { transactions: Transaction[], userRole: string }) {
    const [searchTerm, setSearchTerm] = useState("");
    const [monthFilter, setMonthFilter] = useState("ALL");
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [deletingId, setDeletingId] = useState<string | null>(null);

    // Filtragem
    const filteredTransactions = transactions.filter(t => {
        const matchesSearch = (t.description?.toLowerCase() || "").includes(searchTerm.toLowerCase()) || t.category.toLowerCase().includes(searchTerm.toLowerCase());

        if (monthFilter === "ALL") return matchesSearch;

        const txDate = new Date(t.date);
        const [year, month] = monthFilter.split("-");

        return matchesSearch && txDate.getFullYear() === parseInt(year) && (txDate.getMonth() + 1) === parseInt(month);
    });

    // Opções de Meses Unicos baseados no historico
    const monthOptions = Array.from(new Set(transactions.map(t => {
        const d = new Date(t.date);
        return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    }))).sort().reverse();

    const handleDelete = async (id: string, desc: string | null) => {
        if (!confirm(`Tem certeza que deseja apagar o registro "${desc || id}"?\nIsso alterará os saldos permanentemente.`)) return;

        setDeletingId(id);
        const res = await deleteTransaction(id);
        if (!res.success) alert(res.message);
        setDeletingId(null);
    };

    const handleExportCSV = () => {
        const headers = ["Data", "Tipo", "Categoria", "Valor", "Descricao", "Referencia_Log"];

        const rows = filteredTransactions.map(t => {
            const date = new Date(t.date).toLocaleDateString('pt-BR');
            const type = t.type;
            const cat = t.category;
            const val = t.amount.toString().replace('.', ',');
            const desc = `"${(t.description || "").replace(/"/g, '""')}"`;
            const ref = t.orderId ? `PEDIDO_${t.orderId}` : t.maintenanceId ? `OFICINA_${t.maintenanceId}` : "MANUAL";

            return [date, type, cat, val, desc, ref].join(";");
        });

        const csvContent = [headers.join(";"), ...rows].join("\n");
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement("a");
        const url = URL.createObjectURL(blob);

        link.setAttribute("href", url);
        link.setAttribute("download", `extrato_caixa_${monthFilter === 'ALL' ? 'completo' : monthFilter}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm flex-1 flex flex-col">
            <div className="p-4 border-b border-gray-100 flex flex-col sm:flex-row gap-3 justify-between items-center bg-gray-50/50">
                <div className="flex w-full sm:w-auto gap-3">
                    <div className="relative w-full sm:w-64">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <input
                            type="text"
                            placeholder="Buscar no extrato..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-xl focus:outline-none focus:border-[#0066cc] transition-colors text-sm font-medium"
                        />
                    </div>

                    <select
                        className="bg-white border border-gray-200 rounded-xl px-3 py-2 text-sm font-semibold focus:outline-none focus:border-[#0066cc] cursor-pointer"
                        value={monthFilter}
                        onChange={(e) => setMonthFilter(e.target.value)}
                    >
                        <option value="ALL">Todo o Período</option>
                        {monthOptions.map(m => {
                            const [y, mm] = m.split('-');
                            return <option key={m} value={m}>{mm}/{y}</option>
                        })}
                    </select>
                </div>

                <div className="flex gap-2 w-full sm:w-auto">
                    <button
                        onClick={handleExportCSV}
                        className="flex-1 sm:flex-none bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 font-bold py-2 px-4 rounded-xl transition-colors shadow-sm flex justify-center items-center gap-2 text-sm"
                    >
                        <Download size={16} /> <span className="hidden sm:inline">Exportar CSV</span>
                    </button>

                    <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                        <DialogTrigger asChild>
                            <button className="flex-[2] sm:flex-none bg-[#0066cc] hover:bg-[#0052a3] text-white font-bold py-2 px-4 rounded-xl transition-colors shadow-sm flex justify-center items-center gap-2 text-sm">
                                <Plus size={18} /> Lançamento Extra
                            </button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[500px]">
                            <DialogHeader>
                                <DialogTitle className="text-xl font-black text-[#111] flex items-center gap-2">
                                    Novo Registro Manual
                                </DialogTitle>
                            </DialogHeader>
                            <TransactionForm
                                onSuccess={() => setIsCreateOpen(false)}
                                onCancel={() => setIsCreateOpen(false)}
                            />
                        </DialogContent>
                    </Dialog>
                </div>
            </div>

            <div className="overflow-x-auto flex-1">
                {filteredTransactions.length === 0 ? (
                    <div className="flex flex-col items-center justify-center p-12 text-center h-[300px]">
                        <div className="bg-gray-100 p-4 rounded-full mb-4 text-gray-400">
                            <Frown size={32} />
                        </div>
                        <h3 className="text-lg font-bold text-gray-900 mb-1">Nenhuma transação {monthFilter !== "ALL" && "neste mês"}</h3>
                    </div>
                ) : (
                    <table className="w-full text-sm text-left">
                        <thead className="bg-gray-50 text-gray-500 font-bold uppercase text-[10px] border-b border-gray-200">
                            <tr>
                                <th className="px-6 py-4">Data</th>
                                <th className="px-6 py-4">Descrição</th>
                                <th className="px-6 py-4">Categoria</th>
                                <th className="px-6 py-4 text-right">Valor</th>
                                {userRole === "DONO" && <th className="px-6 py-4 text-right"></th>}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {filteredTransactions.map((tx) => (
                                <tr key={tx.id} className="hover:bg-gray-50/50 transition-colors group">
                                    <td className="px-6 py-4 text-xs font-semibold text-gray-500">
                                        {new Date(tx.date).toLocaleDateString("pt-BR")}
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="font-bold text-gray-900 flex items-center gap-2">
                                            {tx.type === "ENTRADA" ? (
                                                <ArrowUpRight size={16} className="text-green-500" />
                                            ) : (
                                                <ArrowDownRight size={16} className="text-red-500" />
                                            )}
                                            {tx.description}
                                        </div>
                                        {(tx.orderId || tx.maintenanceId) && (
                                            <div className="text-[10px] text-gray-400 mt-0.5 ml-6 bg-gray-100 w-fit px-1.5 py-0.5 rounded font-mono">
                                                Sistema Automático
                                            </div>
                                        )}
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="text-[10px] font-black uppercase tracking-wider bg-gray-100 text-gray-600 px-2 py-1 rounded w-fit">
                                            {tx.category.replace("_", " ")}
                                        </div>
                                    </td>
                                    <td className={`px-6 py-4 text-right font-black ${tx.type === "ENTRADA" ? "text-green-600" : "text-red-600"}`}>
                                        {tx.type === "ENTRADA" ? "+" : "-"}
                                        {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(tx.amount)}
                                    </td>
                                    {userRole === "DONO" && (
                                        <td className="px-6 py-4 text-right">
                                            {(!tx.orderId && !tx.maintenanceId) && (
                                                <button
                                                    onClick={() => handleDelete(tx.id, tx.description)}
                                                    disabled={deletingId === tx.id}
                                                    className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100 disabled:opacity-50"
                                                    title="Excluir Lançamento Manual"
                                                >
                                                    {deletingId === tx.id ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />}
                                                </button>
                                            )}
                                        </td>
                                    )}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
}
