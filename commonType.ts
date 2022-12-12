export type Json =
| string
| number
| boolean
| null
| { [property: string]: Json }
| Json[];

export interface ModuleComponents {
// deno-lint-ignore ban-types
[key: string]: Json | Function;
}