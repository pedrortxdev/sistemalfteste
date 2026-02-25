"use client";

import { useState } from "react";
import { Plus, Search, Edit2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/Dialog";
import { ClientForm } from "./ClientForm";

// Define shape received from Prisma
type ClientItem = {
    id: string;
    name: string;
    cpfCnpj: string;
    phone: string;
    homeAddress: string | null;
    email: string | null;
    createdAt: Date;
    _count: { orders: number };
};

export function ClientListClient({ initialClients }: { initialClients: ClientItem[] }) {
    const [searchTerm, setSearchTerm] = useState("");
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [editingClient, setEditingClient] = useState<ClientItem | null>(null);

    // Filtro simplificado no client-side
    const filteredClients = initialClients.filter(c =>
        c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.cpfCnpj.includes(searchTerm)
    );

    return (
        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm flex-1 flex flex-col">
            <div className="p-4 border-b border-gray-100 flex flex-col sm:flex-row gap-3 justify-between items-center bg-gray-50/50">
                <div className="relative w-full sm:max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input
                        type="text"
                        placeholder="Buscar por nome ou CPF/CNPJ..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0066cc]/20 focus:border-[#0066cc] transition-all text-sm font-medium"
                    />
                </div>

                <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                    <DialogTrigger asChild>
                        <button className="w-full sm:w-auto bg-[#0066cc] hover:bg-[#0052a3] text-white font-bold py-2.5 px-5 rounded-xl transition-colors shadow-sm flex justify-center items-center gap-2 text-sm">
                            <Plus size={18} /> Cadastrar Cliente
                        </button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[550px]">
                        <DialogHeader>
                            <DialogTitle className="text-xl font-black">Novo Cliente</DialogTitle>
                        </DialogHeader>
                        <ClientForm
                            onSuccess={() => setIsCreateOpen(false)}
                            onCancel={() => setIsCreateOpen(false)}
                        />
                    </DialogContent>
                </Dialog>
            </div>

            <div className="overflow-x-auto flex-1">
                {filteredClients.length === 0 ? (
                    <div className="flex flex-col items-center justify-center p-12 text-center h-full">
                        <div className="bg-gray-100 p-4 rounded-full mb-4 text-gray-400">
                            <Search size={32} />
                        </div>
                        <h3 className="text-lg font-bold text-gray-900 mb-1">Nenhum cliente encontrado</h3>
                        <p className="text-gray-500 text-sm max-w-sm">
                            {searchTerm ? "Tente buscar com outros termos." : "Base vazia. Cadastre seu primeiro locatário."}
                        </p>
                    </div>
                ) : (
                    <table className="w-full text-sm text-left">
                        <thead className="bg-gray-50 text-gray-500 font-bold uppercase text-[10px] border-b border-gray-200">
                            <tr>
                                <th className="px-6 py-4">Nome Completo</th>
                                <th className="px-6 py-4">CPF / CNPJ</th>
                                <th className="px-6 py-4">Contato Telefônico</th>
                                <th className="px-6 py-4">Endereço (Sede/Residência)</th>
                                <th className="px-6 py-4 text-center">Locações</th>
                                <th className="px-6 py-4 text-right">Ações</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {filteredClients.map((client) => (
                                <tr key={client.id} className="hover:bg-blue-50/50 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="font-bold text-gray-900">{client.name}</div>
                                        {client.email && <div className="text-xs text-gray-500">{client.email}</div>}
                                    </td>
                                    <td className="px-6 py-4 font-mono font-medium text-gray-600">
                                        {client.cpfCnpj}
                                    </td>
                                    <td className="px-6 py-4 font-medium text-gray-700">
                                        {client.phone}
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="text-xs text-gray-600 max-w-[200px] truncate" title={client.homeAddress || "Não informado"}>
                                            {client.homeAddress || <span className="text-gray-400 italic">Não posssui endereço base</span>}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <span className="inline-flex items-center justify-center bg-gray-100 text-gray-700 text-xs font-bold px-2.5 py-1 rounded-full">
                                            {client._count.orders}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <Dialog open={editingClient?.id === client.id} onOpenChange={(open) => !open && setEditingClient(null)}>
                                            <DialogTrigger asChild>
                                                <button
                                                    onClick={() => setEditingClient(client)}
                                                    className="p-2 text-gray-400 hover:text-[#0066cc] hover:bg-blue-50 rounded-lg transition-colors"
                                                    title="Editar Cliente"
                                                >
                                                    <Edit2 size={18} />
                                                </button>
                                            </DialogTrigger>
                                            <DialogContent className="sm:max-w-[550px]">
                                                <DialogHeader>
                                                    <DialogTitle className="text-xl font-black">Editar Cliente</DialogTitle>
                                                </DialogHeader>
                                                {editingClient?.id === client.id && ( // Only render form if this is the actively edited one to prevent state mess
                                                    <ClientForm
                                                        initialData={editingClient}
                                                        onSuccess={() => setEditingClient(null)}
                                                        onCancel={() => setEditingClient(null)}
                                                    />
                                                )}
                                            </DialogContent>
                                        </Dialog>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
}
