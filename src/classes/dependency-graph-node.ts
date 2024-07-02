export class DependencyGraphNode<K> {
  keyName: K;
  isSingleton: boolean;
  parent?: DependencyGraphNode<any>;

  constructor(
    keyName: K,
    isSingleton: boolean,
    parent?: DependencyGraphNode<any>
  ) {
    this.keyName = keyName;
    this.isSingleton = isSingleton;
    this.parent = parent;
  }
}
