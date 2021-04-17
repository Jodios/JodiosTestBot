import { checkRepeatingDigits } from "../../main/command/DubsChecker";
import 'mocha';
import assert from "assert";


describe("Dubs Checker", () => {
    it("should return dubs when last 2 digits are repeating", () => {
        assert.strictEqual(checkRepeatingDigits(1000011), "dubs");
        assert.strictEqual(checkRepeatingDigits(1000012), "");
        assert.strictEqual(checkRepeatingDigits(1000001), "");
        assert.strictEqual(checkRepeatingDigits(1000021), "");
    })
})

describe("Trips Checker", () => {
    it("should return trips when last 2 digits are repeating", () => {
        assert.strictEqual(checkRepeatingDigits(1000111), "trips");
        assert.strictEqual(checkRepeatingDigits(1000222), "trips");
        assert.strictEqual(checkRepeatingDigits(1002221), "");
        assert.strictEqual(checkRepeatingDigits(1000101), "");
    })
})

describe("Quads Checker", () => {
    it("should return quads when last 2 digits are repeating", () => {
        assert.strictEqual(checkRepeatingDigits(1001111), "quads");
        assert.strictEqual(checkRepeatingDigits(1001110), "");
    })
})