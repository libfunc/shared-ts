import type { FieldType, Typ, TypedKeyType } from "./ty";

export const enum KeySchemeType {
  Typed = "Typed",
  Bytes = "Bytes",
}

export type KeySchemeTyped = EnumVariant<KeySchemeType.Typed, TypedKeyType[]>;
export type KeySchemeBytes = EnumVariant<KeySchemeType.Bytes>;

export type KeyScheme = KeySchemeTyped | KeySchemeBytes;

export interface BoolType {
  type: Typ.Bool;
}

export interface U8Type {
  type: Typ.U8;
}

export interface U16Type {
  type: Typ.U16;
}

export interface U32Type {
  type: Typ.U32;
}

export interface U64Type {
  type: Typ.U64;
}

export interface I32Type {
  type: Typ.I32;
}

export interface I64Type {
  type: Typ.I64;
}

export interface F32Type {
  type: Typ.F32;
}

export interface F64Type {
  type: Typ.F64;
}

export interface StrType {
  type: Typ.Str;
}

export interface BytesType {
  type: Typ.Bytes;
}

export interface ArrayBytesType {
  type: Typ.ArrayBytes;
  data: number;
}

export interface ArrayType {
  type: Typ.Array;
  data: [number, Scheme];
}

export interface VecType {
  type: Typ.Vec;
  data: Scheme;
}

export interface StructType {
  type: Typ.Struct;
  data: StructData;
}

export type NameAndType = [name: string, type: Scheme];

export interface NamedFields {
  type: FieldType.Named;
  data: NameAndType[];
}

export interface UnnamedFields {
  type: FieldType.Unnamed;
  data: Scheme[];
}

export type Fields = NamedFields | UnnamedFields;

export interface StructData {
  name: string;
  fields: Fields;
}

// ordered numbers (sequence)
export type FieldIndex = string | number;

// export type Variants<T> = [FieldIndex, T];
export type Variants<T> = Record<FieldIndex, T>;

export type EnumVariants = Variants<NameAndType>;

export interface Enum {
  name: string;
  variants: EnumVariants;
}

export interface EnumType {
  type: Typ.Enum;
  data: Enum;
}

export interface SimpleEnum {
  name: string;
  variants: Variants<string>;
}

export interface SimpleEnumType {
  type: Typ.SimpleEnum;
  data: SimpleEnum;
}

export interface OptionalType {
  type: Typ.Optional;
  data: Scheme;
}

export interface VoidType {
  type: Typ.Void;
}

export interface DatetimeType {
  type: Typ.Datetime;
}

export interface TimestampType {
  type: Typ.Timestamp;
}

export interface FuidType {
  type: Typ.Fuid;
}

export interface LowIdType {
  type: Typ.LowId;
}

export interface JsonType {
  type: Typ.Json;
}

export interface JsonBytesType {
  type: Typ.JsonBytes;
}

export interface CustomType {
  type: Typ.Custom;
  data: [string, Scheme[]];
}

export type Scheme =
  | BoolType
  | U8Type
  | U16Type
  | U32Type
  | U64Type
  | I32Type
  | I64Type
  | F32Type
  | F64Type
  | StrType
  | DatetimeType
  | TimestampType
  | FuidType
  | LowIdType
  | BytesType
  | ArrayBytesType
  | ArrayType
  | VecType
  | OptionalType
  | SimpleEnumType
  | StructType
  | EnumType
  | VoidType
  | JsonType
  | JsonBytesType
  | CustomType;
