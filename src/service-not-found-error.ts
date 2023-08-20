export class ServiceNotFoundError extends Error {
  name = 'ServiceNotFoundError';

  constructor(message : any) {
    super(message);
  }
}