import { jsonValueSchema } from "./scheme";
import { FieldType, Typ } from "./ty";
import type { Scheme } from "./types";

interface Cursor {
  value: number;
}

export const getLen: Impl<number> = (view, cursor) => {
  const len = view.getUint32(cursor.value, true);
  cursor.value += 4;
  return len;
};

const getByte: Impl<number> = (view, cursor) => {
  const byte = view.getUint8(cursor.value);
  cursor.value++;
  return byte;
};

const getString: Impl<string> = (view, cursor) => {
  const len = getLen(view, cursor);
  console.log(len, view.buffer.byteLength, cursor.value);
  const u8arr = new Uint8Array(view.buffer, cursor.value, len);
  cursor.value += len;
  const utf8decoder = new TextDecoder();
  const str = utf8decoder.decode(u8arr);
  return str;
};

export const bytesView = (
  view: DataView,
  cursor: Cursor,
  len: number,
): string => {
  const u8arr = new Uint8Array(view.buffer, cursor.value, len);
  cursor.value += len;
  const arr = Array.from(u8arr);
  return arr.map((n) => n.toString(16).padStart(2, "0")).join("");
};

type Impl<T = unknown> = (view: DataView, cursor: Cursor, types?: Scheme[]) => T;
type CustomImpls = Record<string, Impl>;

export const fromSlice = (
  view: DataView,
  scheme: Scheme,
  cursor: Cursor,
  customImpls: CustomImpls = {},
): unknown => {
  console.log(scheme);
  switch (scheme.type) {
    case Typ.Bool: {
      return getByte(view, cursor) !== 0;
    }
    case Typ.U8: {
      return getByte(view, cursor);
    }
    case Typ.U16: {
      const u16 = view.getUint16(cursor.value, true);
      cursor.value += 2;
      return u16;
    }
    case Typ.U32: {
      const num = view.getUint32(cursor.value, true);
      cursor.value += 4;
      return num;
    }
    case Typ.U64: {
      const i64 = view.getBigUint64(cursor.value, true);
      const num = Number(i64);
      cursor.value += 8;
      return num;
    }
    case Typ.I32: {
      const num = view.getInt32(cursor.value, true);
      cursor.value += 4;
      return num;
    }
    case Typ.I64: {
      const i64 = view.getBigInt64(cursor.value, true);
      const num = Number(i64);
      cursor.value += 8;
      return num;
    }
    case Typ.F32: {
      const num = view.getFloat32(cursor.value, true);
      cursor.value += 4;
      return num;
    }
    case Typ.F64: {
      const num = view.getFloat64(cursor.value, true);
      cursor.value += 8;
      return num;
    }
    case Typ.Str: {
      return getString(view, cursor);
    }
    case Typ.Datetime: {
      const i64 = view.getBigInt64(cursor.value, true);
      const num = Number(i64);
      const date = new Date(num);
      cursor.value += 8;
      return date;
    }
    case Typ.Timestamp: {
      const u64 = view.getBigUint64(cursor.value, true);
      const num = Number(u64);
      const date = new Date(num);
      cursor.value += 8;
      return date;
    }
    case Typ.Fuid: {
      // 5 bytes timestamp + 1 byte shardId + 2 bytes random
      const ts = bytesView(view, cursor, 5);
      const shardId = getByte(view, cursor);
      const rand = bytesView(view, cursor, 2);
      return `${ts}-${shardId}-${rand}`;
    }
    case Typ.LowId: {
      // 5 bytes timestamp + 1 byte shardId + 2 bytes random
      const ts = bytesView(view, cursor, 5);
      const shardId = getByte(view, cursor);
      const rand = bytesView(view, cursor, 2);
      return `${ts}-${shardId}-${rand}`;
    }
    case Typ.Bytes: {
      const len = getLen(view, cursor);
      return bytesView(view, cursor, len);
    }
    case Typ.ArrayBytes: {
      const len = scheme.data;
      return bytesView(view, cursor, len);
    }
    case Typ.Array: {
      const [len, child] = scheme.data;
      const vec = [];
      for (let index = 0; index < len; index++) {
        const item = fromSlice(view, child, cursor);
        vec.push(item);
      }
      return vec;
    }
    case Typ.Vec: {
      const len = getLen(view, cursor);
      const vec = [];
      for (let index = 0; index < len; index++) {
        const item = fromSlice(view, scheme.data, cursor);
        vec.push(item);
      }
      return vec;
    }
    case Typ.Optional: {
      const exist = getByte(view, cursor) !== 0;
      if (exist) {
        const val = fromSlice(view, scheme.data, cursor);
        return val;
      } else {
        return null;
      }
    }
    case Typ.SimpleEnum: {
      const variantVal = getByte(view, cursor);
      const name = scheme.data.variants[variantVal];
      return name;
    }
    case Typ.Struct: {
      switch (scheme.data.fields.type) {
        case FieldType.Named: {
          const struct: Record<string, unknown> = {};
          for (const [name, field] of scheme.data.fields.data) {
            const item = fromSlice(view, field, cursor);
            struct[name] = item;
          }
          return struct;
        }
        case FieldType.Unnamed: {
          const tuple: unknown[] = [];
          for (const field of scheme.data.fields.data) {
            const item = fromSlice(view, field, cursor);
            tuple.push(item);
          }
          return tuple;
        }
        default:
          throw Error(
            `unknown fields type: ${JSON.stringify(scheme.data.fields)}`,
          );
      }
    }
    case Typ.Enum: {
      const variantVal = getByte(view, cursor);
      const [name, variant] = scheme.data.variants[variantVal];
      const data = fromSlice(view, variant, cursor);
      return { type: name, data };
    }
    case Typ.Void:
      return undefined;
    case Typ.Json: {
      return fromSlice(view, jsonValueSchema, cursor);
    }
    case Typ.JsonBytes: {
      const str = getString(view, cursor);
      return JSON.parse(str);
    }
    case Typ.Custom: {
      let [name, types] = scheme.data;
      return customImpls[name](view, cursor, types);
    }
    default:
      throw Error(`unhandled type: ${JSON.stringify(scheme)}`);
  }
};
