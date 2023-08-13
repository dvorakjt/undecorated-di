export function mergeDictionaries<CurrentMapType, NewMapType>(
  currentMap: CurrentMapType,
  newMap: NewMapType,
) {
  if (typeof currentMap !== "object" || typeof newMap !== "object")
    throw new Error(
      "mergeDictionaries() expected to receive arguments of type object, object. Received " +
        typeof currentMap +
        ", " +
        typeof newMap,
    );
  return { ...currentMap, ...newMap };
}
