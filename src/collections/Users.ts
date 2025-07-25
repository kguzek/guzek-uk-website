import type { CollectionConfig, NumberField, PayloadRequest } from "payload";
import { NextResponse } from "next/server";
import { v4 as uuid } from "uuid";

import { ACCESS_TOKEN_EXPIRATION_SECONDS, PRODUCTION_URL } from "@/lib/constants";
import {
  ALPHANUMERIC_PATTERN,
  isAdmin,
  isAdminFieldLevel,
  isAdminOrSelf,
  isEmptyOrNonNegativeIntegerArray,
  isEmptyOrUniqueArray,
  stackValidators,
  validateUrl,
} from "@/lib/payload";
import { resetPassword } from "@/templates/reset-password";
import { verifyEmail } from "@/templates/verify-email";

const showIdValidator = stackValidators<NumberField, number[]>(
  isEmptyOrUniqueArray,
  isEmptyOrNonNegativeIntegerArray,
);

type TemplateName = "reset-password" | "verify-email";

const TEMPLATE_URL_FIELDS: { [key in TemplateName]: string } = {
  "reset-password": "{RESET_PASSWORD_URL}",
  "verify-email": "{VERIFICATION_URL}",
};

function fillHtmlTemplate(
  templateName: TemplateName,
  args?: { req?: PayloadRequest; token?: string; user?: { username?: string } },
) {
  const { token, user } = args ?? {};
  // const base =
  //   process.env.NODE_ENV === "development" && req?.protocol != null && req?.host != null
  //     ? `${req.protocol}//${req.host}`
  //     : PRODUCTION_URL;
  const url = `${PRODUCTION_URL}/${templateName}?token=${token}`;
  const template = templateName === "reset-password" ? resetPassword : verifyEmail;
  return template
    .replaceAll(TEMPLATE_URL_FIELDS[templateName], url)
    .replaceAll("{USERNAME}", user?.username ? ` @${user.username}` : "")
    .replaceAll("{WEBSITE_URL}", PRODUCTION_URL);
}

export const Users: CollectionConfig = {
  slug: "users",
  admin: {
    useAsTitle: "username",
  },
  auth: {
    verify: {
      generateEmailHTML: (args) => fillHtmlTemplate("verify-email", args),
    },
    forgotPassword: {
      generateEmailHTML: (args) => fillHtmlTemplate("reset-password", args),
    },
    loginWithUsername: {
      allowEmailLogin: true,
      requireEmail: true,
      requireUsername: true,
    },
    tokenExpiration: ACCESS_TOKEN_EXPIRATION_SECONDS,
    maxLoginAttempts: 5,
    lockTime: 300_000,
  },
  access: {
    create: isAdmin,
    read: isAdminOrSelf,
    update: isAdminOrSelf,
    delete: isAdminOrSelf,
  },
  endpoints: [
    {
      // Use server actions instead of REST API to implement ratelimit
      method: "post",
      path: "/forgot-password",
      handler: () => NextResponse.json({ message: "404 Not Found" }, { status: 404 }),
    },
  ],
  fields: [
    {
      name: "id",
      type: "text",
      required: true,
      unique: true,
      defaultValue: () => uuid(),
      admin: { hidden: true },
    },
    {
      name: "username",
      type: "text",
      saveToJWT: true,
      required: true,
      unique: true,
      minLength: 4,
      maxLength: 20,
      validate: (value?: string | null) =>
        ALPHANUMERIC_PATTERN.test(value ?? "") ||
        "Invalid username. Allowed characters: a-z, A-Z, 0-9, _, -",
    },
    {
      name: "email",
      type: "email",
      saveToJWT: true,
      required: true,
      unique: true,
    },
    {
      name: "role",
      type: "select",
      saveToJWT: true,
      required: true,
      defaultValue: "user",
      options: [
        {
          label: { en: "User", pl: "Użytkownik" },
          value: "user",
        },
        {
          label: { en: "Admin", pl: "Administrator" },
          value: "admin",
        },
      ],
      access: {
        create: isAdminFieldLevel,
        update: isAdminFieldLevel,
      },
    },
    {
      name: "serverUrl",
      label: { en: "LiveSeries Server URL", pl: "Adres serwera LiveSeries" },
      type: "text",
      saveToJWT: true,
      defaultValue: "",
      validate: (value?: string | null) => {
        const urlValidationResult = validateUrl(value);
        return urlValidationResult === true
          ? !value || value.endsWith("/") || "Server URL must end with a slash."
          : urlValidationResult;
      },
    },
    {
      name: "userShows",
      type: "group",
      fields: [
        {
          name: "liked",
          type: "number",
          hasMany: true,
          defaultValue: [0],
          required: true,
          validate: showIdValidator,
        },
        {
          name: "subscribed",
          type: "number",
          hasMany: true,
          defaultValue: [0],
          required: true,
          validate: showIdValidator,
        },
      ],
    },
    {
      name: "watchedEpisodes",
      type: "json",
      defaultValue: {} as { [showId: string]: { [season: string]: number[] } },
      required: true,
      jsonSchema: {
        fileMatch: ["^/src/collections/Users.ts$"],
        uri: "https://json-schema.org/draft/2020-12/schema",
        schema: {
          title: "Watched Episodes",
          type: "object",
          patternProperties: {
            "^[1-9][0-9]*$": {
              title: "TV Show Map",
              type: "object",
              patternProperties: {
                "^[1-9][0-9]*$": {
                  title: "Episode Array",
                  type: "array",
                  items: {
                    type: "integer",
                    minimum: 0,
                  },
                  uniqueItems: true,
                },
              },
              additionalProperties: false,
            },
          },
          additionalProperties: false,
        },
      },
    },
  ],
};
