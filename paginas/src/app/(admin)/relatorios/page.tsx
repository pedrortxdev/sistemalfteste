import { auth } from "@/lib/auth";
import { isDono } from "@/lib/permissions";
import { ReportsClient } from "./ReportsClient";
import { getRevenueReport, getMachineReport, getDetailedCashFlowReport } from "./actions";

export default async function ReportsPage() {
  const session = await auth();
  if (!session) return null;

  // Carregar dados iniciais (mês atual)
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

  const [revenue, machines, cashFlow] = await Promise.all([
    getRevenueReport(startOfMonth, endOfMonth),
    getMachineReport(),
    getDetailedCashFlowReport(startOfMonth, endOfMonth)
  ]);

  return (
    <div className="p-4 md:p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Relatórios</h1>
        <Badge variant="info" className="px-3 py-1 text-sm">
          {session.user.role === 'DONO' ? 'Global' : session.user.cityName}
        </Badge>
      </div>

      <ReportsClient 
        initialRevenue={revenue}
        initialMachines={machines}
        initialCashFlow={cashFlow}
        isDono={isDono(session.user.role)}
      />
    </div>
  );
}

function Badge({ children, variant = "info", className = "" }: { children: React.ReactNode, variant?: string, className?: string }) {
  const variants: any = {
    info: "bg-blue-100 text-blue-800",
    success: "bg-green-100 text-green-800",
    warning: "bg-yellow-100 text-yellow-800",
  };
  return <span className={`px-2 py-0.5 rounded-full font-medium ${variants[variant]} ${className}`}>{children}</span>;
}
