export default function CTABanner({ title = 'Get a Free Consultation', subtitle, whatsappNumber }) {
  return (
    <div className="mx-6 rounded-[28px] bg-ia-teal px-8 py-14 text-center text-white shadow-xl">
      <h2 className="text-2xl font-extrabold tracking-tight sm:text-3xl">{title}</h2>
      {subtitle && <p className="mx-auto mt-3 max-w-xl text-white/85">{subtitle}</p>}
      {whatsappNumber && (
        <a
          href={`https://wa.me/${whatsappNumber}`}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-7 inline-flex items-center justify-center gap-2.5 rounded-full bg-white px-7 py-3 text-sm font-bold text-ia-teal shadow-lg transition hover:-translate-y-0.5"
        >
          📞 Call Now
        </a>
      )}
    </div>
  );
}
