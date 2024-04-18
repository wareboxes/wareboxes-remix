import { json } from "@remix-run/node";

export interface ActionResponse {
  success: boolean;
  error?: string;
  issues?: Record<string, unknown>;
}
type HandlerFunction = (formData: FormData) => Promise<Response>;

export interface ActionHandlers {
  [key: string]: HandlerFunction;
}

export function actionResponse(
  success: boolean,
  error?: string,
  issues?: Record<string, unknown>
): ActionResponse {
  return { success, error, issues };
}

export async function actionHandler(
  request: Request,
  actionHandlers: ActionHandlers,
  response: ActionResponse
) {
  const formData = await request.formData();
  const action = formData.get("action");

  if (typeof action !== "string") {
    return json(response);
  }
  const handler = actionHandlers[action || ""];

  if (handler) {
    return handler(formData);
  } else {
    return json(response);
  }
}
