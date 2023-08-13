import type { Constructor } from "./constructor.type";
import { Service } from "./service";

export function autowire<K extends string, Interface, Implementation extends Interface>(
  service : Constructor<Implementation>,
  identifier : K,
  dependencies? : Array<PropertyKey>
) {
  return {
    [identifier as typeof identifier] :
    new Service<Interface, Implementation>(service, dependencies) 
  } as { [Key in K] : Service<Interface, Implementation>};
}