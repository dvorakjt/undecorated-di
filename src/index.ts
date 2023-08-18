import { autowire } from "./autowire";
import { ContainerBuilder } from "./container-builder";

class ServiceA {
  c : ServiceC;
  private num = 2;

  constructor(c : ServiceC) {
    this.c = c;
  }

  addFromC() {
    console.log(this.num + this.c.getNum());
  }

  getNum() {
    return this.num;
  }
}

class ServiceB {
  a : ServiceA;
  private num = 3;

  constructor(a : ServiceA) {
    this.a = a;
  }

  addFromA() {
    console.log(this.num + this.a.getNum());
  }

  getNum() {
    return this.num;
  }
}

class ServiceC {
  b : ServiceB;
  private num = 4;

  constructor(b : ServiceB) {
    this.b = b;
  }

  addFromB() {
    console.log(this.num + this.b.getNum());
  }

  getNum() {
    return this.num;
  }
}

const sa = autowire<'ServiceA', ServiceA, ServiceA>(ServiceA, 'ServiceA', ['ServiceC']);
const sb = autowire<'ServiceB', ServiceB, ServiceB>(ServiceB, 'ServiceB', ['ServiceA']);
const sc = autowire<'ServiceC', ServiceC, ServiceC>(ServiceC, 'ServiceC', ['ServiceB']);

const container = ContainerBuilder.createContainerBuilder().registerSingletonService(sa).registerSingletonService(sb).registerSingletonService(sc).build();
container.services.ServiceA.addFromC();
container.services.ServiceB.addFromA();
container.services.ServiceC.addFromB();


export { autowire, ContainerBuilder };
