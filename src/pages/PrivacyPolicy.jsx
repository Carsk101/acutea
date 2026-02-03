import { Link } from 'react-router-dom'

export default function PrivacyPolicy() {
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
      }}>Privacy Policy</h1>
      
      <section aria-labelledby="effective-date">
        <h2 id="effective-date" style={{ color: 'var(--accent)', fontSize: '20px' }}>Effective Date: September 1, 2025</h2>
        <p>This Privacy Policy describes how ACUTEA ("we", "us", or "our") collects, uses, and discloses your information when you use our service.</p>
      </section>
      
      <section aria-labelledby="information-collection">
        <h2 id="information-collection" style={{ color: 'var(--accent)', fontSize: '20px' }}>Information We Collect</h2>
        <p>We collect several types of information from and about users of our application, including:</p>
        <ul>
          <li>Personal information (such as name, email address, and credentials)</li>
          <li>Educational data (such as grades, assignments, and student records)</li>
          <li>Usage data (such as how you interact with our application)</li>
        </ul>
      </section>
      
      <section aria-labelledby="information-use">
        <h2 id="information-use" style={{ color: 'var(--accent)', fontSize: '20px' }}>How We Use Your Information</h2>
        <p>We use the information we collect to:</p>
        <ul>
          <li>Provide, maintain, and improve our services</li>
          <li>Process and complete transactions</li>
          <li>Send administrative information</li>
          <li>Respond to comments, questions, and requests</li>
          <li>Generate analytics and statistics about usage of our services</li>
          <li>Protect against, identify, and prevent fraud and other illegal activity</li>
        </ul>
      </section>
      
      <section aria-labelledby="information-sharing">
        <h2 id="information-sharing" style={{ color: 'var(--accent)', fontSize: '20px' }}>How We Share Your Information</h2>
        <p>We may share your information with:</p>
        <ul>
          <li>Educational institutions that use our services</li>
          <li>Service providers who perform services on our behalf</li>
          <li>As required by law or to comply with legal process</li>
          <li>To protect the rights, property, or safety of our users or others</li>
        </ul>
      </section>
      
      <section aria-labelledby="data-security">
        <h2 id="data-security" style={{ color: 'var(--accent)', fontSize: '20px' }}>Data Security</h2>
        <p>We implement appropriate technical and organizational measures to protect the security of your personal information. However, no method of transmission over the Internet is 100% secure, and we cannot guarantee absolute security.</p>
      </section>
      
      <section aria-labelledby="data-retention">
        <h2 id="data-retention" style={{ color: 'var(--accent)', fontSize: '20px' }}>Data Retention</h2>
        <p>We retain your information for as long as necessary to fulfill the purposes outlined in this Privacy Policy, unless a longer retention period is required or permitted by law.</p>
      </section>
      
      <section aria-labelledby="your-rights">
        <h2 id="your-rights" style={{ color: 'var(--accent)', fontSize: '20px' }}>Your Rights</h2>
        <p>Depending on your location, you may have certain rights regarding your personal information, including:</p>
        <ul>
          <li>The right to access your personal information</li>
          <li>The right to correct inaccurate information</li>
          <li>The right to delete your information</li>
          <li>The right to restrict or object to processing</li>
          <li>The right to data portability</li>
        </ul>
      </section>
      
      <section aria-labelledby="children-privacy">
        <h2 id="children-privacy" style={{ color: 'var(--accent)', fontSize: '20px' }}>Children's Privacy</h2>
        <p>Our services are designed for educational institutions and comply with applicable laws regarding children's privacy, including the Family Educational Rights and Privacy Act (FERPA) and the Children's Online Privacy Protection Act (COPPA) where applicable.</p>
      </section>
      
      <section aria-labelledby="changes">
        <h2 id="changes" style={{ color: 'var(--accent)', fontSize: '20px' }}>Changes to This Privacy Policy</h2>
        <p>We may update this Privacy Policy from time to time. The updated version will be indicated by an updated "Effective Date" and the updated version will be effective as soon as it is accessible.</p>
      </section>
      
      <section aria-labelledby="contact">
        <h2 id="contact" style={{ color: 'var(--accent)', fontSize: '20px' }}>Contact Us</h2>
        <p>If you have any questions about this Privacy Policy, please contact us at:</p>
        <address>
          Email: privacy@acutea.edu<br />
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
