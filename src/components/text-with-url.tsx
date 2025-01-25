import Link from "next/link";

const VALUE_URL_PATTERN = new RegExp("^(.+)(https://[^\\s]+)(\\s.+)?$");

/** Splits a string which may or may not contain a URL.
 *
 * @param value The string to split, defaulting to an empty string.
 * @returns An array with three elements: the text before the URL, the URL itself, and the text after the URL, if any. If the URL is not present, the first element will be equal to `value` and the other two will be empty strings.
 */
function splitUrlText(value?: string) {
  const text = value || "";
  const match = VALUE_URL_PATTERN.exec(text);
  return match ? match.slice(1) : [text, "", ""];
}

export function TextWithUrl({ children }: { children: string | string[] }) {
  const joined = Array.isArray(children) ? children.join(" ") : children;
  const [before, url, after] = splitUrlText(joined);
  return (
    <p>
      {before}
      {url && (
        <Link
          href={url}
          target="_blank"
          className="hover-underline text-accent"
        >
          {url}
        </Link>
      )}
      {after || (url && ".")}
    </p>
  );
}
