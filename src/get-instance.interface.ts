/**
 * used by Container to type check whether or not a service in its servicesTemplate object has a getInstance property. This allows Container to infer the ReturnType of each service.getInstance property, and thus return an explicitly typed instance when that property is accessed on Container.services.
 */
export interface Instantiable {
  getInstance(args: any): any;
}
