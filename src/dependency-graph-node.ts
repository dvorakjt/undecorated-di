export class DependencyGraphNode<K> {
  serviceKey : K;
  isSingleton : boolean;
  parent? : DependencyGraphNode<any>;
  
  constructor(serviceKey : K, isSingleton : boolean, parent? : DependencyGraphNode<any>) {
    this.serviceKey = serviceKey;
    this.isSingleton = isSingleton;
    this.parent = parent;
  }
}