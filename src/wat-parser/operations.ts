import { or, seq, many, map, Parser, lazy, opt } from "../parser/parser"
import { keyword, array } from "./utils"
import { int32, int64, float32, float64, indices, Int32Value } from "./types"
import { blockInstructions } from "./block"
import { flatten } from "../misc/array"
import { Element } from "../s-parser/s-parser"
import * as Op from "./opdef"
import { ifParser } from "./if"

// operation with no parameters
const op = <T extends Op.Any>(str: string): Parser<Element[], T> =>
  map(
    keyword(str),
    _ =>
      ({
        opType: str
      } as T)
  )

// operation with single parameter
const op1 = <T extends Op.Param1<string, any>>(
  str: string,
  parser: Parser<Element[], T["parameter"]>
): Parser<Element[], T> =>
  map(
    seq(keyword(str), parser),
    r =>
      ({
        opType: str,
        parameter: r[1]
      } as T)
  )

const opN = <T extends Op.ParamMany<string, any>>(
  str: string,
  parser: Parser<Element[], T["parameters"][0]>
): Parser<Element[], T> =>
  map(
    seq(keyword(str), many(parser)),
    r =>
      ({
        opType: str,
        parameters: r[1]
      } as T)
  )

export const constInstructions = or(
  op1<Op.I32_const>("i32.const", int32),
  op1<Op.I64_const>("i64.const", int64),
  op1<Op.F32_const>("f32.const", float32),
  op1<Op.F64_const>("f64.const", float64)
)

