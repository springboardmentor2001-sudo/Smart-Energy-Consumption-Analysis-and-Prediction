from flask import Flask, request, render_template_string,Blueprint,redirect, url_for
import pickle
import pandas as pd
import numpy as np
import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
import requests
from dotenv import load_dotenv
import os
load_dotenv()
OPENROUTER_API_KEY = os.getenv("OPENROUTER_API")
overview_pg = Blueprint("overviews", __name__)

@overview_pg.route("/chat", methods=["POST"])
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


loaded = pickle.load(open("energy_consumption_model.pkl", "rb"))

data = pd.read_csv("Energy_consumption.csv")

# ===============================
# Calculations
# ===============================
TOTAL_CONSUMPTION = round(data["EnergyConsumption"].sum(), 2)

MAX_CONSUMPTION = data["EnergyConsumption"].max() * len(data)
CONSUMPTION_PERCENT = int((TOTAL_CONSUMPTION / MAX_CONSUMPTION) * 100)
import requests
from flask import jsonify


def generate_hvac_boxplot():
    plt.figure(figsize=(8, 6))
    plt.style.use("dark_background")

    ax = plt.gca()
    ax.set_facecolor("#020617")

    data.boxplot(
        column="EnergyConsumption",
        by="HVACUsage",
        ax=ax,
        grid=False,
        patch_artist=True,
        boxprops=dict(facecolor="#22c55e", alpha=0.6),
        medianprops=dict(color="white"),
        whiskerprops=dict(color="#94a3b8"),
        capprops=dict(color="#94a3b8")
    )

    plt.title("HVAC Usage vs Energy Consumption", color="white", pad=14)
    plt.suptitle("")
    plt.xlabel("HVAC Usage", color="#94a3b8")
    plt.ylabel("Energy Consumption (kWh)", color="#94a3b8")

    ax.tick_params(colors="#94a3b8")

    os.makedirs("static", exist_ok=True)
    plt.tight_layout()
    plt.savefig(
        "static/HVAC Usage vs Energy Consumption1.png",
        dpi=300,
        facecolor="#020617"
    )
    plt.close()


generate_hvac_boxplot()


