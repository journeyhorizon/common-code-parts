export interface BaseResponse<T> {
  data: T;
  metadata?: any;
  includes?: {
    [key: string]: any;
  };
}

export interface ModuleResponse<T> extends BaseResponse<T> {
  status: number;
}

export interface ErrorResponse<T> {
  name: string;
  data?: T;
  metadata?: any;
  includes?: {
    [key: string]: any;
  };
}

export interface ModuleErrorResponse<T> extends ErrorResponse<T> {
  status: number;
}