export const plainInstructions = or<Element[], Op.Any>(
  constInstructions,
  op<Op.Nop>("nop"),
  op<Op.Unreachable>("unreachable"),
  op1<Op.Br>("br", indices),
  op1<Op.BrIf>("br_if", indices),
  opN<Op.BrTable>("br_table", indices),
  op1<Op.Call>("call", indices),
  op<Op.CallIndirect>("call_indirect"),
  op<Op.Drop>("drop"),
  op<Op.Select>("select"),
  op<Op.Return>("return"),

  op1<Op.Local_get>("local.get", indices),
  op1<Op.Local_set>("local.set", indices),
  op1<Op.Get_local>("get_local", indices),
  op1<Op.Set_local>("set_local", indices),

  op1<Op.Local_tee>("local.tee", indices),
  op1<Op.Tee_local>("tee_local", indices),

  op1<Op.Global_get>("global.get", indices),
  op1<Op.Global_set>("global.set", indices),
  op1<Op.Get_global>("get_global", indices),
  op1<Op.Set_global>("set_global", indices),

  op<Op.I32_add>("i32.add"),
  op<Op.I64_add>("i64.add"),
  op<Op.F32_add>("f32.add"),
  op<Op.F64_add>("f64.add"),

  op<Op.I32_sub>("i32.sub"),
  op<Op.I64_sub>("i64.sub"),
  op<Op.F32_sub>("f32.sub"),
  op<Op.F64_sub>("f64.sub"),

  op<Op.I32_mul>("i32.mul"),
  op<Op.I64_mul>("i64.mul"),
  op<Op.F32_mul>("f32.mul"),
  op<Op.F64_mul>("f64.mul"),

  op<Op.F32_div>("f32.div"),
  op<Op.F64_div>("f64.div"),

  op<Op.I32_div_s>("i32.div_s"),
  op<Op.I64_div_s>("i64.div_s"),

  op<Op.I32_div_u>("i32.div_u"),
  op<Op.I64_div_u>("i64.div_u"),

  op<Op.I32_rem_s>("i32.rem_s"),
  op<Op.I64_rem_s>("i64.rem_s"),

  op<Op.I32_rem_u>("i32.rem_u"),
  op<Op.I64_rem_u>("i64.rem_u"),

  op<Op.I32_and>("i32.and"),
  op<Op.I64_and>("i64.and"),

  op<Op.I32_or>("i32.or"),
  op<Op.I64_or>("i64.or"),

  op<Op.I32_xor>("i32.xor"),
  op<Op.I64_xor>("i64.xor"),

  op<Op.I32_shl>("i32.shl"),
  op<Op.I64_shl>("i64.shl"),

  op<Op.I32_shr_s>("i32.shr_s"),
  op<Op.I64_shr_s>("i64.shr_s"),

  op<Op.I32_shr_u>("i32.shr_u"),
  op<Op.I64_shr_u>("i64.shr_u"),

  op<Op.I32_rot_l>("i32.rot_l"),
  op<Op.I64_rot_l>("i64.rot_l"),

  op<Op.I32_rot_r>("i32.rot_r"),
  op<Op.I64_rot_r>("i64.rot_r"),

  op<Op.I32_eq>("i32.eq"),
  op<Op.I64_eq>("i64.eq"),
  op<Op.F32_eq>("f32.eq"),
  op<Op.F64_eq>("f64.eq"),

  op<Op.I32_ne>("i32.ne"),
  op<Op.I64_ne>("i64.ne"),
  op<Op.F32_ne>("f32.ne"),
  op<Op.F64_ne>("f64.ne"),

  op<Op.I32_lt_s>("i32.lt_s"),
  op<Op.I64_lt_s>("i64.lt_s"),

  op<Op.I32_lt_u>("i32.lt_u"),
  op<Op.I64_lt_u>("i64.lt_u"),

  op<Op.F32_lt>("f32.lt"),
  op<Op.F64_lt>("f64.lt"),

  op<Op.I32_le_s>("i32.le_s"),
  op<Op.I64_le_s>("i64.le_s"),

  op<Op.I32_le_u>("i32.le_u"),
  op<Op.I64_le_u>("i64.le_u"),

  op<Op.F32_le>("f32.le"),
  op<Op.F64_le>("f64.le"),

  op<Op.I32_gt_s>("i32.gt_s"),
  op<Op.I64_gt_s>("i64.gt_s"),

  op<Op.I32_gt_u>("i32.gt_u"),
  op<Op.I64_gt_u>("i64.gt_u"),

  op<Op.F32_gt>("f32.gt"),
  op<Op.F64_gt>("f64.gt"),

  op<Op.I32_ge_s>("i32.ge_s"),
  op<Op.I64_ge_s>("i64.ge_s"),

  op<Op.I32_ge_u>("i32.ge_u"),
  op<Op.I64_ge_u>("i64.ge_u"),

  op<Op.F32_ge>("f32.ge"),
  op<Op.F64_ge>("f64.ge"),

  op<Op.I32_clz>("i32.clz"),
  op<Op.I64_clz>("i64.clz"),

  op<Op.I32_ctz>("i32.ctz"),
  op<Op.I64_ctz>("i64.ctz"),

  op<Op.I32_popcnt>("i32.popcnt"),
  op<Op.I64_popcnt>("i64.popcnt"),

  op<Op.I32_eqz>("i32.eqz"),
  op<Op.I64_eqz>("i64.eqz"),

  op<Op.F32_abs>("f32.abs"),
  op<Op.F64_abs>("f64.abs"),

  op<Op.F32_neg>("f32.neg"),
  op<Op.F64_neg>("f64.neg"),

  op<Op.F32_copysign>("f32.copysign"),
  op<Op.F64_copysign>("f64.copysign"),

  op<Op.F32_ceil>("f32.ceil"),
  op<Op.F64_ceil>("f64.ceil"),

  op<Op.F32_floor>("f32.floor"),
  op<Op.F64_floor>("f64.floor"),

  op<Op.F32_trunc>("f32.trunc"),
  op<Op.F64_trunc>("f64.trunc"),

  op<Op.F32_nearest>("f32.nearest"),
  op<Op.F64_nearest>("f64.nearest"),

  op<Op.F32_sqrt>("f32.sqrt"),
  op<Op.F64_sqrt>("f64.sqrt"),

  op<Op.F32_min>("f32.min"),
  op<Op.F64_min>("f64.min"),

  op<Op.F32_max>("f32.max"),
  op<Op.F64_max>("f64.max"),

  op<Op.I32_wrap_i64>("i32.wrap/i64"),

  op<Op.I32_trunc_s_f32>("i32.trunc_s/f32"),
  op<Op.I32_trunc_s_f64>("i32.trunc_s/f64"),
  op<Op.I32_trunc_u_f32>("i32.trunc_u/f32"),
  op<Op.I32_trunc_u_f64>("i32.trunc_u/f64"),

  op<Op.I64_extend_s_i32>("i64.extend_s/i32"),
  op<Op.I64_extend_u_i32>("i64.extend_u/i32"),

  op<Op.I64_trunc_s_f32>("i64.trunc_s/f32"),
  op<Op.I64_trunc_s_f64>("i64.trunc_s/f64"),
  op<Op.I64_trunc_u_f32>("i64.trunc_u/f32"),
  op<Op.I64_trunc_u_f64>("i64.trunc_u/f64"),

  op<Op.I32_reinterpret_f32>("i32.reinterpret/f32"),
  op<Op.I64_reinterpret_f64>("i64.reinterpret/f64"),
  op<Op.F32_reinterpret_i32>("f32.reinterpret/i32"),
  op<Op.F64_reinterpret_i64>("f64.reinterpret/i64"),

  op<Op.F32_demote_f64>("f32.demote/f64"),

  op<Op.F32_convert_s_i32>("f32.convert_s/i32"),
  op<Op.F32_convert_s_i64>("f32.convert_s/i64"),
  op<Op.F32_convert_u_i32>("f32.convert_u/i32"),
  op<Op.F32_convert_u_i64>("f32.convert_u/i64"),

  op<Op.F64_promote_f32>("f64.promote/f32"),

  op<Op.F64_convert_s_i32>("f64.convert_s/i32"),
  op<Op.F64_convert_s_i64>("f64.convert_s/i64"),
  op<Op.F64_convert_u_i32>("f64.convert_u/i32"),
  op<Op.F64_convert_u_i64>("f64.convert_u/i64"),

  op<Op.I32_load>("i32.load"),
  op<Op.I64_load>("i64.load"),
  op<Op.F32_load>("f32.load"),
  op<Op.F64_load>("f64.load"),

  op<Op.I32_load8_s>("i32.load8_s"),
  op<Op.I32_load8_u>("i32.load8_u"),
  op<Op.I32_load16_s>("i32.load16_s"),
  op<Op.I32_load16_u>("i32.load16_u"),
  op<Op.I64_load8_s>("i64.load8_s"),
  op<Op.I64_load8_u>("i64.load8_u"),
  op<Op.I64_load16_s>("i64.load16_s"),
  op<Op.I64_load16_u>("i64.load16_u"),
  op<Op.F32_load8_s>("f32.load8_s"),
  op<Op.F32_load8_u>("f32.load8_u"),
  op<Op.F32_load16_s>("f32.load16_s"),
  op<Op.F32_load16_u>("f32.load16_u"),
  op<Op.F64_load8_s>("f64.load8_s"),
  op<Op.F64_load8_u>("f64.load8_u"),
  op<Op.F64_load16_s>("f64.load16_s"),
  op<Op.F64_load16_u>("f64.load16_u"),
  op<Op.I32_store>("i32.store"),
  op<Op.I64_store>("i64.store"),
  op<Op.F32_store>("f32.store"),
  op<Op.F64_store>("f64.store"),
  op<Op.I32_store8>("i32.store8"),
  op<Op.I32_store16>("i32.store16"),
  op<Op.I64_store8>("i64.store8"),
  op<Op.I64_store16>("i64.store16"),
  op<Op.I64_store32>("i64.store32")
)

const foldedInstructions = map(
  array(
    seq(
      plainInstructions,
      opt(map(many(lazy(() => operations)), r => flatten(r)))
    )
  ),
  r => [...(r[1] ? r[1] : []), r[0]]
)

export const operations: Parser<Element[], Op.Any[]> = or(
  lazy(() => blockInstructions),
  lazy(() => ifParser),
  map(plainInstructions, r => [r]),
  foldedInstructions
)
