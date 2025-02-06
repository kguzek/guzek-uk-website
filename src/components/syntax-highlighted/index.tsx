"use client";

import "./syntax-highlighted.css";

// const SAMPLE_JSON = {
//   string_key: "hello world",
//   number_key: 12345,
//   __false_key: false,
//   __true_key: true,
//   __null_key: null,
// };

// Adapted from StackOverflow
// https://stackoverflow.com/questions/4810841/pretty-print-json-using-javascript
function syntaxHighlight(json: any) {
  if (typeof json !== "string") {
    try {
      json = JSON.stringify(json, undefined, 2);
    } catch (error) {
      console.error(error);
      console.debug(json);
      json = `{\n  [Circular]\n}`;
    }
  }
  json = json
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
  return json.replace(
    /("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g,
    (match: any) => {
      const cls = match.startsWith('"')
        ? match.endsWith(":")
          ? "key"
          : "string"
        : ["true", "false", "null"].includes(match)
          ? match
          : "number";
      return `<span class="${cls}">${match}</span>`;
    },
  );
}

export function SyntaxHighlighted({ json }: { json: any }) {
  return (
    <div className="box-border w-full p-3">
      <pre>
        <code
          dangerouslySetInnerHTML={{
            __html: syntaxHighlight(json),
          }}
        ></code>
      </pre>
    </div>
  );
}
