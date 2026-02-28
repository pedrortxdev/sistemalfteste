"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, KeyRound, Package, Search, WalletCards, Building2, BarChart3 } from "lucide-react";

// For mobile we often want slightly different or condensed items to fit on the bar.
// This matches the "App-like" feel the user requested.
const mobileNavItems: { name: string, href: string, icon: any, adminOnly?: boolean }[] = [
    { name: "Início", href: "/dashboard", icon: LayoutDashboard },
    { name: "Pátio", href: "/patio", icon: Package },
    { name: "Aluguel", href: "/aluguel", icon: KeyRound },
    { name: "Caixa", href: "/caixa", icon: WalletCards },
    { name: "Clientes", href: "/clientes", icon: Search },
];

export function MobileNav({ role }: { role?: string }) {
    const pathname = usePathname();
    const itemsToRender = mobileNavItems.filter(item => {
        if (item.adminOnly && role !== "DONO") return false;
        return true;
    });

    return (
        <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-lg border-t border-gray-200 pb-safe">
            <div className="flex justify-around items-center h-16 px-2 overflow-x-auto hide-scroll">
                {itemsToRender.map((item) => {
                    const isActive = pathname === item.href || pathname.startsWith(item.href + "/") && item.href !== '/dashboard';
                    // special rule for dashboard because it's root
                    const isDashboardActive = pathname === '/dashboard' && item.href === '/dashboard';

                    const reallyActive = item.href === '/dashboard' ? isDashboardActive : isActive;

                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className="flex flex-col items-center justify-center gap-1 active:scale-95 transition-transform"
                        >
                            <item.icon
                                size={24}
                                className={reallyActive ? "text-[#0066cc]" : "text-gray-400"}
                                strokeWidth={reallyActive ? 2.5 : 2}
                            />
                            <span
                                className={`text-[10px] font-bold ${reallyActive ? "text-[#0066cc]" : "text-gray-400"
                                    }`}
                            >
                                {item.name}
                            </span>
                        </Link>
                    );
                })}
            </div>
        </nav>
    );
}
