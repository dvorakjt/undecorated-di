export class UninitializedPropertyAccessError extends Error {
  name = "UninitializedPropertyAccessed";

  constructor() {
    super(
      "A singleton that is part of a dependency cycle accessed a property of another member of that cycle in its constructor before the cycle could be resolved."
    );
  }
}
