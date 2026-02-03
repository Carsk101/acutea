import { Link } from 'react-router-dom'

export default function TermsOfService() {
  return (
    <div className="container" style={{
      maxWidth: '900px',
      margin: '40px auto',
      padding: '20px',
      background: 'rgba(255, 255, 255, 0.9)',
      backdropFilter: 'blur(10px)',
      borderRadius: '12px',
      boxShadow: '0 10px 30px rgba(45, 106, 79, 0.1)'
    }}>
      <h1 style={{
        color: 'var(--accent)',
        marginBottom: '30px',
        fontSize: '28px',
        borderBottom: '2px solid var(--accent-pastel)',
        paddingBottom: '10px'
      }}>Terms of Service</h1>
      
      <section aria-labelledby="effective-date">
        <h2 id="effective-date" style={{ color: 'var(--accent)', fontSize: '20px' }}>Effective Date: September 1, 2025</h2>
        <p>Please read these Terms of Service ("Terms") carefully before using the ACUTEA application.</p>
      </section>
      
      <section aria-labelledby="acceptance">
        <h2 id="acceptance" style={{ color: 'var(--accent)', fontSize: '20px' }}>Acceptance of Terms</h2>
        <p>By accessing or using the ACUTEA application, you agree to be bound by these Terms. If you disagree with any part of the Terms, you may not access the application.</p>
      </section>
      
      <section aria-labelledby="changes-to-terms">
        <h2 id="changes-to-terms" style={{ color: 'var(--accent)', fontSize: '20px' }}>Changes to Terms</h2>
        <p>We reserve the right to modify or replace these Terms at any time. If a revision is material, we will provide at least 30 days' notice prior to any new terms taking effect. What constitutes a material change will be determined at our sole discretion.</p>
      </section>
      
      <section aria-labelledby="account-responsibilities">
        <h2 id="account-responsibilities" style={{ color: 'var(--accent)', fontSize: '20px' }}>Account Responsibilities</h2>
        <p>When you create an account with us, you must provide accurate, complete, and current information. Failure to do so constitutes a breach of the Terms, which may result in immediate termination of your account.</p>
        <p>You are responsible for safeguarding the password that you use to access the application and for any activities or actions under your password.</p>
        <p>You agree not to disclose your password to any third party. You must notify us immediately upon becoming aware of any breach of security or unauthorized use of your account.</p>
      </section>
      
      <section aria-labelledby="intellectual-property">
        <h2 id="intellectual-property" style={{ color: 'var(--accent)', fontSize: '20px' }}>Intellectual Property</h2>
        <p>The application and its original content, features, and functionality are and will remain the exclusive property of ACUTEA and its licensors. The application is protected by copyright, trademark, and other laws of both the United States and foreign countries.</p>
        <p>Our trademarks and trade dress may not be used in connection with any product or service without the prior written consent of ACUTEA.</p>
      </section>
      
      <section aria-labelledby="user-content">
        <h2 id="user-content" style={{ color: 'var(--accent)', fontSize: '20px' }}>User Content</h2>
        <p>Our application may allow you to post, link, store, share and otherwise make available certain information, text, graphics, videos, or other material. You are responsible for the content that you post to the application, including its legality, reliability, and appropriateness.</p>
        <p>By posting content to the application, you grant us the right to use, modify, publicly perform, publicly display, reproduce, and distribute such content on and through the application.</p>
      </section>
      
      <section aria-labelledby="prohibited-uses">
        <h2 id="prohibited-uses" style={{ color: 'var(--accent)', fontSize: '20px' }}>Prohibited Uses</h2>
        <p>You may use the application only for lawful purposes and in accordance with these Terms. You agree not to use the application:</p>
        <ul>
          <li>In any way that violates any applicable federal, state, local, or international law or regulation</li>
          <li>To transmit, or procure the sending of, any advertising or promotional material, including any "junk mail", "chain letter", "spam", or any other similar solicitation</li>
          <li>To impersonate or attempt to impersonate ACUTEA, an ACUTEA employee, another user, or any other person or entity</li>
          <li>To engage in any other conduct that restricts or inhibits anyone's use or enjoyment of the application</li>
        </ul>
      </section>
      
      <section aria-labelledby="termination">
        <h2 id="termination" style={{ color: 'var(--accent)', fontSize: '20px' }}>Termination</h2>
        <p>We may terminate or suspend your account immediately, without prior notice or liability, for any reason whatsoever, including without limitation if you breach the Terms.</p>
        <p>Upon termination, your right to use the application will immediately cease. If you wish to terminate your account, you may simply discontinue using the application.</p>
      </section>
      
      <section aria-labelledby="limitation-of-liability">
        <h2 id="limitation-of-liability" style={{ color: 'var(--accent)', fontSize: '20px' }}>Limitation of Liability</h2>
        <p>In no event shall ACUTEA, nor its directors, employees, partners, agents, suppliers, or affiliates, be liable for any indirect, incidental, special, consequential or punitive damages, including without limitation, loss of profits, data, use, goodwill, or other intangible losses, resulting from your access to or use of or inability to access or use the application.</p>
      </section>
      
      <section aria-labelledby="governing-law">
        <h2 id="governing-law" style={{ color: 'var(--accent)', fontSize: '20px' }}>Governing Law</h2>
        <p>These Terms shall be governed and construed in accordance with the laws of the United States, without regard to its conflict of law provisions.</p>
        <p>Our failure to enforce any right or provision of these Terms will not be considered a waiver of those rights. If any provision of these Terms is held to be invalid or unenforceable by a court, the remaining provisions of these Terms will remain in effect.</p>
      </section>
      
      <section aria-labelledby="contact">
        <h2 id="contact" style={{ color: 'var(--accent)', fontSize: '20px' }}>Contact Us</h2>
        <p>If you have any questions about these Terms, please contact us at:</p>
        <address>
          Email: legal@acutea.edu<br />
          Address: 123 Education Lane, Suite 400, Learning City, ST 12345
        </address>
      </section>
      
      <div style={{ marginTop: '30px', textAlign: 'center' }}>
        <Link to="/" style={{
          display: 'inline-block',
          padding: '10px 20px',
          background: 'var(--accent)',
          color: 'white',
          borderRadius: '8px',
          textDecoration: 'none',
          fontWeight: '500'
        }}>Back to Dashboard</Link>
      </div>
    </div>
  )
}
