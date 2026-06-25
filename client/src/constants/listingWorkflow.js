export const DEFAULT_STEPS = [
  { id: "import", label: "Importer" },
  { id: "configure", label: "Configurer" },
  { id: "generate", label: "Générer" },
  { id: "next", label: "Enchaîner" },
];

export const LISTING_STEPS = [
  { id: "import", label: "Importer" },
  { id: "classify", label: "Classer" },
  { id: "generate", label: "Générer" },
  { id: "compare", label: "Comparer" },
  { id: "export", label: "Exporter" },
];

export const ESSENTIAL_ROOMS = ["salon", "chambre", "cuisine", "sdb", "entree"];

export function getDefaultActiveStep({ hasImage, hasResult, loading }) {
  if (loading) return "generate";
  if (hasResult) return "next";
  if (hasImage) return "configure";
  return "import";
}

export function getListingActiveStep({
  hasImage,
  hasResult,
  loading,
  activeVariants,
  exporting,
  essentialDone,
  essentialTotal,
}) {
  if (exporting) return "export";
  if (activeVariants?.length >= 2) return "compare";
  if (loading) return "generate";
  if (hasResult) {
    if (essentialDone >= essentialTotal) return "export";
    return "classify";
  }
  if (hasImage) return "classify";
  return "import";
}

export function countEssentialDone(roomStatus) {
  return ESSENTIAL_ROOMS.filter((id) => roomStatus[id] === "done").length;
}

export function buildRoomStatus({
  history,
  photoQueue,
  roomType,
  roomProgress,
}) {
  const status = { ...(roomProgress ?? {}) };

  for (const entry of history) {
    if (entry.roomType) status[entry.roomType] = "done";
  }

  if (roomType && status[roomType] !== "done") {
    status[roomType] = hasQueuedOrCurrent(roomType, photoQueue)
      ? "queued"
      : (status[roomType] ?? "missing");
  }

  for (const room of ESSENTIAL_ROOMS) {
    if (!status[room]) status[room] = "missing";
  }

  return status;
}

function hasQueuedOrCurrent(roomType, photoQueue) {
  return photoQueue?.length > 0;
}

export function getNextEssentialRoom(roomStatus) {
  return ESSENTIAL_ROOMS.find((id) => roomStatus[id] !== "done") ?? null;
}
