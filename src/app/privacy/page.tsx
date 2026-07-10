import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Privacy Policy — OpenWhoop',
  description:
    'Privacy policy for OpenWhoop, a personal companion app for WHOOP bands.',
};

export default function PrivacyPolicy() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-16">
      <article className="prose dark:prose-invert">
        <h1>OpenWhoop Privacy Policy</h1>
        <p>
          <em>Last updated: July 9, 2026</em>
        </p>

        <p>
          OpenWhoop is a personal companion application for WHOOP bands. It runs
          on your own device and is designed to be local-first: your health and
          fitness data stays on your device unless you explicitly configure a
          feature that sends it elsewhere. This policy explains what data
          OpenWhoop accesses, how it is used, and the choices you have.
        </p>

        <h2>Data OpenWhoop accesses</h2>
        <ul>
          <li>
            <strong>WHOOP account data</strong>, only after you authorize access
            through WHOOP&apos;s official OAuth login: recovery, sleep, cycles,
            workouts, profile, and body measurements.
          </li>
          <li>
            <strong>Sensor data from your WHOOP band</strong> over Bluetooth:
            heart rate, heart-rate variability, and motion/accelerometer data.
          </li>
        </ul>

        <h2>How your data is used</h2>
        <p>
          Data is used solely to display and analyze your own metrics —
          recovery, sleep, strain, heart-rate variability, and journal entries —
          within the app on your device. OpenWhoop does not use your data for
          advertising, and does not sell, rent, or trade it.
        </p>

        <h2>Where your data is stored</h2>
        <p>
          By default, all data is stored locally on your device. Authentication
          tokens and any API keys you enter are stored in the device&apos;s
          secure keychain. Some optional features, which are off by default and
          only run when you turn them on and configure them, send data to
          services <em>you</em> control or choose:
        </p>
        <ul>
          <li>
            <strong>AI analysis</strong> — if enabled, a summary of your recent
            metrics is sent to Anthropic&apos;s API using an API key that you
            provide. This is subject to Anthropic&apos;s privacy policy.
          </li>
          <li>
            <strong>Sleep staging</strong> — if enabled, recorded signal is sent
            to a server that you host and operate.
          </li>
          <li>
            <strong>WHOOP cloud sync</strong> — if enabled, OpenWhoop reads your
            data from WHOOP&apos;s API, subject to WHOOP&apos;s privacy policy.
          </li>
        </ul>
        <p>
          OpenWhoop does not operate any shared server that collects or stores
          your data. Data leaves your device only to the services listed above,
          and only when you have enabled them.
        </p>

        <h2>Your choices and data deletion</h2>
        <ul>
          <li>
            Delete all locally stored data by deleting the app from your device.
          </li>
          <li>
            Revoke OpenWhoop&apos;s access to your WHOOP account at any time from
            your WHOOP account settings.
          </li>
          <li>Remove any API keys or server settings you entered, in the app.</li>
        </ul>

        <h2>Children</h2>
        <p>
          OpenWhoop is not directed to children under the age of 16 and does not
          knowingly collect data from them.
        </p>

        <h2>Changes to this policy</h2>
        <p>
          This policy may be updated from time to time. The effective date at the
          top of the page reflects the latest version.
        </p>

        <h2>Contact</h2>
        <p>
          Questions about this policy? Contact{' '}
          <a href="mailto:haydenmenge@gmail.com">haydenmenge@gmail.com</a>.
        </p>
      </article>
    </main>
  );
}
