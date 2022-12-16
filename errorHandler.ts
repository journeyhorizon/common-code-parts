import { Json, ModuleError } from "./commonType.ts";

export class ModuleGenericError extends Error {
  status: number;
  errorDetails: Json;

  constructor(errorObj: ModuleError) {
    super(JSON.stringify(errorObj.data));
    this.status = errorObj.status;
    this.errorDetails = errorObj.data;
  }
}
