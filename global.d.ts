declare interface EnumVariant<T, D = undefined> {
  type: T;
  data: D;
}

declare type Option<T> = T | null;

declare type closure = () => void;

// interface RequestInit {
//   priority?: "high" | "low";
// }

interface EventTarget {
  closest(this: EventTarget, key: string): Element | null;
}

declare type ChangeEvent = Event & {
  currentTarget: { name: string; value: string };
};

interface Navigator {
  sayswho?: string;
  userAgentData?: { mobile?: boolean };
}

interface PreventElement {
  preventDefault: () => void;
}
