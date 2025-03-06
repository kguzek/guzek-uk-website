import type { CollectionBeforeChangeHook, CollectionConfig } from "payload";

import type { Project } from "@/payload-types";
import {
  ALPHANUMERIC_PATTERN,
  isAdmin,
  stackValidators,
  validateGitHubUrl,
  validateUrl,
} from "@/lib/payload";

const isEpochDate = (date?: string | Date | null) =>
  date == null ||
  date === "" ||
  (date instanceof Date ? date : new Date(date)).getTime() === 0;

const getGithubApiUrl = (repositoryUrl: string) =>
  repositoryUrl.replace("github.com", "api.github.com/repos");

async function getRepoCreationDate(repositoryUrl: string) {
  try {
    const result = await fetch(getGithubApiUrl(repositoryUrl));
    const body = await result.json();
    if (!result.ok) {
      throw new Error(`HTTP ${result.status} ${body.message}`);
    }
    const createdAt = body.created_at;
    if (typeof createdAt === "string") {
      return createdAt;
    }
    return null;
  } catch (error) {
    console.error("Failed to fetch repository creation date", error);
    return null;
  }
}

async function getRepoDownloadUrl(repositoryUrl: string) {
  try {
    const result = await fetch(`${getGithubApiUrl(repositoryUrl)}/releases/latest`);
    const body = await result.json();
    if (!result.ok) {
      if (result.status === 404) {
        // No releases found
        return null;
      }
      throw new Error(`HTTP ${result.status} ${body.message}`);
    }
    return `${repositoryUrl}/releases/latest`;
  } catch (error) {
    console.error("Failed to fetch repository download URL", error);
    return null;
  }
}

export const Projects: CollectionConfig = {
  slug: "projects",
  access: {
    create: isAdmin,
    read: () => true,
    update: isAdmin,
    delete: isAdmin,
  },
  hooks: {
    beforeChange: [
      async (args) => {
        const project: Partial<Project> = { ...args.originalDoc, ...args.data };
        if (!project.slug) {
          project.slug = project.title?.toLowerCase().replace(/\s+/g, "-");
        }
        if (!project.repository) {
          return project;
        }
        if (isEpochDate(project.datePublished)) {
          const repoCreationDate = await getRepoCreationDate(project.repository);
          if (repoCreationDate != null) {
            project.datePublished = repoCreationDate;
          }
        }
        if (!project.downloadUrl) {
          const downloadUrl = await getRepoDownloadUrl(project.repository);
          if (downloadUrl != null) {
            project.downloadUrl = downloadUrl;
          }
        }
        return project;
      },
    ] as CollectionBeforeChangeHook<Project>[],
  },
  fields: [
    {
      name: "slug",
      type: "text",
      required: true,
      defaultValue: "",
      unique: true,
      validate: (value?: string | null) =>
        value === "" || ALPHANUMERIC_PATTERN.test(value ?? "") || "Invalid slug",
    },
    {
      name: "title",
      type: "text",
      localized: true,
      required: true,
    },
    {
      name: "description",
      type: "richText",
      localized: true,
      required: true,
    },
    {
      name: "repository",
      label: "Repository URL",
      type: "text",
      validate: stackValidators(validateUrl, validateGitHubUrl),
    },
    {
      name: "url",
      label: "Showcase URL",
      type: "text",
      validate: validateUrl,
    },
    {
      name: "downloadUrl",
      label: "Download URL",
      type: "text",
      validate: validateUrl,
    },
    {
      name: "mainImage",
      type: "relationship",
      relationTo: "media",
      required: true,
    },
    {
      name: "extraImages",
      type: "relationship",
      relationTo: "media",
      hasMany: true,
    },
    {
      name: "categories",
      type: "relationship",
      relationTo: "project-categories",
      hasMany: true,
      defaultValue: [],
    },
    {
      name: "technologies",
      type: "relationship",
      relationTo: "technologies",
      hasMany: true,
      defaultValue: [],
    },
    {
      name: "datePublished",
      type: "date",
      required: true,
      defaultValue: new Date(0),
      validate: (value, data) => {
        const project: Partial<Project> = data.siblingData;
        if (isEpochDate(value) && project.repository == null) {
          return "Publish date is required if repository URL is not provided";
        }
        return true;
      },
    },
  ],
};
