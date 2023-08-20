export interface DependencyArrayBearer<ServicesDictionary> {
  dependencies : Array<keyof ServicesDictionary>;
}