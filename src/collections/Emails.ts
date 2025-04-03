import type { CollectionConfig, PayloadRequest, SendEmailOptions } from "payload";

import type { Email } from "@/payload-types";
import { EMAIL_FROM_ADDRESS } from "@/lib/constants";
import { isAdmin } from "@/lib/payload";

import { serializeEmailTemplate } from "./blocks/BlockEmailTemplate";

async function sendEmail(email: Email, req: PayloadRequest) {
  const { fromAddress, fromName, subject, content, recipients } = email;

  const [layout] = content;

  await Promise.all(
    recipients.map(async (recipient) => {
      const options: SendEmailOptions = {
        to: recipient.email,
        from: {
          address: fromAddress || EMAIL_FROM_ADDRESS,
          name: fromName || EMAIL_FROM_ADDRESS,
        },
        subject,
        html: await serializeEmailTemplate(layout, req.payload, recipient),
      };
      console.info(
        `Sending email with subject "${subject}" to ${recipient.email} (${recipient.name || "<no name>"})`,
      );
      try {
        return await req.payload.sendEmail(options);
      } catch (error) {
        console.error("Error sending email:", error);
      }
    }),
  );
}

export const Emails: CollectionConfig = {
  slug: "emails",
  access: {
    create: isAdmin,
    read: isAdmin,
    update: isAdmin,
    delete: isAdmin,
  },
  fields: [
    {
      name: "subject",
      type: "text",
      required: true,
    },
    {
      name: "fromAddress",
      type: "email",
      required: true,
      defaultValue: EMAIL_FROM_ADDRESS,
    },
    {
      name: "fromName",
      type: "text",
      required: true,
      defaultValue: EMAIL_FROM_ADDRESS,
    },
    {
      name: "recipients",
      type: "array",
      required: true,
      interfaceName: "EmailRecipients",
      minRows: 1,
      fields: [
        {
          name: "email",
          type: "email",
          required: true,
          admin: {
            description:
              "Used as the receipient email and for any '{EMAIL}' template replacements in the email message.",
          },
        },
        {
          name: "name",
          type: "text",
          admin: {
            description:
              "Used for any '{USERNAME}' template replacements in the email message.",
          },
        },
      ],
    },
    {
      name: "content",
      type: "blocks",
      required: true,
      blocks: [],
      blockReferences: ["email-template"],
      defaultValue: [
        {
          blockType: "email-template",
          blockName: "Content",
        },
      ],
      validate: (value) =>
        (Array.isArray(value) && value.length === 1) ||
        "You must select the email template exactly once.",
    },
    {
      name: "sent",
      type: "checkbox",
      defaultValue: false,
      admin: {
        description:
          "If checked, will send the mail on next save and reset to unchecked.",
      },
    },
  ],
  hooks: {
    beforeChange: [
      async (args) => {
        const email: Email = { ...args.originalDoc, ...args.data };
        if (!args.data.sent) {
          return email;
        }
        try {
          await sendEmail(email, args.req);
        } finally {
          email.sent = false;
          return email;
        }
      },
    ],
  },
};
