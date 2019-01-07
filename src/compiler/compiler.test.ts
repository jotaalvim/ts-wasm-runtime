import * as assert from "assert"
import { compile } from "./compiler"
import { ASTModule } from "../wat-parser/module"
import { ValType } from "../wat-parser/types"
import { watParser } from "../wat-parser"
import { transform } from "../parser/parser"
import { parser } from "../s-parser/s-parser"

describe("compiler", () => {
  it("compiles", () => {
    /*
      (module
        (func (export "add") (param i32) (param i32) (result i32)
          get_local 0 
          get_local 1
          i32.add
        )
      )
    */
    const ast: ASTModule = {
      nodeType: "module",
      exports: [],
      globals: [],
      memories: [],
      tables: [],
      types: [],
      functions: [
        {
          nodeType: "func",
          identifier: null,
          export: "add",
          parameters: [
            {
              identifier: null,
              type: ValType.i32
            },
            {
              identifier: null,
              type: ValType.i32
            }
          ],
          locals: [],
          results: [ValType.i32],
          body: [
            {
              opType: "get_local",
              parameters: [0]
            },
            {
              opType: "get_local",
              parameters: [1]
            },
            {
              opType: "i32.add",
              parameters: []
            }
          ]
        }
      ]
    }
    const codes = compile(ast)
    assert.deepStrictEqual(codes, [
      [
        { opcode: "get_local", parameters: [0] },
        { opcode: "get_local", parameters: [1] },
        { opcode: "i32.add", parameters: [] },
        { opcode: "_ret", parameters: [] }
      ],
      [
        {
          export: "add",
          locals: [],
          parameters: ["i32", "i32"],
          identifier: null,
          results: ["i32"],
          pointer: 0
        }
      ]
    ])
  })
  it("replaces identifiers to indices", () => {
    const ast: ASTModule = transform(parser, watParser)(
      `(module
        (func $fib (export "fib") (param $p0 i32) (result i32)
          (local $l0 i32)
          i32.const 1
          set_local $l0
          block $B0
            get_local $p0
            i32.const 2
            i32.lt_u
            br_if $B0
            i32.const 1
            set_local $l0
            loop $L1
              get_local $p0
              i32.const -1
              i32.add
              call $fib
              get_local $l0
              i32.add
              set_local $l0
              get_local $p0
              i32.const -2
              i32.add
              tee_local $p0
              i32.const 1
              i32.gt_u
              br_if $B0
            end
          end
          get_local $l0)
      )
      `,
      0
    )[1]
    const codes = compile(ast)
    assert.deepStrictEqual(codes, [
      [
        { opcode: "i32.const", parameters: [0] },
        { opcode: "set_local", parameters: [1] },
        { opcode: "i32.const", parameters: [1] },
        { opcode: "set_local", parameters: [1] },
        { opcode: "_push", parameters: [0, 22] },
        { opcode: "get_local", parameters: [0] },
        { opcode: "i32.const", parameters: [2] },
        { opcode: "i32.lt_u", parameters: [] },
        { opcode: "br_if", parameters: [0] },
        { opcode: "i32.const", parameters: [1] },
        { opcode: "set_local", parameters: [1] },
        { opcode: "_push", parameters: [0, 0] },
        { opcode: "get_local", parameters: [0] },
        { opcode: "i32.const", parameters: [-1] },
        { opcode: "i32.add", parameters: [] },
        { opcode: "call", parameters: [0] },
        { opcode: "get_local", parameters: [1] },
        { opcode: "i32.add", parameters: [] },
        { opcode: "set_local", parameters: [1] },
        { opcode: "get_local", parameters: [0] },
        { opcode: "i32.const", parameters: [-2] },
        { opcode: "i32.add", parameters: [] },
        { opcode: "tee_local", parameters: [0] },
        { opcode: "i32.const", parameters: [1] },
        { opcode: "i32.gt_u", parameters: [] },
        { opcode: "br_if", parameters: [1] },
        { opcode: "_pop", parameters: [] },
        { opcode: "_pop", parameters: [] },
        { opcode: "get_local", parameters: [1] },
        { opcode: "_ret", parameters: [] }
      ],
      [
        {
          export: "fib",
          identifier: "$fib",
          locals: ["i32"],
          parameters: ["i32"],
          pointer: 0,
          results: ["i32"]
        }
      ]
    ])
  })
})
