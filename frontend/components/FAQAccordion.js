export default function FAQAccordion({ faqs }) {
  if (!faqs?.length) return null;

  return (
    <div className="divide-y divide-gray-200/70">
      {faqs.map((faq, i) => (
        <details key={i} className="group py-4">
          <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-bold text-[var(--tc-dark)]">
            {faq.question}
            <span className="flex-none text-lg text-[var(--tc-primary)] transition group-open:rotate-45">+</span>
          </summary>
          {faq.answer && <p className="mt-3 text-sm leading-relaxed text-gray-600">{faq.answer}</p>}
        </details>
      ))}
    </div>
  );
}
