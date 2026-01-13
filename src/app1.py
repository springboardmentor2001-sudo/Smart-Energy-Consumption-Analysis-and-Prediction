from flask import Flask, request, render_template_string
import pickle
import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
import os

app = Flask(__name__)

# ===============================
# Load Model & Dataset
# ===============================
loaded = pickle.load(open("energy_consumption_model.pkl", "rb"))

data = pd.read_csv("Energy_consumption.csv")

# ===============================
# Calculations
# ===============================
TOTAL_CONSUMPTION = round(data["EnergyConsumption"].sum(), 2)

MAX_CONSUMPTION = data["EnergyConsumption"].max() * len(data)
CONSUMPTION_PERCENT = int((TOTAL_CONSUMPTION / MAX_CONSUMPTION) * 100)

# ===============================
# HTML (INLINE – FIXED)
# ===============================

def generate_consumption_graph():
    x = np.arange(len(data))
    y = data["EnergyConsumption"]

    plt.figure(figsize=(12, 4))
    plt.style.use("dark_background")

    ax = plt.gca()
    ax.set_facecolor("#020617")

    plt.plot(x, y, color="#22c55e", linewidth=2.5, marker="o", markersize=4)
    plt.fill_between(x, y, color="#22c55e", alpha=0.25)

    ax.grid(True, axis="y", linestyle="--", alpha=0.3)
    ax.grid(False, axis="x")

    ax.tick_params(colors="#94a3b8")
    ax.spines["top"].set_visible(False)
    ax.spines["right"].set_visible(False)
    ax.spines["left"].set_color("#1e293b")
    ax.spines["bottom"].set_color("#1e293b")

    ticks = np.linspace(0, len(x)-1, 8, dtype=int)
    labels = ["00:00", "03:00", "06:00", "09:00",
              "12:00", "15:00", "18:00", "Now"]
    plt.xticks(ticks, labels)

    plt.ylabel("kW", color="#94a3b8")
    plt.title("Energy Consumption Pattern", fontsize=14, color="white", pad=15)

    os.makedirs("static/images", exist_ok=True)
    plt.tight_layout()
    plt.savefig(
        "static/date_vs_consumption.png",
        dpi=300,
        facecolor="#020617"
    )
    plt.close()
generate_consumption_graph()
HTML = """
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>EnergyHub | Smart Energy Dashboard</title>

<link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;600&display=swap" rel="stylesheet">

<style>
body {
    margin: 0;
    font-family: 'Inter', sans-serif;
    background: #0b0f1a;
    color: white;
}

header {
    padding: 20px 40px;
    background: linear-gradient(90deg, #0f172a, #020617);
    display: flex;
    justify-content: space-between;
    align-items: center;
}

header h1 { color: #22c55e; }

.help-btn {
    background: #22c55e;
    color: black;
    padding: 8px 16px;
    border-radius: 20px;
    text-decoration: none;
    font-weight: 600;
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

footer {
    text-align: center;
    padding: 15px;
    opacity: 0.5;
}
</style>
</head>

<body>

<header>
    <h1>⚡ EnergyHub</h1>
    <a class="help-btn" href="/help">Help</a>
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
        <img src="/static/date_vs_consumption.png">
    </div>
</div>

<br>

<div class="grid">
    <div class="card">
        <h3>Correlation Heatmap</h3>
        <img src="/static/correlation_heatmap.png">
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

<footer>© 2026 EnergyHub</footer>

</body>
</html>
"""

# ===============================
# Routes
# ===============================
@app.route("/", methods=["GET", "POST"])
def index():
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

    return render_template_string(
        HTML,
        total_consumption=TOTAL_CONSUMPTION,
        consumption_percent=CONSUMPTION_PERCENT,
        prediction=prediction
    )

@app.route("/help")
def help():
    return "<h2>EnergyHub Support</h2><p>Email: support@energyhub.ai</p>"

# ===============================
# Run
# ===============================
if __name__ == "__main__":
    app.run(debug=True)
