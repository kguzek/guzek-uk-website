import Logo from "@/media/logo";
import { useTranslations } from "@/providers/translation-provider";

export async function Footer() {
  const { data } = await useTranslations();
  return (
    <footer className="mt-10">
      <hr />
      <div className="mt-2 flex items-center justify-center">
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
      </div>
    </footer>
  );
}
