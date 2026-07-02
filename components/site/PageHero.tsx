import Image from "next/image";

export function PageHero({
  eyebrow, title, subtitle, image, script,
}: {
  eyebrow: string;
  title: string;
  subtitle?: string;
  image: string;
  script?: string;
}) {
  return (
    <section className="relative flex min-h-[62vh] items-center justify-center overflow-hidden pt-24">
      <Image src={image} alt="" fill priority className="animate-zoom object-cover" sizes="100vw" />
      <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/30 to-black/55" />
      <div className="container-x relative z-10 max-w-3xl text-center text-white">
        <p className="animate-fade eyebrow !text-brass-soft">{eyebrow}</p>
        {script && <p className="animate-rise delay-1 font-script text-3xl text-brass-soft">{script}</p>}
        <h1 className="animate-rise delay-1 mt-3 font-display text-5xl leading-tight md:text-6xl">{title}</h1>
        {subtitle && <p className="animate-rise delay-2 mx-auto mt-5 max-w-xl text-white/85">{subtitle}</p>}
      </div>
    </section>
  );
}
