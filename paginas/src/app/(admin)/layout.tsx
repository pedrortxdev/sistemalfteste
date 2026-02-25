import { ReactNode } from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import { MobileNav } from "@/components/layout/MobileNav";
import { Header } from "@/components/layout/Header";
import { auth } from "@/lib/auth";

export default async function AdminLayout({ children }: { children: ReactNode }) {
    const session = await auth();

    // Garante que se o middleware falhar, a tela ainda assim tenta proteger a UI
    if (!session?.user) return null;

    return (
        <div className="flex h-screen bg-gray-50 overflow-hidden">
            {/* Sidebar Desktop */}
            <Sidebar role={session.user.role} />

            <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
                {/* Top Header */}
                <Header
                    userName={session.user.name || "Usuário"}
                    cityName={session.user.cityName}
                    role={session.user.role}
                />

                {/* Main Content Area */}
                <main className="flex-1 overflow-y-auto w-full pb-20 md:pb-0 hide-scroll">
                    {children}
                </main>

                {/* Bottom Nav Mobile */}
                <MobileNav role={session.user.role} />
            </div>
        </div>
    );
}
