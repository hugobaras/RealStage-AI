import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { fetchAdminAgencies } from "../../api/admin";

export default function AdminAgenciesPage() {
  const { getIdToken } = useAuth();
  const [agencies, setAgencies] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        const idToken = await getIdToken();
        const data = await fetchAdminAgencies(idToken);
        setAgencies(data.agencies);
      } catch (err) {
        setError(err.message);
      }
    })();
  }, [getIdToken]);

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-fg">Agences</h2>
      {error && <p className="text-sm text-red-300">{error}</p>}
      <div className="surface-card overflow-hidden rounded-2xl">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-line/80 bg-elevated/40 text-fg-muted">
            <tr>
              <th className="px-4 py-3">Nom</th>
              <th className="px-4 py-3">Owner</th>
              <th className="px-4 py-3">Membres</th>
              <th className="px-4 py-3">Biens</th>
            </tr>
          </thead>
          <tbody>
            {agencies.map((a) => (
              <tr key={a.id} className="border-b border-line/40">
                <td className="px-4 py-3 font-medium text-fg">{a.name}</td>
                <td className="px-4 py-3">
                  <Link
                    to={`/admin/users/${a.ownerUid}`}
                    className="text-accent-light hover:underline"
                  >
                    {a.ownerEmail ?? a.ownerUid}
                  </Link>
                </td>
                <td className="px-4 py-3 text-fg-muted">
                  {a.memberCount}/{a.seatLimit}
                </td>
                <td className="px-4 py-3 text-fg-muted">{a.propertyCount}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {agencies.length === 0 && (
          <p className="py-8 text-center text-sm text-fg-muted">
            Aucune agence.
          </p>
        )}
      </div>
    </div>
  );
}
