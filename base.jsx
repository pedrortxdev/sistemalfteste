import React, { useState, useRef } from 'react';
import {
    Home,
    Wrench,
    PlusCircle,
    Users,
    Camera,
    AlertTriangle,
    CheckCircle2,
    ChevronRight,
    FileText,
    MapPin,
    Calculator,
    Search,
    Hammer,
    Phone,
    LogOut,
    Lock,
    Building2,
    ChevronDown
} from 'lucide-react';

export default function App() {
    // --- ESTADOS DE AUTENTICAÇÃO E CONTEXTO ---
    const [user, setUser] = useState(null); // null = não logado
    const [activeTab, setActiveTab] = useState('dashboard');
    const [currentStore, setCurrentStore] = useState('Ijuí / RS');

    const STORES = ['Ijuí / RS', 'Cruz Alta / RS'];

    // --- ESTADOS DOS MÓDULOS ---
    const [orderStep, setOrderStep] = useState(1);
    const [capturedImage, setCapturedImage] = useState(null);
    const fileInputRef = useRef(null);
    const [diarias, setDiarias] = useState(1);
    const [frete, setFrete] = useState('');
    const [maquinaPreco, setMaquinaPreco] = useState(0);

    // --- MOCK DATA ---
    const storeStats = currentStore === 'Ijuí / RS'
        ? { total: 67, broken: 45, rented: 12, available: 10, faturamento: 'R$ 14.500' }
        : { total: 40, broken: 5, rented: 25, available: 10, faturamento: 'R$ 28.300' };

    const MOCK_MACHINES = [
        { id: 'LF-001', nome: 'Betoneira 400L CSM', status: 'DISPONIVEL', valor: 80, loja: 'Ijuí / RS' },
        { id: 'LF-045', nome: 'Martelete Rompedor 15kg', status: 'ALUGADA', valor: 65, loja: 'Ijuí / RS' },
        { id: 'LF-012', nome: 'Serra Mármore Makita', status: 'ESTRAGADA', valor: 35, loja: 'Ijuí / RS' },
        { id: 'CA-001', nome: 'Compactador de Solo', status: 'DISPONIVEL', valor: 120, loja: 'Cruz Alta / RS' },
        { id: 'CA-002', nome: 'Andaime Tubular (Kit)', status: 'ALUGADA', valor: 15, loja: 'Cruz Alta / RS' },
    ];

    const MOCK_CLIENTS = [
        { id: 1, nome: 'João Pedreiro', doc: '123.456.789-00', fone: '(55) 99999-1111', endereco: 'Rua das Flores, 45', loja: 'Ijuí / RS' },
        { id: 2, nome: 'Construtora Silva LTDA', doc: '11.222.333/0001-44', fone: '(55) 3333-2222', endereco: 'Av. Coronel Dico, 1000', loja: 'Ijuí / RS' },
        { id: 3, nome: 'Carlos Reformas', doc: '987.654.321-11', fone: '(55) 98888-3333', endereco: 'Rua do Comércio, 550', loja: 'Cruz Alta / RS' },
    ];

    const calculoTotal = (diarias * maquinaPreco) + (parseFloat(frete.replace(',', '.')) || 0);

    const handleMachineChange = (e) => {
        const text = e.target.options[e.target.selectedIndex].text;
        if (text.includes('R$ 80')) setMaquinaPreco(80);
        else if (text.includes('R$ 65')) setMaquinaPreco(65);
        else if (text.includes('R$ 120')) setMaquinaPreco(120);
        else setMaquinaPreco(0);
    };

    const handleImageCapture = (e) => {
        const file = e.target.files[0];
        if (file) setCapturedImage(URL.createObjectURL(file));
    };

    const doLogin = (role) => {
        if (role === 'DONO') {
            setUser({ name: 'Chefe', role: 'DONO', fixedStore: null });
            setCurrentStore('Ijuí / RS');
        } else {
            setUser({ name: 'Balconista Ijuí', role: 'OPERADOR', fixedStore: 'Ijuí / RS' });
            setCurrentStore('Ijuí / RS');
        }
        setActiveTab('dashboard');
    };

    const doLogout = () => {
        setUser(null);
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'DISPONIVEL': return 'bg-emerald-100 text-emerald-800 border-emerald-200';
            case 'ALUGADA': return 'bg-blue-100 text-blue-800 border-blue-200';
            case 'ESTRAGADA': return 'bg-red-100 text-red-800 border-red-200';
            default: return 'bg-gray-100 text-gray-800 border-gray-200';
        }
    };

    // ==========================================
    // VIEW: LOGIN PÚBLICO
    // ==========================================
    if (!user) {
        return (
            <div className="min-h-screen bg-zinc-900 flex items-center justify-center p-4 font-sans selection:bg-emerald-500 selection:text-white">
                <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
                    <div className="bg-zinc-100 p-8 text-center border-b border-gray-200">
                        <div className="w-16 h-16 bg-zinc-900 rounded-2xl mx-auto flex items-center justify-center mb-4 shadow-lg rotate-3">
                            <Wrench size={32} className="text-white -rotate-3" />
                        </div>
                        <h1 className="text-3xl font-black text-zinc-900 tracking-tight">LF <span className="font-light text-zinc-500">Aluguel</span></h1>
                        <p className="text-sm text-gray-500 mt-2 font-medium">Acesso Restrito ao Sistema</p>
                    </div>

                    <div className="p-8 space-y-6">
                        <div className="space-y-4 opacity-50 pointer-events-none">
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">E-mail</label>
                                <div className="relative">
                                    <Lock size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                    <input type="email" value="admin@lfaluguel.com" readOnly className="w-full bg-gray-50 pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl outline-none text-sm font-medium" />
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Senha</label>
                                <div className="relative">
                                    <Lock size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                    <input type="password" value="********" readOnly className="w-full bg-gray-50 pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl outline-none text-sm font-medium" />
                                </div>
                            </div>
                        </div>

                        <div className="pt-4 border-t border-gray-100 space-y-3">
                            <p className="text-xs text-center font-bold text-gray-400 uppercase tracking-wider mb-4">Simulação de Acesso (Dev)</p>
                            <button onClick={() => doLogin('DONO')} className="w-full bg-zinc-900 text-white py-3.5 rounded-xl font-bold hover:bg-zinc-800 transition-all flex justify-center items-center gap-2 shadow-md">
                                <Building2 size={18} /> Entrar como DONO
                            </button>
                            <button onClick={() => doLogin('OPERADOR')} className="w-full bg-emerald-50 text-emerald-700 border border-emerald-200 py-3.5 rounded-xl font-bold hover:bg-emerald-100 transition-all flex justify-center items-center gap-2">
                                <Users size={18} /> Entrar como FUNCIONÁRIO
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // ==========================================
    // COMPONENTES DE TELA AUTENTICADOS
    // ==========================================

    const DashboardView = () => (
        <div className="space-y-6 animate-in fade-in duration-300">
            <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-200 flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-black text-gray-800 tracking-tight">Painel de Controle</h2>
                    <p className="text-sm text-gray-500 font-medium mt-1">
                        {user.role === 'DONO' ? 'Visão gerencial da loja:' : 'Resumo da sua operação em:'} <strong className="text-zinc-900">{currentStore}</strong>
                    </p>
                </div>
                {user.role === 'DONO' && (
                    <div className="hidden sm:block text-right">
                        <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-1">Faturamento (Mês)</span>
                        <span className="text-2xl font-black text-emerald-600">{storeStats.faturamento}</span>
                    </div>
                )}
            </div>

            {storeStats.broken > 10 && (
                <div className="bg-red-50 border-2 border-red-500 rounded-xl p-5 shadow-sm">
                    <div className="flex items-start gap-4">
                        <div className="bg-red-100 p-3 rounded-full shrink-0">
                            <AlertTriangle size={32} className="text-red-600" />
                        </div>
                        <div>
                            <h3 className="text-red-800 font-extrabold text-lg">ALERTA CRÍTICO DE ESTOQUE ({currentStore})</h3>
                            <p className="text-red-700 font-medium mt-1">
                                {storeStats.broken} de {storeStats.total} máquinas estão ESTRAGADAS.
                            </p>
                            <p className="text-red-600 text-sm mt-2 max-w-2xl">
                                A loja está operando com apenas <strong>{Math.round((storeStats.available / storeStats.total) * 100)}%</strong> da capacidade. Priorize os consertos imediatamente para não perder dinheiro.
                            </p>
                            <button onClick={() => setActiveTab('maquinas')} className="mt-4 bg-red-600 text-white px-4 py-2.5 rounded-lg font-bold shadow-md hover:bg-red-700 active:scale-95 transition-all text-sm">
                                Ir para Oficina
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex flex-col items-center justify-center text-center">
                    <span className="text-4xl font-black text-emerald-600">{storeStats.available}</span>
                    <span className="text-xs font-bold text-gray-500 uppercase tracking-wider mt-2">Disponíveis</span>
                </div>
                <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex flex-col items-center justify-center text-center">
                    <span className="text-4xl font-black text-blue-600">{storeStats.rented}</span>
                    <span className="text-xs font-bold text-gray-500 uppercase tracking-wider mt-2">Alugadas</span>
                </div>
                <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex flex-col items-center justify-center text-center col-span-2 md:col-span-2">
                    <span className="text-4xl font-black text-zinc-900">{storeStats.total}</span>
                    <span className="text-xs font-bold text-gray-500 uppercase tracking-wider mt-2">Patrimônio Total ({currentStore})</span>
                </div>
            </div>
        </div>
    );

    const NovoPedidoView = () => (
        <div className="space-y-6 animate-in fade-in duration-300 max-w-2xl mx-auto">
            <div className="bg-zinc-900 text-white p-5 rounded-xl shadow-md flex justify-between items-center">
                <div>
                    <h2 className="text-xl font-black tracking-tight">Novo Contrato</h2>
                    <p className="text-emerald-400 text-xs font-mono mt-1 flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span> {currentStore}
                    </p>
                </div>
                <div className="bg-zinc-800 px-4 py-1.5 rounded-full text-sm font-bold border border-zinc-700 shadow-inner">
                    Passo {orderStep}/2
                </div>
            </div>

            {orderStep === 1 && (
                <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
                    <div className="p-5 border-b border-gray-100 bg-gray-50 flex items-center gap-3">
                        <div className="p-2 bg-white rounded-lg shadow-sm"><FileText size={20} className="text-zinc-600" /></div>
                        <h3 className="font-extrabold text-gray-800 text-lg">Preenchimento</h3>
                    </div>

                    <div className="p-6 space-y-5">
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">Cliente / Locatário</label>
                            <select className="w-full p-3.5 border-2 border-gray-200 rounded-xl bg-white focus:border-zinc-900 focus:ring-0 outline-none transition-colors text-base appearance-none font-medium">
                                <option>Selecione o cliente...</option>
                                {MOCK_CLIENTS.filter(c => c.loja === currentStore).map(c => <option key={c.id}>{c.nome} ({c.doc})</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
                                <MapPin size={16} className="text-gray-400" /> Local de uso da ferramenta (Obra)
                            </label>
                            <input type="text" placeholder="Ex: Rua do Comércio, 123" className="w-full p-3.5 border-2 border-gray-200 rounded-xl focus:border-zinc-900 outline-none transition-colors text-base font-medium" />
                        </div>
                        <div className="pt-4 border-t border-gray-100">
                            <label className="block text-sm font-bold text-gray-700 mb-2">Máquina (Apenas Disponíveis)</label>
                            <select onChange={handleMachineChange} className="w-full p-3.5 border-2 border-gray-200 rounded-xl bg-white focus:border-zinc-900 outline-none text-base appearance-none font-medium">
                                <option>Selecione a máquina...</option>
                                {MOCK_MACHINES.filter(m => m.loja === currentStore && m.status === 'DISPONIVEL').map(m => (
                                    <option key={m.id}>{m.nome} ({m.id}) - R$ {m.valor}/dia</option>
                                ))}
                            </select>
                        </div>
                        <div className="grid grid-cols-2 gap-4 pt-2">
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">Qtd. Diárias</label>
                                <input type="number" value={diarias} onChange={(e) => setDiarias(Math.max(1, parseInt(e.target.value) || 1))} min={1} className="w-full p-3.5 border-2 border-gray-200 rounded-xl focus:border-zinc-900 outline-none text-xl text-center font-black text-zinc-800" />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">Frete (R$)</label>
                                <input type="number" value={frete} onChange={(e) => setFrete(e.target.value)} placeholder="0.00" className="w-full p-3.5 border-2 border-gray-200 rounded-xl focus:border-zinc-900 outline-none text-xl font-black text-zinc-800" />
                            </div>
                        </div>
                        <div className="bg-emerald-50 p-5 rounded-xl border-2 border-emerald-200 mt-6 flex justify-between items-center shadow-inner">
                            <div className="flex items-center gap-2 text-emerald-800">
                                <Calculator size={24} />
                                <span className="font-extrabold text-sm uppercase tracking-wider">Total Estimado</span>
                            </div>
                            <div className="text-right">
                                <span className="text-3xl font-black text-emerald-600">R$ {calculoTotal.toFixed(2).replace('.', ',')}</span>
                            </div>
                        </div>
                        <button onClick={() => setOrderStep(2)} className="w-full mt-6 bg-zinc-900 text-white p-4.5 py-4 rounded-xl font-black text-lg flex items-center justify-center gap-2 hover:bg-zinc-800 active:scale-[0.98] transition-all shadow-xl">
                            Avançar para Documento <ChevronRight size={24} />
                        </button>
                    </div>
                </div>
            )}

            {orderStep === 2 && (
                <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
                    <div className="p-6 text-center border-b border-gray-100 bg-gray-50">
                        <h3 className="font-extrabold text-2xl text-gray-900 tracking-tight">Assinatura do Cliente</h3>
                        <p className="text-sm text-gray-500 mt-2 font-medium">Tire uma foto nítida do canhoto de papel assinado para arquivar no sistema.</p>
                    </div>
                    <div className="p-6">
                        <input type="file" accept="image/*" capture="environment" ref={fileInputRef} onChange={handleImageCapture} className="hidden" />
                        {capturedImage ? (
                            <div className="space-y-4">
                                <div className="border-4 border-emerald-500 rounded-xl overflow-hidden relative bg-black shadow-inner">
                                    <img src={capturedImage} alt="Contrato Assinado" className="w-full h-auto max-h-80 object-contain opacity-90" />
                                    <div className="absolute top-3 right-3 bg-emerald-500 text-white px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-wider flex items-center gap-2 shadow-lg">
                                        <CheckCircle2 size={16} /> Foto Anexada
                                    </div>
                                </div>
                                <button onClick={() => fileInputRef.current?.click()} className="w-full py-4 text-zinc-600 font-bold border-2 border-zinc-200 rounded-xl hover:bg-zinc-50 transition-colors">
                                    Tirar foto novamente
                                </button>
                            </div>
                        ) : (
                            <button onClick={() => fileInputRef.current?.click()} className="w-full py-16 border-4 border-dashed border-zinc-300 rounded-2xl flex flex-col items-center justify-center gap-4 text-zinc-500 hover:border-zinc-900 hover:text-zinc-900 hover:bg-zinc-50 transition-all cursor-pointer">
                                <div className="bg-white shadow-md p-5 rounded-full"><Camera size={48} className="text-zinc-800" /></div>
                                <div className="text-center">
                                    <span className="font-black text-xl block text-zinc-800">Abrir Câmera</span>
                                    <span className="text-sm font-medium mt-1 block">Tire uma foto do papel assinado</span>
                                </div>
                            </button>
                        )}
                        <div className="mt-8 flex gap-3">
                            <button onClick={() => setOrderStep(1)} className="w-1/3 p-4 rounded-xl font-bold text-gray-600 bg-gray-100 hover:bg-gray-200 transition-all">Voltar</button>
                            <button disabled={!capturedImage} className={`w-2/3 p-4 rounded-xl font-black text-lg flex items-center justify-center gap-2 transition-all shadow-md ${capturedImage ? 'bg-emerald-600 text-white hover:bg-emerald-700' : 'bg-gray-300 text-gray-500 cursor-not-allowed'}`}>
                                <CheckCircle2 size={24} /> Confirmar
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );

    const EstoqueView = () => {
        const [filtro, setFiltro] = useState('TODAS');
        // Filtra pelo loja atual e status
        const maquinasFiltradas = MOCK_MACHINES.filter(m => m.loja === currentStore && (filtro === 'TODAS' || m.status === filtro));

        return (
            <div className="space-y-6 animate-in fade-in duration-300">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                        <h2 className="text-2xl font-black text-gray-800 tracking-tight">Estoque & Oficina</h2>
                        <p className="text-sm text-gray-500 mt-1 font-medium">Visualizando: {currentStore}</p>
                    </div>
                    <button className="bg-zinc-900 text-white px-4 py-2.5 rounded-xl text-sm font-bold shadow-md hover:bg-zinc-800 flex items-center gap-2 w-full sm:w-auto justify-center">
                        <PlusCircle size={18} /> Nova Máquina
                    </button>
                </div>

                <div className="flex gap-2 overflow-x-auto pb-2 -mx-4 px-4 sm:mx-0 sm:px-0 sm:pb-0 scrollbar-hide">
                    <button onClick={() => setFiltro('TODAS')} className={`px-5 py-2.5 rounded-full text-sm font-extrabold whitespace-nowrap transition-all border shadow-sm ${filtro === 'TODAS' ? 'bg-zinc-900 text-white border-zinc-900 scale-105' : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'}`}>
                        Todas
                    </button>
                    <button onClick={() => setFiltro('ESTRAGADAS')} className={`px-5 py-2.5 rounded-full text-sm font-extrabold whitespace-nowrap transition-all border shadow-sm flex items-center gap-1.5 ${filtro === 'ESTRAGADAS' ? 'bg-red-600 text-white border-red-700 scale-105' : 'bg-white text-red-600 border-red-200 hover:bg-red-50'}`}>
                        <AlertTriangle size={16} /> UTI / Estragadas
                    </button>
                    <button onClick={() => setFiltro('DISPONIVEL')} className={`px-5 py-2.5 rounded-full text-sm font-extrabold whitespace-nowrap transition-all border shadow-sm ${filtro === 'DISPONIVEL' ? 'bg-emerald-600 text-white border-emerald-700 scale-105' : 'bg-white text-emerald-600 border-emerald-200 hover:bg-emerald-50'}`}>
                        Disponíveis
                    </button>
                </div>

                <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm whitespace-nowrap">
                            <thead className="bg-gray-50 border-b border-gray-200 text-gray-500 text-xs uppercase tracking-wider font-extrabold">
                                <tr>
                                    <th className="p-4">Cód.</th>
                                    <th className="p-4">Máquina</th>
                                    <th className="p-4">Status</th>
                                    <th className="p-4 text-right">Ação</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {maquinasFiltradas.map(m => (
                                    <tr key={m.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="p-4 font-mono text-xs text-gray-400 font-bold">{m.id}</td>
                                        <td className="p-4 font-black text-gray-800">{m.nome}</td>
                                        <td className="p-4">
                                            <span className={`px-2.5 py-1 text-[10px] font-black uppercase tracking-wider rounded border ${getStatusColor(m.status)}`}>
                                                {m.status}
                                            </span>
                                        </td>
                                        <td className="p-4 text-right">
                                            {m.status === 'ESTRAGADA' && (
                                                <button className="text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-lg font-bold hover:bg-emerald-100 border border-emerald-200 text-xs inline-flex items-center gap-1.5 transition-colors shadow-sm">
                                                    <CheckCircle2 size={14} /> Consertada
                                                </button>
                                            )}
                                            {m.status === 'DISPONIVEL' && (
                                                <div className="flex justify-end gap-2">
                                                    <button className="text-red-700 bg-red-50 px-3 py-1.5 rounded-lg font-bold hover:bg-red-100 border border-red-200 text-xs inline-flex items-center gap-1.5 transition-colors shadow-sm">
                                                        <Hammer size={14} /> Oficina
                                                    </button>
                                                    {/* Permissão Condicional Visual */}
                                                    {user.role === 'DONO' ? (
                                                        <button className="text-blue-700 bg-blue-50 px-3 py-1.5 rounded-lg font-bold hover:bg-blue-100 border border-blue-200 text-xs transition-colors shadow-sm">
                                                            Transferir
                                                        </button>
                                                    ) : (
                                                        <button className="text-orange-700 bg-orange-50 px-3 py-1.5 rounded-lg font-bold hover:bg-orange-100 border border-orange-200 text-xs transition-colors shadow-sm">
                                                            Solicitar Envio
                                                        </button>
                                                    )}
                                                </div>
                                            )}
                                            {m.status === 'ALUGADA' && (
                                                <span className="text-gray-400 text-[10px] font-bold uppercase tracking-wider">Em uso</span>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    {maquinasFiltradas.length === 0 && (
                        <div className="p-10 text-center flex flex-col items-center justify-center text-gray-400">
                            <Wrench size={48} className="mb-3 opacity-20" />
                            <p className="font-bold text-gray-500">Nenhuma máquina encontrada neste filtro.</p>
                        </div>
                    )}
                </div>
            </div>
        );
    };

    const ClientesView = () => {
        const clientesFiltrados = MOCK_CLIENTS.filter(c => c.loja === currentStore);

        return (
            <div className="space-y-6 animate-in fade-in duration-300">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                        <h2 className="text-2xl font-black text-gray-800 tracking-tight">Clientes</h2>
                        <p className="text-sm text-gray-500 mt-1 font-medium">Cadastros de: {currentStore}</p>
                    </div>
                    <button className="bg-zinc-900 text-white px-4 py-2.5 rounded-xl text-sm font-bold shadow-md hover:bg-zinc-800 flex items-center gap-2 w-full sm:w-auto justify-center">
                        <PlusCircle size={18} /> Novo Cliente
                    </button>
                </div>

                <div className="relative shadow-sm">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                    <input
                        type="text"
                        placeholder="Buscar por nome ou CPF..."
                        className="w-full pl-12 pr-4 py-3.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-zinc-900 focus:border-zinc-900 outline-none text-sm font-medium transition-shadow"
                    />
                </div>

                <div className="grid gap-3">
                    {clientesFiltrados.map(c => (
                        <div key={c.id} className="bg-white border border-gray-200 p-5 rounded-xl shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-zinc-400 transition-colors">
                            <div className="space-y-1.5">
                                <div className="flex items-center gap-2 mb-2">
                                    <h3 className="font-black text-gray-900 text-lg">{c.nome}</h3>
                                    <span className="px-2 py-0.5 bg-gray-100 text-gray-500 text-[10px] font-mono font-bold rounded border border-gray-200">{c.doc}</span>
                                </div>
                                <div className="flex items-center gap-2 text-sm text-gray-600 font-medium">
                                    <Phone size={14} className="text-gray-400" /> {c.fone}
                                </div>
                                <div className="text-xs text-gray-500 font-medium flex items-center gap-2">
                                    <MapPin size={14} className="text-gray-400 shrink-0" /> {c.endereco}
                                </div>
                            </div>

                            <div className="flex flex-row sm:flex-col gap-2 border-t sm:border-t-0 pt-4 sm:pt-0 border-gray-100">
                                <button className="flex-1 sm:flex-none text-center text-zinc-700 bg-zinc-100 hover:bg-zinc-200 px-4 py-2.5 rounded-lg font-extrabold text-xs transition-colors border border-zinc-200">
                                    Histórico
                                </button>
                                <button onClick={() => setActiveTab('novo_pedido')} className="flex-1 sm:flex-none text-center text-emerald-700 bg-emerald-50 hover:bg-emerald-100 px-4 py-2.5 rounded-lg font-extrabold text-xs transition-colors border border-emerald-200 shadow-sm">
                                    Alugar
                                </button>
                            </div>
                        </div>
                    ))}
                    {clientesFiltrados.length === 0 && (
                        <div className="p-8 text-center text-gray-500 font-medium bg-white rounded-xl border border-gray-200">
                            Nenhum cliente cadastrado nesta filial ainda.
                        </div>
                    )}
                </div>
            </div>
        );
    };

    // ==========================================
    // COMPONENTES REUTILIZÁVEIS: MENU / SELETOR
    // ==========================================
    const NAV_ITEMS = [
        { id: 'dashboard', label: 'Resumo', icon: Home },
        { id: 'novo_pedido', label: 'Alugar', icon: PlusCircle },
        { id: 'maquinas', label: 'Estoque', icon: Wrench },
        { id: 'clientes', label: 'Clientes', icon: Users },
    ];

    const StoreSelector = () => {
        if (user.role === 'DONO') {
            return (
                <div className="relative group cursor-pointer w-full">
                    <select
                        value={currentStore}
                        onChange={(e) => setCurrentStore(e.target.value)}
                        className="w-full appearance-none bg-zinc-800 text-emerald-400 text-xs font-mono font-bold py-2 px-3 pr-8 rounded-lg border border-zinc-700 focus:outline-none focus:border-emerald-500 cursor-pointer"
                    >
                        {STORES.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                    <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none" />
                </div>
            );
        }
        return (
            <div className="bg-zinc-800 text-zinc-400 text-xs font-mono font-bold py-2 px-3 rounded-lg border border-zinc-700 flex items-center gap-2">
                <Lock size={12} className="text-zinc-500" /> {currentStore}
            </div>
        );
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col md:flex-row font-sans selection:bg-zinc-200">

            {/* SIDEBAR (Desktop) */}
            <aside className="hidden md:flex flex-col w-64 bg-white border-r border-gray-200 fixed h-full z-10 shadow-sm">
                <div className="p-6 border-b border-gray-100 bg-zinc-900 text-white flex flex-col gap-4">
                    <div>
                        <h1 className="text-2xl font-black tracking-tight">LF <span className="font-light text-zinc-400">Aluguel</span></h1>
                        <div className="mt-2"><StoreSelector /></div>
                    </div>
                    <div className="flex items-center gap-3 pt-4 border-t border-zinc-800">
                        <div className="w-10 h-10 bg-zinc-800 rounded-full flex items-center justify-center font-black text-emerald-400 border border-zinc-700">
                            {user.name.charAt(0)}
                        </div>
                        <div>
                            <p className="text-sm font-bold text-white leading-tight">{user.name}</p>
                            <p className="text-[10px] text-zinc-400 font-mono uppercase tracking-widest">{user.role}</p>
                        </div>
                    </div>
                </div>

                <nav className="flex-1 p-4 space-y-2 mt-2 overflow-y-auto">
                    {NAV_ITEMS.map(item => (
                        <button
                            key={item.id}
                            onClick={() => setActiveTab(item.id)}
                            className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl text-sm font-extrabold transition-all ${activeTab === item.id
                                    ? 'bg-zinc-900 text-white shadow-md'
                                    : 'text-gray-500 hover:bg-gray-100 hover:text-zinc-900'
                                }`}
                        >
                            <item.icon size={20} className={activeTab === item.id ? 'text-white' : 'text-gray-400'} />
                            {item.label}
                        </button>
                    ))}
                </nav>

                <div className="p-4 border-t border-gray-100">
                    <button onClick={doLogout} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold text-gray-500 hover:bg-red-50 hover:text-red-700 transition-colors">
                        <LogOut size={20} /> Sair do Sistema
                    </button>
                </div>
            </aside>

            {/* HEADER MOBILE */}
            <header className="md:hidden bg-zinc-900 text-white p-4 sticky top-0 z-20 shadow-md">
                <div className="flex justify-between items-center mb-3">
                    <h1 className="text-xl font-black">LF <span className="font-light text-zinc-400">Aluguel</span></h1>
                    <div className="flex items-center gap-3">
                        <div className="text-right hidden sm:block">
                            <p className="text-xs font-bold text-white">{user.name}</p>
                            <p className="text-[9px] text-zinc-400 font-mono uppercase">{user.role}</p>
                        </div>
                        <button onClick={doLogout} className="w-8 h-8 bg-zinc-800 rounded-full flex items-center justify-center text-zinc-400 hover:bg-red-900 hover:text-red-200 transition-colors border border-zinc-700">
                            <LogOut size={14} />
                        </button>
                    </div>
                </div>
                <StoreSelector />
            </header>

            {/* CONTEÚDO PRINCIPAL */}
            <main className="flex-1 md:ml-64 p-4 sm:p-8 pb-24 md:pb-8 w-full max-w-5xl mx-auto">
                {activeTab === 'dashboard' && <DashboardView />}
                {activeTab === 'novo_pedido' && <NovoPedidoView />}
                {activeTab === 'maquinas' && <EstoqueView />}
                {activeTab === 'clientes' && <ClientesView />}
            </main>

            {/* BOTTOM NAVIGATION (Mobile) */}
            <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 pb-safe z-20 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
                <div className="flex justify-around items-center h-16 px-2">
                    {NAV_ITEMS.map(item => (
                        <button
                            key={item.id}
                            onClick={() => setActiveTab(item.id)}
                            className={`flex flex-col items-center justify-center w-full h-full space-y-1 rounded-xl transition-all ${activeTab === item.id ? 'text-zinc-900' : 'text-gray-400 hover:text-gray-500'
                                }`}
                        >
                            <div className={`p-1.5 rounded-full ${activeTab === item.id ? 'bg-zinc-100 scale-110' : ''} transition-transform`}>
                                <item.icon size={22} strokeWidth={activeTab === item.id ? 2.5 : 2} />
                            </div>
                            <span className={`text-[9px] uppercase tracking-wider ${activeTab === item.id ? 'font-black' : 'font-bold'}`}>
                                {item.label}
                            </span>
                        </button>
                    ))}
                </div>
            </nav>

        </div>
    );
}