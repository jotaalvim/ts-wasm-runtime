import * as assert from "assert"
import { param, funcBody, func } from "./func"
import { parser as sParser } from "../s-parser/s-parser"

describe("parser", () => {
  it("parse param", () => {
    const r = param(["param", "i32"], 0)
    assert.deepEqual(r, [true, [{ identifier: null, type: "i32" }], 2])
  })

  it("parse param with identifier", () => {
    const r = param(["param", "$p2", "f64"], 0)
    assert.deepEqual(r, [true, [{ identifier: "$p2", type: "f64" }], 3])
  })

  it("parse function body", () => {
    const r = funcBody(["get_local", "$lhs", "get_local", "$rhs"], 0)
    assert.deepEqual(r, [
      true,
      [
        {
          opType: "get_local",
          parameters: ["$lhs"]
        },
        {
          opType: "get_local",
          parameters: ["$rhs"]
        }
      ],
      4
    ])
  })

  it("parse function", () => {
    const r = func(
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
      0
    )
    assert.deepEqual(r, [
      true,
      {
        nodeType: "func",
        identifier: null,
        export: null,
        parameters: [
          { identifier: "$lhs", type: "i32" },
          { identifier: "$rhs", type: "i32" }
        ],
        results: ["i32"],
        locals: [],
        body: [
          {
            opType: "get_local",
            parameters: ["$lhs"]
          },
          {
            opType: "get_local",
            parameters: ["$rhs"]
          },
          {
            opType: "i32.add",
            parameters: []
          }
        ]
      },
      9
    ])
  })

  it("parses function with export", () => {
    const r = func(
      [
        "func",
        "$add",
        ["export", `"add"`],
        ["param", "$lhs", "i32"],
        ["param", "$rhs", "i32"],
        ["result", "i32"],
        "get_local",
        "$lhs",
        "get_local",
        "$rhs",
        "i32.add"
      ],
      0
    )
    assert.deepEqual(r, [
      true,
      {
        nodeType: "func",
        identifier: "$add",
        export: "add",
        parameters: [
          { identifier: "$lhs", type: "i32" },
          { identifier: "$rhs", type: "i32" }
        ],
        results: ["i32"],
        locals: [],
        body: [
          {
            opType: "get_local",
            parameters: ["$lhs"]
          },
          {
            opType: "get_local",
            parameters: ["$rhs"]
          },
          {
            opType: "i32.add",
            parameters: []
          }
        ]
      },
      11
    ])
  })
  it("parses function", () => {
    const sExp = sParser(
      `(func (export "hello") (result i32)
        i32.const 42
      )`,
      0
    )
    const r = func(sExp[1], 0)
    assert.deepStrictEqual(r, [
      true,
      {
        body: [
          {
            opType: "i32.const",
            parameters: [{ i32: "42" }]
          }
        ],
        export: "hello",
        identifier: null,
        nodeType: "func",
        parameters: [],
        results: ["i32"],
        locals: []
      },
      5
    ])
  })
  it("parses function with local", () => {
    const sExp = sParser(
      `(func (export "hello") (result i32) (local i32)
        get_local 0
      )`,
      0
    )
    const r = func(sExp[1], 0)
    assert.deepStrictEqual(r, [
      true,
      {
        body: [{ opType: "get_local", parameters: [0] }],
        export: "hello",
        identifier: null,
        nodeType: "func",
        parameters: [],
        results: ["i32"],
        locals: [{ type: "i32", identifier: null }]
      },
      6
    ])
  })

  it("parses single folded instruction", () => {
    const r = funcBody([["get_local", { int: "0" }]], 0)
    assert.deepStrictEqual(r, [
      true,
      [{ opType: "get_local", parameters: [0] }],
      1
    ])
  })

  it("parses nested folded instruction", () => {
    const r = funcBody(
      [["i32.add", ["i32.const", { int: "2" }], ["i32.const", { int: "3" }]]],
      0
    )
    assert.deepStrictEqual(r, [
      true,
      [
        { opType: "i32.const", parameters: [{ i32: "2" }] },
        { opType: "i32.const", parameters: [{ i32: "3" }] },
        { opType: "i32.add", parameters: [] }
      ],
      1
    ])
  })

  it("parses function with abbreviated parameters", () => {
    const sExp = sParser(
      `(func (export "type-mixed") (param i64 f32 f64 i32 i32)
      (local f32 i64 i64 f64)
      (drop (i64.eqz (local.get 0)))
    )`,
      0
    )
    const r = func(sExp[1], 0)
    assert.deepStrictEqual(r, [
      true,
      {
        body: [
          { opType: "local.get", parameters: [0] },
          { opType: "i64.eqz", parameters: [] },
          { opType: "drop", parameters: [] }
        ],
        export: "type-mixed",
        identifier: null,
        locals: [
          { identifier: null, type: "f32" },
          { identifier: null, type: "i64" },
          { identifier: null, type: "i64" },
          { identifier: null, type: "f64" }
        ],
        nodeType: "func",
        parameters: [
          { identifier: null, type: "i64" },
          { identifier: null, type: "f32" },
          { identifier: null, type: "f64" },
          { identifier: null, type: "i32" },
          { identifier: null, type: "i32" }
        ],
        results: []
      },
      5
    ])
  })

  it("block", () => {
    const sExp = sParser(
      `(func (export "as-compare-operand") (result i32)
        (f32.gt
          (block (result f32) (call $dummy) (f32.const 3))
          (block (result f32) (call $dummy) (f32.const 3))
        )
      )`,
      0
    )
    const r = func(sExp[1], 0)
    assert.deepStrictEqual(r, [
      true,
      {
        body: [
          {
            body: [
              { opType: "call", parameters: ["$dummy"] },
              { opType: "f32.const", parameters: [{ f32: "3" }] }
            ],
            identifier: null,
            opType: "block",
            parameters: [],
            results: ["f32"]
          },
          {
            body: [
              { opType: "call", parameters: ["$dummy"] },
              { opType: "f32.const", parameters: [{ f32: "3" }] }
            ],
            identifier: null,
            opType: "block",
            parameters: [],
            results: ["f32"]
          },
          { opType: "f32.gt", parameters: [] }
        ],
        export: "as-compare-operand",
        identifier: null,
        locals: [],
        nodeType: "func",
        parameters: [],
        results: ["i32"]
      },
      4
    ])
  })
})
