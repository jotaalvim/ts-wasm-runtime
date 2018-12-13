import * as assert from "assert"
import { parser } from "./s-parser"

describe("parser", () => {
  it("parse text", () => {
    const r = parser("abc", 0)
    assert.deepEqual(r, [true, "abc", 3])
  })

  it("parse number", () => {
    const r = parser("123", 0)
    assert.deepEqual(r, [true, 123, 3])
  })

  it("parse number", () => {
    const r = parser("123.456", 0)
    assert.deepEqual(r, [true, 123.456, 7])
  })

  it("parse list with single token", () => {
    const r = parser("(a)", 0)
    assert.deepEqual(r, [true, ["a"], 3])
  })

  it("parse list", () => {
    const r = parser("(a b c)", 0)
    assert.deepEqual(r, [true, ["a", "b", "c"], 7])
  })

  it("parse nested list", () => {
    const r = parser("(a (b c) ((d)))", 0)
    assert.deepEqual(r, [true, ["a", ["b", "c"], [["d"]]], 15])
  })

  it("parse multiline text", () => {
    const r = parser(
      `(a
      (b c)
      )`,
      0
    )
    assert.deepEqual(r, [true, ["a", ["b", "c"]], 22])
  })

  it("parse wasm", () => {
    const r = parser(
      `(func (param $lhs i32) (param $rhs i32) (result i32)
    get_local $lhs
    get_local $rhs
    i32.add)`,
      0
    )
    assert.deepEqual(r, [
      true,
      [
        "func",
        ["param", "$lhs", "i32"],
        ["param", "$rhs", "i32"],
        ["result", "i32"],
        "get_local",
        "$lhs",
        "get_local",
        "$rhs",
        "i32.add"
      ],
      103
    ])
  })
})
