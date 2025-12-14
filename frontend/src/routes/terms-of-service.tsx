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
              <li>Cheating, hacking, or using exploits in tournaments.</li>
              <li>Creating multiple accounts to circumvent rules or manipulate rankings.</li>
              <li>Sharing account credentials with other users.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-2">3. Account Responsibilities</h2>
            <p className="text-gray-300">
              You are responsible for:
            </p>
            <ul className="list-disc list-inside mt-2 text-gray-300">
              <li>Maintaining the confidentiality of your account credentials.</li>
              <li>Ensuring that account information you provide is accurate and up-to-date.</li>
              <li>Using your account only for personal, non-commercial purposes.</li>
              <li>Notifying us immediately of any unauthorized use of your account.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-2">4. Tournament Rules & Fair Play</h2>
            <p className="text-gray-300">
              All tournament participants must adhere to the following:
            </p>
            <ul className="list-disc list-inside mt-2 text-gray-300">
              <li>Compete fairly and honestly without the use of cheats or exploits.</li>
              <li>Maintain respectful sportsmanship toward opponents and organizers.</li>
              <li>Accept tournament decisions and rulings made by administrators.</li>
              <li>Violations may result in immediate disqualification and account suspension.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-2">5. ELO Rating System</h2>
            <p className="text-gray-300">
              Your ELO rating is a dynamic representation of your competitive skill level:
            </p>
            <ul className="list-disc list-inside mt-2 text-gray-300">
              <li>Ratings are calculated based on tournament results and match outcomes.</li>
              <li>Ratings may be adjusted or reset at the discretion of administrators.</li>
              <li>ELO ratings may not be transferred between accounts.</li>
              <li>We do not guarantee the accuracy or availability of rating calculations.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-2">6. Third-Party Services</h2>
            <p className="text-gray-300">
              Our platform integrates with the 42 School authentication system. By using our services, you consent to:
            </p>
            <ul className="list-disc list-inside mt-2 text-gray-300">
              <li>Sharing your 42 Intra ID with our platform.</li>
              <li>Our access to basic profile information from 42 School services.</li>
              <li>The terms and privacy policies of 42 School also apply to this data sharing.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-2">7. Intellectual Property</h2>
            <p className="text-gray-300">
              All tournament results, statistics, and competition data are the property of 42LAN. You grant us the right to:
            </p>
            <ul className="list-disc list-inside mt-2 text-gray-300">
              <li>Display and publish tournament results and rankings publicly.</li>
              <li>Use anonymized data for analytics and platform improvements.</li>
              <li>Archive historical competition data indefinitely.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-2">8. Age & Eligibility</h2>
            <p className="text-gray-300">
              You must be at least 13 years old to use our services. If you are a minor, you represent that you have obtained parental consent before using our platform.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-2">9. Service Availability & Disclaimers</h2>
            <p className="text-gray-300">
              42LAN is provided on an "as-is" basis. We do not guarantee:
            </p>
            <ul className="list-disc list-inside mt-2 text-gray-300">
              <li>Uninterrupted or error-free service availability.</li>
              <li>That our services are free from viruses or other harmful components.</li>
              <li>That tournament scheduling will not experience delays.</li>
              <li>Compensation for service disruptions or data loss.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-2">10. Termination</h2>
            <p className="text-gray-300">
              We may terminate or suspend your account at any time, without prior notice or liability, for any reason, including if you breach these Terms of Service. Upon termination:
            </p>
            <ul className="list-disc list-inside mt-2 text-gray-300">
              <li>Your access to the platform will be immediately revoked.</li>
              <li>Historical tournament data associated with your account will remain in our records for integrity purposes.</li>
              <li>You may request account anonymization as per our Privacy Policy.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-2">11. Limitation of Liability</h2>
            <p className="text-gray-300">
              In no event shall 42LAN be liable for any indirect, incidental, special, consequential or punitive damages, including without limitation, loss of profits, data, use, goodwill, or other intangible losses, arising from your use of our services.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-2">12. Governing Law</h2>
            <p className="text-gray-300">
              These Terms of Service are governed by and construed in accordance with the laws of France, and you irrevocably submit to the exclusive jurisdiction of the courts located in France.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-2">13. Changes to Terms</h2>
            <p className="text-gray-300">
              We reserve the right to modify these terms at any time. We will provide notice of changes by posting the new terms on this page.
            </p>
          </section>
        </div>
      </div>
    </div>
  )
}
