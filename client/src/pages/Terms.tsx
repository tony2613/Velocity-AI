import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SEO from "@/components/SEO";

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-background">
      <SEO
        title="Terms of Service – VelocityAI"
        description="Review VelocityAI's terms of service, refund policy, and acceptable use policy. Understand your rights and responsibilities when using our platform."
        canonicalPath="/terms"
      />
      <Navbar />
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20 prose dark:prose-invert">
        <h1>Terms of Service</h1>
        <p className="text-sm text-muted-foreground">Effective Date: February 18, 2026</p>

        <h2>1. Acceptance of Terms</h2>
        <p>By accessing or using Velocity AI ("Service"), operated by <strong>Swapnil Tony Lewis</strong> ("we", "us", "our"), you agree to be bound by these Terms of Use ("Terms"). If you disagree with any part of these terms, you intend does not permit the use of our Service.</p>

        <h2>2. Beta Services Disclaimer</h2>
        <p>Please note that this Service is currently in a <strong>Beta</strong> phase. By using the Service, you acknowledge and accept that:</p>
        <ul>
          <li>Features and functionality may change without prior notice.</li>
          <li>Data integrity is not guaranteed, and data loss may occur during updates.</li>
          <li>The Service may experience downtime or instability.</li>
        </ul>

        <h2>3. Eligibility</h2>
        <p>You verify that you are at least 16 years of age. If you are accessing the Service on behalf of a legal entity, you represent that you have the authority to bind that entity to these Terms.</p>

        <h2>4. Description of Service</h2>
        <p>The Service utilizes artificial intelligence to provide educational summaries, quizzes, and research assistance. While we strive for accuracy, AI-generated content may contain errors. You agree to use the Service as a supplementary educational tool and should verify critical information independently.</p>

        <h2>5. User Conduct and Responsibilities</h2>
        <p>You agree to use the Service only for lawful purposes. You specifically agree NOT to:</p>
        <ul>
          <li>Upload any content that violates applicable laws or regulations.</li>
          <li>Infringe upon the intellectual property rights of others (e.g., uploading copyrighted textbooks without authorization).</li>
          <li>Attempt to circumvent, disable, or interfere with security-related features of the Service.</li>
          <li>Use automated systems ("bots") to access the Service in a manner that sends more request messages to our servers than a human can reasonably produce.</li>
        </ul>

        <h2>6. Intellectual Property Rights</h2>
        <p><strong>User Content:</strong> You retain all ownership rights to the content you upload to the Service. By uploading content, you grant us a worldwide, non-exclusive, royalty-free license to use, reproduce, and process that content solely for the purpose of providing the Service to you.</p>
        <p><strong>Service Content:</strong> The Service, including its software, code, and design, is owned by Velocity AI and is protected by copyright and intellectual property laws.</p>

        <h2>7. Academic Integrity</h2>
        <p>You are solely responsible for ensuring your use of the Service complies with your academic institution's policies regarding academic integrity and plagiarism. Velocity AI is designed to assist learning, not to facilitate academic dishonesty.</p>

        <h2>8. Termination</h2>
        <p>We may terminate or suspend your account immediately, without prior notice or liability, for any reason whatsoever, including without limitation if you breach the Terms.</p>

        <h2>9. Limitation of Liability</h2>
        <p>To the maximum extent permitted by applicable law, in no event shall Velocity AI or its proprietor be liable for any indirect, punitive, incidental, special, consequential, or exemplary damages, including without limitation damages for loss of profits, goodwill, use, data, or other intangible losses, arising out of or relating to the use of, or inability to use, the Service.</p>

        <h2>10. Governing Law</h2>
        <p>These Terms shall be governed and construed in accordance with the laws of India, without regard to its conflict of law provisions. Any disputes arising under these Terms shall be subject to the exclusive jurisdiction of the courts located in <strong>Bengaluru, Karnataka, India</strong>.</p>

        <hr className="my-10 border-border" />

        <h1>Refund Policy</h1>
        <p className="text-sm text-muted-foreground">Effective Date: February 18, 2026</p>

        <h2>1. General Policy</h2>
        <p>Subscriptions to Velocity AI are billed in advance on a recurring monthly or sessional basis.</p>

        <h2>2. Eligibility for Refunds</h2>
        <p>As a digital service, we generally do not offer refunds once a subscription period has commenced. However, exceptions may be made in the following specific circumstances:</p>
        <ul>
          <li><strong>Duplicate Payment:</strong> If you were charged multiple times for a single billing cycle due to a technical error.</li>
          <li><strong>Billing Error:</strong> If you were charged after successfully cancelling your subscription prior to the renewal date.</li>
        </ul>
        <p>All refund requests must be submitted within <strong>7 days</strong> of the transaction date.</p>

        <h2>3. Non-Refundable Circumstances</h2>
        <p>We do not provide refunds for:</p>
        <ul>
          <li>Partial use of the Service during a subscription period.</li>
          <li>Failure to cancel a subscription before the renewal date.</li>
          <li>Dissatisfaction with the Service outcomes (e.g., quality of AI summaries).</li>
        </ul>

        <h2>4. Cancellation</h2>
        <p>You may cancel your subscription at any time through your account settings. Cancellation will stop future billing, and you will retain access to the Service until the end of your current billing cycle.</p>

        <h2>5. Contact for Refunds</h2>
        <p>To request a refund or for billing inquiries, please contact us at: <a href="mailto:velocityai.app@gmail.com" className="text-primary hover:underline">velocityai.app@gmail.com</a></p>

        <hr className="my-10 border-border" />

        <h1>Acceptable Use Policy</h1>
        <p className="text-sm text-muted-foreground">Effective Date: February 18, 2026</p>

        <p>By using Velocity AI, you agree NOT to:</p>
        <ul>
          <li>Distribute viruses, malware, or any other malicious code.</li>
          <li>Engage in any activity that interferes with or disrupts the Service.</li>
          <li>Reverse engineer, decompile, or disassemble any aspect of the Service.</li>
          <li>Use the Service to generate content that is hate speech, harassing, or sexually explicit.</li>
        </ul>

        <h2>Violations</h2>
        <p>We reserve the right to investigate and prosecute violations of any of the above to the fullest extent of the law. We may involve and cooperate with law enforcement authorities in prosecuting users who violate these terms.</p>
        <p>Violation of this policy may result in immediate account suspension or termination without refund.</p>

      </main>
      <Footer />
    </div>
  );
}
