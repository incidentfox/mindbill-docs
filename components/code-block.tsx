import { codeToHtml } from "shiki";
import { CopyButton } from "./copy-button";

export async function CodeBlock({ code, language = "typescript", filename }: { code: string; language?: string; filename?: string }) {
  const html = await codeToHtml(code.trim(), {
    lang: language,
    themes: { light: "github-light", dark: "github-dark" },
  });
  return (
    <div className="code-block" data-code-language={language}>
      <div className="code-toolbar"><span>{filename ?? language}</span><CopyButton value={code.trim()} /></div>
      <div className="shiki-wrap" dangerouslySetInnerHTML={{ __html: html }} />
    </div>
  );
}
