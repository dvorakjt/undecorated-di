export class UninitializedPropertyAccessError extends Error {
  name = 'UninitializedPropertyAccessed';

  constructor(message : any) {
    super(message);
  }
}