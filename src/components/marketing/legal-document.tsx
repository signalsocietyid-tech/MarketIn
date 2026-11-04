import { Fragment } from "react";
import { DraftNotice, InfoPage, InfoSection } from "@/components/marketing/info-page";
import { CONTACT_EMAILS } from "@/content/contact";
import type { LegalBlock, LegalDocument } from "@/content/legal";

const EMAILS = Object.values(CONTACT_EMAILS);
const EMAIL_PATTERN = new RegExp(`(${EMAILS.map((e) => e.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("|")})`);

/** Turns known MarketIn email addresses inside a string into mailto links. */
function withEmailLinks(text: string) {
  return text.split(EMAIL_PATTERN).map((part, i) =>
    EMAILS.includes(part as (typeof EMAILS)[number]) ? (
      <a key={i} href={`mailto:${part}`}>
        {part}
      </a>
    ) : (
      <Fragment key={i}>{part}</Fragment>
    ),
  );
}

function Block({ block }: { block: LegalBlock }) {
  if ("p" in block) return <p>{withEmailLinks(block.p)}</p>;
  if ("h" in block) return <h3>{block.h}</h3>;
  if ("ul" in block)
    return (
      <ul>
        {block.ul.map((item) => (
          <li key={item}>{withEmailLinks(item)}</li>
        ))}
      </ul>
    );
  return (
    <div className="mt-4 overflow-x-auto rounded-lg border border-line">
      <table className="w-full min-w-[560px] border-collapse text-left text-sm">
        <thead className="bg-canvas text-xs font-medium uppercase tracking-wide text-subtle">
          <tr>
            {block.table.head.map((h) => (
              <th key={h} scope="col" className="border-b border-line px-4 py-2.5 font-medium">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {block.table.rows.map((row) => (
            <tr key={row.join("|")} className="[&:last-child>td]:border-b-0">
              {row.map((cell, i) => (
                <td key={i} className="border-b border-line px-4 py-3 align-top text-ink">
                  {i === 0 ? <code className="rounded bg-canvas px-1.5 py-0.5 text-[13px]">{cell}</code> : cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/** Renders a legal document from src/content/legal.ts with numbered sections and a TOC. */
export function LegalDocumentPage({ doc }: { doc: LegalDocument }) {
  return (
    <InfoPage
      eyebrow="Legal"
      title={doc.title}
      intro={doc.intro}
      lastUpdated={doc.lastUpdated}
      notice={<DraftNotice />}
      toc={doc.sections.map((s, i) => ({ id: s.id, label: `${i + 1}. ${s.title}` }))}
    >
      {doc.sections.map((s, i) => (
        <InfoSection key={s.id} id={s.id} number={i + 1} title={s.title}>
          {s.blocks.map((b, j) => (
            <Block key={j} block={b} />
          ))}
        </InfoSection>
      ))}
    </InfoPage>
  );
}
