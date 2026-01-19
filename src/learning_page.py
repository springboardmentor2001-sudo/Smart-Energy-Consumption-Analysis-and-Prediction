from flask import Flask, request, render_template_string,Blueprint,redirect, url_for, jsonify
import requests
from dotenv import load_dotenv
import os
load_dotenv()
OPENROUTER_API_KEY = os.getenv("OPENROUTER_API")

learning_pg = Blueprint("learning", __name__)


@learning_pg.route("/chat", methods=["POST"])
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


@learning_pg.route("/learning")
def learning():
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

        .about-energy {
          background: #0e1117;
          padding: 96px 24px;
        }

        .section-title {
          text-align: center;
          color: #ffffff;
          font-size: clamp(32px, 4vw, 48px);
          margin-bottom: 12px;
        }

        .section-subtitle {
          text-align: center;
          color: rgba(255, 255, 255, 0.6);
          max-width: 700px;
          margin: 0 auto 64px;
        }

        .energy-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          gap: 24px;
        }

        .energy-card {
          background: linear-gradient(
            180deg,
            rgba(255, 255, 255, 0.06),
            rgba(255, 255, 255, 0.02)
          );
          border-radius: 16px;
          padding: 20px;
          border: 1px solid rgba(255, 255, 255, 0.08);
          transition: transform 0.3s ease, box-shadow 0.3s ease;
        }

        .energy-card:hover {
          transform: translateY(-6px);
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.4);
        }

        .energy-card img {
          width: 100%;
          height: 160px;
          object-fit: cover;
          border-radius: 12px;
          margin-bottom: 16px;
        }

        .energy-card h3 {
          color: #ffffff;
          font-size: 18px;
          margin-bottom: 8px;
        }

        .energy-card p {
          color: rgba(255, 255, 255, 0.7);
          font-size: 14px;
          line-height: 1.6;
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
      <!-- ABOUT PAGE CONTENT -->
     <section class="about">
     <section class="about-energy">
      <div class="container">
        <h2 class="section-title">⚡ Smart Energy Ecosystem</h2>
        <p class="section-subtitle">
          Key technologies and devices that enable efficient, intelligent, and sustainable energy consumption.
        </p>

        <div class="energy-grid">

          <!-- Card 1 -->
          <div class="energy-card">
            <img src="/static/images/img7.png" alt="Solar Energy">
            <h3>Solar Energy System</h3>
            <p>A solar energy system harnesses sunlight using high-efficiency photovoltaic (PV) panels and converts it into usable electrical power. 
              This renewable energy solution helps reduce dependency on conventional grid electricity, lowers carbon emissions, and significantly cuts electricity costs. 
              Modern solar systems can be integrated with battery storage and smart monitoring tools, allowing users to track energy production, optimize usage, 
              and ensure uninterrupted power supply even during outages.</p>
          </div>

          <!-- Card 2 -->
          <div class="energy-card">
            <img src="/static/images/img8.png" alt="Wind Energy">
            <h3>Wind Energy System</h3>
            <p>A wind energy system converts kinetic energy from moving air into electrical power using wind turbines. 
              As wind rotates the turbine blades, a generator produces clean and renewable electricity without emitting greenhouse gases. 
              Wind energy systems are highly efficient in open and high-altitude areas and play a vital role in reducing reliance on fossil fuels 
              while supporting sustainable and eco-friendly power generation.</p>
          </div>

          <!-- Card 3 -->
          <div class="energy-card">
            <img src="/static/images/img9.png" alt="Home Inverter">
            <h3>Home Inverter & Battery</h3>
            <p>A home inverter and battery system stores excess electrical energy for later use and provides uninterrupted power during outages. 
              It ensures continuous operation of essential appliances during power cuts and improves overall energy efficiency. 
              When integrated with renewable sources like solar panels, the system enables smart energy management, reduces electricity bills, 
              and enhances reliability by supplying clean backup power whenever needed.</p>
          </div>

          <!-- Card 4 -->
          <div class="energy-card">
            <img src="/static/images/img10.png" alt="Smart Meter">
            <h3>Smart Energy Meter</h3>
            <p>A smart energy meter monitors real-time electricity consumption and provides detailed insights into energy usage patterns. 
              It enables users to track power usage accurately, identify energy-saving opportunities, and manage consumption more efficiently. 
              With advanced data analytics and remote monitoring capabilities, smart meters support better decision-making, cost optimization, 
              and contribute to a smarter, more sustainable energy management system.</p>
          </div>

          <!-- Card 5 -->
          <div class="energy-card">
            <img src="/static/images/img11.png" alt="EV Charging">
            <h3>EV Charging System</h3>
            <p>An EV charging system provides efficient and reliable charging for electric vehicles using renewable energy sources such as solar or wind power. 
              It supports fast and safe charging while optimizing energy consumption to reduce grid dependency and carbon emissions. 
              When integrated with smart energy management systems, EV chargers can schedule charging during off-peak hours, 
              monitor energy usage, and promote sustainable transportation solutions.</p>
          </div>

          <!-- Card 6 -->
          <div class="energy-card">
            <img src="/static/images/img12.png" alt="Smart Grid">
            <h3>Smart Grid Integration</h3>
            <p>Smart grid integration enables intelligent communication between energy producers, consumers, and storage systems to balance electricity supply and demand efficiently. 
              It uses advanced sensors, automation, and real-time data exchange to optimize power distribution, reduce energy losses, and enhance grid reliability. 
              By integrating renewable energy sources and smart devices, the smart grid supports stable, secure, and sustainable energy management.</p>
          </div>

          <!-- Card 7 -->
          <div class="energy-card">
            <img src="/static/images/img13.png" alt="Smart Appliances">
            <h3>Smart Home Appliances</h3>
            <p>Smart home appliances are energy-efficient devices designed to automatically optimize power usage based on user behavior and real-time energy availability. 
              These appliances can be controlled remotely, scheduled for off-peak operation, and integrated with smart energy systems to reduce electricity consumption. 
              By enhancing convenience and minimizing energy waste, smart appliances contribute to a more efficient and sustainable home environment.</p>
          </div>

          <!-- Card 8 -->
          <div class="energy-card">
            <img src="/static/images/img14.png" alt="Energy Management">
            <h3>Energy Management System</h3>
            <p>An Energy Management System (EMS) provides centralized monitoring and control of energy consumption across devices and systems. 
              It collects real-time data, analyzes usage patterns, and helps optimize energy distribution to reduce waste and operational costs. 
              By integrating renewable sources, storage units, and smart appliances, an EMS ensures efficient, reliable, and sustainable energy utilization.</p>
          </div>

          <!-- Card 9 -->
          <div class="energy-card">
            <img src="/static/images/img15.png" alt="AI Optimization">
            <h3>AI Optimization</h3>
            <p>AI optimization uses machine learning algorithms and data analytics to predict energy demand and optimize consumption patterns in real time. 
              By analyzing historical usage, weather conditions, and user behavior, AI systems can automatically adjust energy distribution for maximum efficiency. 
              This intelligent optimization reduces energy waste, lowers operational costs, and enhances the overall performance of smart energy systems.</p>
          </div>

          <!-- Card 10 -->
          <div class="energy-card">
            <img src="/static/images/img16.png" alt="Smart Lighting">
            <h3>Smart Lighting & Thermostats</h3>
            <p>Smart lighting and thermostats automatically adjust illumination and temperature based on occupancy, time of day, and user preferences. 
              These systems help reduce unnecessary energy consumption by optimizing lighting levels and maintaining comfortable indoor temperatures efficiently. 
              With remote control and automation features, they enhance comfort, lower electricity costs, and contribute to a more energy-efficient and sustainable home.</p>
          </div>

          <!-- Card 11 -->
          <div class="energy-card">
            <img src="/static/images/img17.png" alt="Industrial Energy">
            <h3>Industrial Energy Monitoring</h3>
            <p>Industrial energy monitoring systems track and analyze large-scale energy consumption across manufacturing units and industrial facilities. 
              They provide real-time insights into power usage, identify inefficiencies, and help optimize operations to reduce energy costs and downtime. 
              By enabling predictive maintenance and data-driven decision-making, these systems support improved productivity, sustainability, and operational efficiency.</p>
          </div>



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
      </html>""")

#def create_app():
#    app = Flask(__name__)
#    @app.route('/')
#    def home():
#        return redirect("/learning")
#    app.register_blueprint(learning_pg, url_prefix="/")
#    return app
#
#if __name__ == "__main__":
#    app = create_app()
#    app.run(debug=True)