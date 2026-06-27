import { useState } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { testAdminTuning } from "../../api/admin";

export default function AdminTuningLabPage() {
  const { getIdToken } = useAuth();
  const [image, setImage] = useState(null);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const onFile = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setImage(reader.result);
    reader.readAsDataURL(file);
  };

  const run = async () => {
    if (!image) return;
    setLoading(true);
    setError(null);
    try {
      const idToken = await getIdToken();
      const data = await testAdminTuning(idToken, { image });
      setResult(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-fg">Banc de test tuning</h2>
      <input type="file" accept="image/*" onChange={onFile} />
      <button
        type="button"
        disabled={!image || loading}
        onClick={run}
        className="rounded-xl bg-accent px-4 py-2 text-sm text-white disabled:opacity-50"
      >
        Tester
      </button>
      {error && <p className="text-sm text-red-300">{error}</p>}
      {result?.imageUrl && (
        <img
          src={result.imageUrl}
          alt="Résultat test"
          className="max-w-md rounded-xl"
        />
      )}
      {result?.falParams && (
        <pre className="rounded-xl bg-elevated p-4 text-xs text-fg-muted">
          {JSON.stringify(result.falParams, null, 2)}
        </pre>
      )}
    </div>
  );
}
