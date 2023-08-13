export function mergeDictionaries<CurrentMapType, NewMapType>(currentMap : CurrentMapType, newMap : NewMapType) {
  return {...currentMap, ...newMap};
}