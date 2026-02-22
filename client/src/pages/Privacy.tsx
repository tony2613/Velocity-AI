import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SEO from "@/components/SEO";

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-background">
      <SEO
        title="Privacy Policy – VelocityAI"
        description="Read VelocityAI's privacy policy to understand how we collect, use, and protect your personal data in accordance with India's DPDP Act 2023."
        canonicalPath="/privacy"
      />
      <Navbar />
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20 prose dark:prose-invert">
        <h1>Privacy Policy</h1>
        <p className="text-sm text-muted-foreground">Effective Date: February 18, 2026</p>
        <p className="text-sm text-muted-foreground">Last Updated: February 18, 2026</p>

        <h2>1. Introduction</h2>
        <p>This Privacy Policy ("Policy") governs the manner in which Velocity AI ("Service", "we", "us", or "our"), operated by <strong>Swapnil Tony Lewis</strong> (Sole Proprietor, Bengaluru, India), collects, uses, maintains, and discloses information collected from users ("User" or "you") of the Velocity AI application.</p>
        <p>We are committed to protecting your privacy and processing your personal data in strict accordance with the <strong>Digital Personal Data Protection Act, 2023 (India)</strong> and other applicable laws.</p>
        <p>By accessing or using the Service, you signify your acceptance of this Policy. If you do not agree to this Policy, please do not use our Service.</p>

        <h2>2. Eligibility</h2>
        <p>You must be at least 16 years of age to access or use the Service. We do not knowingly collect, use, or disclose personal data from individuals under the age of 16 without verifiable parental consent.</p>

        <h2>3. Information We Collect</h2>
        <h3>3.1 Personal Data</h3>
        <p>We may collect personal identification information from Users in various ways, including, but not limited to, when Users visit our site, register on the site, and in connection with other activities, services, features, or resources we make available. Users may be asked for, as appropriate:</p>
        <ul>
          <li><strong>Identity Data:</strong> Name, username.</li>
          <li><strong>Contact Data:</strong> Email address.</li>
          <li><strong>Authentication Data:</strong> Encrypted passwords.</li>
        </ul>

        <h3>3.2 User Content</h3>
        <p>To provide our core services, we process content uploaded by you, including educational documents (PDFs) and generated output data (summaries, quizzes). We do not claim ownership of your content.</p>

        <h3>3.3 Usage & Technical Data</h3>
        <p>We may collect non-personal identification information about Users whenever they interact with our Service. This may include:</p>
        <ul>
          <li>Browser name and version.</li>
          <li>Type of computer or mobile device.</li>
          <li>Operating system and Internet service providers utilized.</li>
          <li>Log data, IP address, and feature usage patterns.</li>
        </ul>

        <h3>3.4 Payment Information</h3>
        <p>Financial transactions are processed exclusively through secure third-party payment processors. We do not store or process your complete credit/debit card information on our servers.</p>

        <h2>4. Purpose of Data Processing</h2>
        <p>We collect and use personal data for the following legitimate purposes:</p>
        <ul>
          <li><strong>To Provide Service Functionality:</strong> To generate AI-powered summaries, quizzes, and research insights.</li>
          <li><strong>To Improve Customer Service:</strong> Information you provide helps us respond to your customer service requests and support needs more efficiently.</li>
          <li><strong>To Personalize User Experience:</strong> We may use information in the aggregate to understand how our Users as a group use the services and resources provided on our Service.</li>
          <li><strong>To Send Periodic Emails:</strong> We may use the email address to respond to inquiries, questions, and/or other requests.</li>
        </ul>
        <p><strong>Note: We refrain from using your uploaded documents to train our core Artificial Intelligence models.</strong></p>

        <h2>5. Sharing Your Information</h2>
        <p>We do not sell, trade, or rent Users' personal identification information to others. We share generic aggregated demographic information not linked to any personal identification information regarding visitors and users with our business partners, trusted affiliates, and advertisers.</p>
        <p>We may use third-party service providers to help us operate our business and the Service, such as:</p>
        <ul>
          <li><strong>Groq API:</strong> For AI inference and processing.</li>
          <li><strong>Google Search API:</strong> For research functionality.</li>
          <li><strong>Cloud Hosting Providers:</strong> For secure data storage and computation.</li>
        </ul>
        <p>These third parties process data only as necessary to provide their respective services to us.</p>

        <h2>6. Your Rights and Choices</h2>
        <p>In accordance with the Digital Personal Data Protection Act, 2023, you retain the following rights regarding your personal data:</p>
        <ul>
          <li><strong>Right to Access:</strong> You may request a summary of personal data processed by us.</li>
          <li><strong>Right to Correction:</strong> You may request correction of inaccurate or incomplete personal data.</li>
          <li><strong>Right to Erasure:</strong> You may request the deletion of your personal data, subject to legal retention usage requirements.</li>
          <li><strong>Right to Withdraw Consent:</strong> You may withdraw your consent for data processing at any time.</li>
          <li><strong>Right to Grievance Redressal:</strong> You may file a complaint regarding our data processing practices.</li>
        </ul>
        <p>To exercise these rights, please contact us at: <a href="mailto:velocityai.app@gmail.com" className="text-primary hover:underline">velocityai.app@gmail.com</a></p>

        <h2>7. Data Retention and Security</h2>
        <p>We adopt appropriate data collection, storage, and processing practices and security measures to protect against unauthorized access, alteration, disclosure, or destruction of your personal information. We retain your personal data only for as long as is necessary for the purposes set out in this Policy.</p>

        <h2>8. Grievance Officer</h2>
        <p>In accordance with the Information Technology Act, 2000 and rules made thereunder, the contact details of the Grievance Officer are provided below:</p>
        <p>
          <strong>Name:</strong> Swapnil Tony Lewis<br />
          <strong>Email:</strong> <a href="mailto:swapnil.t.lewis@gmail.com" className="text-primary hover:underline">swapnil.t.lewis@gmail.com</a>
        </p>

        <h2>9. Changes to This Privacy Policy</h2>
        <p>Velocity AI has the discretion to update this privacy policy at any time. When we do, we will revise the updated date at the top of this page. We encourage Users to frequently check this page for any changes to stay informed about how we are helping to protect the personal information we collect.</p>

        <h2>10. Contact Us</h2>
        <p>If you have any questions about this Privacy Policy, the practices of this site, or your dealings with this site, please contact us at:</p>
        <p>
          <strong>Velocity AI (Swapnil Tony Lewis)</strong><br />
          Bengaluru, India<br />
          Email: <a href="mailto:velocityai.app@gmail.com" className="text-primary hover:underline">velocityai.app@gmail.com</a>
        </p>

        <hr className="my-10 border-border" />

        <h1>Cookie Policy</h1>
        <p className="text-sm text-muted-foreground">Effective Date: February 18, 2026</p>

        <h2>1. Definitions</h2>
        <p>Cookies are small text files placed on your device to store data that can be recalled by a web server in the domain that placed the cookie.</p>

        <h2>2. Our Use of Cookies</h2>
        <p>We verify that we use cookies strictly for essential operational purposes, including:</p>
        <ul>
          <li><strong>Authentication:</strong> To verify your account and determine when you are logged in.</li>
          <li><strong>Security:</strong> To help detect and prevent fraud and abuse of our Services.</li>
          <li><strong>Performance:</strong> To ensure the Service functions correctly on your device.</li>
        </ul>

        <h2>3. Third-Party Cookies</h2>
        <p>Some content or applications, including advertisements, on the Service are served by third-parties. These third parties may use cookies alone or in conjunction with web beacons or other tracking technologies to collect information about you when you use our website.</p>

        <h2>4. Managing Cookies</h2>
        <p>Most web browsers automatically accept cookies, but you can usually modify your browser setting to decline cookies if you prefer. If you choose to decline cookies, you may not be able to fully experience the interactive features of the Service.</p>
      </main>
      <Footer />
    </div>
  );
}
