/** Surfaces types indicatives par type de pièce (m²). */
export const ROOM_TYPICAL_SQM = {
  salon: 25,
  chambre: 14,
  cuisine: 12,
  salle_a_manger: 16,
  bureau: 10,
  salle_de_bain: 6,
  entree: 8,
  couloir: 6,
  chambre_enfant: 12,
  chambre_bebe: 10,
  dressing: 8,
  suite_parentale: 22,
  studio: 28,
  cuisine_ouverte: 35,
  open_space: 45,
};

export const SQM_PRESETS = [12, 18, 25, 35, 50];

export function getTypicalSqm(roomType) {
  return ROOM_TYPICAL_SQM[roomType] ?? 20;
}
