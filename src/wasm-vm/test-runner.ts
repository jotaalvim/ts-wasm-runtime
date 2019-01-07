import { wastParser } from "../wat-parser/wast"
import { ASTModuleNode } from "../wat-parser/types"
import { ASTModule } from "../wat-parser/module"
import { ASTAssertReturn } from "../wat-parser/assert"
import { WASMVirtualMachine } from "./wasm-vm"
import { compile } from "../compiler/compiler"

const isAssertReturn = (n: ASTModuleNode): n is ASTAssertReturn =>
  n.nodeType === "assert_return"

const isModule = (n: ASTModuleNode): n is ASTModule => n.nodeType === "module"

const runTestCase = (vm: WASMVirtualMachine, ast: ASTAssertReturn) => {
  console.log(`Testing ${ast.invoke}...`)
  const mem = vm.callFunction(
    ast.invoke,
    ...ast.args.map(a => a.parameters[0] as number)
  )
  for (const exp of ast.expected) {
    const received = mem.values.pop()
    if (received !== exp.parameters[0]) {
      throw new Error(
        `FAIL: ${ast.invoke}, expected ${
          exp.parameters
        } but received ${received}`
      )
    }
  }
  console.log(`PASS: ${ast.invoke}`)
}

export const runTests = (code: string) => {
  const r = wastParser(code, 0)
  if (!r[0]) {
    throw new Error("failed to parse")
  }
  const testCases = r[1].filter(isAssertReturn)
  const modules = r[1].filter(isModule)

  const module = compile(modules[0])
  const vm = new WASMVirtualMachine(module)

  for (const test of testCases) {
    runTestCase(vm, test)
  }
}
