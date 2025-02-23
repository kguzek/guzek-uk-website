import type {
  Access,
  FieldAccess,
  NumberFieldManyValidation,
  ValidateOptions,
} from "payload";

export const ALPHANUMERIC_PATTERN = /^[a-zA-Z0-9][\w-]+[a-zA-Z0-9]$/;

export const isAdminFieldLevel: FieldAccess = ({ req: { user } }) =>
  user?.role === "admin";

export const isAdmin: Access = isAdminFieldLevel;

export const isAdminOrSelf: Access = ({ req }) =>
  req.user == null ? false : isAdmin({ req }) || { id: { equals: req.user.id } };

/** Ensures the value is falsey or a valid URL with either HTTP or HTTPS. */
export function validateUrl(value?: string | null): string | true {
  if (!value) return true;
  let url;
  try {
    url = new URL(value);
  } catch (error) {
    return `Invalid URL: ${(error as Error).message}`;
  }
  return (
    url.protocol === "http:" ||
    url.protocol === "https:" ||
    "URL must start with http:// or https://"
  );
}

/** Ensures every item in the array appears at most once. */
export const isEmptyOrUniqueArray: NumberFieldManyValidation = (array) =>
  !array || new Set(array).size === array.length || "Every array item must be unique.";

export const isEmptyOrPositiveIntegerArray = (
  array: null | undefined | any[], // eslint-disable-line @typescript-eslint/no-explicit-any
) =>
  !array ||
  array.every((value) => Number.isInteger(value) && value > 0) ||
  "Every array item must be a positive integer.";

type Validator<F extends object, T> = (
  value: T | null | undefined,
  options: ValidateOptions<unknown, unknown, F, T>,
) => string | true | Promise<string | true>;

/** Allows the stacking of multiple validators for a given field. */
export const stackValidators = <F extends object, T>(
  ...validators: Validator<F, T>[]
) => {
  const stacked: Validator<F, T> = (value, options) => {
    for (const validator of validators) {
      const result = validator(value, options);
      if (result !== true) return result;
    }
    return true;
  };
  return stacked;
};
