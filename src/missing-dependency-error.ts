export class MissingDependencyError extends Error {
  name = "MissingDependencyError";

  constructor(message?: string) {
    super(message);
  }
}
