export const DELETE_CONFIRM_VALUE = "yes-delete";

export function isDeleteConfirmed(
  value: FormDataEntryValue | null | undefined,
): boolean {
  return value === DELETE_CONFIRM_VALUE;
}
