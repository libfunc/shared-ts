import { bytesView, fromSlice, getLen } from "./from-slice";
import type { JsKeyType, KeyVal, TypedKeyType } from "./ty";
import { FieldType, KeyVariant, Typ } from "./ty";
import type {
  KeyScheme,
  NameAndType,
  NamedFields,
  Scheme,
  StructType,
} from "./types";
import { KeySchemeType } from "./types";

export { sch } from "./scheme";
export { FieldType, Typ } from "./ty";
export { KeySchemeType } from "./types";
export type { KeyScheme, NamedFields, Scheme, StructType } from "./types";

// deserialize single value
export const valDeser = (view: DataView, scheme: Scheme) => {
  const cursor = { value: 0 };
  // const time = performance.now();
  const item = fromSlice(view, scheme, cursor);
  // const timeEnd = performance.now();
  // console.info("one item deserialize", timeEnd - time);
  return item;
};

export const vecDeser = (view: DataView, scheme: Scheme) => {
  const arr = [];
  const cursor = { value: 0 };
  // const time = performance.now();
  while (cursor.value < view.byteLength) {
    const val = fromSlice(view, scheme, cursor);
    arr.push(val);
  }
  // const timeEnd = performance.now();
  // console.info("vec deserialize", timeEnd - time);
  return arr;
};

// deserialize key
const keyDeser = (
  view: DataView,
  scheme: KeyScheme,
  cursor: { value: number },
): JsKeyType => {
  switch (scheme.type) {
    case KeySchemeType.Typed: {
      const arr = [];
      for (const item of scheme.data) {
        switch (item.type) {
          case KeyVariant.U8: {
            const u8 = view.getUint8(cursor.value);
            arr.push(u8);
            cursor.value++;
            break;
          }
          case KeyVariant.U32: {
            const num = view.getUint32(cursor.value);
            arr.push(num);
            cursor.value += 4;
            break;
          }
          case KeyVariant.Array: {
            const len = item.data.size;
            const slice = bytesView(view, cursor, len);
            arr.push(slice);
            break;
          }
          default:
            throw Error(`unhandled type in key: ${JSON.stringify(item)}`);
        }
      }
      // console.log(arr);
      return arr;
    }
    case KeySchemeType.Bytes: {
      const len = getLen(view, cursor);
      return bytesView(view, cursor, len);
    }
  }
};

export const entryDeser = (
  view: DataView,
  keyScheme: KeyScheme,
  valScheme: Scheme,
  cursor: { value: number },
): KeyVal => {
  const key = keyDeser(view, keyScheme, cursor);
  const val = fromSlice(view, valScheme, cursor);
  return { key, val };
};

export const vecEntryDeser = (
  view: DataView,
  keyScheme: KeyScheme,
  valScheme: Scheme,
) => {
  const arr = [];
  const cursor = { value: 0 };
  // const time = performance.now();
  const max = view.byteLength - 1;
  while (cursor.value < max) {
    const entry = entryDeser(view, keyScheme, valScheme, cursor);
    // console.log("entry", entry);
    arr.push(entry);
  }
  // const timeEnd = performance.now();
  // console.info("vec deserialize", timeEnd - time);
  return arr;
};

export const stringify = (item: unknown): string => {
  if (typeof item === "string") {
    return item;
  }
  if (typeof item === "number") {
    return item.toString();
  }
  if (typeof item === "object") {
    if (item instanceof Date) {
      return item.toISOString();
    }
    if (item === null) {
      return "";
    }
    if (item instanceof Uint8Array) {
      return `Uint8Array with len: ${item.length}`;
    }

    return JSON.stringify(item);
  }

  return "";
};

export const keyTypeToString = (type: TypedKeyType): string => {
  switch (type.type) {
    case KeyVariant.U8:
      return "U8";
    case KeyVariant.U32:
      return "U32";
    case KeyVariant.Array:
      return `Array(${type.data.size})`;
  }
};

export const flatten = (scheme: StructType, prefix = ""): NameAndType[] => {
  return (scheme.data.fields as NamedFields).data.flatMap(([name, scheme]) => {
    if (
      scheme.type === Typ.Struct &&
      scheme.data.fields.type === FieldType.Named
    ) {
      return flatten(scheme, `${prefix}${name}.`);
    }
    return [[prefix + name, scheme]];
  });
};
