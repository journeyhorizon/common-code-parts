import { Json } from "./commonType.ts";

const composeMRight =
  (method: string) =>
  // deno-lint-ignore ban-types
  (...ms: Function[]) =>
    ms.reduceRight((f, g) => (x: Json) => g(x)[method](f));
//This one is used to inject your own logic onto the current execution
//Result of the previous function is the args of the current function
const composePromises = composeMRight("then");

export default composePromises;
