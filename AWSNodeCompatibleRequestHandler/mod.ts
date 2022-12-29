import { NodeHttpHandler } from "npm:@aws-sdk/node-http-handler";

// deno-lint-ignore no-explicit-any
export type Record<K extends keyof any, T> = {
  [P in K]: T;
};

export const queryParser = (query?: { [key: string]: number | string }): string => {
  if (!query) {
    return "";
  }

  return Object.entries(query).reduce(
    (query: string, currentQueryPair: [string, string | number]): string => {
      const [key, value] = currentQueryPair;
      if (query === "") {
        return `?${key}=${value}`;
      }
      return `${query}&${key}=${value}`;
    },
    ""
  );
};

export const parseDenoToNodeHeaders = (headers: Headers): HeaderBag => {
  const nodeCompatibleHeader: HeaderBag = {};
  headers.forEach((value: string, key: string) => {
    nodeCompatibleHeader[`${key}`] = value;
  });
  return nodeCompatibleHeader;
};

export declare type HeaderBag = Record<string, string>;

export interface HttpMessage {
  headers: HeaderBag;
  // deno-lint-ignore no-explicit-any
  body?: any;
}

export declare type HttpResponseOptions = Partial<HttpMessage> & {
  statusCode: number;
};

export class DenoHttpResponse {
  statusCode: number;
  headers: HeaderBag;
  // deno-lint-ignore no-explicit-any
  body?: any;
  constructor(options: HttpResponseOptions) {
    this.statusCode = options.statusCode;
    this.headers = options.headers || {};
    this.body = options.body;
  }
  static isInstance(response: DenoHttpResponse) {
    if (!response) return false;
    const resp = response;
    return (
      typeof resp.statusCode === "number" && typeof resp.headers === "object"
    );
  }
}

export interface NodeCompatibleReadableStream<R> extends ReadableStream<R> {
  // deno-lint-ignore no-explicit-any
  pipe?: (stream: any) => void;
  // deno-lint-ignore ban-types
  on?: (eventName: string, cb: Function) => void;
}

export class AWSNodeCompatibleRequestHandler extends NodeHttpHandler {
  async handle(
    // deno-lint-ignore no-explicit-any
    request: any,
    handlerOptions?: {
      abortSignal: AbortSignal;
    }
  ): Promise<{
    response: DenoHttpResponse;
  }> {
    const requestOptions: RequestInit = {
      headers: request.headers,
      method: request.method,
      body: request.body,
      keepalive: true,
    };

    if (handlerOptions) {
      requestOptions.signal = handlerOptions.abortSignal;
    }

    const rawResponse: Response = await fetch(
      `${request.protocol}//${request.hostname}${request.path}${queryParser(
        request.query
      )}`,
      requestOptions
    );

    // Deno ReadableStream and Node Stream are not compatible since Node expose events while Deno does not
    // So we would need to mimic that behavior using Node EventEmitter

    const streamingBody: NodeCompatibleReadableStream<Uint8Array> | null =
      rawResponse.body;

    if (streamingBody) {
      streamingBody.pipe = async (stream) => {
        if (rawResponse.body) {
          const bodyReader = rawResponse.body.getReader();
          const parsedBody = await bodyReader.read();

          // We would call node stream.end method so that the finish event can be called
          stream.end(parsedBody.value || "");
        }
      };
      streamingBody.on = (eventName, _cb) => {
        console.info(
          `Readable Stream event listener, event "${eventName}": Not implemented`
        );
      };
    }

    const response = new DenoHttpResponse({
      statusCode: rawResponse.status,
      headers: parseDenoToNodeHeaders(rawResponse.headers),
      body: streamingBody,
    });

    return {
      response,
    };
  }
}