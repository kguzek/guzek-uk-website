import Link from "next/link";

import { Logo } from "@/components/logo";
import { getTranslations } from "@/lib/providers/translation-provider";

export async function Footer() {
  const { data } = await getTranslations();
  const version = process.env.npm_package_version;
  return (
    <footer className="py-4">
      <hr />
      <div className="mt-4 flex items-center justify-center gap-3">
        <Logo size={20} />
        <small className="text-xs">
          <Link
            className="hover-underline"
            href="https://github.com/kguzek"
            target="_blank"
          >
            {data.footer(new Date().getFullYear().toString())}
          </Link>
        </small>
        <small className="text-xs">
          Next.js (payload{version ? ` v${version}` : ""})
        </small>
      </div>
    </footer>
  );
}
