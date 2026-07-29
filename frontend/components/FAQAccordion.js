export default function FAQAccordion({ faqs }) {
  if (!faqs?.length) return null;

  return (
    <div className="space-y-3">
      {faqs.map((faq, i) => (
        <details
          key={i}
          className="group rounded-2xl border border-gray-100 bg-white px-5 py-4 shadow-sm transition-shadow duration-300 open:shadow-md"
        >
          <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-bold text-[var(--tc-dark)] transition-colors group-hover:text-[var(--tc-primary)]">
            {faq.question}
            <span className="grid h-7 w-7 flex-none place-items-center rounded-full bg-[var(--tc-primary-tint)] text-lg text-[var(--tc-primary)] transition-transform duration-300 group-open:rotate-45">
              +
            </span>
          </summary>
          {faq.answer && <p className="mt-3 text-sm leading-relaxed text-gray-600">{faq.answer}</p>}
        </details>
      ))}
    </div>
  );
}
