import { Logo } from "@/media/logo";
import { useTranslations } from "@/providers/translation-provider";

export async function Footer() {
  const { data } = await useTranslations();
  return (
    <footer className="mt-10">
      <hr />
      <div className="mt-4 flex items-center justify-center gap-3">
        <Logo size={20} />
        <small className="text-xs">
          <a
            className="hover-underline"
            href="https://github.com/kguzek"
            target="_blank"
          >
            {data.footer(new Date().getFullYear().toString())}
          </a>
        </small>
        <small className="text-xs">Next (no-JS)</small>
      </div>
    </footer>
  );
}
