export interface Identifiable {
  id: string | number;
}

export function createFormData<T extends Identifiable>(
  keyId: string,
  values: T
): FormData {
  const formData = new FormData();
  formData.append(keyId, values.id.toString());

  Object.entries(values).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      const formValue =
        typeof value === "object" ? JSON.stringify(value) : value.toString();
      formData.append(key, formValue);
    }
  });

  return formData;
}
