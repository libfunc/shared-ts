import { FieldType, Typ } from "./ty";
import type * as r from "./types";
import type { Scheme } from "./types";

export const sch = {
  bool: { type: Typ.Bool } as const,
  u8: { type: Typ.U8 } as r.U8Type,
  u16: { type: Typ.U16 } as r.U16Type,
  u32: { type: Typ.U32 } as r.U32Type,
  u64: { type: Typ.U64 } as r.U64Type,
  i32: { type: Typ.I32 } as r.I32Type,
  i64: { type: Typ.I64 } as r.I64Type,
  f32: { type: Typ.F32 } as r.F32Type,
  f64: { type: Typ.F64 } as r.F64Type,
  str: { type: Typ.Str } as r.StrType,
  dt: { type: Typ.Datetime } as r.DatetimeType,
  ts: { type: Typ.Timestamp } as r.TimestampType,
  decimal: { type: Typ.Decimal } as r.DecimalType,
  fuid: { type: Typ.Fuid } as r.FuidType,
  lowid: { type: Typ.LowId } as r.LowIdType,
  bytes: { type: Typ.Bytes } as r.BytesType,
  void: { type: Typ.Void } as r.VoidType,
  json: { type: Typ.Json } as r.JsonType,
  jsonBytes: { type: Typ.JsonBytes } as r.JsonBytesType,

  arrayBytes(count: number): r.ArrayBytesType {
    return { type: Typ.ArrayBytes, data: count };
  },
  arr(count: number, type: Scheme): r.ArrayType {
    return { type: Typ.Array, data: [count, type] };
  },
  vec(type: Scheme): r.VecType {
    return { type: Typ.Vec, data: type };
  },
  optional(type: Scheme): r.OptionalType {
    return { type: Typ.Optional, data: type };
  },
  // struct with named fields
  named(name: string, fields: r.NameAndType[]): r.StructType {
    return {
      type: Typ.Struct,
      data: {
        name,
        fields: {
          type: FieldType.Named,
          data: fields,
        },
      },
    };
  },
  // struct with unnamed fields
  unnamed(name: string, fields: Scheme[]): r.StructType {
    return {
      type: Typ.Struct,
      data: {
        name,
        fields: {
          type: FieldType.Unnamed,
          data: fields,
        },
      },
    };
  },
  enum(name: string, variants: r.NameAndType[]): r.EnumType {
    return {
      type: Typ.Enum,
      data: {
        name,
        variants: variants.reduce<r.EnumVariants>((prev, variant, index) => {
          prev[index] = variant;
          return prev;
        }, {}),
      },
    };
  },
  enumWithKey(name: string, variants: [number, string, Scheme][]): r.EnumType {
    return {
      type: Typ.Enum,
      data: {
        name,
        variants: variants.reduce<r.EnumVariants>(
          (prev, [index, ...variant]) => {
            prev[index] = variant;
            return prev;
          },
          {},
        ),
      },
    };
  },
  simpleEnum(name: string, variants: string[]): r.SimpleEnumType {
    return {
      type: Typ.SimpleEnum,
      data: {
        name,
        variants: variants.reduce<Record<r.FieldIndex, string>>(
          (prev, variant, index) => {
            prev[index] = variant;
            return prev;
          },
          {},
        ),
      },
    };
  },
  custom(name: string, types: Scheme[]): r.CustomType {
    return { type: Typ.Custom, data: [name, types] };
  },
  // tuple OR unnamed struct with unnamed fields
  tuple(fields: Scheme[]): r.StructType {
    return {
      type: Typ.Struct,
      data: {
        name: "",
        fields: {
          type: FieldType.Unnamed,
          data: fields,
        },
      },
    };
  },
  // hashmap, btreemap ...
  map(key: Scheme, value: Scheme) {
    return sch.vec(sch.tuple([key, value]));
  },
};

const numberVariants: Scheme = sch.enum("Number", [
  ["U64", sch.u64],
  ["I64", sch.i64],
  ["F64", sch.f64],
]);
const jsonVariants: r.NameAndType[] = [
  ["Null", sch.void],
  ["Bool", sch.bool],
  ["Number", numberVariants],
  ["String", sch.str],
  ["Array", sch.vec(sch.json)],
  ["Object", sch.map(sch.str, sch.json)],
];
export const jsonValueSchema = sch.enum("Json", jsonVariants);
