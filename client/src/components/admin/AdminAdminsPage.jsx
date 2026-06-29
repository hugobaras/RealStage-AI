import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { fetchAdminAdmins } from "../../api/admin";
import AdminDataTable from "./AdminDataTable";

export default function AdminAdminsPage() {
  const { getIdToken } = useAuth();
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const idToken = await getIdToken();
        const data = await fetchAdminAdmins(idToken);
        setAdmins(data.admins);
      } finally {
        setLoading(false);
      }
    })();
  }, [getIdToken]);

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-fg md:text-2xl">Administrateurs</h2>
      <p className="text-sm text-fg-muted">
        Historique des grants : voir le{" "}
        <Link to="/admin/audit" className="text-accent-light hover:underline">
          journal d&apos;audit
        </Link>
        .
      </p>
      <AdminDataTable
        loading={loading}
        rows={admins}
        rowKey={(a) => a.uid}
        emptyMessage="Aucun administrateur."
        columns={[
          {
            key: "email",
            label: "E-mail",
            render: (a) => (
              <Link
                to={`/admin/users/${a.uid}`}
                className="text-accent-light hover:underline"
              >
                {a.email ?? a.uid}
              </Link>
            ),
          },
          {
            key: "role",
            label: "Rôle",
            render: (a) => <span className="capitalize">{a.role}</span>,
          },
          {
            key: "uid",
            label: "UID",
            render: (a) => <span className="text-xs">{a.uid}</span>,
          },
        ]}
      />
    </div>
  );
}
