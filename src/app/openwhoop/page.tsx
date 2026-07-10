import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'OpenWhoop — In Development',
  description:
    'OpenWhoop, a personal companion app for WHOOP bands. Currently in development.',
};

export default function OpenWhoop() {
  return (
    <main className="mx-auto flex min-h-[60vh] max-w-2xl flex-col items-center justify-center px-4 py-16 text-center">
      <h1 className="text-3xl font-semibold tracking-tight">OpenWhoop</h1>
      <p className="mt-4 text-muted-foreground">
        A personal companion app for WHOOP bands. This is a non-commercial
        project and is currently in development.
      </p>
      <p className="mt-6 text-sm text-muted-foreground">
        <Link href="/privacy" className="underline underline-offset-4">
          Privacy Policy
        </Link>
      </p>
    </main>
  );
}
