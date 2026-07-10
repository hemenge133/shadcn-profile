import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Privacy Policy — MegaMenge',
  description: 'Privacy policy for MegaMenge, a personal WHOOP companion app.',
};

export default function PrivacyPolicy() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-16">
      <article className="prose dark:prose-invert">
        <h1>MegaMenge Privacy Policy</h1>
        <p>
          <em>Last updated: July 9, 2026</em>
        </p>

        <p>
          MegaMenge is a personal, non-commercial application developed and used
          solely by its author. It is not publicly distributed.
        </p>
        <p>
          It accesses only the author&apos;s own WHOOP account data — through
          WHOOP&apos;s official API, with the author&apos;s authorization — and
          heart-rate data from the author&apos;s own WHOOP band over Bluetooth.
        </p>
        <p>
          All data is stored locally on the author&apos;s device. It is never
          shared with, sold to, or disclosed to any third party, and no data from
          any other person is collected.
        </p>
        <p>
          Access can be revoked at any time from WHOOP account settings, and all
          locally stored data is removed by deleting the application.
        </p>

        <h2>Contact</h2>
        <p>
          <a href="mailto:haydenmenge@gmail.com">haydenmenge@gmail.com</a>
        </p>
      </article>
    </main>
  );
}
