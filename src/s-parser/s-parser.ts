import { Parser, or, seq, lazy, opt, many, map } from "../parser/parser"
import { regexp, token } from "./util"

export interface FloatElement {
  float: string
}
export interface HexElement {
  hex: string
}
export interface IntElement {
  int: string
}

export type NumberElement = IntElement | HexElement | FloatElement

export type Element = string | NumberElement | ElementArray
export interface ElementArray extends Array<Element> {}

const number = or(
  map(
    regexp(/^-?0x[0-9a-fA-F][0-9a-fA-F_]*/),
    value => ({ hex: value } as HexElement)
  ),
  map(regexp(/^-?[0-9]+\.[0-9]*/), value => ({ float: value } as FloatElement)),
  map(regexp(/^-?[0-9]+/), value => ({ int: value } as IntElement))
)
const text = regexp(/^[a-zA-Z\$][0-9a-zA-Z\._]*/)
const string = regexp(/^(".+")/)
const types = or(number, text, string)
const comment = regexp(/^;;.*\n/)
const separator = many(or(regexp(/^\s+/), comment))
const list: Parser<string, ElementArray> = lazy(() =>
  map(
    seq(
      opt(separator),
      map(
        seq(
          token("("),
          opt(separator),
          expression,
          opt(many(map(seq(separator, expression), r => r[1]))), // separator を含まない
          opt(separator),
          token(")")
        ),
        r => (r[3] !== null ? [r[2], ...r[3]] : [r[2]]) // 括弧を含まない flat な配列にする
      )
    ),
    r => r[1]
  )
)

export const expression = or(types, list)

export const parser = list
export const multiParser = many(
  map(
    seq(parser, opt(separator)),
    r => r[0] // remove separator
  )
)
