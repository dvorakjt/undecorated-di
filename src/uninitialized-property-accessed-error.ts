export class UninitializedPropertyAccessedError extends Error {
  name = 'UninitializedPropertyAccessed';

  constructor(message : any) {
    super(message);
  }
}