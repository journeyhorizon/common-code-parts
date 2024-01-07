import { NodeHttpHandler } from "npm:@aws-sdk/node-http-handler";
import { HttpHandlerOptions, AbortSignal, QueryParameterBag, HeaderBag, HttpMessage } from "npm:@smithy/types";
import { HttpHandler, HttpRequest, HttpResponse } from "npm:@smithy/protocol-http";

const queryParser = (query?: QueryParameterBag): string => {
  if (!query) {
    return "";
  }

  return Object.entries(query)
    .reduce((result, [key, value]) => {
      if (value !== null) {
        let stringRep
        if (typeof value === 'string') {
          stringRep = value
        } else if (Array.isArray(value)) {
          stringRep = value.join(',')
        }
        return result === ''
          ? `?${key}=${stringRep}`
          : `${result}&${key}=${stringRep}`
      }
      return result;
    }, '')
};

const parseDenoToNodeHeaders = (headers: Headers): HeaderBag => {
  const nodeCompatibleHeader: HeaderBag = {};

  headers.forEach((value: string, key: string) => {
    nodeCompatibleHeader[`${key}`] = value;
  });

  return nodeCompatibleHeader;
};

export declare type HttpResponseOptions = Partial<HttpMessage> & {
  statusCode: number;
};

export class DenoHttpResponse extends HttpResponse {
  statusCode: number;
  headers: HeaderBag;
  // deno-lint-ignore no-explicit-any
  body?: any;
  constructor(options: HttpResponseOptions) {
    super(options)

    this.statusCode = options.statusCode;
    this.headers = options.headers || {};
    this.body = options.body;
  }
  static isInstance(response: DenoHttpResponse): response is HttpResponse {
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

// deno-lint-ignore no-empty-interface
export interface AWSNodeCompatibleHttpHandlerConfig {
  // Define any custom configuration options here
}

export class AWSNodeCompatibleRequestHandler extends NodeHttpHandler implements HttpHandler<AWSNodeCompatibleHttpHandlerConfig> {
  async handle(
    request: HttpRequest,
    handlerOptions?: HttpHandlerOptions
  ): Promise<{ response: HttpResponse; }> {
    const requestOptions: RequestInit = {
      headers: request.headers,
      method: request.method,
      body: request.body,
      keepalive: true,
    };
    console.log('Request Options', requestOptions)

    if (handlerOptions) {
      if (handlerOptions.abortSignal) {
        throw new Error('No support for mapping abort signal')
        // requestOptions.signal = handlerOptions.abortSignal;
      }
    }

    const query = queryParser(request.query)
    console.log('Query', query)
    const url = `${request.protocol}//${request.hostname}${request.path}${query}`
    console.log('URL', url)

    const rawResponse: Response = await fetch(url, requestOptions);

    // Deno ReadableStream and Node Stream are not compatible since Node expose events while Deno does not
    // So we would need to mimic that behavior using Node EventEmitter
    const streamingBody: NodeCompatibleReadableStream<Uint8Array> | null = rawResponse.body;

    if (streamingBody) {
      streamingBody.pipe = async (stream) => {
        if (rawResponse.body) {
          const bodyReader = rawResponse.body.getReader();
          const parsedBody = await bodyReader.read();

          // We would call node stream.end method so that the finish event can be called
          stream.end(parsedBody.value || "");
        }
      }

      streamingBody.on = (eventName, _cb) => {
        console.info(`Readable Stream event listener, event "${eventName}": Not implemented`)
      }
    }

    const response = new DenoHttpResponse({
      statusCode: rawResponse.status,
      headers: parseDenoToNodeHeaders(rawResponse.headers),
      body: streamingBody,
    })

    return { response }
  }

  // Implement the HttpHandler interface methods
  // deno-lint-ignore no-unused-vars
  updateHttpClientConfig(key: keyof AWSNodeCompatibleHttpHandlerConfig, value: AWSNodeCompatibleHttpHandlerConfig[typeof key]): void {

  }

  httpHandlerConfigs(): AWSNodeCompatibleHttpHandlerConfig {
    return {}; // Return an instance of CustomHttpHandlerConfig
  }
}
