import { describe, test, expect } from "vitest";
import { Keys, Key } from "../../classes";
import { DuplicateKeyError } from "../../errors";

describe("Keys", () => {
  test("When createKeys() is called, keys is initialized to an empty object.", () => {
    const { keys } = Keys.createKeys();
    expect(keys).toStrictEqual({});
  });

  test("When addKey().forType() is called, a Key is created and added.", () => {
    const { keys } = Keys.createKeys().addKey("TestKey").forType<string>();
    expect(keys).toStrictEqual({
      TestKey: new Key<"TestKey", string>("TestKey"),
    });
  });

  test(`When addKey().forType() is called with a key that already exists, a 
  DuplicateKeyError is thrown.`, () => {
    const keyName = "TestKey";
    const keyBuilder = Keys.createKeys().addKey(keyName).forType<string>();

    expect(() => keyBuilder.addKey(keyName).forType<string>()).toThrow(
      new DuplicateKeyError(keyName)
    );
  });
});
