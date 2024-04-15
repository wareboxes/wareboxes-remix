export interface ActionResponse {
  success: boolean;
  error: string | null;
  issues: Record<string, unknown> | null;
}

export function actionResponse(
  success: boolean = false,
  error: string | null = null,
  issues: Record<string, unknown> | null = null
): ActionResponse {
  return {
    success,
    error,
    issues,
  };
}
