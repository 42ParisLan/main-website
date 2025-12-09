import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/terms-of-service')({
  component: TermsOfServicePage,
})

function TermsOfServicePage() {
  return (
    <div className="bg-background text-white min-h-screen">
      <div className="container mx-auto px-4 py-12">
        <h1 className="text-4xl font-bold mb-8">Terms of Service</h1>
        
        <div className="space-y-6">
          <section>
            <h2 className="text-2xl font-semibold mb-2">1. Agreement to Terms</h2>
            <p className="text-gray-300">
              By accessing or using our services, you agree to be bound by these Terms of Service. If you do not agree to these terms, you may not use our services.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-2">2. User Conduct</h2>
            <p className="text-gray-300">
              You agree not to engage in any of the following prohibited activities:
            </p>
            <ul className="list-disc list-inside mt-2 text-gray-300">
              <li>Harassing, threatening, or defaming other users.</li>
              <li>Using our services for any illegal purpose.</li>
              <li>Attempting to interfere with the proper functioning of the service.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-2">3. Termination</h2>
            <p className="text-gray-300">
              We may terminate or suspend your account at any time, without prior notice or liability, for any reason, including if you breach these Terms of Service.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-2">4. Limitation of Liability</h2>
            <p className="text-gray-300">
              In no event shall 42LAN be liable for any indirect, incidental, special, consequential or punitive damages, including without limitation, loss of profits, data, use, goodwill, or other intangible losses.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-2">5. Changes to Terms</h2>
            <p className="text-gray-300">
              We reserve the right to modify these terms at any time. We will provide notice of changes by posting the new terms on this page.
            </p>
          </section>
        </div>
      </div>
    </div>
  )
}
