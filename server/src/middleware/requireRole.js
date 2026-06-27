const ADMIN_ROLES = ["super_admin", "support", "readonly"];

export function resolveAdminRole(user) {
  if (!user) return null;
  if (user.role && ADMIN_ROLES.includes(user.role)) return user.role;
  if (user.admin === true) return "super_admin";
  return null;
}

export function requireRole(...allowedRoles) {
  return (req, res, next) => {
    const role = resolveAdminRole(req.user);
    if (!role) {
      return res.status(403).json({ error: "Accès administrateur requis." });
    }
    if (allowedRoles.length && !allowedRoles.includes(role)) {
      return res.status(403).json({ error: "Permissions insuffisantes." });
    }
    req.adminRole = role;
    return next();
  };
}

export function isReadOnlyAdmin(role) {
  return role === "readonly";
}
