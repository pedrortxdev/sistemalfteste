"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, KeyRound, Wrench, Users, Package, Building2, ShieldCheck, ArrowRightLeft, WalletCards } from "lucide-react";

const navItems = [
    { name: "Resumo", href: "/dashboard", icon: LayoutDashboard },
    { name: "Caixa", href: "/caixa", icon: WalletCards },
    { name: "Aluguel", href: "/aluguel", icon: KeyRound },
    { name: "Máquinas", href: "/maquinas", icon: Package },
    { name: "Transferências", href: "/transferencias", icon: ArrowRightLeft },
    { name: "Manutenção", href: "/manutencao", icon: Wrench },
    { name: "Clientes", href: "/clientes", icon: Users },
    { name: "Unidades", href: "/cidades", icon: Building2, adminOnly: true },
    { name: "Usuários", href: "/usuarios", icon: ShieldCheck, adminOnly: true },
];

export function Sidebar({ role }: { role?: string }) {
    const pathname = usePathname();

    return (
        <aside className="hidden md:flex flex-col w-64 bg-white border-r border-gray-200">
            <div className="h-16 flex items-center px-6 border-b border-gray-200">
                <h1 className="text-xl font-black tracking-tight text-[#111111]">
                    LF <span className="font-light text-gray-500">Aluguel</span>
                </h1>
            </div>
            <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
                {navItems.map((item) => {
                    if (item.adminOnly && role !== "DONO") return null;

                    const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-colors ${isActive
                                ? "bg-[#0066cc]/10 text-[#0066cc]"
                                : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                                }`}
                        >
                            <item.icon size={20} className={isActive ? "text-[#0066cc]" : "text-gray-500"} />
                            {item.name}
                        </Link>
                    );
                })}
            </nav>
            <div className="p-4 border-t border-gray-200 text-xs text-center text-gray-400 font-medium">
                LF Aluguel © {new Date().getFullYear()}
            </div>
        </aside>
    );
}
