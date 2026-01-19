from flask import Flask, request, render_template_string,Blueprint,redirect, url_for
import matplotlib
matplotlib.use("Agg")
import smtplib
from email.message import EmailMessage

YOUR_EMAIL = "rockysaaho755@gmail.com"
EMAIL_PASSWORD = "yfceqvnygwsxkplp"

contact_pg = Blueprint("contact", __name__)

@contact_pg.route("/contact", methods=["GET", "POST"])
def contact():
    success = False

    if request.method == "POST":
        name = request.form["name"]
        email = request.form["email"]
        message = request.form["message"]
        file = request.files.get("attachment")

        msg = EmailMessage()
        msg["Subject"] = "New EnergyFlow Contact Query"
        msg["From"] = YOUR_EMAIL
        msg["To"] = YOUR_EMAIL

        msg.set_content(f"""
    New Contact Form Submission

    Name: {name}
    Email: {email}

    Message:
    {message}
    """)
        if file and file.filename != "":
            file_data = file.read()
            msg.add_attachment(
                file_data,
                maintype="application",
                subtype="octet-stream",
                filename=file.filename
            )

        with smtplib.SMTP_SSL("smtp.gmail.com", 465) as server:
            server.login(YOUR_EMAIL, EMAIL_PASSWORD)
            server.send_message(msg)

        success = True

    return render_template_string("""
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>EnergyFlow - Smart Energy Solutions</title>
      <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,500;0,600;0,700;1,400;1,500;1,600;1,700&family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
      <style>
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }

        :root {
          --background: #020617;
          --foreground: #f8f9fa;
          --primary: #1a1d24;
          --primary-foreground: #f8f9fa;
          --secondary: #f4f5f7;
          --muted: #6b7280;
          --accent: #e67e22;
          --dark-surface: #1a1d24;
          --dark-card: #24272e;
          --border: #e5e7eb;
        }

        body {
          font-family: 'Inter', system-ui, sans-serif;
          color: var(--foreground);
          background: var(--background);
          line-height: 1.6;
          padding-top: 100px;
        }

        h1, h2, h3, h4, h5, h6 {
          font-family: 'Playfair Display', Georgia, serif;
        }

        .heading-display {
          font-family: 'Playfair Display', Georgia, serif;
          font-style: italic;
          font-weight: 500;
        }

        .container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 24px;
        }

        /* Header */
        .header {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          z-index: 50;
          padding: 24px 0;
          background: var(--background);
        }

        .header-inner {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .logo {
          display: flex;
          align-items: center;
          gap: 8px;
          color: var(--primary-foreground);
          font-family: 'Playfair Display', serif;
          font-size: 20px;
          font-weight: 600;
          text-decoration: none;
        }

        .logo svg {
          width: 24px;
          height: 24px;
        }

        .nav {
          display: none;
          gap: 32px;
        }

        @media (min-width: 768px) {
          .nav {
            display: flex;
          }
        }

        .nav a {
          color: rgba(248, 249, 250, 0.8);
          text-decoration: none;
          transition: color 0.3s;
        }

        .nav a:hover {
          color: var(--primary-foreground);
        }

        .btn {
          display: inline-block;
          padding: 12px 24px;
          border-radius: 9999px;
          font-size: 14px;
          font-weight: 500;
          text-decoration: none;
          cursor: pointer;
          transition: all 0.3s;
          border: none;
        }

        .btn-outline-light {
          background: transparent;
          border: 1px solid rgba(248, 249, 250, 0.5);
          color: var(--primary-foreground);
        }

        .btn-outline-light:hover {
          background: var(--primary-foreground);
          color: var(--primary);
        }

        .btn-primary {
          background: var(--primary);
          color: var(--primary-foreground);
        }

        .btn-primary:hover {
          opacity: 0.9;
        }

        .btn-outline-dark {
          background: transparent;
          border: 1px solid var(--border);
          color: var(--foreground);
        }

        .btn-outline-dark:hover {
          background: var(--foreground);
          color: var(--background);
        }
        /* Footer */
        .footer {
          background: var(--background);
          padding: 64px 0;
          border-top: 1px solid var(--border);
        }

        .footer-grid {
          display: grid;
          gap: 48px;
        }

        @media (min-width: 768px) {
          .footer-grid {
            grid-template-columns: repeat(4, 1fr);
          }
        }

        .footer-logo {
          display: flex;
          align-items: center;
          gap: 8px;
          color: var(--foreground);
          font-family: 'Playfair Display', serif;
          font-size: 20px;
          font-weight: 600;
          text-decoration: none;
          margin-bottom: 24px;
        }

        .footer-logo svg {
          width: 24px;
          height: 24px;
        }

        .footer-section p {
          color: var(--muted);
          font-size: 14px;
        }

        .footer-section h4 {
          font-family: 'Inter', sans-serif;
          font-weight: 600;
          margin-bottom: 16px;
        }

        .footer-section ul {
          list-style: none;
        }

        .footer-section ul li {
          margin-bottom: 12px;
        }

        .footer-section ul a {
          color: var(--muted);
          text-decoration: none;
          font-size: 14px;
          transition: color 0.3s;
        }

        .footer-section ul a:hover {
          color: var(--foreground);
        }

        .footer-bottom {
          border-top: 1px solid var(--border);
          margin-top: 48px;
          padding-top: 32px;
          text-align: center;
        }

        .footer-bottom p {
          color: var(--muted);
          font-size: 14px;
        }
        /* Contact Section */
        .contact-wrapper {
          display: flex;
          justify-content: center;
          align-items: center;
          min-height: 70vh;
        }

        .contact-card {
          width: 100%;
          max-width: 520px;
          background: #1a1d24;
          border-radius: 16px;
          padding: 50px 40px;
          box-shadow: 0 0 40px rgba(0,0,0,0.4);
          border: 1px solid #1e293b;
          text-align: center;
        }

        .contact-card h2 {
          font-size: 32px;
          margin-bottom: 10px;
        }

        .contact-subtext {
          font-size: 14px;
          color: rgba(248,249,250,0.6);
          margin-bottom: 40px;
        }

        /* Floating Inputs */
        .input-group {
          position: relative;
          margin-bottom: 30px;
        }

        .input-group input,
        .input-group textarea {
          width: 100%;
          background: transparent;
          border: none;
          border-bottom: 2px solid #334155;
          padding: 10px 0;
          color: white;
          font-size: 14px;
          outline: none;
        }

        .input-group label {
          position: absolute;
          left: 0;
          top: 10px;
          color: #94a3b8;
          font-size: 13px;
          transition: 0.3s ease;
          pointer-events: none;
        }

        .input-group input:focus + label,
        .input-group input:valid + label,
        .input-group textarea:focus + label,
        .input-group textarea:valid + label {
          top: -14px;
          font-size: 11px;
          color: #22c55e;
        }

        .input-group input:focus,
        .input-group textarea:focus {
          border-bottom-color: #22c55e;
        }

        /* Submit Button */
        .submit-btn {
          margin-top: 20px;
          padding: 12px 30px;
          background: transparent;
          border: 2px solid #22c55e;
          color: #22c55e;
          border-radius: 30px;
          font-weight: 600;
          cursor: pointer;
          transition: 0.3s;
        }

        .submit-btn:hover {
          background: #22c55e;
          color: #020617;
        }

        .success-msg {
          margin-top: 20px;
          color: #22c55e;
          font-size: 14px;
        }

        </style>
        </head>
        <body>
            <!-- Header -->
            <header class="header">
              <div class="container">
                <div class="header-inner">
                  <a href="#" class="logo">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                      <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon>
                    </svg>
                    EnergyFlow
                  </a>

                  <nav class="nav">
                    <a href="/">Home</a>
                    <a href="/learning">Learning</a>
                    <a href="/overviews">Overviews</a>
                    <a href="/contact">Contact</a>
                  </nav>

                  <a href="#" class="btn btn-outline-light">Learn More</a>
                </div>
              </div>
            </header>
            <div class="container contact-wrapper">
              <div class="contact-card">
                <h2>CONTACT US</h2>
                <p class="contact-subtext">
                  Have a question about smart energy consumption?  
                  Drop your query and we’ll get back to you.
                </p>

                <form method="POST" action="/contact" enctype="multipart/form-data">
                  <div class="input-group">
                    <input type="text" name="name" required>
                    <label>Your Name</label>
                  </div>

                  <div class="input-group">
                    <input type="email" name="email" required>
                    <label>Your Email</label>
                  </div>

                  <div class="input-group">
                    <textarea name="message" rows="4" required></textarea>
                    <label>Your Message</label>
                  </div>
                  <div class="input-group">
                      <input type="file" name="attachment" required>
                  </div>
                  <button type="submit" class="submit-btn">
                    SUBMIT →
                  </button>

                </form>

                {% if success %}
                  <p class="success-msg">✔ Message sent successfully</p>
                {% endif %}
              </div>

            </div>

            <!-- Footer -->
            <footer class="footer">
              <div class="container">
                <div class="footer-grid">
                  <div class="footer-section">
                    <a href="#" class="footer-logo">
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon>
                      </svg>
                      EnergyFlow
                    </a>
                    <p>Transforming energy efficiency for a sustainable future.</p>
                  </div>

                  <div class="footer-section">
                    <h4>Quick Links</h4>
                    <ul>
                      <li><a href="/">Home</a></li>
                      <li><a href="/learning">Learning</a></li>
                      <li><a href="/overviews">Overviews</a></li>
                      <li><a href="/contact">Contact</a></li>
                    </ul>
                  </div>

                  <div class="footer-section">
                    <h4>Connect With Us</h4>
                    <ul>
                      <li><a href="#">LinkedIn</a></li>
                      <li><a href="#">Twitter</a></li>
                      <li><a href="#">Facebook</a></li>
                      <li><a href="#">Instagram</a></li>
                    </ul>
                  </div>

                  <div class="footer-section">
                    <h4>Legal</h4>
                    <ul>
                      <li><a href="#">Privacy Policy</a></li>
                      <li><a href="#">Terms of Service</a></li>
                      <li><a href="#">Cookie Policy</a></li>
                    </ul>
                  </div>
                </div>

                <div class="footer-bottom">
                  <p>© 2026 EnergyFlow. All rights reserved.</p>
                </div>
              </div>
            </footer>
            </body>
        </html>""", success=success)

