import type {
  CollectionConfig,
  Payload,
  PayloadRequest,
  SendEmailOptions,
} from "payload";

import type { EmailRecipient, EmailRecipientManual } from "@/lib/types";
import type { Email } from "@/payload-types";
import { EMAIL_FROM_ADDRESS } from "@/lib/constants";
import { isAdmin } from "@/lib/payload";

import { serializeEmailTemplate } from "./blocks/BlockEmailTemplate";

async function getUserRecipient(
  uuid: string,
  payload: Payload,
): Promise<EmailRecipientManual> {
  const user = await payload.findByID({
    collection: "users",
    id: uuid,
  });
  if (!user) {
    throw new Error(`Failed to fetch user recipient: ${uuid}`);
  }
  return {
    type: "manual",
    name: user.username,
    email: user.email,
  };
}

async function sendEmail(email: Email, req: PayloadRequest) {
  const { fromAddress, fromName, subject, content, recipients } = email;

  const [layout] = content;

  async function _send(emailRecipient: EmailRecipient) {
    let recipient;
    if (emailRecipient.type === "user") {
      let userRecipient;
      try {
        userRecipient = await getUserRecipient(emailRecipient.user, req.payload);
      } catch (error) {
        console.error("Error fetching user recipient:", error);
        return;
      }
      recipient = userRecipient;
    } else {
      recipient = emailRecipient;
    }

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
      `Sending email with subject "${subject}" to`,
      recipient.email,
      `(${recipient.name || "<no name>"})`,
    );
    try {
      return await req.payload.sendEmail(options);
    } catch (error) {
      console.error("Error sending email:", error);
    }
  }

  const [firstRecipient, ...remainingRecipients] = recipients as EmailRecipient[];
  await _send(firstRecipient);
  for (const recipient of remainingRecipients) {
    // resend.com allows 2 emails per second
    await new Promise((resolve) => setTimeout(resolve, 500));
    await _send(recipient);
  }
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
          name: "type",
          type: "select",
          required: true,
          defaultValue: "manual",
          options: [
            { label: "Manual Entry", value: "manual" },
            { label: "Existing User", value: "user" },
          ],
          admin: {
            description:
              "Choose whether to manually enter a recipient's details or select an existing user.",
          },
        },
        {
          name: "name",
          type: "text",
          admin: {
            description: "Used for {USERNAME} replacements in the email message.",
            condition: (_, siblingData) => siblingData.type === "manual",
          },
        },
        {
          name: "email",
          type: "email",
          required: true,
          admin: {
            description:
              "Used as the recipient address and  for {EMAIL} replacements in the email message.",
            condition: (_, siblingData) => siblingData.type === "manual",
          },
        },
        {
          name: "user",
          type: "relationship",
          relationTo: "users",
          admin: {
            description: "Select an existing user as the recipient.",
            condition: (_, siblingData) => siblingData.type === "user",
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
      name: "shouldSend",
      type: "checkbox",
      defaultValue: false,
      virtual: true,
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
        if (!args.data.shouldSend) {
          return email;
        }
        try {
          await sendEmail(email, args.req);
        } finally {
          email.shouldSend = false;
          return email;
        }
      },
    ],
  },
};
