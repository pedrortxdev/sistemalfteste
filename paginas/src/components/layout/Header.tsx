"use client";

import { LogOut } from "lucide-react";
import { signOut } from "next-auth/react";
import { Button } from "@/components/ui/Button";

interface HeaderProps {
    userName: string;
    cityName: string;
    role: string;
}

export function Header({ userName, cityName, role }: HeaderProps) {
    return (
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4 md:px-6 sticky top-0 z-40">
            <div className="flex items-center gap-3">
                {/* Mobile App Title */}
                <div className="flex flex-col md:hidden">
                    <h1 className="text-sm font-black tracking-tight text-[#111111] leading-tight">
                        LF <span className="font-light text-gray-500">Aluguel</span>
                    </h1>
                    <span className="text-[10px] font-bold text-[#0066cc] uppercase truncate max-w-[120px]">{cityName}</span>
                </div>

                {/* Desktop City Indicator */}
                <div className="hidden md:flex flex-col">
                    <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Unidade Atual</span>
                    <span className="text-sm font-semibold text-gray-900">{cityName}</span>
                </div>
            </div>

            <div className="flex items-center gap-4">
                <div className="hidden sm:flex flex-col items-end">
                    <span className="text-sm font-semibold text-gray-900">{userName}</span>
                    <span className="text-[10px] font-bold text-gray-500 uppercase px-2 py-0.5 bg-gray-100 rounded-full">{role}</span>
                </div>
                <Button variant="ghost" size="icon" onClick={() => signOut({ callbackUrl: "/login" })} title="Sair do Sistema">
                    <LogOut size={20} className="text-gray-500 hover:text-red-500" />
                </Button>
            </div>
        </header>
    );
}
