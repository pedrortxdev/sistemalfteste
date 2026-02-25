"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createRentalOrder } from "../actions";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { FileText, MapPin, PackagePlus, PenTool, Calendar as CalendarIcon, ArrowRight, ArrowLeft, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import SignaturePad from "react-signature-canvas";
import { useRef } from "react";

interface ClientData {
    id: string;
    name: string;
    cpfCnpj: string;
    homeAddress: string | null;
    phone: string;
}

interface MachineData {
    id: string;
    name: string;
    model: string | null;
    category: string;
    dailyPrice: number;
}

interface RentalWizardProps {
    clients: ClientData[];
    availableMachines: MachineData[];
    userCityId: string;
}

export function RentalWizard({ clients, availableMachines, userCityId }: RentalWizardProps) {
    const router = useRouter();
    const [step, setStep] = useState(1);
    const [isPending, startTransition] = useTransition();
    const sigPad = useRef<any>(null);

    // Estado Geral do Pedido
    const [formData, setFormData] = useState({
        clientId: "",
        jobSiteAddress: "",
        startDate: "",
        endDate: "",
        freightValue: 0,
        advancePayment: 0,
        notes: "",
    });

    // Carrinho de Máquinas
    const [selectedItems, setSelectedItems] = useState<{ machine: MachineData, days: number }[]>([]);

    // Handler de Mudanças
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    // Actions Cart
    const addMachineToCart = (machineId: string) => {
        if (!machineId) return;
        const machine = availableMachines.find(m => m.id === machineId);
        if (!machine) return;

        // Validar Dias Baseado nas Datas (se as datas existirem, podemos auto-calcular)
        let defaultDays = 1;
        if (formData.startDate && formData.endDate) {
            const diffTime = Math.abs(new Date(formData.endDate).getTime() - new Date(formData.startDate).getTime());
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            if (diffDays > 0) defaultDays = diffDays;
        }

        if (!selectedItems.find(item => item.machine.id === machine.id)) {
            setSelectedItems(prev => [...prev, { machine, days: defaultDays }]);
        }
    };

    const removeMachineFromCart = (machineId: string) => {
        setSelectedItems(prev => prev.filter(item => item.machine.id !== machineId));
    };

    const updateItemDays = (machineId: string, days: number) => {
        setSelectedItems(prev => prev.map(item => item.machine.id === machineId ? { ...item, days } : item));
    };

    // Cálculos Financeiros
    const subtotalEquipamentos = selectedItems.reduce((acc, item) => acc + (item.machine.dailyPrice * item.days), 0);
    const totalOrder = subtotalEquipamentos + Number(formData.freightValue);
    const totalDue = totalOrder - Number(formData.advancePayment); // O que falta pagar

    // Finalização
    const handleFinalize = () => {
        if (sigPad.current?.isEmpty()) {
            alert("A assinatura do cliente é obrigatória.");
            return;
        }

        startTransition(async () => {
            const signatureDataUrl = sigPad.current.getTrimmedCanvas().toDataURL("image/png");

            const finalPayload = {
                ...formData,
                signatureUrl: signatureDataUrl,
                items: selectedItems.map(item => ({
                    machineId: item.machine.id,
                    days: item.days,
                    dailyPrice: item.machine.dailyPrice,
                    subtotal: item.days * item.machine.dailyPrice
                }))
            };

            const result = await createRentalOrder(finalPayload);
            if (result.success) {
                router.push("/aluguel");
            } else {
                alert(result.message || "Ocorreu um erro ao gerar o pedido.");
            }
        });
    };

    // Renders de Steps
    const renderStep1 = () => (
        <div className="space-y-6 pb-6">
            <div className="bg-blue-50/50 p-4 border border-blue-100 rounded-2xl flex items-start gap-3">
                <FileText className="text-blue-500 mt-0.5" size={20} />
                <div>
                    <h3 className="font-bold text-blue-900 text-sm">Dados do Pedido</h3>
                    <p className="text-xs text-blue-700 font-medium mt-0.5">Selecione o titular da locação e defina para onde o equipamento será enviado.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 gap-5">
                <Select
                    label="Selecione o Cliente *"
                    name="clientId"
                    value={formData.clientId}
                    onChange={handleChange}
                    options={[
                        { value: "", label: "Busque ou selecione um cliente" },
                        ...clients.map(c => ({ value: c.id, label: `${c.name} (${c.cpfCnpj})` }))
                    ]}
                />

                <Input
                    label="Endereço ou Local da Obra (Se diferente de casa)"
                    name="jobSiteAddress"
                    value={formData.jobSiteAddress}
                    onChange={handleChange}
                    placeholder="Ex: Rua das Flores, 123 - Centro"
                />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-2">
                <Input
                    label="Data de Retirada *"
                    name="startDate"
                    type="date"
                    value={formData.startDate}
                    onChange={handleChange}
                />
                <Input
                    label="Data Proposta p/ Devolução *"
                    name="endDate"
                    type="date"
                    value={formData.endDate}
                    onChange={handleChange}
                />
            </div>

            <div className="flex justify-end pt-4 border-t border-gray-100">
                <Button
                    type="button"
                    onClick={() => setStep(2)}
                    disabled={!formData.clientId || !formData.startDate || !formData.endDate}
                    className="flex text-sm font-bold gap-2"
                >
                    Avançar para Máquinas <ArrowRight size={16} />
                </Button>
            </div>
        </div>
    );

    const renderStep2 = () => (
        <div className="space-y-6 pb-6">
            <div className="bg-orange-50/50 p-4 border border-orange-100 rounded-2xl flex items-start gap-3">
                <PackagePlus className="text-orange-500 mt-0.5" size={20} />
                <div>
                    <h3 className="font-bold text-orange-900 text-sm">Adicionar Máquinas Disponíveis</h3>
                    <p className="text-xs text-orange-700 font-medium mt-0.5">Monte o talão de locação adicionando equipamentos e definindo diárias.</p>
                </div>
            </div>

            <div className="flex gap-2">
                <Select
                    name="machineSelector"
                    className="flex-1"
                    options={[
                        { value: "", label: "Selecione uma máquina para adicionar" },
                        ...availableMachines.filter(am => !selectedItems.find(si => si.machine.id === am.id)).map(m => ({
                            value: m.id,
                            label: `${m.name} - ${new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(m.dailyPrice)}/dia`
                        }))
                    ]}
                    onChange={(e) => addMachineToCart(e.target.value)}
                />
            </div>

            {selectedItems.length > 0 && (
                <div className="bg-white border rounded-2xl overflow-hidden shadow-sm mt-4">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-gray-50 text-gray-500 font-bold uppercase text-[10px]">
                            <tr>
                                <th className="px-4 py-3">Equipamento Locado</th>
                                <th className="px-4 py-3 w-24">Dias</th>
                                <th className="px-4 py-3 text-right">R$ Unitário</th>
                                <th className="px-4 py-3 text-right">R$ SubTotal</th>
                                <th className="px-4 py-3 w-10"></th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {selectedItems.map(({ machine, days }) => (
                                <tr key={machine.id} className="hover:bg-gray-50">
                                    <td className="px-4 py-3 font-semibold text-gray-900">{machine.name}</td>
                                    <td className="px-4 py-3">
                                        <input
                                            type="number"
                                            min="1"
                                            value={days}
                                            onChange={(e) => updateItemDays(machine.id, parseInt(e.target.value) || 1)}
                                            className="w-full border rounded outline-none px-2 py-1 text-center font-bold"
                                        />
                                    </td>
                                    <td className="px-4 py-3 text-right font-medium text-gray-500">
                                        {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(machine.dailyPrice)}
                                    </td>
                                    <td className="px-4 py-3 text-right font-bold text-gray-900">
                                        {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(machine.dailyPrice * days)}
                                    </td>
                                    <td className="px-4 py-3 text-center">
                                        <button onClick={() => removeMachineFromCart(machine.id)} className="text-red-400 hover:text-red-600 transition-colors">
                                            <Trash2 size={16} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            <div className="flex justify-between pt-4 border-t border-gray-100">
                <Button type="button" variant="ghost" onClick={() => setStep(1)} className="flex text-sm font-bold gap-2">
                    <ArrowLeft size={16} /> Voltar
                </Button>
                <Button
                    type="button"
                    onClick={() => setStep(3)}
                    disabled={selectedItems.length === 0}
                    className="flex text-sm font-bold gap-2"
                >
                    Avançar para Adiantamento <ArrowRight size={16} />
                </Button>
            </div>
        </div>
    );

    const renderStep3 = () => (
        <div className="space-y-6 pb-6">
            <div className="bg-emerald-50/50 p-4 border border-emerald-100 rounded-2xl flex items-start gap-3">
                <PenTool className="text-emerald-500 mt-0.5" size={20} />
                <div>
                    <h3 className="font-bold text-emerald-900 text-sm">Fechamento do Contrato</h3>
                    <p className="text-xs text-emerald-700 font-medium mt-0.5">Lance os valores de frete, adiantamento, assine e despache.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
                <div className="space-y-4">
                    <Input
                        label="Valor do Frete (R$)"
                        name="freightValue"
                        type="number"
                        min="0"
                        step="0.01"
                        value={formData.freightValue}
                        onChange={handleChange}
                    />
                    <Input
                        label="Sinal / Adiantamento Pago (R$)"
                        name="advancePayment"
                        type="number"
                        min="0"
                        step="0.01"
                        value={formData.advancePayment}
                        onChange={handleChange}
                    />
                    <div className="space-y-1.5 pt-2">
                        <label className="text-sm font-bold text-gray-700 uppercase">Observações do Pedido</label>
                        <textarea
                            name="notes"
                            value={formData.notes}
                            onChange={handleChange}
                            className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-[#0066cc]/20 focus:border-[#0066cc] transition-all resize-none min-h-[100px] text-sm"
                            placeholder="Anotações para devolução ou sobre o local..."
                        ></textarea>
                    </div>
                </div>

                <div className="bg-gray-50 p-5 rounded-2xl border border-gray-200 h-full flex flex-col justify-between">
                    <div>
                        <h4 className="font-bold text-gray-900 uppercase text-xs mb-4">Resumo Financeiro</h4>
                        <div className="space-y-2 text-sm font-medium">
                            <div className="flex justify-between text-gray-500">
                                <span>Subtotal Equipamentos</span>
                                <span>{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(subtotalEquipamentos)}</span>
                            </div>
                            <div className="flex justify-between text-gray-500 border-b border-gray-200 pb-2">
                                <span>Frete (+)</span>
                                <span>{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(formData.freightValue))}</span>
                            </div>
                            <div className="flex justify-between text-gray-900 pt-1 font-bold">
                                <span>Total do Pedido</span>
                                <span>{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(totalOrder)}</span>
                            </div>
                            <div className="flex justify-between text-red-500/80 pt-1 border-b border-gray-200 pb-2">
                                <span>Sinal / Adiantamento (-)</span>
                                <span>{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(formData.advancePayment))}</span>
                            </div>
                            <div className="flex justify-between text-blue-700 pt-1 font-black text-lg">
                                <span>Saldo a Receber</span>
                                <span>{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(totalDue)}</span>
                            </div>
                        </div>
                    </div>

                    <div className="mt-8">
                        <h4 className="font-bold text-gray-900 uppercase text-xs mb-2">Assinatura do Locatário</h4>
                        <div className="bg-white border-2 border-dashed border-gray-300 rounded-xl overflow-hidden shadow-inner">
                            <SignaturePad
                                ref={sigPad}
                                canvasProps={{ className: "w-full h-32 touch-none" }}
                            />
                        </div>
                        <div className="flex justify-end mt-2">
                            <button onClick={() => sigPad.current?.clear()} className="text-xs font-bold text-gray-400 hover:text-gray-600">
                                Limpar Assinatura
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <div className="flex justify-between pt-4 border-t border-gray-100">
                <Button type="button" variant="ghost" onClick={() => setStep(2)} className="flex text-sm font-bold gap-2" disabled={isPending}>
                    <ArrowLeft size={16} /> Voltar
                </Button>
                <Button
                    type="button"
                    variant="primary"
                    onClick={handleFinalize}
                    disabled={isPending}
                    className="flex text-sm font-bold gap-2 bg-emerald-600 hover:bg-emerald-700 text-white"
                >
                    {isPending ? "Processando Contrato..." : "Assinar e Finalizar Contrato"} <CheckCircle size={16} />
                </Button>
            </div>
        </div>
    );

    return (
        <div className="bg-white border rounded-2xl p-6 shadow-sm">
            {/* Status Steps */}
            <div className="flex items-center gap-2 mb-8 hidden sm:flex">
                <div className={`flex-1 h-1.5 rounded-full ${step >= 1 ? "bg-blue-600" : "bg-gray-100"}`}></div>
                <div className={`flex-1 h-1.5 rounded-full ${step >= 2 ? "bg-orange-500" : "bg-gray-100"}`}></div>
                <div className={`flex-1 h-1.5 rounded-full ${step >= 3 ? "bg-emerald-500" : "bg-gray-100"}`}></div>
            </div>

            <div className="md:px-2">
                {step === 1 && renderStep1()}
                {step === 2 && renderStep2()}
                {step === 3 && renderStep3()}
            </div>
        </div>
    );
}

// Icon Import Workaround - CheckCircle was missing above, creating a quick mock or adding to imports
import { CheckCircle } from "lucide-react";
