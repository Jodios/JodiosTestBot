"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var DubsChecker_1 = require("../../main/command/DubsChecker");
require("mocha");
var assert_1 = __importDefault(require("assert"));
describe("Dubs Checker", function () {
    it("should return dubs when last 2 digits are repeating", function () {
        assert_1.default.strictEqual(DubsChecker_1.checkRepeatingDigits(1000011), "dubs");
        assert_1.default.strictEqual(DubsChecker_1.checkRepeatingDigits(1000012), "");
        assert_1.default.strictEqual(DubsChecker_1.checkRepeatingDigits(1000001), "");
        assert_1.default.strictEqual(DubsChecker_1.checkRepeatingDigits(1000021), "");
    });
});
describe("Trips Checker", function () {
    it("should return trips when last 2 digits are repeating", function () {
        assert_1.default.strictEqual(DubsChecker_1.checkRepeatingDigits(1000111), "trips");
        assert_1.default.strictEqual(DubsChecker_1.checkRepeatingDigits(1000222), "trips");
        assert_1.default.strictEqual(DubsChecker_1.checkRepeatingDigits(1002221), "");
        assert_1.default.strictEqual(DubsChecker_1.checkRepeatingDigits(1000101), "");
    });
});
describe("Quads Checker", function () {
    it("should return quads when last 2 digits are repeating", function () {
        assert_1.default.strictEqual(DubsChecker_1.checkRepeatingDigits(1001111), "quads");
        assert_1.default.strictEqual(DubsChecker_1.checkRepeatingDigits(1001110), "");
    });
});
