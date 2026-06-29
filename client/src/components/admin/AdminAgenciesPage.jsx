import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { fetchAdminAgencies } from "../../api/admin";
import AdminDataTable from "./AdminDataTable";

export default function AdminAgenciesPage() {
  const { getIdToken } = useAuth();
  const [agencies, setAgencies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        const idToken = await getIdToken();
        const data = await fetchAdminAgencies(idToken);
        setAgencies(data.agencies);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    })();
  }, [getIdToken]);

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-fg md:text-2xl">Agences</h2>
      {error && <p className="text-sm text-red-300">{error}</p>}
      <AdminDataTable
        loading={loading}
        rows={agencies}
        rowKey={(a) => a.id}
        emptyMessage="Aucune agence."
        columns={[
          {
            key: "name",
            label: "Nom",
            render: (a) => <span className="font-medium text-fg">{a.name}</span>,
          },
          {
            key: "owner",
            label: "Owner",
            render: (a) => (
              <Link
                to={`/admin/users/${a.ownerUid}`}
                className="text-accent-light hover:underline"
              >
                {a.ownerEmail ?? a.ownerUid}
              </Link>
            ),
          },
          {
            key: "members",
            label: "Membres",
            render: (a) => `${a.memberCount}/${a.seatLimit}`,
          },
          {
            key: "properties",
            label: "Biens",
            render: (a) => a.propertyCount,
          },
        ]}
      />
    </div>
  );
}
