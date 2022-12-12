export type Json =
| string
| number
| boolean
| null
| { [property: string]: Json }
| Json[];

export interface ModuleGenericComponents {
// deno-lint-ignore ban-types
[key: string]: Json | Function;
}

export interface ModuleFunctionComponents {
  // deno-lint-ignore ban-types
  [key: string]: Function;
}