import {
  PartialInstructionSet,
  WASMCode,
  WASMMemory,
  WASMContext
} from "../wasm-code"
import { range } from "../../misc/array"

export const popStack = ({ callStack, values }: WASMMemory) => {
  const { resultLength } = callStack.peek()
  // 指定された数の戻り値を pop 後のスタックに積む
  const returnValues = range(0, resultLength).map(_ => values.pop())
  callStack.pop()
  const ctx = callStack.peek()
  returnValues.forEach(ctx.values.push)
}

// Internal instructions generated by compiler
export const internalInstructionSet: PartialInstructionSet<
  WASMCode,
  WASMMemory
> = code => {
  switch (code.opcode) {
    case "_push":
      return (code, memory) => {
        const { callStack, programCounter } = memory

        // 相対アドレス
        const labelPosition = programCounter + code.parameters[1]

        callStack.push(
          new WASMContext(programCounter, code.parameters[0], labelPosition)
        )
      }
    case "_ret":
      return (_, memory) => {
        popStack(memory)
        memory.localStack.pop()
      }
    case "_pop":
      return (_, memory) => {
        const pc = memory.programCounter
        popStack(memory)
        // pop 後に return しないでそのまま次のコードを読み込む
        memory.programCounter = pc
      }
  }
  return null
}
