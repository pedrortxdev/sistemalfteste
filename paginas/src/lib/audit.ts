import { prisma } from "./prisma";

interface AuditParams {
  userId: string;
  action: string;
  entity: string;
  entityId: string;
  details?: string;
}

export async function createAuditLog({ userId, action, entity, entityId, details }: AuditParams) {
  try {
    await prisma.auditLog.create({
      data: {
        userId,
        action,
        entity,
        entityId,
        details,
      }
    });
  } catch (error) {
    console.error("Erro ao gravar log de auditoria:", error);
    // Não travamos a execução principal se o log falhar
  }
}