# PREDICTION PAGE
@overview_pg.route("/overviews", methods=["GET", "POST"])
def overviews():
    data["Date"] = pd.to_datetime(data["Timestamp"])
    prediction = None

    if request.method == "POST":
        features = [
            float(request.form["Temperature"]),
            float(request.form["Humidity"]),
            float(request.form["SquareFootage"]),
            float(request.form["Occupancy"]),
            float(request.form["HVACUsage"]),
            float(request.form["LightingUsage"]),
            float(request.form["RenewableEnergy"])
        ]
        features = np.array(features).reshape(1, -1)
        prediction = round(loaded.predict(features)[0])
    energy_values = data["EnergyConsumption"].tolist()
    labels = list(range(len(energy_values)))
    corr = data.select_dtypes(include=[np.number]).corr()
    corr_data = corr.values.tolist()
    corr_labels = corr.columns.tolist()

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
        .container { padding: 30px 40px; }

        .grid {
            display: grid;
            grid-template-columns: 1fr 2fr;
            gap: 25px;
        }

        .card {
            background: #020617;
            border-radius: 16px;
            padding: 25px;
            box-shadow: 0 0 30px rgba(34,197,94,0.08);
        }

        /* Circular Gauge */
        .circle {
            width: 220px;
            height: 220px;
            border-radius: 50%;
            background: conic-gradient(#22c55e {{ consumption_percent }}%, #0f172a 0);
            display: flex;
            justify-content: center;
            align-items: center;
            margin: auto;
        }

        .circle-inner {
            width: 170px;
            height: 170px;
            border-radius: 50%;
            background: #020617;
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
        }

        .circle-inner h2 {
            margin: 0;
            font-size: 36px;
            color: #22c55e;
        }

        img {
            width: 100%;
            border-radius: 12px;
        }

        /* Prediction */
        input {
            width: 100%;
            padding: 10px;
            margin: 8px 0;
            background: #020617;
            border: 1px solid #1e293b;
            border-radius: 8px;
            color: white;
        }

        button {
            width: 100%;
            padding: 12px;
            background: #22c55e;
            border: none;
            border-radius: 10px;
            font-weight: 600;
            cursor: pointer;
        }

        .result {
            margin-top: 15px;
            text-align: center;
            color: #22c55e;
            font-size: 18px;
        }
        .card-image {
          padding: 0;
          overflow: hidden;
        }

        .card-image h3 {
          padding: 20px 24px;
          margin: 0;
          color: #f8f9fa;
          background: transparent;
        }

        .card-media {
          width: 100%;
          height: 100%;
          max-height: 520px;        /* controls visual size */
          padding: 16px 24px 24px; /* spacing inside card */
        }

        .card-media img {
          width: 100%;
          height: 100%;
          object-fit: contain;     /* IMPORTANT for heatmap */
          border-radius: 12px;
          background: #020617;
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
                    <a href="/">Home</a>
                    <a href="/learning">Learning</a>
                    <a href="/overviews">Overviews</a>
                    <a href="/contact">Contact</a>
                  </nav>

                  <a href="#" class="btn btn-outline-light">Learn More</a>
                </div>
              </div>
            </header>
            <div class="container">
            <div class="grid">
                <div class="card">
                    <h3>Total Energy Consumption</h3>
                    <div class="circle">
                        <div class="circle-inner">
                            <h2>{{ total_consumption }}</h2>
                            <span>kWh</span>
                        </div>
                    </div>
                </div>

                <div class="card">
                    <h3>Date vs Energy Consumption</h3>
                    <canvas id="energyChart" height="120"></canvas>
                </div>
            </div>

            <br>

            <div class="grid">
                <div class="card card-image">
                  <h3>Correlation Heatmap</h3>
                  <div class="card-media">
                    <div id="correlationHeatmap" style="height: 420px;"></div>
                  </div>
                </div>

                <div class="card">
                    <h3>HVAC vs Consumption</h3>
                    <img src="/static/HVAC Usage vs Energy Consumption.png">
                </div>
            </div>

            <br>

            <div class="card">
            <h3>🔮 Predict Energy Consumption</h3>

            <form method="POST">
            <input name="Temperature" placeholder="Temperature" required>
            <input name="Humidity" placeholder="Humidity" required>
            <input name="SquareFootage" placeholder="Square Footage" required>
            <input name="Occupancy" placeholder="Occupancy" required>
            <input name="HVACUsage" placeholder="HVAC Usage" required>
            <input name="LightingUsage" placeholder="Lighting Usage" required>
            <input name="RenewableEnergy" placeholder="Renewable Energy" required>
            <button type="submit">Predict</button>
            </form>

            {% if prediction %}
            <div class="result">
            Predicted Consumption: <b>{{ prediction }} kWh</b>
            </div>
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
            
            <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>

            <script>
            const ctx = document.getElementById('energyChart').getContext('2d');

            const energyChart = new Chart(ctx, {
                type: 'line',
                data: {
                    labels: {{ labels | safe }},
                    datasets: [{
                        label: 'Energy Consumption (kWh)',
                        data: {{ energy_values | safe }},
                        borderColor: '#22c55e',
                        backgroundColor: 'rgba(34,197,94,0.25)',
                        fill: true,
                        tension: 0.4,
                        pointRadius: 4,
                        pointHoverRadius: 7,
                        pointBackgroundColor: '#22c55e'
                    }]
                },
                options: {
                    responsive: true,
                    plugins: {
                        tooltip: {
                            enabled: true,
                            callbacks: {
                                label: function(context) {
                                    return ` ${context.parsed.y} kWh`;
                                }
                            }
                        },
                        legend: {
                            display: false
                        }
                    },
                    scales: {
                        x: {
                            ticks: { color: '#94a3b8' },
                            grid: { display: false }
                        },
                        y: {
                            ticks: { color: '#94a3b8' },
                            grid: { color: 'rgba(148,163,184,0.15)' }
                        }
                    }
                }
            });
            </script>
            <script src="https://cdn.plot.ly/plotly-2.27.0.min.js"></script>
            <script>
            Plotly.newPlot(
                "correlationHeatmap",
                [{
                    z: {{ corr_data | safe }},
                    x: {{ corr_labels | safe }},
                    y: {{ corr_labels | safe }},
                    type: "heatmap",
                    colorscale: "Viridis",
                    hoverongaps: false
                }],
                {
                    paper_bgcolor: "#020617",
                    plot_bgcolor: "#020617",
                    font: { color: "white" },
                    margin: { t: 30 }
                },
                { responsive: true }
            );
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
        </html>""", total_consumption=TOTAL_CONSUMPTION,
                                  consumption_percent=CONSUMPTION_PERCENT,
                                  prediction=prediction, energy_values=energy_values,
                                  labels=labels, corr_data=corr_data,
                                  corr_labels=corr_labels,
                                  )

#def create_app():
#    app = Flask(__name__)
#    @app.route('/')
#    def home():
#        return redirect("/overviews")
#    app.register_blueprint(overview_pg, url_prefix="/")
#    return app
#
#if __name__ == "__main__":
#    app = create_app()
#    app.run(debug=True)