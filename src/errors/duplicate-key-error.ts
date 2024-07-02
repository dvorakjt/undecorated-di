export class DuplicateKeyError extends Error {
  name = "DuplicateKeyError";

  public constructor(keyName: string) {
    super(`"${keyName}" is already assigned.`);
  }
}
