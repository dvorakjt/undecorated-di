import { Service } from "./service";
import type { Constructor } from "./constructor.type";

/**
 * @typeParam K - a unique key used to retrieve the autowired class. This should be be the type of a string literal.
 * @typeParam Interface - the interface / abstract class / class that you would like the returned instance to be typed as.
 * @typeParam Implementation - the type of the concrete class of the service.
 * @param service - The concrete class implmenting the generic type parameter Interface.
 * @param identifier - A string literal used to uniquely identify the class. Must be of type K.
 * @param dependencies - An array of string literals used to retrieve the dependencies of the class when the container instantiates it.
 * @returns { [K] : Service<Interface, Implementation> }
 * @example
 * ```ts
 *   interface Flyable {
 *     fly() : void;
 *   }
 *   const FlyableKey = 'Flyable';
 *   type FlyableKeyType = typeof FlyableKey;
 * 
 *   class Bird implements Flyable {
 *     fly() {
 *       console.log('The bird flaps its wings and soars into the air.');
 *     }
 *   }
 *   
 *
 *   const FlyableService = autowire<FlyableKeyType, Flyable, Bird>(Bird, FlyableKey); 
 * 
 *   //If registered to a container, will be retrieved as type Flyable
 *   export default FlyableService;
 * ```
 */
export function autowire<
  K extends string,
  Interface,
  Implementation extends Interface,
>(
  service: Constructor<Implementation>,
  identifier: K,
  dependencies?: Array<string>,
) {
  return {
    [identifier as typeof identifier]: new Service<Interface, Implementation>(
      service,
      dependencies,
    ),
  } as { [Key in K]: Service<Interface, Implementation> };
}
