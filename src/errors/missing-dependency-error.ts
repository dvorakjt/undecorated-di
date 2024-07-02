import type { DependencyGraphNode } from "../classes";

export class MissingDependencyError extends Error {
  name = "MissingDependencyError";

  constructor(node: DependencyGraphNode<string>) {
    super(MissingDependencyError.getMessage(node));
  }

  private static getMessage(node: DependencyGraphNode<string>) {
    return `Service with key ${
      node.keyName
    } not found. Dependency graph is ${this.buildDependencyGraph(node)}.`;
  }

  private static buildDependencyGraph(node: DependencyGraphNode<string>) {
    const serviceKeys: Array<any> = [];
    serviceKeys.push(node.keyName);
    while (node.parent) {
      node = node.parent;
      serviceKeys.push(node.keyName);
    }
    serviceKeys.reverse();
    return serviceKeys.join("-->");
  }
}
