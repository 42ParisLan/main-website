import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/gdpr')({
  component: GdprPage,
})

function GdprPage() {
  return (
    <div className="bg-background text-white min-h-screen">
      <div className="container mx-auto px-4 py-12">
        <h1 className="text-4xl font-bold mb-8">Privacy Policy (GDPR)</h1>
        
        <div className="space-y-6">
          <section>
            <h2 className="text-2xl font-semibold mb-2">1. Introduction</h2>
            <p className="text-gray-300">
              This Privacy Policy explains how we collect, use, and protect your personal data in compliance with the General Data Protection Regulation (GDPR). Your privacy is important to us, and we are committed to safeguarding your information.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-2">2. Data Controller</h2>
            <p className="text-gray-300">
              42LAN is the data controller responsible for your personal data. If you have any questions about this policy or our data protection practices, please contact us at <a href="mailto:dpo@42lan.fr" className="text-blue-400 hover:underline">dpo@42lan.fr</a>.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-2">3. What Data We Collect</h2>
            <p className="text-gray-300">
              We may collect the following types of personal data:
            </p>
            <ul className="list-disc list-inside mt-2 text-gray-300">
              <li>Identity Data: username, 42 intra ID.</li>
              <li>Contact Data: email address.</li>
              <li>Profile Data: profile picture.</li>
              <li>Account Data: creation date, last update date, ELO rating.</li>
              <li>Usage Data: information about how you use our website and services, tournament participation, votes.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-2">4. How We Use Your Data</h2>
            <p className="text-gray-300">
              We use your data to:
            </p>
            <ul className="list-disc list-inside mt-2 text-gray-300">
              <li>Provide and manage your account.</li>
              <li>Organize and manage tournaments.</li>
              <li>Communicate with you about events and updates.</li>
              <li>Improve our website and services.</li>
              <li>Comply with legal obligations.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-2">5. Your Rights</h2>
            <p className="text-gray-300">
              Under GDPR, you have the right to:
            </p>
            <ul className="list-disc list-inside mt-2 text-gray-300">
              <li>Access your personal data.</li>
              <li>Request correction of your personal data.</li>
              <li>Request erasure of your personal data.</li>
              <li>Object to processing of your personal data.</li>
              <li>Request restriction of processing your personal data.</li>
              <li>Request transfer of your personal data.</li>
              <li>Withdraw consent at any time.</li>
            </ul>
            <p className="text-gray-300 mt-2">
              To exercise these rights, please contact us.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-2">6. Account Anonymization</h2>
            <p className="text-gray-300">
              You can exercise your right to erasure by anonymizing your account. When you anonymize your account:
            </p>
            <ul className="list-disc list-inside mt-2 text-gray-300">
              <li>Your personal information (username, email, profile picture) will be permanently anonymized.</li>
              <li>Your account will be marked with an anonymization timestamp.</li>
              <li>Your historical participation data (tournament results, votes, etc.) will be retained for data integrity and competition records, but will no longer be linked to your personal identity.</li>
              <li>This action is irreversible.</li>
            </ul>
            <p className="text-gray-300 mt-2">
              You can initiate the anonymization process from your profile settings on the platform. We will ask for confirmation before proceeding.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-2">7. Data Security</h2>
            <p className="text-gray-300">
              We have implemented appropriate security measures to prevent your personal data from being accidentally lost, used, or accessed in an unauthorized way.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-2">8. Changes to This Policy</h2>
            <p className="text-gray-300">
              We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new policy on this page.
            </p>
          </section>
        </div>
      </div>
    </div>
  )
}
