from flask import Flask, request, render_template_string,Blueprint, jsonify
import requests
from dotenv import load_dotenv
import os
home_pg = Blueprint("home", __name__)
load_dotenv()
OPENROUTER_API_KEY = os.getenv("OPENROUTER_API")
print("API KEY LOADED:", OPENROUTER_API_KEY[:15])
@home_pg.route("/chat", methods=["POST"])
def chat():
    data = request.get_json(silent=True)

    if not data or "message" not in data:
        return jsonify({"reply": "Invalid request"}), 400

    user_msg = data["message"].strip().lower()

    # -------------------------------
    # Greeting Handler
    # -------------------------------
    greetings = ["hi", "hello", "hey", "hii", "good morning", "good evening"]
    if user_msg in greetings:
        return jsonify({
            "reply": "👋 Hi! I'm **EnergyBot** 🤖\n\nI help with:\n• Smart energy usage\n• Energy prediction\n• Solar & HVAC systems\n• Energy optimization\n\nAsk me anything related to energy ⚡"
        })

    # -------------------------------
    # Allowed Topics
    # -------------------------------
    allowed_keywords = [
        # General Energy
        "energy", "power", "electric", "electricity", "consumption", "usage",
        "load", "demand", "unit", "kwh", "kilowatt",

        # Renewable Energy
        "solar", "solar panel", "wind", "renewable", "green energy",
        "clean energy", "sustainable", "sustainability",

        # Smart Systems
        "smart grid", "grid", "smart energy", "iot", "automation",
        "energy management", "ems", "monitoring",

        # HVAC & Building
        "hvac", "cooling", "heating", "air conditioning",
        "temperature", "humidity", "building energy",

        # Prediction & ML
        "prediction", "forecast", "machine learning",
        "model", "energy prediction", "ai", "analytics",

        # Optimization
        "efficiency", "optimize", "optimization",
        "saving", "reduce cost", "energy saving",

        # Your Website Context
        "energyflow", "dashboard", "overview",
        "consumption graph", "energy chart"
    ]

    if not any(word in user_msg for word in allowed_keywords):
        return jsonify({
            "reply": "⚠️ I only answer questions related to smart energy, prediction, and optimization."
        })


    if any(word in user_msg for word in ["predict", "forecast", "estimate"]):
        return jsonify({"redirect": "/overviews"})

    try:
        response = requests.post(
            "https://openrouter.ai/api/v1/chat/completions",
            headers={
                "Authorization": f"Bearer {OPENROUTER_API_KEY}",
                "Content-Type": "application/json"
            },
            json={
                "model": "google/gemma-3-27b-it:free",
                "messages": [
                    {
                        "role": "system",
                        "content": (
                            """You are EnergyBot, a professional assistant for smart energy systems.
                                STRICT RULES:
                                1. Answer only energy-related questions.
                                2. Always use structured formatting.n
                                3. if need then write long paragraphs otherwise not write.
                                4. Do NOT use markdown symbols like ##, **, or *.
                                5. Use clear section titles with colons.
                                6. Use bullet points with hyphens (-).
                                7. Do not add unnecessary explanations.
                                8. Do not repeat the question.
                                9.Always starting with new line if previous line was end.
                                
                                Allowed Structure Example:
                                
                                TITLE:
                                <short title>\n
                                
                                DESCRIPTION:
                                - point\n
                                - point\n
                                
                                TYPES / COMPONENTS / BENEFITS (only if relevant):
                                - point\n
                                - point\n
                                
                                APPLICATION:
                                - point\n
                                """
                        )
                    },
                    {
                        "role": "user",
                        "content": user_msg
                    }
                ]
            },
            timeout=20
        )

        data = response.json()

        if "choices" not in data:
            return jsonify({"reply": "⚠️ Server busy. Try again shortly."})

        reply = data["choices"][0]["message"]["content"]

        return jsonify({"reply": reply})

    except Exception as e:
        return jsonify({
            "reply": "⚠️ EnergyBot is currently unavailable. Please try again later."
        })


