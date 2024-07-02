export class CircularDependencyError extends Error {
  name = "CircularDependencyError";

  constructor(keyName: string) {
    super(
      `A circular dependency was found when resolving "${keyName}." All members of a dependency cycle must be singletons.`
    );
  }
}
