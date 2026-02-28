import { auth } from "@/lib/auth";
import { isDono } from "@/lib/permissions";
import { redirect } from "next/navigation";
import { getAuditLogs } from "../actions";

export default async function AuditLogPage() {
  const session = await auth();
  if (!session || !isDono(session.user.role)) {
    redirect("/dashboard");
  }

  const logs = await getAuditLogs();

  return (
    <div className="p-4 md:p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Log de Auditoria</h1>
        <p className="text-sm text-gray-500">Últimas 100 ações críticas</p>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-3 font-semibold text-gray-700">Data/Hora</th>
              <th className="px-6 py-3 font-semibold text-gray-700">Usuário</th>
              <th className="px-6 py-3 font-semibold text-gray-700">Ação</th>
              <th className="px-6 py-3 font-semibold text-gray-700">Entidade</th>
              <th className="px-6 py-3 font-semibold text-gray-700">Detalhes</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {logs.map((log) => (
              <tr key={log.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4 text-gray-600 whitespace-nowrap">
                  {new Date(log.timestamp).toLocaleString()}
                </td>
                <td className="px-6 py-4">
                  <div className="font-medium text-gray-900">{log.user.name}</div>
                  <div className="text-xs text-gray-500">{log.user.email}</div>
                </td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getActionColor(log.action)}`}>
                    {log.action}
                  </span>
                </td>
                <td className="px-6 py-4 text-gray-600">{log.entity}</td>
                <td className="px-6 py-4 text-gray-500 max-w-xs truncate" title={log.details || ""}>
                  {log.details}
                </td>
              </tr>
            ))}
            {logs.length === 0 && (
              <tr>
                <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                  Nenhum log registrado ainda.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function getActionColor(action: string) {
  switch (action) {
    case "CREATE": return "bg-green-100 text-green-700";
    case "UPDATE": return "bg-blue-100 text-blue-700";
    case "DELETE": return "bg-red-100 text-red-700";
    case "STATUS_CHANGE": return "bg-yellow-100 text-yellow-700";
    default: return "bg-gray-100 text-gray-700";
  }
}
