# undecorated-di

Type-safe, straightforward dependency injection TypeScript without annotations or reflect-metadata.

![test](https://github.com/dvorakjt/undecorated-di/actions/workflows/test.yml/badge.svg)

## Installation

```
npm i undecorated-di
```

## What's new in V2

- Containers can now provide functions and constants in addition to classes
- Simpler function signatures for attaching dependencies to classes
- Keys are type-safe
- Usage is now very similar to other libraries but with greater type-safety

## Use

### 1. Define Interfaces

```
//interfaces.ts
export interface Greet {
  (name: string) : void;
}

export interface Logger {
  log(message: string) : void;
}
```

### 2. Create Keys

```
// keys.ts
import { Keys } from 'undecorated-di';
import type { Logger, Greet } from './interfaces';

export const { keys } = Keys.createKeys()
  .addKey('Logger')
  .forType<Logger>()
  .addKey('Greet')
  .forType<Greet>()
  .addKey('Greeting')
  .forType<string>();
```

### 3. Bind dependencies to functions

```
// greet.ts
import { bind } from 'undecorated-di';
import { keys } from './keys';
import type { Logger } from './interfaces';

function greet(logger: Logger, greeting: string, name: string) {
  const message = `${greeting}, ${name}!`;
  logger.log(message);
}

export default bind(greet, [keys.Logger, keys.Greeting]);
```

### 4. Inject dependencies into classes

```
// console-logger.ts
import { inject } from "undecorated-di";
import type { Logger } from "./interfaces";

class ConsoleLogger implements Logger {
  log(message: string) {
    console.log(message);
  }
}

/*
  If the constructor for ConsoleLogger required parameters,
  the corresponding keys would go in the second argument of inject.

  Unlike bind which can accept a partial list of keys, inject
  requires that you provide a key for every parameter of the
  constructor.
*/
export default inject(ConsoleLogger, []);
```

### 5. Create a Container

```
// container.ts
import { ContainerBuilder, inject } from "undecorated-di";
import { keys } from "./keys";
import greet from "./greet";
import ConsoleLogger from "./console-logger";

export const container = ContainerBuilder.createBuilder()
  .registerConstant(keys.Greeting, "Hello")
  .registerClass(keys.Logger, ConsoleLogger)
  .registerFunction(keys.Greet, greet)
  .build();
```

### 6. Enjoy

```
// consumer.ts
import { container } from "./container";
import { keys } from "./keys";

const greet = container.get(keys.Greet);

greet("World");

```

## Circular Dependencies

As of version 1.1.0, circular dependencies CAN be resolved in very specific cases. First, all members of the cycle must be registered as singletons. One singleton will be replaced by a proxy, which will be "filled in" with an actual instance of that singleton once it is instantiated.

Each time a transient service is retrieved, the expected behavior is that that instance is unique. Therefore, to avoid the potentially infinite chains that this guarantee of uniqueness could cause, only singletons may be part of a resolvable circular dependency. If any members are registered in transient scope, a `CircularDependencyError` will be thrown. For similar reasons, functions detected in a dependency cycle will also trigger a `CircularDependencyError`.

If a property of one member of a cycle is accessed by another member in that member's constructor, an `UninitializedPropertyAccessError` will be thrown. Once all of the constructors have been called, all singletons will have been fully instantiated, and their properties can be considered valid and may be accessed without causing errors.

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

However, it will cause stack overflow if `myValue` is actually accessed from either class. Therefore, if you choose to include a circular dependency, first ask yourself if it is actually necessary. If it happens to be an appropriate solution to describe a certain problem (perhaps a problem whose optimal answer involves nesting or recursion), ensure that an internal cycle like the one above does not exist, or that there is a terminal condition when members of the cycle invoke each other's methods or access each others' properties. Additionally, ensuring that methods are pure can help keep these types of interactions clean.

### Checking for circular dependencies

When an attempt to resolve a dependency is made, a tree structure is created and a branch of the tree is traversed from child node to parent node in order to check for circular dependencies. For efficiency, this check is only performed once. In the case of singletons, if they have previously been resolved, they are returned immediately. In the case of transient services, once a dependency has been resolved, its key is added to a set of previously resolved dependencies. Each time the service is requested, before performing the circular dependency check again, this set will be checked for the key of the service in question. If it exists in the set, the dependency is considered trusted and the tree traversal will not be performed.

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
