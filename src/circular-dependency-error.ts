export class CircularDependencyError extends Error {
  name = "CircularDependencyError";

  constructor(message?: string) {
    super(message);
  }
}
