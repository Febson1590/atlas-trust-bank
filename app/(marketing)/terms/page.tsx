import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Service — Atlas Trust Bank",
  description:
    "Read the Terms of Service governing the use of Atlas Trust Bank accounts, digital services, and financial products.",
};

const sections = [
  {
    id: "acceptance",
    title: "1. Acceptance of Terms",
    content: [
      "By accessing, registering for, or using any services provided by Atlas Trust Bank AG (\"Atlas Trust Bank,\" \"we,\" \"our,\" or \"us\"), you acknowledge that you have read, understood, and agree to be bound by these Terms of Service (\"Terms\"). These Terms constitute a legally binding agreement between you and Atlas Trust Bank.",
      "If you do not agree with any provision of these Terms, you must immediately discontinue your use of our services. We reserve the right to deny service to any individual or entity at our sole discretion, subject to applicable law.",
      "These Terms apply to all users of our services, including but not limited to depositors, borrowers, cardholders, investment clients, and visitors to our digital platforms.",
    ],
  },
  {
    id: "account",
    title: "2. Account Terms",
    content: [
      "To open and maintain an account with Atlas Trust Bank, you must be at least 18 years of age (or the age of majority in your jurisdiction), provide accurate and complete identification documentation, and comply with all applicable Know Your Customer (KYC) and Anti-Money Laundering (AML) requirements.",
      "You are solely responsible for maintaining the confidentiality of your account credentials, including passwords, PINs, and security tokens. You agree to notify us immediately of any unauthorized use of your account or any other security breach. Atlas Trust Bank shall not be liable for any losses arising from unauthorized access to your account resulting from your failure to safeguard your credentials.",
      "We reserve the right to suspend, restrict, or close any account that we reasonably believe is being used in violation of these Terms, applicable law, or in connection with fraudulent, illegal, or unauthorized activity. Account closures will be handled in accordance with applicable regulatory requirements, and remaining balances will be returned to you after deduction of any outstanding fees or obligations.",
    ],
  },
  {
    id: "privacy",
    title: "3. Privacy and Data Protection",
    content: [
      "Your privacy is of paramount importance to Atlas Trust Bank. Our collection, use, storage, and disclosure of your personal information is governed by our Privacy Policy, which is incorporated into these Terms by reference.",
      "By using our services, you consent to the processing of your personal data as described in our Privacy Policy. We process data in accordance with the Swiss Federal Act on Data Protection (FADP), the EU General Data Protection Regulation (GDPR) where applicable, and other relevant data protection laws in the jurisdictions where we operate.",
      "We implement industry-leading security measures including end-to-end encryption, multi-factor authentication, and continuous monitoring to protect your information. However, no method of electronic transmission or storage is completely secure, and we cannot guarantee absolute security.",
    ],
  },
  {
    id: "transactions",
    title: "4. Transactions and Payments",
    content: [
      "All transactions initiated through Atlas Trust Bank are subject to verification, compliance screening, and applicable processing times. We reserve the right to delay, block, or reverse any transaction that we reasonably believe to be unauthorized, fraudulent, or in violation of applicable sanctions, anti-money laundering, or counter-terrorism financing regulations.",
      "Transaction fees, exchange rates, and processing times vary by product, service type, and jurisdiction. Current fee schedules are available on our website and within your account dashboard. We reserve the right to modify our fee structure with 30 days advance notice to affected account holders.",
      "International wire transfers are subject to correspondent banking fees and foreign exchange spreads, which may be deducted from the transfer amount. Atlas Trust Bank shall not be responsible for delays caused by intermediary banks, regulatory holds, or circumstances beyond our reasonable control.",
      "You agree that all transaction instructions submitted through authenticated channels are binding. Once a transaction has been processed and confirmed, it generally cannot be reversed except in cases of demonstrated fraud or manifest error, subject to applicable law and our internal dispute resolution procedures.",
    ],
  },
  {
    id: "liability",
    title: "5. Limitation of Liability",
    content: [
      "To the maximum extent permitted by applicable law, Atlas Trust Bank, its directors, officers, employees, affiliates, and agents shall not be liable for any indirect, incidental, special, consequential, or punitive damages, including but not limited to loss of profits, data, business opportunities, or goodwill, arising from or in connection with your use of our services.",
      "Our total aggregate liability for any claims arising under or in connection with these Terms shall not exceed the total fees paid by you to Atlas Trust Bank during the twelve (12) months immediately preceding the event giving rise to such liability.",
      "Atlas Trust Bank shall not be liable for any losses resulting from: (a) circumstances beyond our reasonable control, including but not limited to natural disasters, acts of government, or failures of telecommunications or power infrastructure; (b) your failure to comply with security requirements or these Terms; (c) the actions or omissions of third-party service providers; or (d) inaccurate or incomplete information provided by you.",
      "Nothing in these Terms shall limit or exclude our liability for death or personal injury caused by our negligence, fraud or fraudulent misrepresentation, or any other liability that cannot be lawfully excluded or limited.",
    ],
  },
  {
    id: "termination",
    title: "6. Termination",
    content: [
      "You may close your account and terminate your relationship with Atlas Trust Bank at any time by providing written notice through our secure messaging system or by contacting your relationship manager. Account closure is subject to the settlement of all outstanding obligations, including pending transactions, accrued fees, and any outstanding loan balances.",
      "Atlas Trust Bank reserves the right to terminate or suspend your account and access to our services at any time, with or without notice, for any reason including but not limited to: (a) violation of these Terms; (b) suspected fraudulent, illegal, or unauthorized activity; (c) failure to comply with KYC/AML requirements; (d) prolonged account inactivity as defined by applicable regulations; or (e) as required by law, regulation, or court order.",
      "Upon termination, your right to access and use our services will immediately cease. We will retain your data in accordance with our data retention policies and applicable legal and regulatory requirements.",
    ],
  },
  {
    id: "changes",
    title: "7. Changes to These Terms",
    content: [
      "Atlas Trust Bank reserves the right to modify, amend, or replace these Terms at any time. Material changes will be communicated to you at least 30 days prior to taking effect through one or more of the following methods: email notification to your registered address, in-app notification, or prominent notice on our website.",
      "Your continued use of our services after the effective date of any changes constitutes your acceptance of the revised Terms. If you do not agree to the modified Terms, you must discontinue use of our services and close your account prior to the effective date of the changes.",
      "We encourage you to review these Terms periodically to stay informed about your rights and obligations as an Atlas Trust Bank client.",
    ],
  },
  {
    id: "contact",
    title: "8. Contact Information",
    content: [
      "If you have any questions, concerns, or complaints regarding these Terms or our services, please contact us through the following channels:",
      "Atlas Trust Bank AG, Legal Department, Bahnhofstrasse 42, 8001 Zurich, Switzerland. Email: legal@atlastrust.com. Telephone: +1 (800) 482-7878 (US) / +44 20 7946 0958 (International).",
      "For formal complaints, please submit a written complaint through our secure client portal or by registered mail to our Legal Department. We will acknowledge receipt within five (5) business days and endeavor to resolve the matter within thirty (30) business days.",
      "These Terms are governed by and construed in accordance with the laws of Switzerland. Any disputes arising under these Terms shall be submitted to the exclusive jurisdiction of the courts of Zurich, Switzerland, unless otherwise required by applicable consumer protection laws in your jurisdiction.",
    ],
  },
];

