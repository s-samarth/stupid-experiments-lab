import Link from "next/link";

export default function NotFound() {
  return (
    <main className="flex min-h-dvh items-center justify-center px-5">
      <div className="max-w-md text-center">
        <p className="font-mono text-[12px] text-muted">404 · result not reproducible</p>
        <h1 className="mt-3 font-serif text-[36px] leading-tight">This experiment doesn&apos;t exist.</h1>
        <p className="mt-2 font-hand text-[22px] text-pen">or it failed so badly I deleted it.</p>
        <Link href="/" className="ink-link mt-6 inline-block text-[15px]">
          Back to the lab →
        </Link>
      </div>
    </main>
  );
}
