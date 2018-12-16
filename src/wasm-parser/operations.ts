import { or, seq, many, map } from "../parser/parser"
import { keyword } from "./utils"
import { operand } from "./types"

// operation with no parameters
const op = (str: string) =>
  map(keyword(str), r => ({
    opType: r,
    parameters: null
  }))

// operation with single parameter
const op1 = (str: string) =>
  map(seq(keyword(str), operand), r => ({
    opType: r[0],
    parameters: r[1]
  }))

export const operations = or(
  op("nop"),
  op("unreachable"),
  op("block"),
  op("loop"),
  op("if"),
  op1("br"),
  op1("br_if"),
  seq(keyword("br_table"), many(operand)),
  op1("call"),
  op("call_indirect"),
  op("drop"),
  seq(keyword("select")),
  op1("get_local"),
  op1("set_local"),
  op1("tee_local"),
  op1("get_global"),
  op1("set_global"),
  op("i32.add"),
  op1("i32.const"),
  op1("i64.const"),
  op1("f32.const"),
  op1("f64.const"),
  op("i32.add"),
  op("i64.add"),
  op("f32.add"),
  op("f64.add"),
  op("i32.sub"),
  op("i64.sub"),
  op("f32.sub"),
  op("f64.sub"),
  op("i32.mul"),
  op("i64.mul"),
  op("f32.mul"),
  op("f64.mul"),
  op("i32.div_s"),
  op("i64.div_s"),
  op("f32.div_s"),
  op("f64.div_s"),
  op("i32.div_u"),
  op("i64.div_u"),
  op("f32.div_u"),
  op("f64.div_u"),
  op("i32.rem_s"),
  op("i64.rem_s"),
  op("f32.rem_s"),
  op("f64.rem_s"),
  op("i32.rem_u"),
  op("i64.rem_u"),
  op("f32.rem_u"),
  op("f64.rem_u"),
  op("i32.and"),
  op("i64.and"),
  op("f32.and"),
  op("f64.and"),
  op("i32.or"),
  op("i64.or"),
  op("f32.or"),
  op("f64.or"),
  op("i32.xor"),
  op("i64.xor"),
  op("f32.xor"),
  op("f64.xor"),
  op("i32.shl"),
  op("i64.shl"),
  op("f32.shl"),
  op("f64.shl"),
  op("i32.shr_s"),
  op("i64.shr_s"),
  op("f32.shr_s"),
  op("f64.shr_s"),
  op("i32.shr_u"),
  op("i64.shr_u"),
  op("f32.shr_u"),
  op("f64.shr_u"),
  op("i32.rot_l"),
  op("i64.rot_l"),
  op("f32.rot_l"),
  op("f64.rot_l"),
  op("i64.rot_r"),
  op("f32.rot_r"),
  op("f64.rot_r"),
  op("i64.eq"),
  op("f32.eq"),
  op("f64.eq"),
  op("i32.ne"),
  op("i64.ne"),
  op("f32.ne"),
  op("f64.ne"),
  op("i32.lt_s"),
  op("i64.lt_s"),
  op("f32.lt_s"),
  op("f64.lt_s"),
  op("i32.lt_u"),
  op("i64.lt_u"),
  op("f32.lt_u"),
  op("f64.lt_u"),
  op("i32.le_s"),
  op("i64.le_s"),
  op("f32.le_s"),
  op("f64.le_s"),
  op("i32.le_u"),
  op("i64.le_u"),
  op("f32.le_u"),
  op("f64.le_u"),
  op("i32.gt_s"),
  op("i64.gt_s"),
  op("f32.gt_s"),
  op("f64.gt_s"),
  op("i32.gt_u"),
  op("i64.gt_u"),
  op("f32.gt_u"),
  op("f64.gt_u"),
  op("i32.ge_s"),
  op("i64.ge_s"),
  op("f32.ge_s"),
  op("f64.ge_s"),
  op("i32.ge_u"),
  op("i64.ge_u"),
  op("f32.ge_u"),
  op("f64.ge_u"),
  op("i32.clz"),
  op("i64.clz"),
  op("f32.clz"),
  op("f64.clz"),
  op("i64.ctz"),
  op("f32.ctz"),
  op("f64.ctz"),
  op("i64.popcnt"),
  op("f32.popcnt"),
  op("f64.popcnt"),
  op("i64.eqz"),
  op("f32.eqz"),
  op("f64.eqz"),
  op("f32.abs"),
  op("f64.abs"),
  op("f32.neg"),
  op("f64.neg"),
  op("f32.copysign"),
  op("f64.copysign"),
  op("f64.ceil"),
  op("f32.floor"),
  op("f64.floor"),
  op("f32.trunc"),
  op("f64.trunc"),
  op("f64.nearest"),
  op("f64.sqrt"),
  op("f32.min"),
  op("f64.min"),
  op("f32.max"),
  op("f64.max"),
  op("i32.wrap/i64"),
  op("i32.trunc_s/f32"),
  op("i32.trunc_s/f64"),
  op("i32.trunc_u/f32"),
  op("i32.trunc_u/f64"),
  op("i32.reinterpret/f32"),
  op("i64.extend_s/i32"),
  op("i64.extend_u/i32"),
  op("i64.trunc_s/f32"),
  op("i64.trunc_s/f64"),
  op("i64.trunc_u/f32"),
  op("i64.trunc_u/f64"),
  op("i64.reinterpret/f64"),
  op("f32.demote/f64"),
  op("f32.convert_s/i32"),
  op("f32.convert_s/i64"),
  op("f32.convert_u/i32"),
  op("f32.convert_u/i64"),
  op("f32.reinterpret/i32"),
  op("f64.promote/f32"),
  op("f64.convert_s/i32"),
  op("f64.convert_s/i64"),
  op("f64.convert_u/i32"),
  op("f64.convert_u/i64"),
  op("f64.reinterpret/i64"),
  op("get_local"),
  op("set_local"),
  op("tee_local"),
  op("global.get"),
  op("global.set"),
  op("i32.load"),
  op("i64.load"),
  op("f32.load"),
  op("f64.load"),
  op("i32.load8_s"),
  op("i32.load8_u"),
  op("i32.load16_s"),
  op("i32.load16_u"),
  op("i64.load8_s"),
  op("i64.load8_u"),
  op("i64.load16_s"),
  op("i64.load16_u"),
  op("f32.load8_s"),
  op("f32.load8_u"),
  op("f32.load16_s"),
  op("f32.load16_u"),
  op("f64.load8_s"),
  op("f64.load8_u"),
  op("f64.load16_s"),
  op("f64.load16_u"),
  op("i32.store"),
  op("i64.store"),
  op("f32.store"),
  op("f64.store"),
  op("i32.store8"),
  op("i32.store16"),
  op("i64.store8"),
  op("i64.store16"),
  op("i64.store32")
)
