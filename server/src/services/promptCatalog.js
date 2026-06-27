function compileStylePrompts(definitions) {
  function buildInteriorAtmosphere({
    character,
    palette,
    materials,
    interiorFinish,
  }) {
    return `${character}. Color palette of ${palette}. ${materials}. ${interiorFinish}`;
  }

  function buildOutdoorAtmosphere({
    label,
    character,
    palette,
    materials,
    outdoorFurniture,
    outdoorFinish,
  }) {
    return (
      `Exact same ${label} style as the matching interior — identical palette of ${palette}, same ${materials}. ` +
      `${outdoorFurniture}. ${character}. ${outdoorFinish}`
    );
  }

  return Object.fromEntries(
    Object.entries(definitions).map(([key, def]) => [
      key,
      {
        label: def.label,
        palette: def.palette,
        atmosphere: buildInteriorAtmosphere(def),
        outdoorAtmosphere: buildOutdoorAtmosphere(def),
      },
    ]),
  );
}

let stylePrompts = null;
let outdoorOnlyStylePrompts = null;
let roomPrompts = null;
let outdoorRoomTypes = null;

export function getStylePrompts() {
  return stylePrompts;
}

export function getOutdoorOnlyStylePrompts() {
  return outdoorOnlyStylePrompts;
}

export function getRoomPrompts() {
  return roomPrompts;
}

export function getOutdoorRoomTypes() {
  return outdoorRoomTypes;
}

export function applyPromptCatalog({
  styleDefinitions = null,
  outdoorOnlyDefinitions = null,
  roomPromptOverrides = null,
  outdoorRoomTypeIds = null,
}) {
  stylePrompts =
    styleDefinitions && Object.keys(styleDefinitions).length > 0
      ? compileStylePrompts(styleDefinitions)
      : null;

  outdoorOnlyStylePrompts =
    outdoorOnlyDefinitions && Object.keys(outdoorOnlyDefinitions).length > 0
      ? outdoorOnlyDefinitions
      : null;

  roomPrompts =
    roomPromptOverrides && Object.keys(roomPromptOverrides).length > 0
      ? roomPromptOverrides
      : null;

  outdoorRoomTypes =
    Array.isArray(outdoorRoomTypeIds) && outdoorRoomTypeIds.length > 0
      ? new Set(outdoorRoomTypeIds)
      : null;
}

export function resetPromptCatalog() {
  stylePrompts = null;
  outdoorOnlyStylePrompts = null;
  roomPrompts = null;
  outdoorRoomTypes = null;
}

export { compileStylePrompts };
