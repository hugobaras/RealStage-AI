import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { fetchAdminAdmins } from "../../api/admin";

export default function AdminAdminsPage() {
  const { getIdToken } = useAuth();
  const [admins, setAdmins] = useState([]);

  useEffect(() => {
    (async () => {
      const idToken = await getIdToken();
      const data = await fetchAdminAdmins(idToken);
      setAdmins(data.admins);
    })();
  }, [getIdToken]);

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-fg">Administrateurs</h2>
      <p className="text-sm text-fg-muted">
        Historique des grants : voir le{" "}
        <Link to="/admin/audit" className="text-accent-light hover:underline">
          journal d&apos;audit
        </Link>
        .
      </p>
      <div className="surface-card overflow-hidden rounded-2xl">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-line/80 bg-elevated/40 text-fg-muted">
            <tr>
              <th className="px-4 py-3">E-mail</th>
              <th className="px-4 py-3">Rôle</th>
              <th className="px-4 py-3">UID</th>
            </tr>
          </thead>
          <tbody>
            {admins.map((a) => (
              <tr key={a.uid} className="border-b border-line/40">
                <td className="px-4 py-3">
                  <Link
                    to={`/admin/users/${a.uid}`}
                    className="text-accent-light hover:underline"
                  >
                    {a.email ?? a.uid}
                  </Link>
                </td>
                <td className="px-4 py-3 capitalize text-fg-muted">{a.role}</td>
                <td className="px-4 py-3 text-xs text-fg-subtle">{a.uid}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
