declare var global: typeof globalThis & { __authToken?: string };

declare global {
  var __authToken: string | undefined;
}

export {};
