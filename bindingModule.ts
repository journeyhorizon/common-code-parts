import { ModuleGenericComponents, ModuleProperty } from "./commonType.ts";
import { ThrownError } from "./responseType.ts";

const bindModule = (
  mod: ModuleGenericComponents,
  thisToAssign: unknown
): ModuleGenericComponents => {
  return Object.entries(mod).reduce(
    (boundModule: ModuleGenericComponents, currentPair) => {
      const [key, value] = currentPair;

      if (!value) {
        throw new ThrownError({
          status: 400,
          data: {
            message: `Can not find definition for module ${key}`,
          },
        });
      }

      if (value instanceof Function) {
        boundModule[key] = value;
        boundModule[key] = boundModule[key]?.bind(thisToAssign);
      } else {
        boundModule[key] = bindModule(
          value as ModuleGenericComponents,
          thisToAssign
        ) as ModuleProperty;
      }

      return boundModule;
    },
    {}
  );
};
