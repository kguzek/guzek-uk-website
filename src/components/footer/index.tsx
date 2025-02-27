import Link from "next/link";
import { Glow } from "@codaworks/react-glow";
import { FlaskConical } from "lucide-react";

import { Logo } from "@/components/logo";
import { getTranslations } from "@/lib/providers/translation-provider";

export async function Footer() {
  const { data } = await getTranslations();
  const version = process.env.npm_package_version;
  return (
    <footer className="py-4">
      <Glow>
        <hr className="border-background glow:border-accent/70" />
      </Glow>
      <div className="mt-4 flex items-center justify-center gap-3 text-xs">
        <Logo size={20} />
        <small>
          <Link
            className="hover-underline text-xs"
            href="https://github.com/kguzek"
            target="_blank"
          >
            {data.footer(new Date().getFullYear().toString())}
          </Link>
        </small>
        <small className="text-xs">{version ? `v${version}` : ""}</small>
        <Link
          href="https://github.com/kguzek/guzek-uk-website/pull/18"
          className="group flex items-center gap-1"
        >
          <FlaskConical
            size={24}
            className="scale-75 transition-transform duration-300 group-hover:scale-100"
          />
          <span className="hover-underline group-hover:underlined text-xs">
            PayloadCMS
          </span>
        </Link>
      </div>
    </footer>
  );
}
