import { apiUrl, isTesting } from "./env";

export const URI = `${apiUrl}/api/`;
export const CLIENT_ERROR = 400;

interface UserMessage {
  text: string;
  field: string | null;
}

export class ApiError extends Error {
  statusCode: number;
  message: string;

  constructor(statusCode: number, message: string) {
    super(message);
    this.name = "ApiError";
    this.statusCode = statusCode;
    this.message = message;
  }
}

export class EntityError extends Error {
  error: UserMessage;

  constructor(error: UserMessage) {
    super("entity error");
    this.name = "EntityError";
    this.error = error;
  }
}

export type ParamsType = Record<string, string>;

export enum Method {
  Get = "GET",
  Post = "POST",
  Put = "PUT",
  Patch = "PATCH",
  Delete = "DELETE",
}

export interface RequestParams {
  path: string;
  params?: ParamsType;
  body?: unknown;
  method: Method;
  requiredSignin?: closure;
  metricSend?: (url: string, ms: number) => void;
  timeout?: number;
}

/**
 * Все запросы могут вернуть либо ОК,
 * либо Unauthorized 401 - необходимо перенаправить на страницу авторизации?
 *
 * - или вывести сообщение о необходимости авторизации
 * - либо 404 - "Не найдено..."
 * - либо Server error 500 - необходимо вывести ошибку "Ошибка..."
 * - либо Bad request 400 - необходимо вывести ошибку "Ошибка..."
 * - либо 403 - "Ошибка..."
 * - Либо свою кастомную ошибку - в этом случае необходимо вывести эту кастомную ошибку
 * - Кастомная ошибка отдается как 200, но у нее есть свой номер ошибки, сообщение для консоли и сообщение для пользователя
 * - Кастомные ошибки должны обрабатываться в компоненте, в котором делается запрос. В теле промиса в then, а не catch.
 * */
export const request = async <D>(data: RequestParams): Promise<D> => {
  const { params, path, body, method, requiredSignin, metricSend } = data;
  let uri = path;

  if (params) {
    const urlParams = new URLSearchParams();
    for (const [k, v] of Object.entries(params)) {
      urlParams.append(k, v);
    }
    const stringParams = urlParams.toString();
    if (stringParams) {
      uri = `${uri}?${urlParams.toString()}`;
    }
  }

  const headers = new Headers();

  if (body) {
    headers.set("Content-Type", "application/json");
  }

  let reqBody = null;

  if (body) {
    if (typeof body === "string") {
      reqBody = body;
    } else {
      reqBody = JSON.stringify(body);
    }
  }

  const controller = new AbortController();

  setTimeout(() => {
    controller.abort();
  }, data.timeout ?? 2000);

  // no-cors
  // cors - если есть заголовки CORS у стороннего сайта
  // same-origin - тот же самый origin, в рамках одного сайта
  const mode: RequestMode = isTesting ? "cors" : "same-origin";

  // include, same-origin, omit
  const credentials: RequestCredentials = isTesting ? "include" : "same-origin";

  // default, no-cache, reload, force-cache, only-if-cached
  // const cache = "default" as const;

  const options: RequestInit = {
    method,
    headers,
    body: reqBody,
    mode,
    credentials,
    signal: controller.signal,
    priority: "high",
  };

  const time = performance.now();

  const res = await fetch(uri, options);
  const contentType = res.headers.get("Content-Type");
  const isJson = contentType === "application/json";

  if (res.ok) {
    let body: D = null as D;

    if (isJson) {
      body = await res.json();
    } else if (contentType === "text/plain") {
      const data = (await res.text()) as D;
      body = data;
    } else if (contentType === "application/octet-stream") {
      const buffer = await res.arrayBuffer();
      const data = new DataView(buffer) as D;
      body = data;
    }

    const ms = performance.now() - time;
    metricSend?.(uri, ms);

    return body;
  }

  // Unprocessable Entity
  if (res.status === 422 && isJson) {
    const json: UserMessage = await res.json();
    const ms = performance.now() - time;
    metricSend?.(uri, ms);

    throw new EntityError(json);
  }

  let message = "";

  if (res.status === CLIENT_ERROR && isJson) {
    message = await res.text();
  }

  const ms = performance.now() - time;
  metricSend?.(uri, ms);

  // export const CLIENT_ERRORS = [400, 401, 403, 404];
  // const isClientError = CLIENT_ERRORS.includes(res.status);
  // if (!isClientError) {
  //   const text = await res.text();
  //   errorSend?.(res.status, "api_error", text);
  // }

  if (res.status === 401) {
    requiredSignin?.();
  }

  throw new ApiError(res.status, message);
};
