import type { CollectionConfig, NumberField } from "payload";

import {
  isAdmin,
  isAdminFieldLevel,
  isAdminOrSelf,
  isEmptyOrPositiveIntegerArray,
  isEmptyOrUniqueArray,
  stackValidators,
  validateUrl,
} from "@/lib/payload";

const showIdValidator = stackValidators<NumberField, number[]>(
  isEmptyOrUniqueArray,
  isEmptyOrPositiveIntegerArray,
);

export const Users: CollectionConfig = {
  slug: "users",
  admin: {
    useAsTitle: "username",
  },
  auth: {
    verify: true,
    loginWithUsername: {
      allowEmailLogin: true,
      requireEmail: true,
      requireUsername: true,
    },
    tokenExpiration: 3600,
    maxLoginAttempts: 5,
    lockTime: 300,
  },
  access: {
    create: isAdmin,
    read: isAdminOrSelf,
    update: isAdminOrSelf,
    delete: isAdmin,
  },
  fields: [
    // Email, hash and salt are added by default
    {
      name: "username",
      type: "text",
      required: true,
      unique: true,
      minLength: 4,
      maxLength: 20,
      validate: (value?: string | null) =>
        /^[a-zA-Z0-9][\w-]+[a-zA-Z0-9]$/.test(value ?? "") ||
        "Invalid username. Allowed characters: a-z, A-Z, 0-9, _, -",
    },
    {
      name: "role",
      type: "select",
      saveToJWT: true,
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
      defaultValue: "user",
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
          defaultValue: [],
          validate: showIdValidator,
        },
        {
          name: "subscribed",
          type: "number",
          hasMany: true,
          defaultValue: [],
          validate: showIdValidator,
        },
      ],
    },
    {
      name: "watchedEpisodes",
      type: "json",
      defaultValue: {},
      validate: (value) => {
        if (!value) return true;
        let parsed;
        if (typeof value === "string") {
          try {
            parsed = JSON.parse(value);
          } catch (error) {
            return `Invalid JSON: ${(error as Error).message}`;
          }
        } else {
          parsed = value;
        }
        if (Array.isArray(parsed)) return "Must be an object, not an array.";
        const parsedType = typeof parsed;
        if (parsedType !== "object")
          return `Must be an object, not ${parsedType}.`;
        for (const key in parsed) {
          if (!Array.isArray(parsed[key])) {
            return `Value at key "${key}" must be an array.`;
          }
          const arrayValidation = isEmptyOrPositiveIntegerArray(parsed[key]);
          if (arrayValidation !== true) return arrayValidation;
        }
        return true;
      },
    },
  ],
};
