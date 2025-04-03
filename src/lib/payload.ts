import type { FeatureProviderServer } from "@payloadcms/richtext-lexical";
import type {
  Access,
  FieldAccess,
  NumberFieldManyValidation,
  ValidateOptions,
} from "payload";
import { FixedToolbarFeature, lexicalEditor } from "@payloadcms/richtext-lexical";

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
    return `Invalid URL: ${(error as Error).message}.`;
  }
  return (
    ["http:", "https:"].includes(url.protocol) ||
    "URL must use either HTTP or HTTPS protocols."
  );
}

/** Ensures the value is falseys or a valid GitHub repository URL. */
export function validateGitHubUrl(value?: string | null): string | true {
  return (
    !value ||
    /^https:\/\/github\.com\/[^/]+\/[^/]+$/.test(value) ||
    "Must be a valid GitHub repository URL."
  );
}

/** Ensures every item in the array appears at most once. */
export const isEmptyOrUniqueArray: NumberFieldManyValidation = (array) =>
  (array != null && new Set(array).size === array.length) ||
  "Every array item must be unique.";

export const isNonNegativeInteger = (value: string | number) =>
  Number.isInteger(+value) && +value >= 0;

export const isEmptyOrNonNegativeIntegerArray = (
  array: null | undefined | (string | number)[],
) =>
  (array != null && array.every(isNonNegativeInteger)) ||
  "Every array item must be a positive integer.";

type Validator<F extends object, T> = (
  value: T | null | undefined,
  options: ValidateOptions<unknown, unknown, F, T>,
) => string | true | Promise<string | true>;

/** Allows the stacking of multiple validators for a given field. */
export const stackValidators =
  <F extends object, T>(...validators: Validator<F, T>[]): Validator<F, T> =>
  (value, options) =>
    validators
      .reduce(async (acc, validator) => {
        const messages = await acc;
        const message = await validator(value, options);
        return message === true ? messages : [...messages, message];
      }, Promise.resolve<string[]>([]))
      .then((results) => results.length === 0 || results.join(" "));

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const richTextEditor = (...features: FeatureProviderServer<any, any, any>[]) =>
  lexicalEditor({
    features: ({ defaultFeatures, rootFeatures }) => [
      ...defaultFeatures,
      ...rootFeatures,
      FixedToolbarFeature(),
      ...features,
    ],
  });
