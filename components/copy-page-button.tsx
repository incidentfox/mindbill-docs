"use client";

import { Check, Copy } from "lucide-react";
import { useState } from "react";

function cleanText(value: string): string {
  return value.replace(/\u00a0/g, " ").replace(/[ \t]+\n/g, "\n").trim();
}

function inlineMarkdown(node: Node): string {
  if (node instanceof Text) return node.textContent ?? "";
  if (!(node instanceof HTMLElement)) return "";
  const element: HTMLElement = node;
  const matches = (selector: string): boolean => element.matches(selector);
  if (matches("[data-copy-page-ignore]")) return "";

  const content = Array.from(element.childNodes).map(inlineMarkdown).join("");
  if (matches("code")) return `\`${cleanText(content)}\``;
  if (matches("strong, b")) return `**${cleanText(content)}**`;
  if (matches("em, i")) return `_${cleanText(content)}_`;
  if (matches("a")) {
    const href = element.getAttribute("href");
    return href ? `[${cleanText(content)}](${new URL(href, window.location.href).href})` : content;
  }
  if (matches("br")) return "\n";
  return content;
}

function blockMarkdown(node: Element): string {
  if (!(node instanceof HTMLElement) || node.matches("[data-copy-page-ignore]")) return "";

  if (node.matches(".code-block")) {
    const filename = cleanText(node.querySelector(".code-toolbar > span")?.textContent ?? "");
    const language = node.dataset.codeLanguage ?? "";
    const code = cleanText(node.querySelector("pre")?.textContent ?? "");
    return `${filename ? `_${filename}_\n\n` : ""}\`\`\`${language}\n${code}\n\`\`\``;
  }

  const tag = node.tagName.toLowerCase();
  if (/^h[1-6]$/.test(tag)) {
    return `${"#".repeat(Number(tag.slice(1)))} ${cleanText(inlineMarkdown(node))}`;
  }
  if (tag === "p") return cleanText(inlineMarkdown(node));
  if (tag === "blockquote") return cleanText(inlineMarkdown(node)).split("\n").map((line) => `> ${line}`).join("\n");
  if (tag === "pre") return `\`\`\`\n${cleanText(node.textContent ?? "")}\n\`\`\``;
  if (tag === "li") {
    const blocks = Array.from(node.children).map(blockMarkdown).filter(Boolean);
    return blocks.length ? blocks.join("\n\n") : cleanText(inlineMarkdown(node));
  }
  if (tag === "ul" || tag === "ol") {
    return Array.from(node.children).map((child, index) => {
      const body = blockMarkdown(child);
      const marker = tag === "ol" ? `${index + 1}.` : "-";
      return `${marker} ${body.replace(/\n/g, "\n   ")}`;
    }).join("\n");
  }
  if (tag === "aside" && node.classList.contains("callout")) {
    const title = cleanText(node.querySelector(":scope > strong")?.textContent ?? "");
    const body = cleanText(node.querySelector(":scope > div")?.textContent ?? "");
    return [title ? `> **${title}**` : "> Note", ...body.split("\n").map((line) => `> ${line}`)].join("\n");
  }

  return Array.from(node.children).map(blockMarkdown).filter(Boolean).join("\n\n")
    || cleanText(inlineMarkdown(node));
}

function pageAsMarkdown(article: HTMLElement): string {
  const sections = [
    article.querySelector(".doc-header"),
    article.querySelector(".doc-content"),
  ].filter((node): node is Element => Boolean(node));
  return `${sections.map(blockMarkdown).filter(Boolean).join("\n\n")}\n`;
}

export function CopyPageButton() {
  const [copied, setCopied] = useState(false);
  return (
    <button
      type="button"
      className="copy-page-button"
      data-copy-page-ignore
      aria-label="Copy page as Markdown"
      onClick={async () => {
        const article = document.querySelector<HTMLElement>("[data-doc-article]");
        if (!article) return;
        const markdown = pageAsMarkdown(article);
        if (navigator.clipboard?.writeText) {
          await navigator.clipboard.writeText(markdown);
        } else {
          const textarea = document.createElement("textarea");
          textarea.value = markdown;
          textarea.style.position = "fixed";
          textarea.style.opacity = "0";
          document.body.appendChild(textarea);
          textarea.select();
          document.execCommand("copy");
          textarea.remove();
        }
        setCopied(true);
        window.setTimeout(() => setCopied(false), 1400);
      }}
    >
      {copied ? <Check size={16} /> : <Copy size={16} />}
      {copied ? "Copied" : "Copy page"}
      <span>Markdown</span>
    </button>
  );
}
