"use client";

import { useTransition } from "react";
import { Building2, Power, PowerOff } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { toggleCityActive } from "./actions";

interface CityCardProps {
    city: {
        id: string;
        name: string;
        cnpj: string | null;
        active: boolean;
        createdAt: Date;
    };
}

export function CityCard({ city }: CityCardProps) {
    const [isPending, startTransition] = useTransition();

    const handleToggle = () => {
        startTransition(() => {
            toggleCityActive(city.id, city.active);
        });
    };

    return (
        <Card className={`relative overflow-hidden transition-all duration-200 ${!city.active ? 'opacity-60 grayscale-[0.5]' : 'hover:shadow-md hover:-translate-y-1'}`}>
            <div className="p-5 flex flex-col h-full gap-4">

                <div className="flex justify-between items-start">
                    <div className={`p-3 rounded-xl ${city.active ? 'bg-blue-50 text-blue-600' : 'bg-gray-100 text-gray-500'}`}>
                        <Building2 size={24} />
                    </div>
                    <Badge variant={city.active ? "success" : "default"}>
                        {city.active ? "Ativa" : "Inativa"}
                    </Badge>
                </div>

                <div>
                    <h3 className="font-bold text-lg text-gray-900 leading-tight mb-1">{city.name}</h3>
                    {city.cnpj ? (
                        <p className="text-sm font-medium text-gray-500">{city.cnpj}</p>
                    ) : (
                        <p className="text-sm italic text-gray-400">CNPJ não informado</p>
                    )}
                </div>

                <div className="mt-auto pt-4 border-t border-gray-100 flex items-center justify-between">
                    <span className="text-xs font-semibold text-gray-400">
                        Criada em {new Date(city.createdAt).toLocaleDateString('pt-BR')}
                    </span>
                    <button
                        onClick={handleToggle}
                        disabled={isPending}
                        className={`p-2 rounded-full transition-colors ${city.active
                                ? "text-red-500 hover:bg-red-50"
                                : "text-green-500 hover:bg-green-50"
                            }`}
                        title={city.active ? "Desativar Unidade" : "Reativar Unidade"}
                    >
                        {city.active ? <PowerOff size={18} /> : <Power size={18} />}
                    </button>
                </div>
            </div>
        </Card>
    );
}
