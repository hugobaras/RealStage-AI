import { useEffect, useState } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { fetchAdminConfig, updateAdminConfig } from "../../api/admin";

export default function AdminPlansForm({ onSaved }) {
  const { getIdToken } = useAuth();
  const [plans, setPlans] = useState([]);
  const [trialLimit, setTrialLimit] = useState(3);
  const [message, setMessage] = useState(null);

  useEffect(() => {
    (async () => {
      const idToken = await getIdToken();
      const data = await fetchAdminConfig(idToken, "plans");
      setPlans(data.plans?.items ?? []);
      setTrialLimit(data.plans?.trialLimit ?? 3);
    })();
  }, [getIdToken]);

  const updatePlan = (index, field, value) => {
    setPlans((prev) =>
      prev.map((p, i) => (i === index ? { ...p, [field]: value } : p)),
    );
  };

  const save = async () => {
    const idToken = await getIdToken();
    await updateAdminConfig(idToken, "plans", { items: plans, trialLimit });
    setMessage("Forfaits enregistrés.");
    onSaved?.();
  };

  return (
    <div className="space-y-4">
      {message && <p className="text-sm text-emerald-300">{message}</p>}
      <label className="block text-sm text-fg-muted">
        Limite essai
        <input
          type="number"
          value={trialLimit}
          onChange={(e) => setTrialLimit(Number(e.target.value))}
          className="ml-2 w-20 rounded border border-line bg-elevated px-2 py-1 text-fg"
        />
      </label>
      {plans.map((plan, i) => (
        <div key={plan.id} className="surface-card space-y-2 rounded-xl p-4">
          <p className="font-semibold capitalize text-fg">{plan.id}</p>
          <input
            value={plan.label ?? ""}
            onChange={(e) => updatePlan(i, "label", e.target.value)}
            placeholder="Label"
            className="w-full rounded border border-line bg-elevated px-2 py-1 text-sm text-fg"
          />
          <input
            type="number"
            value={plan.priceMonthly ?? ""}
            onChange={(e) =>
              updatePlan(i, "priceMonthly", Number(e.target.value))
            }
            placeholder="Prix/mois"
            className="w-full rounded border border-line bg-elevated px-2 py-1 text-sm text-fg"
          />
          <input
            value={plan.stripePriceId ?? ""}
            onChange={(e) => updatePlan(i, "stripePriceId", e.target.value)}
            placeholder="Stripe Price ID"
            className="w-full rounded border border-line bg-elevated px-2 py-1 text-sm text-fg"
          />
          <input
            type="number"
            value={plan.generationsPerMonth ?? ""}
            onChange={(e) =>
              updatePlan(
                i,
                "generationsPerMonth",
                e.target.value ? Number(e.target.value) : null,
              )
            }
            placeholder="Générations/mois"
            className="w-full rounded border border-line bg-elevated px-2 py-1 text-sm text-fg"
          />
        </div>
      ))}
      <button
        type="button"
        onClick={save}
        className="rounded-xl bg-accent px-4 py-2 text-sm text-white"
      >
        Enregistrer les forfaits
      </button>
    </div>
  );
}
