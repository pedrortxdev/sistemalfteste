type Permission =
    | "cities:manage"
    | "users:manage"
    | "clients:write"
    | "machines:write"
    | "machines:transfer"
    | "transfers:request"
    | "transfers:approve"
    | "orders:create"
    | "orders:cancel"
    | "maintenance:write"
    | "cashflow:write"
    | "cashflow:read"
    | "nfe:view"
    | "nfe:config"
    | "reports:view"
    | "export:csv";

const ROLE_PERMISSIONS: Record<string, Permission[]> = {
    DONO: [/* todas — verificado via shortcut */],
    OPERADOR: [
        "clients:write",
        "machines:write",
        "transfers:request",
        "orders:create",
        "orders:cancel",
        "maintenance:write",
        "cashflow:write",
        "cashflow:read",
        "nfe:view",
        "reports:view",
        "export:csv",
    ],
};

export function hasPermission(role: string, permission: Permission): boolean {
    if (role === "DONO") return true;  // DONO tem acesso a tudo
    return ROLE_PERMISSIONS[role]?.includes(permission) ?? false;
}

export function isDono(role: string): boolean {
    return role === "DONO";
}
