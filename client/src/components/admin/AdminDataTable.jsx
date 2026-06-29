export default function AdminDataTable({
  columns,
  rows,
  rowKey,
  emptyMessage = "Aucune donnée.",
  loading = false,
  loadingRows = 5,
}) {
  if (loading) {
    return (
      <div className="space-y-2">
        {Array.from({ length: loadingRows }).map((_, i) => (
          <div
            key={i}
            className="surface-card h-24 animate-pulse rounded-xl bg-elevated/40 md:h-12"
          />
        ))}
      </div>
    );
  }

  if (!rows?.length) {
    return (
      <p className="rounded-xl border border-dashed border-line/80 px-4 py-8 text-center text-sm text-fg-muted">
        {emptyMessage}
      </p>
    );
  }

  return (
    <>
      <div className="space-y-2 md:hidden">
        {rows.map((row) => (
          <div
            key={rowKey(row)}
            className="surface-card space-y-2 rounded-xl p-4"
          >
            {columns.map((col) => (
              <div
                key={col.key}
                className="flex items-start justify-between gap-3 text-sm"
              >
                <span className="shrink-0 text-fg-muted">{col.label}</span>
                <span className="min-w-0 text-right text-fg">
                  {col.render ? col.render(row) : row[col.key]}
                </span>
              </div>
            ))}
          </div>
        ))}
      </div>

      <div className="surface-card hidden overflow-hidden rounded-2xl md:block">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead className="border-b border-line/80 bg-elevated/40 text-fg-muted">
              <tr>
                {columns.map((col) => (
                  <th key={col.key} className="px-4 py-3 font-medium">
                    {col.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr
                  key={rowKey(row)}
                  className="border-b border-line/40 hover:bg-elevated/30"
                >
                  {columns.map((col) => (
                    <td key={col.key} className="px-4 py-3 text-fg-muted">
                      {col.render ? col.render(row) : row[col.key]}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
