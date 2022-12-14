import { Json } from "./commonType.ts";

export interface BaseResponse<T> {
  data: T;
  metadata?: Json;
  includes?: {
    [key: string]: Json;
  };
}

export interface ModuleResponse<T> extends BaseResponse<T> {
  status: number;
}

export interface ErrorResponse<T> {
  name: string;
  data?: T;
  metadata?: Json;
  includes?: {
    [key: string]: Json;
  };
}

export interface ModuleErrorResponse<T> extends ErrorResponse<T> {
  status: number;
}

export class ThrownError extends Error {
  status: number;
  data: Json | undefined;

  constructor({ status, data }: { status: number; data?: Json }) {
    super(data?.toString());
    this.status = status;
    if (data) {
      this.data = data;
    }
  }
}
