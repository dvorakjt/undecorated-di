import { DependencyGraphNode } from "./dependency-graph-node";

function buildDependencyGraph(node : DependencyGraphNode<any>) {
  const serviceKeys : Array<any> = [];
  serviceKeys.push(node.serviceKey);
  while(node.parent) {
    node = node.parent;
    serviceKeys.push(node.serviceKey)
  }
  serviceKeys.reverse();
  return serviceKeys.join('-->');
}

export const ErrorMessages = {
  CIRCULAR_DEPENDENCY_ERROR : (serviceKey : any) => `Service with key '${serviceKey}' found its own key in its inherited dependency graph. This indicates a dependency cycle. Because transient-scope services were detected in the cycle, the dependency cycle cannot be resolved. Either ensure that all services in the cycle are registered as singletons, or restructure your dependency graph such that there are no longer circular dependencies.`,
  MISSING_DEPENDENCY_ERROR : (serviceKey : any) => `Service with key ${serviceKey} not found.`,
  MISSING_DEPENDENCY_ERROR_WITH_DEPENDENCY_GRAPH : <K>(node : DependencyGraphNode<K>) => {
    return `Service with key ${node.serviceKey} not found. Dependency graph is ${buildDependencyGraph(node)}.`
  }
}