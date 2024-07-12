export const enum Typ {
  Bool = "Bool",
  U8 = "U8",
  U16 = "U16",
  U32 = "U32",
  U64 = "U64",
  I32 = "I32",
  I64 = "I64",
  F32 = "F32",
  F64 = "F64",
  Str = "Str",
  Datetime = "Datetime",
  Timestamp = "Timestamp",
  Fuid = "Fuid",
  LowId = "LowId",
  Bytes = "Bytes",
  ArrayBytes = "ArrayBytes",
  Array = "Array",
  Vec = "Vec",
  Optional = "Optional",
  SimpleEnum = "SimpleEnum",
  Struct = "Struct",
  Enum = "Enum",
  Void = "Void",
  Json = "Json",
  JsonBytes = "JsonBytes",
  Custom = "Custom",
  // Tuple = "Tuple",
}

export const enum FieldType {
  Named = "Named",
  Unnamed = "Unnamed",
}

export const enum KeyVariant {
  U8 = "U8",
  U32 = "U32",
  Array = "Array",
}

export type KeyTypeU8 = EnumVariant<KeyVariant.U8>;
export type KeyTypeU32 = EnumVariant<KeyVariant.U32>;
export type KeyTypeArray = EnumVariant<KeyVariant.Array, { size: number }>;

export type TypedKeyType = KeyTypeU8 | KeyTypeU32 | KeyTypeArray;

export type JsTypedKeyType = (number | string)[];
export type JsKeyType = string | JsTypedKeyType;

export interface KeyVal<T = unknown> {
  key: JsKeyType;
  val: T;
}