@home_pg.route("/",methods=["GET","POST"])
def home():

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
          --background: #ffffff;
          --foreground: #0f1419;
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

        /* Hero Section */
        .hero {
          background: var(--dark-surface);
          min-height: 100vh;
          position: relative;
          overflow: hidden;
          display: flex;
          align-items: center;
        }

        .hero-overlay {
          position: absolute;
          inset: 0;
          background: linear-gradient(to right, var(--dark-surface), rgba(26, 29, 36, 0.95), transparent);
          z-index: 10;
        }

        .hero-image {
          position: absolute;
          right: 0;
          top: 0;
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
        .hero .container {
          width: 100%;
          display: flex;
          justify-content: flex-start; /* LEFT ALIGN */
        }

        .hero-content {
          position: relative;
          z-index: 20;
          max-width: 600px;
          padding-top: 96px;
          text-align: left;
        }

        .hero h1 {
          font-size: clamp(40px, 6vw, 72px);
          color: var(--primary-foreground);
          line-height: 1.1;
          margin-bottom: 24px;
        }

        .hero p {
          color: rgba(248, 249, 250, 0.7);
          font-size: 18px;
          max-width: 400px;
          margin-bottom: 40px;
        }

        /* Solutions Section */
        .solutions {
          padding: 96px 0;
          background: var(--background);
        }

        .solutions-grid {
          display: grid;
          gap: 64px;
          align-items: start;
        }

        @media (min-width: 1024px) {
          .solutions-grid {
            grid-template-columns: 1fr 1fr;
          }
        }

        .solutions h2 {
          font-size: clamp(32px, 4vw, 48px);
          margin-bottom: 24px;
        }

        .solutions > .container > .solutions-grid > div:first-child p {
          color: var(--muted);
          max-width: 400px;
        }

        .solutions-cards {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 16px;
        }

        .solution-card {
          border: 1px solid var(--border);
          border-radius: 8px;
          padding: 24px;
          text-align: center;
        }

        .solution-card h3 {
          font-size: 18px;
          margin-bottom: 8px;
        }

        .solution-card p {
          font-size: 14px;
          color: var(--muted);
        }

        /* Features Section */
        .features {
          background: var(--dark-surface);
          padding: 96px 0;
        }

        .features-grid {
          display: grid;
          gap: 32px;
        }

        @media (min-width: 768px) {
          .features-grid {
            grid-template-columns: repeat(3, 1fr);
          }
        }

        .feature-card {
          background: var(--dark-card);
          border-radius: 8px;
          padding: 48px 24px;
          text-align: center;
        }

        .icon-circle {
          width: 80px;
          height: 80px;
          border-radius: 50%;
          border: 1px solid rgba(255, 255, 255, 0.2);
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 24px;
          background: radial-gradient(circle at center, var(--dark-card) 0%, transparent 70%);
        }

        .icon-circle svg {
          width: 32px;
          height: 32px;
          color: rgba(248, 249, 250, 0.8);
        }

        .feature-card h3 {
          color: var(--primary-foreground);
          font-size: 20px;
          margin-bottom: 12px;
        }

        .feature-card p {
          color: rgba(248, 249, 250, 0.6);
          font-size: 14px;
          max-width: 280px;
          margin: 0 auto;
        }

        /* Partner Section */
        .partner {
          padding: 96px 0;
          background: var(--background);
        }

        .partner-grid {
          display: grid;
          gap: 64px;
          align-items: center;
        }

        @media (min-width: 1024px) {
          .partner-grid {
            grid-template-columns: 1fr 1fr;
          }
        }

        .label-accent {
          color: var(--accent);
          font-size: 14px;
          font-weight: 500;
          letter-spacing: 0.5px;
        }

        .partner h2 {
          font-size: clamp(32px, 4vw, 48px);
          margin-top: 16px;
          margin-bottom: 24px;
        }

        .partner p {
          color: var(--muted);
          max-width: 400px;
          margin-bottom: 32px;
        }

        .partner-image {
          width: 100%;
          height: 400px;
          object-fit: cover;
          border-radius: 8px;
        }

        /* Expertise Section */
        .expertise {
          padding: 96px 0;
          background: var(--secondary);
        }

        .expertise-header {
          display: flex;
          flex-direction: column;
          gap: 24px;
          margin-bottom: 48px;
        }

        @media (min-width: 768px) {
          .expertise-header {
            flex-direction: row;
            align-items: center;
            justify-content: space-between;
          }
        }

        .expertise h2 {
          font-size: clamp(32px, 4vw, 48px);
          margin-top: 16px;
        }

        .expertise-cards {
          display: grid;
          gap: 24px;
        }

        @media (min-width: 768px) {
          .expertise-cards {
            grid-template-columns: repeat(3, 1fr);
          }
        }

        .expertise-card {
          position: relative;
          height: 350px;
          border-radius: 8px;
          overflow: hidden;
        }

        .expertise-card img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.5s;
        }

        .expertise-card:hover img {
          transform: scale(1.05);
        }

        .expertise-card-overlay {
          position: absolute;
          inset: 0;
          background: linear-gradient(to top, rgba(0, 0, 0, 0.8), rgba(0, 0, 0, 0.2), transparent);
        }

        .expertise-card-content {
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          padding: 24px;
        }

        .expertise-card h3 {
          color: var(--primary-foreground);
          font-size: 20px;
          font-weight: 600;
          margin-bottom: 8px;
        }

        .expertise-card p {
          color: rgba(248, 249, 250, 0.7);
          font-size: 14px;
        }

        /* Future Energy Section */
        .future-energy {
          background: var(--dark-surface);
          padding: 96px 0;
        }

        .future-energy-header {
          text-align: center;
          margin-bottom: 64px;
        }

        .future-energy h2 {
          color: var(--primary-foreground);
          font-size: clamp(32px, 4vw, 48px);
          margin-bottom: 16px;
        }

        .future-energy-header p {
          color: rgba(248, 249, 250, 0.6);
          max-width: 600px;
          margin: 0 auto;
        }

        .future-card {
          background: var(--dark-card);
          border-radius: 8px;
          padding: 40px 24px;
          text-align: center;
        }

        .future-card h3 {
          color: var(--primary-foreground);
          font-size: 20px;
          margin-bottom: 8px;
        }

        .future-card .subtitle {
          color: rgba(248, 249, 250, 0.5);
          font-size: 14px;
          margin-bottom: 16px;
        }

        .future-card .description {
          color: rgba(248, 249, 250, 0.7);
          font-size: 14px;
          max-width: 280px;
          margin: 0 auto;
        }

        /* Newsletter Section */
        .newsletter {
          display: grid;
        }

        @media (min-width: 1024px) {
          .newsletter {
            grid-template-columns: 1fr 1fr;
          }
        }

        .newsletter-dark {
          background: var(--dark-surface);
          padding: 96px 24px;
        }

        .newsletter-dark-inner {
          max-width: 480px;
          margin-left: 0;
          margin-right: auto;
        }

        @media (min-width: 1024px) {
          .newsletter-dark-inner {
            margin-left: auto;
            margin-right: 0;
          }
        }

        .newsletter-dark h2 {
          color: var(--primary-foreground);
          font-size: clamp(32px, 4vw, 48px);
          margin-bottom: 24px;
        }

        .newsletter-dark > .newsletter-dark-inner > p {
          color: rgba(248, 249, 250, 0.6);
          margin-bottom: 40px;
        }

        .benefit-item {
          display: flex;
          align-items: flex-start;
          gap: 16px;
          background: rgba(36, 39, 46, 0.5);
          padding: 16px;
          border-radius: 8px;
          margin-bottom: 16px;
        }

        .benefit-icon {
          width: 48px;
          height: 48px;
          border-radius: 50%;
          background: rgba(230, 126, 34, 0.2);
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .benefit-icon svg {
          width: 20px;
          height: 20px;
          color: var(--accent);
        }

        .benefit-item p {
          color: rgba(248, 249, 250, 0.8);
          font-size: 14px;
        }

        .newsletter-light {
          background: var(--secondary);
          padding: 96px 24px;
        }

        .newsletter-light-inner {
          max-width: 480px;
          margin: 0 auto;
        }

        @media (min-width: 1024px) {
          .newsletter-light-inner {
            margin-right: auto;
            margin-left: 0;
          }
        }

        .newsletter-light .label {
          font-weight: 500;
          color: var(--foreground);
        }

        .newsletter-light h2 {
          font-size: clamp(28px, 3vw, 36px);
          margin-top: 16px;
          margin-bottom: 24px;
        }

        .newsletter-light > .newsletter-light-inner > p {
          color: var(--muted);
          margin-bottom: 40px;
        }

        .form-group {
          margin-bottom: 16px;
        }

        .form-group label {
          display: block;
          font-size: 14px;
          color: var(--muted);
          margin-bottom: 8px;
        }

        .form-group input {
          width: 100%;
          padding: 12px 16px;
          border: 1px solid var(--border);
          border-radius: 8px;
          font-size: 16px;
          background: var(--background);
        }

        .form-group input:focus {
          outline: none;
          border-color: var(--primary);
        }

        .btn-full {
          width: 100%;
          padding: 16px 24px;
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
        /* TYPEWRITER TEXT */
        .typewriter {
          color: #ffffff;
          position: relative;
        }

        /* BLINKING CURSOR */
        .typewriter::after {
          content: "|";
          margin-left: 4px;
          animation: blink 1s infinite;
          opacity: 0.8;
        }

        @keyframes blink {
          0%, 50%, 100% { opacity: 1; }
          25%, 75% { opacity: 0; }
        }
        /* CHATBOT CONTAINER */
        #chatbot {
          position: fixed;
          bottom: 100px;
          right: 30px;
          width: 850px;          /* ⬅ Increased width */
          height: 920px;         /* ⬅ Increased height */
          background: #020617;
          border-radius: 16px;
          display: none;
          flex-direction: column;
          overflow: hidden;
          z-index: 9999;
          box-shadow: 0 0 30px rgba(0, 255, 150, 0.3);
        }
        
        /* HEADER */
        #chatbot-header {
          background: linear-gradient(135deg, #22c55e, #16a34a);
          color: black;
          padding: 5px 14px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          font-weight: 600;
        }
        
        /* BOT ICON */
        .bot-icon {
          width: 244px;
          height: 104px;
          margin-right: 8px; 
          animation: floatBot 2s ease-in-out infinite;
        }
        
        /* CHAT BODY */
        #chat-body {
          flex: 1;
          padding: 12px;
          overflow-y: auto;
          color: white;
          font-size: 24px;
          line-height: 1.5;
        }
        
        /* USER INPUT */
        #chat-input {
          display: flex;
          border-top: 1px solid #1f2937;
        }
        
        #chat-input input {
          flex: 1;
          padding: 12px;
          border: none;
          background: #020617;
          color: white;
          outline: none;
        }
        
        #chat-input button {
          background: #22c55e;
          border: none;
          padding: 0 18px;
          cursor: pointer;
          font-size: 18px;
        }
        
        /* FLOATING BUTTON */
        #chat-toggle {
          position: fixed;
          bottom: 30px;
          right: 30px;
          width: 65px;
          height: 65px;
          border-radius: 50%;
          background: #22c55e;
          font-size: 26px;
          border: none;
          cursor: pointer;
          z-index: 9999;
          animation: pulse 1.5s infinite;
        }
        
        /* BOT ANIMATION */
        @keyframes floatBot {
          0% { transform: translateY(0); }
          50% { transform: translateY(-4px); }
          100% { transform: translateY(0); }
        }
        
        @keyframes pulse {
          0% { box-shadow: 0 0 0 0 rgba(34,197,94,.6); }
          70% { box-shadow: 0 0 0 18px rgba(34,197,94,0); }
          100% { box-shadow: 0 0 0 0 rgba(34,197,94,0); }
        }
        .user-msg {
          background: #1f2937;
          color: white;
          padding: 10px;
          margin: 6px 0;
          border-radius: 10px;
          max-width: 90%;
          align-self: flex-end;
        }
        
        .bot-msg {
          background: #14532d;
          color: #e5e7eb;
          padding: 10px;
          margin: 6px 0;
          border-radius: 10px;
          max-width: 90%;
          line-height: 1.5;
          white-space: normal;
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
              <a class="help-btn" href="/">Home</a>
              <a class="help-btn" href="/learning">Learning</a>
              <a class="help-btn" href="/overviews">Overviews</a>
              <a class="help-btn" href="/contact">Contact</a>
            </nav>

            <a href="#" class="btn btn-outline-light">Learn More</a>
          </div>
        </div>
      </header>

      <!-- Hero Section -->
      <section class="hero">
        <div class="hero-overlay"></div>
        <img src="/static/images/img2.png" alt="Energy facility" class="hero-image">
        <div class="container">
          <div class="hero-content">
            <h1 class="heading-display">
              <span class="typewriter"></span>
              Solutions for a
            </h1>
            <p>
              At our website, we are dedicated to providing cutting-edge smart energy solutions
              that empower individuals and businesses to reduce their carbon footprint and achieve
            </p>
            <a href="#one" class="btn btn-outline-light">Explore Now</a>
          </div>
        </div>
      </section>

      <!-- Solutions Section -->
      <section class="solutions" id="one">
        <div class="container">
          <div class="solutions-grid">
            <div>
              <h2 class="heading-display">About Our Solutions</h2>
              <p>
                Our smart energy solutions leverage advanced data analytics, IoT
                integration, and intelligent automation to deliver unprecedented
                visibility and control over your energy consumption
              </p>
            </div>
            <div class="solutions-cards">
              <div class="solution-card">
                <h3 class="heading-display">Intelligent</h3>
                <p>Optimize energy use and reduce costs with our</p>
              </div>
              <div class="solution-card">
                <h3 class="heading-display">Distributed</h3>
                <p>Harness renewable energy</p>
              </div>
              <div class="solution-card">
                <h3 class="heading-display">Energy Efficiency</h3>
                <p>Unlock your energy-</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- Features Section -->
      <section class="features">
        <div class="container">
          <div class="features-grid">
            <div class="feature-card">
              <div class="icon-circle">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon>
                </svg>
              </div>
              <h3 class="heading-display">Innovative Technology</h3>
              <p>Cutting-edge solutions for smarter energy management</p>
            </div>
            <div class="feature-card">
              <div class="icon-circle">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <line x1="9" y1="18" x2="15" y2="18"></line>
                  <line x1="10" y1="22" x2="14" y2="22"></line>
                  <path d="M15.09 14c.18-.98.65-1.74 1.41-2.5A4.65 4.65 0 0 0 18 8 6 6 0 0 0 6 8c0 1 .23 2.23 1.5 3.5A4.61 4.61 0 0 1 8.91 14"></path>
                </svg>
              </div>
              <h3 class="heading-display">Scalable Platforms</h3>
              <p>Tailored for businesses of all sizes</p>
            </div>
            <div class="feature-card">
              <div class="icon-circle">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <line x1="18" y1="20" x2="18" y2="10"></line>
                  <line x1="12" y1="20" x2="12" y2="4"></line>
                  <line x1="6" y1="20" x2="6" y2="14"></line>
                </svg>
              </div>
              <h3 class="heading-display">Proven Results</h3>
              <p>Measurable impact on your energy costs and carbon</p>
            </div>
          </div>
        </div>
      </section>

      <!-- Partner Section -->
      <section class="partner">
        <div class="container">
          <div class="partner-grid">
            <div>
              <span class="label-accent">Partner with Us</span>
              <h2 class="heading-display">
                Transforming Energy<br>
                Efficiency Together
              </h2>
              <p>
                At our company, we believe that smart energy solutions are the key to a
                sustainable future. By partnering with us, you'll gain access to the latest
                technologies, expert guidance
              </p>
              <a href="#" class="btn btn-primary">Get Started</a>
            </div>
            <div>
              <img src="/static/images/i1.png" alt="Energy facility" class="partner-image">
            </div>
          </div>
        </div>
      </section>

      <!-- Expertise Section -->
      <section class="expertise">
        <div class="container">
          <div class="expertise-header">
            <div>
              <span class="label-accent">Our Expertise</span>
              <h2 class="heading-display">Empowering Sustainable Solutions</h2>
            </div>
            <a href="/learning" class="btn btn-outline-dark">Discover More</a>
          </div>
          <div class="expertise-cards">
            <div class="expertise-card">
              <img src="/static/images/img3.png" alt="Wind turbines">
              <div class="expertise-card-overlay"></div>
              <div class="expertise-card-content">
                <h3>Wind Power Integration</h3>
                <p>Harnessing clean wind energy for sustainable solutions</p>
              </div>
            </div>
            <div class="expertise-card">
              <img src="/static/images/img4.png" alt="Solar panels">
              <div class="expertise-card-overlay"></div>
              <div class="expertise-card-content">
                <h3>Solar Technology</h3>
                <p>Advanced photovoltaic systems for maximum efficiency</p>
              </div>
            </div>
            <div class="expertise-card">
              <img src="/static/images/img5.png" alt="Wind turbine sunset">
              <div class="expertise-card-overlay"></div>
              <div class="expertise-card-content">
                <h3>Sustainable Future</h3>
                <p>Building tomorrow's energy infrastructure today</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- Future Energy Section -->
      <section class="future-energy">
        <div class="container">
          <div class="future-energy-header">
            <h2 class="heading-display">Driving the Future of Energy</h2>
            <p>
              Our innovative smart energy solutions are designed to empower businesses and
              individuals to take control of their energy consumption, reduce costs
            </p>
          </div>
          <div class="features-grid">
            <div class="future-card">
              <div class="icon-circle">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon>
                </svg>

              </div>
              <h3 class="heading-display">Smart Building</h3>
              <p class="subtitle">Optimize energy use and enhance efficiency</p>
              <p class="description">Leverage data-driven insights to transform your energy management strategies.</p>
            </div>
            <div class="future-card">
              <div class="icon-circle">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <line x1="9" y1="18" x2="15" y2="18"></line>
                  <line x1="10" y1="22" x2="14" y2="22"></line>
                  <path d="M15.09 14c.18-.98.65-1.74 1.41-2.5A4.65 4.65 0 0 0 18 8 6 6 0 0 0 6 8c0 1 .23 2.23 1.5 3.5A4.61 4.61 0 0 1 8.91 14"></path>
                </svg>
              </div>
              <h3 class="heading-display">Renewable Energy</h3>
              <p class="subtitle">Harness the power of renewable sources</p>
              <p class="description">Achieve greater self-sufficiency and reduce reliance on the grid.</p>
            </div>
            <div class="future-card">
              <div class="icon-circle">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <line x1="18" y1="20" x2="18" y2="10"></line>
                  <line x1="12" y1="20" x2="12" y2="4"></line>
                  <line x1="6" y1="20" x2="6" y2="14"></line>
                </svg>
              </div>
              <h3 class="heading-display">Energy Efficiency</h3>
              <p class="subtitle">Unlock hidden savings and drive sustainability</p>
              <p class="description">Benefit from our expertise in optimizing your energy consumption.</p>
            </div>
          </div>
        </div>
      </section>

      <!-- Newsletter Section -->
      <section class="newsletter">
        <div class="newsletter-dark">
          <div class="newsletter-dark-inner">
            <h2 class="heading-display">
              Empowering a<br>
              Sustainable
            </h2>
            <p>
              At our website, we are committed to providing innovative
              smart energy solutions that not only reduce your energy
            </p>

            <div class="benefit-item">
              <div class="benefit-icon">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <line x1="9" y1="18" x2="15" y2="18"></line>
                  <line x1="10" y1="22" x2="14" y2="22"></line>
                  <path d="M15.09 14c.18-.98.65-1.74 1.41-2.5A4.65 4.65 0 0 0 18 8 6 6 0 0 0 6 8c0 1 .23 2.23 1.5 3.5A4.61 4.61 0 0 1 8.91 14"></path>
                </svg>

              </div>
              <p>Discover how our solutions can help you become a leader in energy efficiency and sustainability</p>
            </div>

            <div class="benefit-item">
              <div class="benefit-icon">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <line x1="9" y1="18" x2="15" y2="18"></line>
                  <line x1="10" y1="22" x2="14" y2="22"></line>
                  <path d="M15.09 14c.18-.98.65-1.74 1.41-2.5A4.65 4.65 0 0 0 18 8 6 6 0 0 0 6 8c0 1 .23 2.23 1.5 3.5A4.61 4.61 0 0 1 8.91 14"></path>
                </svg>
              </div>
              <p>Take the first step towards a more sustainable tomorrow.</p>
            </div>

            <div class="benefit-item">
              <div class="benefit-icon">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <line x1="9" y1="18" x2="15" y2="18"></line>
                  <line x1="10" y1="22" x2="14" y2="22"></line>
                  <path d="M15.09 14c.18-.98.65-1.74 1.41-2.5A4.65 4.65 0 0 0 18 8 6 6 0 0 0 6 8c0 1 .23 2.23 1.5 3.5A4.61 4.61 0 0 1 8.91 14"></path>
                </svg>
              </div>
              <p>Our team of energy experts are ready to partner with you and guide you through the journey</p>
            </div>

            <div class="benefit-item">
              <div class="benefit-icon">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <line x1="9" y1="18" x2="15" y2="18"></line>
                  <line x1="10" y1="22" x2="14" y2="22"></line>
                  <path d="M15.09 14c.18-.98.65-1.74 1.41-2.5A4.65 4.65 0 0 0 18 8 6 6 0 0 0 6 8c0 1 .23 2.23 1.5 3.5A4.61 4.61 0 0 1 8.91 14"></path>
                </svg>
              </div>
              <p>Together, we can unlock the full potential of smart energy and drive meaningful</p>
            </div>
          </div>
        </div>

        <div class="newsletter-light">
          <div class="newsletter-light-inner">
            <span class="label">Stay Connected</span>
            <h2 class="heading-display">
              Explore Our Energy-<br>
              Saving Solutions
            </h2>
            <p>
              Sign up for our newsletter to stay informed about the latest
              advancements in smart energy technology and learn how you
              can optimize your energy consumption and reduce your carbon
            </p>

            <form>
              <div class="form-group">
                <label>Email Address</label>
                <input type="email" placeholder="Enter your email">
              </div>
              <button type="submit" class="btn btn-primary btn-full">Subscribe</button>
            </form>
          </div>
        </div>
      </section>

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
      <div id="chatbot">
          <div id="chatbot-header">
            <img src="/static/images/bot.png" class="bot-icon">
            
            <button onclick="toggleChat()">×</button>
          </div>
        
          <div id="chat-body"></div>
        
          <div id="chat-input">
            <input type="text" id="userMsg" placeholder="Ask about energy..." />
            <button onclick="sendMessage()">➤</button>
          </div>
     </div>
     <button id="chat-toggle" onclick="toggleChat()">💬</button>
      
      <script>
      const words = [
        "Smarter Tomorrow",
        "Sustainable Future",
        "Greener World",
        "Efficient Living"
      ];

      let wordIndex = 0;
      let charIndex = 0;
      let isDeleting = false;

      const speed = 140;       // typing speed
      const deleteSpeed = 220; // deleting speed
      const holdTime = 1600;

      const target = document.querySelector(".typewriter");

      function typeEffect() {
        const currentWord = words[wordIndex];

        if (!isDeleting) {
          target.textContent = currentWord.substring(0, charIndex + 1);
          charIndex++;

          if (charIndex === currentWord.length) {
            setTimeout(() => isDeleting = true, delay);
          }
        } else {
          target.textContent = currentWord.substring(0, charIndex - 1);
          charIndex--;

          if (charIndex === 0) {
            isDeleting = false;
            wordIndex = (wordIndex + 1) % words.length;
          }
        }

        setTimeout(typeEffect, isDeleting ? deleteSpeed : speed);
      }

      typeEffect();
    </script>
    <script>
      function toggleChat() {
        const box = document.getElementById("chatbot");
        box.style.display = box.style.display === "flex" ? "none" : "flex";
      }
    
      function addMessage(sender, text) {
        const chatBody = document.getElementById("chat-body");
    
        const msg = document.createElement("div");
        msg.style.marginBottom = "10px";
        msg.style.padding = "10px";
        msg.style.borderRadius = "8px";
        msg.style.maxWidth = "90%";
    
        if (sender === "user") {
          msg.style.background = "#1f2937";
          msg.style.alignSelf = "flex-end";
          msg.innerHTML = "👤 " + text;
        } else {
          msg.style.background = "#14532d";
          msg.style.alignSelf = "flex-start";
          msg.innerHTML = "🤖 " + formatBotMessage(text);
        }
    
        chatBody.appendChild(msg);
        chatBody.scrollTop = chatBody.scrollHeight;
      }
    
      function formatBotMessage(text) {
        return text
          .replace(/\\n/g, "<br>")
          .replace(/\\*\\*(.*?)\\*\\*/g, "<b>$1</b>");
      }
    
      function showTyping() {
        const chatBody = document.getElementById("chat-body");
        const typing = document.createElement("div");
        typing.id = "typing";
        typing.innerHTML = "🤖 Typing...";
        typing.style.opacity = "0.6";
        chatBody.appendChild(typing);
        chatBody.scrollTop = chatBody.scrollHeight;
      }
    
      function removeTyping() {
        const typing = document.getElementById("typing");
        if (typing) typing.remove();
      }
    
      async function sendMessage() {
        const input = document.getElementById("userMsg");
        const message = input.value.trim();
        if (!message) return;
    
        input.value = "";
        addMessage("user", message);
        showTyping();
    
        try {
          const res = await fetch("/chat", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ message })
          });
    
          const data = await res.json();
          removeTyping();
    
          if (data.redirect) {
            window.location.href = data.redirect;
            return;
          }
    
          addMessage("bot", data.reply || "⚠️ No response received.");
    
        } catch (err) {
          removeTyping();
          addMessage("bot", "⚠️ Server error. Please try again.");
        }
      }
    
      document.getElementById("userMsg").addEventListener("keydown", function (e) {
        if (e.key === "Enter") sendMessage();
      });
    </script>

    
    
        
    


    </body>
    </html>
    """)
#def create_app():
#    app = Flask(__name__)
#    app.register_blueprint(home_pg)
#    return app
#
#if __name__ == "__main__":
#    app = create_app()
#    app.run(debug=True)