export default function TermsPage() {
  return (
    <div className="bg-navy-900">
      {/* ── Hero ───────────────────────────────────────────────── */}
      <section className="relative overflow-hidden pt-32 pb-16">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -top-32 -right-32 h-[600px] w-[600px] rounded-full bg-gold-500/[0.04] blur-[120px]" />
          <div className="absolute -bottom-48 -left-48 h-[500px] w-[500px] rounded-full bg-navy-600/30 blur-[100px]" />
        </div>

        <div className="relative mx-auto max-w-4xl px-6 lg:px-8 text-center animate-fade-in">
          <h1 className="text-4xl font-bold leading-tight tracking-tight text-text-primary sm:text-5xl">
            Terms of <span className="gold-text">Service</span>
          </h1>
          <p className="mt-4 text-text-secondary">
            Last updated: March 1, 2026
          </p>
        </div>
      </section>

      {/* ── Content ────────────────────────────────────────────── */}
      <section className="relative bg-navy-950 py-20">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-gold-500/20 to-transparent" />

        <div className="mx-auto max-w-4xl px-6 lg:px-8">
          {/* Intro */}
          <div className="mb-12 rounded-xl border border-border-subtle bg-navy-800/60 p-6 animate-fade-in">
            <p className="text-sm text-text-secondary leading-relaxed">
              Please read these Terms of Service carefully before using any
              services provided by Atlas Trust Bank AG. These Terms govern your
              access to and use of all banking products, digital platforms, and
              financial services offered by Atlas Trust Bank. By accessing or
              using our services, you agree to be bound by these Terms in their
              entirety.
            </p>
          </div>

          {/* Table of Contents */}
          <nav className="mb-16 rounded-xl border border-border-subtle bg-navy-800/40 p-6">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-gold-500 mb-4">
              Table of Contents
            </h2>
            <ul className="space-y-2">
              {sections.map((section) => (
                <li key={section.id}>
                  <a
                    href={`#${section.id}`}
                    className="text-sm text-text-secondary hover:text-gold-400 transition-colors"
                  >
                    {section.title}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          {/* Sections */}
          <div className="space-y-16">
            {sections.map((section) => (
              <div key={section.id} id={section.id} className="scroll-mt-32">
                <h2 className="text-xl font-bold text-text-primary mb-6 pb-3 border-b border-border-subtle">
                  {section.title}
                </h2>
                <div className="space-y-4">
                  {section.content.map((paragraph, i) => (
                    <p
                      key={i}
                      className="text-sm leading-relaxed text-text-secondary"
                    >
                      {paragraph}
                    </p>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Footer note */}
          <div className="mt-20 pt-8 border-t border-border-subtle text-center">
            <p className="text-xs text-text-muted">
              Atlas Trust Bank AG is registered in Zurich, Switzerland under
              company registration number CHE-123.456.789. Regulated by the
              Swiss Financial Market Supervisory Authority (FINMA).
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
