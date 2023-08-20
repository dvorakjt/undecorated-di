# undecorated-di

Type-safe, straightforward dependency injection for object-oriented programming using ES6 classes and TypeScript interfaces/abstract classes/types--without annotations or reflect-metadata.

![test](https://github.com/dvorakjt/undecorated-di/actions/workflows/test.yml/badge.svg) 

## Installation

```
npm i undecorated-di
```

## Use

Define interfaces for your services.

```
//flyable.interface.ts

export interface Flyable {
  fly() : void;
}

export const FlyableKey = 'Flyable';

export type FlyableKeyType = typeof FlyableKey;

```

```
//logger.interface.ts

export interface Logger {
  log(message : any) : void;
}

export const LoggerKey = 'Logger';

export type LoggerKeyType = typeof LoggerKey;

```

Import these interfaces and implement them.

```
//bird.ts

import { autowire } from 'undecorated-di';
import { FlyableKey, type Flyable, type FlyableKeyType } from './flyable.interface';
import { LoggerKey, type Logger } from './logger.interface';

class Bird implements Flyable {
  constructor(private logger : Logger) {}

  fly() {
    this.logger.log('The bird flaps its wings and soars into the air.');
  }
}

export default autowire<FlyableKeyType, Flyable, Bird>(Bird, FlyableKey, [LoggerKey]);

```

Autowire is a generic function. The first generic type parameter is the type of the key you wish to associate the service class to. Here we are using 
the string literal 'Flyable' exported as FlyableKeyType from flyable.interface.ts. The second generic type parameter is the interface you wish the class
to be exposed as when it is retrieved from the container. This can be anything as long as the implementing class extends it. The third generic type parameter 
is the type of the class that you are registering as a service, or in other words, the class that implements the interface. 

The function takes 2-3 parameters. The first parameter is the class you wish to autowire. The second is the actual key you wish to register the class to. This should
be the same type as the first generic type parameter. The third parameter, which is optional, is a dependency array. Here, specify the keys of your dependencies.
Order matters here! You must specify them in the order that the constructor of the autowired class expects to receive them.

```
//plane.ts

import { autowire } from 'undecorated-di';
import { FlyableKey, type Flyable, type FlyableKeyType } from './flyable.interface';
import { LoggerKey, type Logger } from './logger.interface';

class Plane implements Flyable {
  constructor(private logger : Logger) {}

  fly() {
    this.logger.log('The pilot starts the engine, the propeller begins to spin, and the plane takes off.');
  }
}

export default autowire<FlyableKeyType, Flyable, Plane>(Plane, FlyableKey, [LoggerKey]);

```
```
//console-logger.ts

import { autowire } from 'undecorated-di';
import { LoggerKey, type Logger, type LoggerKeyType } from './logger.interface';

class ConsoleLogger implements Logger {
  log(message : any) {
    console.log(message);
  }
}

export default autowire<LoggerKeyType, Logger, ConsoleLogger>(ConsoleLogger, LoggerKey);

```

Register these classes to containers

```
//container-a.ts

import { ContainerBuilder } from 'undecorated-di';
import BirdService from './bird';
import ConsoleLoggerService from './console-logger';

const containerA = ContainerBuilder
  .createContainerBuilder()
  .registerTransientService(BirdService) //order does not matter, even if there are dependencies
  .registerTransientService(ConsoleLoggerService)
  .build();

export { containerA }; 

```
Another container. You can create as many as you need. Likely you will need one for src and one for testing.

```
//container-b.ts

import { ContainerBuilder } from 'undecorated-di';
import PlaneService from './plane';
import ConsoleLoggerService from './console-logger';

/* 
  Here, we register services as singletons. Only one instance of a singleton service is created per 
  container, even if it was first accessed indirectly by a dependent class.
*/

const containerB = ContainerBuilder
  .createContainerBuilder()
  .registerSingletonService(PlaneService) 
  .registerSingletonService(ConsoleLoggerService)
  .build();

export { containerB };

```
Import these containers and you will have access to the services you have registered. 

```
//some file, e.g. index.ts

import { containerA } from './container-a';

const iFly = containerA.services.Flyable; // returns a new instance of the class registered as Flyable

//iFly will be of type Flyable, but will call the concrete methods of its implementing class

iFly.fly(); //logs 'The bird flaps its wings and soars into the air.'

```
```
//another file, perhaps a test
import { containerB } from './container-b';

const iFly = containerB.services.Flyable; //in containerB, Plane was registered to Flyable
iFly.fly(); //logs 'The pilot starts the engine, the propeller begins to spin, and the plane takes off.'


```

Dependencies are resolved when an instance is retrieved from the services property. If a dependency is missing, an error will be thrown.

## Circular Dependencies

As of version 1.1.0, circular dependencies CAN be resolved in very specific cases. First, all members of the cycle must be registered as singletons. One singleton will be replaced by a proxy, which will be "filled in" with an actual instance of that singleton once it is instantiated.

Each time a transient service is retrieved, the expected behavior is that that instance is unique. Therefore, to avoid the potentially infinite chains that this guarantee of uniqueness could cause, only singletons may be part of a resolvable circular dependency. If any members are registered in transient scope, a CircularDependencyError will be thrown.

If a property of one member of a cycle is accessed by another member in that member's constructor, an UninitializedPropertyAccessError will be thrown. The idea here is that if the singleton is not fully instantiated, its properties cannot be guaranteed to be in a valid state. Once all of the constructors have been called, all singletons will have been fully instantiated, and their properties can be considered valid and may be accessed without causing errors.

Though circular dependencies can be resolved, they must be handled with care. For example, the dependency below will resolve if both classes are registered as singletons:

```
  class A {
    b : B;

    get myValue() {
      return this.b.myValue;
    }

    constructor(b : B) {
      this.b = b;
    }
  }

  class B {
    a : A;

    get myValue() {
      return this.a.myValue;
    }

    constructor(a : A) {
      this.a = a;
    }
  }
```

However, it will cause stack overflow if 'myValue' is actually accessed on either class. Therefore, if you choose to include a circular dependency, first ask yourself if it is actually necessary. If it happens to be an appropriate solution to describe a certain problem (perhaps a problem whose optimal answer involves nesting or recursion), ensure that an internal cycle like the one above does not exist, or that there is a terminal condition when members of the cycle invoke each other's methods or access each others' properties. Additionally, ensuring that methods are pure can help keep these types of interactions clean.

### Checking for circular dependencies

When an attempt to resolve a dependency is made, a tree structure is created and a branch of the tree is traversed from child node to parent node in order to check for circular dependencies. For efficiency, this check is only performed once. In the case of singletons, if they have previously been resolved, they are returned immediately. In the case of transient services, once a dependency has been resolved, its key is added to a set of previously resolved dependencies. Each time the service is requested, before performing the circular dependency check again, this set will be checked for the key of the service in question. If it exists in the set, the dependency is considered trusted and the tree traversal will not be performed. 

## tsconfig

Several classes in the project have private members. Therefore, you must set the target option in your tsconfig to "ES2015" or higher.

```
//tsconfig.json
{
  "compilerOptions": {
    "target": "ES2015",
  }
}
```

## Example

You can view a simple example project [here](https://github.com/dvorakjt/undecorated-di-sample).

## License

MIT License

Copyright (c) 2023 Joseph Dvorak

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.