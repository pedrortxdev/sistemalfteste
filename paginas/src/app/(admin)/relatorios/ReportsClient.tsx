"use client";

import { useState } from "react";
import { getRevenueReport, getMachineReport, getDetailedCashFlowReport } from "./actions";
import { useToast } from "@/components/ui/Toast";

interface ReportsClientProps {
  initialRevenue: any[];
  initialMachines: any[];
  initialCashFlow: any[];
  isDono: boolean;
}

export function ReportsClient({ initialRevenue, initialMachines, initialCashFlow, isDono }: ReportsClientProps) {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<'revenue' | 'machines' | 'cashflow'>('revenue');
  const [revenue, setRevenue] = useState(initialRevenue);
  const [machines, setMachines] = useState(initialMachines);
  const [cashFlow, setCashFlow] = useState(initialCashFlow);
  const [loading, setLoading] = useState(false);

  const [startDate, setStartDate] = useState(new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);

  const handleFilter = async () => {
    setLoading(true);
    try {
      const start = new Date(startDate);
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);

      if (activeTab === 'revenue') {
        const data = await getRevenueReport(start, end);
        setRevenue(data);
      } else if (activeTab === 'cashflow') {
        const data = await getDetailedCashFlowReport(start, end);
        setCashFlow(data);
      }
      toast("Relatório atualizado", "success");
    } catch (err) {
      toast("Erro ao filtrar dados", "error");
    } finally {
      setLoading(false);
    }
  };

  const exportToCSV = () => {
    let dataToExport: any[] = [];
    let headers: string[] = [];
    let filename = `relatorio-${activeTab}.csv`;

    if (activeTab === 'revenue') {
      headers = ['Cidade', 'Aluguel', 'Frete', 'Outros', 'Total'];
      dataToExport = revenue.map(r => [r.cityName, r.aluguel, r.frete, r.outros, r.total]);
    } else if (activeTab === 'machines') {
      headers = ['Máquina', 'Modelo', 'Cidade', 'Total Aluguéis', 'Custo Manutenção'];
      dataToExport = machines.map(m => [m.name, m.model, m.cityName, m.totalRentals, m.maintenanceCost]);
    } else if (activeTab === 'cashflow') {
      headers = ['Data', 'Cidade', 'Tipo', 'Categoria', 'Valor', 'Descrição'];
      dataToExport = cashFlow.map(c => [
        new Date(c.date).toLocaleDateString(),
        c.city.name,
        c.type,
        c.category,
        c.amount,
        c.description
      ]);
    }

    const csvContent = [
      headers.join(','),
      ...dataToExport.map(row => row.join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-4">
      {/* Filtros e Tabs */}
      <div className="flex flex-col md:flex-row gap-4 justify-between bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
        <div className="flex gap-2">
          <TabButton active={activeTab === 'revenue'} onClick={() => setActiveTab('revenue')}>Receita</TabButton>
          <TabButton active={activeTab === 'machines'} onClick={() => setActiveTab('machines')}>Máquinas</TabButton>
          <TabButton active={activeTab === 'cashflow'} onClick={() => setActiveTab('cashflow')}>Fluxo de Caixa</TabButton>
        </div>

        <div className="flex flex-wrap gap-2 items-end">
          {activeTab !== 'machines' && (
            <>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Início</label>
                <input 
                  type="date" 
                  value={startDate} 
                  onChange={(e) => setStartDate(e.target.value)}
                  className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Fim</label>
                <input 
                  type="date" 
                  value={endDate} 
                  onChange={(e) => setEndDate(e.target.value)}
                  className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>
              <button 
                onClick={handleFilter}
                disabled={loading}
                className="px-4 py-1.5 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:bg-gray-400"
              >
                {loading ? '...' : 'Filtrar'}
              </button>
            </>
          )}
          <button 
            onClick={exportToCSV}
            className="px-4 py-1.5 bg-gray-100 text-gray-700 border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-200"
          >
            Exportar CSV
          </button>
        </div>
      </div>

      {/* Tabela de Resultados */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden overflow-x-auto">
        {activeTab === 'revenue' && (
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 font-semibold text-gray-700">Filial</th>
                <th className="px-6 py-3 font-semibold text-gray-700">Aluguel</th>
                <th className="px-6 py-3 font-semibold text-gray-700">Frete</th>
                <th className="px-6 py-3 font-semibold text-gray-700">Outros</th>
                <th className="px-6 py-3 font-semibold text-gray-700">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {revenue.map((r, i) => (
                <tr key={i} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 font-medium text-gray-900">{r.cityName}</td>
                  <td className="px-6 py-4 text-gray-600">R$ {r.aluguel.toLocaleString()}</td>
                  <td className="px-6 py-4 text-gray-600">R$ {r.frete.toLocaleString()}</td>
                  <td className="px-6 py-4 text-gray-600">R$ {r.outros.toLocaleString()}</td>
                  <td className="px-6 py-4 font-semibold text-blue-600">R$ {r.total.toLocaleString()}</td>
                </tr>
              ))}
              {revenue.length === 0 && <tr><td colSpan={5} className="px-6 py-8 text-center text-gray-500">Nenhum dado encontrado.</td></tr>}
            </tbody>
          </table>
        )}

        {activeTab === 'machines' && (
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 font-semibold text-gray-700">Máquina</th>
                <th className="px-6 py-3 font-semibold text-gray-700">Filial</th>
                <th className="px-6 py-3 font-semibold text-gray-700">Aluguéis</th>
                <th className="px-6 py-3 font-semibold text-gray-700">Custo Manut.</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {machines.map((m, i) => (
                <tr key={i} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="font-medium text-gray-900">{m.name}</div>
                    <div className="text-xs text-gray-500">{m.model}</div>
                  </td>
                  <td className="px-6 py-4 text-gray-600">{m.cityName}</td>
                  <td className="px-6 py-4 font-medium text-gray-900">{m.totalRentals}</td>
                  <td className="px-6 py-4 text-red-600">R$ {m.maintenanceCost.toLocaleString()}</td>
                </tr>
              ))}
              {machines.length === 0 && <tr><td colSpan={4} className="px-6 py-8 text-center text-gray-500">Nenhuma máquina encontrada.</td></tr>}
            </tbody>
          </table>
        )}

        {activeTab === 'cashflow' && (
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 font-semibold text-gray-700">Data</th>
                <th className="px-6 py-3 font-semibold text-gray-700">Filial</th>
                <th className="px-6 py-3 font-semibold text-gray-700">Tipo</th>
                <th className="px-6 py-3 font-semibold text-gray-700">Categoria</th>
                <th className="px-6 py-3 font-semibold text-gray-700">Valor</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {cashFlow.map((c, i) => (
                <tr key={i} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 text-gray-600">{new Date(c.date).toLocaleDateString()}</td>
                  <td className="px-6 py-4 text-gray-600">{c.city.name}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${c.type === 'ENTRADA' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                      {c.type}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-gray-600">{c.category}</td>
                  <td className={`px-6 py-4 font-medium ${c.type === 'ENTRADA' ? 'text-green-600' : 'text-red-600'}`}>
                    {c.type === 'ENTRADA' ? '+' : '-'} R$ {c.amount.toLocaleString()}
                  </td>
                </tr>
              ))}
              {cashFlow.length === 0 && <tr><td colSpan={5} className="px-6 py-8 text-center text-gray-500">Nenhuma movimentação no período.</td></tr>}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

function TabButton({ children, active, onClick }: { children: React.ReactNode, active: boolean, onClick: () => void }) {
  return (
    <button 
      onClick={onClick}
      className={`px-4 py-1.5 text-sm font-medium rounded-lg transition-colors ${active ? 'bg-blue-50 text-blue-700' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'}`}
    >
      {children}
    </button>
  );
}
