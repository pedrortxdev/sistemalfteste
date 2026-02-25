"use client";

import { useTransition } from "react";
import { User, ShieldUser, ShieldCheck, Power, PowerOff } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { toggleUserActive } from "./actions";

interface UserCardProps {
    user: {
        id: string;
        name: string;
        email: string;
        role: string;
        active: boolean;
        city: { name: string } | null;
    };
    currentUserEmail?: string | null;
}

export function UserCard({ user, currentUserEmail }: UserCardProps) {
    const [isPending, startTransition] = useTransition();

    const handleToggle = () => {
        startTransition(() => {
            toggleUserActive(user.id, user.active);
        });
    };

    const isDono = user.role === "DONO";
    const isMe = user.email === currentUserEmail;

    return (
        <Card className={`relative overflow-hidden transition-all duration-200 ${!user.active ? 'opacity-60 grayscale-[0.5]' : 'hover:shadow-md'}`}>
            <div className="p-5 flex flex-col h-full gap-4">

                <div className="flex justify-between items-start">
                    <div className={`p-3 rounded-xl ${isDono ? 'bg-purple-50 text-purple-600' : 'bg-gray-100 text-gray-500'}`}>
                        {isDono ? <ShieldCheck size={24} /> : <User size={24} />}
                    </div>

                    <div className="flex flex-col items-end gap-1">
                        {isMe && <Badge variant="info">Você</Badge>}
                        <Badge variant={user.active ? "success" : "default"}>
                            {user.active ? "Ativo" : "Inativo"}
                        </Badge>
                    </div>
                </div>

                <div>
                    <h3 className="font-bold text-lg text-gray-900 leading-tight mb-1">{user.name}</h3>
                    <p className="text-sm font-medium text-gray-500">{user.email}</p>
                </div>

                <div className="mt-auto pt-4 border-t border-gray-100 flex items-center justify-between">
                    <div className="flex flex-col">
                        <span className="text-xs font-bold text-gray-400 uppercase">Unidade</span>
                        <span className="text-sm font-semibold text-gray-700">{user.city?.name || "Global"}</span>
                    </div>

                    {!isMe && (
                        <button
                            onClick={handleToggle}
                            disabled={isPending}
                            className={`p-2 rounded-full transition-colors ${user.active
                                    ? "text-red-500 hover:bg-red-50"
                                    : "text-green-500 hover:bg-green-50"
                                }`}
                            title={user.active ? "Desativar" : "Reativar"}
                        >
                            {user.active ? <PowerOff size={18} /> : <Power size={18} />}
                        </button>
                    )}
                </div>
            </div>
        </Card>
    );
}
