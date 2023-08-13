import { describe, test, expect } from "vitest";
import { mergeDictionaries } from "../merge-dictionaries";

describe("mergeDictionaries", () => {
  test("It merges two dictionaries", () => {
    const dictionaryA = {
      hello: "world",
    };
    const dicttionaryB = {
      one: 1,
    };
    const expectedDictionary = {
      hello: "world",
      one: 1,
    };
    expect(mergeDictionaries(dictionaryA, dicttionaryB)).toStrictEqual(
      expectedDictionary,
    );
  });

  test("It throws an error if it does not receive two objects.", () => {
    const number = 3;
    const string = "hello";

    expect(() => mergeDictionaries(number, string)).toThrowError(
      "mergeDictionaries() expected to receive arguments of type object, object. Received number, string",
    );
  });
});
