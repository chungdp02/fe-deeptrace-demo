type PageBannerProps = {
  title: string;
  subtitle: string;
};

export function PageBanner({ title, subtitle }: PageBannerProps) {
  return (
    <section className="relative isolate overflow-hidden bg-gradient-to-br from-[#005aab] to-[#0c263d] px-6 py-16 text-center text-white sm:py-20">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10 opacity-20 [background-image:radial-gradient(circle,#add8ff_1px,transparent_1px)] [background-size:28px_28px]" />
      <div className="mx-auto max-w-3xl">
        <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">{title}</h1>
        <div aria-hidden="true" className="mx-auto mt-5 h-1 w-16 rounded-full bg-[#add8ff]" />
        <p className="mx-auto mt-6 max-w-2xl text-base leading-8 text-[#d8e0e8] sm:text-lg">{subtitle}</p>
      </div>
    </section>
  );
}
