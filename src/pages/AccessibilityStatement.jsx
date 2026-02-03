import { Link } from 'react-router-dom'

export default function AccessibilityStatement() {
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
      }}>Accessibility Statement</h1>
      
      <section aria-labelledby="commitment">
        <h2 id="commitment" style={{ color: 'var(--accent)', fontSize: '20px' }}>Our Commitment</h2>
        <p>ACUTEA is committed to ensuring digital accessibility for people with disabilities. We are continually improving the user experience for everyone and applying the relevant accessibility standards.</p>
      </section>
      
      <section aria-labelledby="compliance-status">
        <h2 id="compliance-status" style={{ color: 'var(--accent)', fontSize: '20px' }}>Compliance Status</h2>
        <p>The Web Content Accessibility Guidelines (WCAG) define requirements for designers and developers to improve accessibility for people with disabilities. It defines three levels of conformance: Level A, Level AA, and Level AAA.</p>
        <p>ACUTEA is partially conformant with WCAG 2.1 level AA. Partially conformant means that some parts of the content do not fully conform to the accessibility standard.</p>
      </section>
      
      <section aria-labelledby="compatibility">
        <h2 id="compatibility" style={{ color: 'var(--accent)', fontSize: '20px' }}>Compatibility with Browsers and Assistive Technology</h2>
        <p>ACUTEA is designed to be compatible with the following assistive technologies:</p>
        <ul>
          <li>Screen readers (including NVDA and VoiceOver)</li>
          <li>Screen magnifiers</li>
          <li>Speech recognition software</li>
          <li>Keyboard-only navigation</li>
        </ul>
        <p>The application is compatible with recent versions of major browsers including Chrome, Firefox, Safari, and Edge.</p>
      </section>
      
      <section aria-labelledby="technical-specifications">
        <h2 id="technical-specifications" style={{ color: 'var(--accent)', fontSize: '20px' }}>Technical Specifications</h2>
        <p>Accessibility of ACUTEA relies on the following technologies to work with the particular combination of web browser and any assistive technologies or plugins installed on your computer:</p>
        <ul>
          <li>HTML</li>
          <li>WAI-ARIA</li>
          <li>CSS</li>
          <li>JavaScript</li>
        </ul>
        <p>These technologies are relied upon for conformance with the accessibility standards used.</p>
      </section>
      
      <section aria-labelledby="assessment-approach">
        <h2 id="assessment-approach" style={{ color: 'var(--accent)', fontSize: '20px' }}>Assessment Approach</h2>
        <p>ACUTEA has assessed the accessibility of the application by the following approaches:</p>
        <ul>
          <li>Self-evaluation</li>
          <li>Internal testing with assistive technology</li>
        </ul>
      </section>
      
      <section aria-labelledby="known-limitations">
        <h2 id="known-limitations" style={{ color: 'var(--accent)', fontSize: '20px' }}>Known Limitations</h2>
        <p>Despite our best efforts to ensure the accessibility of ACUTEA, there may be some limitations. Below is a description of known limitations, and where applicable, links to solutions:</p>
        <ul>
          <li><strong>PDF Documents</strong>: Some PDF documents may not be fully accessible. We are working to remediate these documents.</li>
          <li><strong>Data Tables</strong>: Some complex data tables may not have proper header associations. We are working to improve these.</li>
          <li><strong>Third-Party Content</strong>: Some third-party content may not be fully accessible. We are working with our vendors to improve accessibility.</li>
        </ul>
      </section>
      
      <section aria-labelledby="feedback">
        <h2 id="feedback" style={{ color: 'var(--accent)', fontSize: '20px' }}>Feedback</h2>
        <p>We welcome your feedback on the accessibility of ACUTEA. Please let us know if you encounter accessibility barriers:</p>
        <ul>
          <li>Phone: (555) 123-4567</li>
          <li>E-mail: accessibility@acutea.edu</li>
          <li>Postal address: 123 Education Lane, Suite 400, Learning City, ST 12345</li>
        </ul>
        <p>We try to respond to feedback within 5 business days.</p>
      </section>
      
      <section aria-labelledby="compliance-contact">
        <h2 id="compliance-contact" style={{ color: 'var(--accent)', fontSize: '20px' }}>Designated Agency Section 508 Coordinator</h2>
        <p>For Section 508 compliance issues, please contact:</p>
        <address>
          Name: Jane Smith<br />
          Email: section508@acutea.edu<br />
          Phone: (555) 123-4567 ext. 890
        </address>
      </section>
      
      <section aria-labelledby="formal-complaints">
        <h2 id="formal-complaints" style={{ color: 'var(--accent)', fontSize: '20px' }}>Formal Complaints</h2>
        <p>We aim to promptly respond to all accessibility feedback. If you wish to file a formal complaint about the accessibility of this website, you may do so through one of the following channels:</p>
        <ul>
          <li>The <a href="https://www.ada.gov/filing_complaint.htm" style={{ color: 'var(--accent)' }}>U.S. Department of Justice</a></li>
          <li>The <a href="https://www.access-board.gov/" style={{ color: 'var(--accent)' }}>U.S. Access Board</a></li>
        </ul>
      </section>
      
      <section aria-labelledby="approval">
        <h2 id="approval" style={{ color: 'var(--accent)', fontSize: '20px' }}>Formal Approval of This Accessibility Statement</h2>
        <p>This statement was approved on September 1, 2025 by ACUTEA's Digital Accessibility Team.</p>
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
