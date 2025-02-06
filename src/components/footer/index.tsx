import Link from "next/link";

import { Logo } from "@/media/logo";
import { getTranslations } from "@/providers/translation-provider";

export async function Footer() {
  const { data } = await getTranslations();
  const version = process.env.npm_package_version;
  return (
    <footer className="mt-10">
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
          Next.js (main{version ? ` v${version}` : ""})
        </small>
      </div>
    </footer>
  );
}
