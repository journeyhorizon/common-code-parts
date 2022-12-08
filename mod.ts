const composeMRight =
  (method) =>
  (...ms) =>
    ms.reduceRight((f, g) => (x) => g(x)[method](f));
//This one is used to inject your own logic onto the current execution
//Result of the previous function is the args of the current function
const composePromises = composeMRight("then");

export { composePromises };

