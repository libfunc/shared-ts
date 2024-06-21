export type Id = string;

export interface Uid<E = RecordStatus> {
  id: Id;
  status: E;
}

export const enum RecordStatus {
  Active = "Active",
  Disabled = "Disabled",
  Deleted = "Deleted",
}

export type Entry<T, ID = Uid> = T & ID;

export type DateType = Date;
export type Datetime = string;
export type Timestamp = string;

// e81800dca5-242-e806
// `${ts}-${shardId}-${rand}` where ts: 5 bytes hex, shardId: 0-255 (1 byte), rand: 2 bytes hex
// only for internal use (admin), not for public
export type Fuid = `${string}-${string}-${string}`;
