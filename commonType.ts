export type Json =
  | string
  | number
  | boolean
  | null
  | { [property: string]: Json }
  | Json[];

// deno-lint-ignore ban-types
export type ModuleProperty = Function | { [property: string]: ModuleProperty };

export interface ModuleGenericComponents {
  [key: string]: ModuleProperty;
}

export interface ModuleFunctionComponents {
  // deno-lint-ignore ban-types
  [key: string]: Function;
}

export interface ModuleError {
  status: number;
  data: Json;
}