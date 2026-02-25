import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";

export default async function DashboardPage() {
    return (
        <div className="p-4 md:p-8 space-y-6 max-w-5xl mx-auto">
            <div>
                <h2 className="text-2xl font-black text-gray-900 tracking-tight">Resumo Operacional</h2>
                <p className="text-sm font-semibold text-gray-500 mt-1">Acompanhe os indicadores e componentes base do seu negócio.</p>
            </div>

            {/* Teste UI de Componentes Base */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                <Card>
                    <CardHeader>
                        <CardTitle className="flex justify-between items-center">
                            <span>Status dos Equipamentos</span>
                            <Badge variant="success">Online</Badge>
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex flex-wrap gap-2">
                            <Badge variant="info">40 Disponíveis</Badge>
                            <Badge variant="warning">12 Em Uso</Badge>
                            <Badge variant="danger">3 Em Manutenção</Badge>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Teste de UI (Botoes & Inputs)</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex flex-wrap gap-3">
                            <Button variant="primary">Principal</Button>
                            <Button variant="secondary">Secundário</Button>
                            <Button variant="danger">Perigo</Button>
                            <Button variant="ghost">Fantasma</Button>
                        </div>
                        <div className="space-y-3 pt-4 border-t border-gray-100">
                            <Input label="Exemplo de Input" placeholder="Digite algo aqui..." />
                            <Select
                                label="Exemplo de Select"
                                options={[
                                    { value: "1", label: "Opção Alpha" },
                                    { value: "2", label: "Opção Beta" }
                                ]}
                            />
                        </div>
                    </CardContent>
                </Card>

            </div>
        </div>
    );
}
