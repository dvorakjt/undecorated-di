export class MissingInjectableError extends Error {
  name = "MissingInjectableError";

  constructor(keyName: string) {
    super(
      `Injectable with key name "${keyName}" not found. Was it registered?`
    );
  }
}
