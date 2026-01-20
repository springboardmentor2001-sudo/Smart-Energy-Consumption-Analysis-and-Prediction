const express = require("express");
const axios = require("axios");
const qs = require("qs"); // ✅ REQUIRED for FastAPI Form data

const app = express();

// ---------------- Middleware ----------------
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static("public"));

// ---------------- View Engine ----------------
app.set("view engine", "ejs");

// ---------------- Temporary Storage ----------------
// NOTE: Use DB in production
let predictions = [];

// ---------------- Routes ----------------

// Home
app.get("/", (req, res) => {
  res.render("index");
});

// About
app.get("/about", (req, res) => {
  res.render("about");
});

// ---------------- PREDICTION ----------------

// Predict page
app.get("/predict", (req, res) => {
  res.render("predict", { prediction: null });
});

// Predict handler (FastAPI compatible)
app.post("/predict", async (req, res) => {
  try {
    // 🔹 Build payload EXACTLY as FastAPI expects
    const payload = {
      Temperature: req.body.Temperature,
      Humidity: req.body.Humidity,
      SquareFootage: req.body.SquareFootage,
      Occupancy: req.body.Occupancy,
      HVACUsage: req.body.HVACUsage,           // "On" / "Off"
      LightingUsage: req.body.LightingUsage,   // "On" / "Off"
      Day: req.body.Day,
      DayOfWeek: req.body.DayOfWeek,           // 1–7
      Month: req.body.Month,
      Hour: req.body.Hour,
      RenewableEnergy: req.body.RenewableEnergy,
      Holiday: req.body.Holiday                // 0 / 1
    };

    // 🔹 Send as FORM data (NOT JSON)
    const response = await axios.post(
      "http://127.0.0.1:8001/predict",
      qs.stringify(payload),
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded"
        }
      }
    );

    // Save prediction history
    predictions.push({
      timestamp: new Date().toLocaleString(),
      ...payload,
      prediction: response.data.prediction
    });

    res.render("predict", { prediction: response.data.prediction });

  } catch (error) {
    console.error("❌ Prediction error:", error.response?.data || error.message);
    res.render("predict", { prediction: "Error generating prediction" });
  }
});

// ---------------- CHATBOT ----------------

// Chatbot page
app.get("/chatbot", (req, res) => {
  res.render("chatbot", {
    userMessage: null,
    reply: null
  });
});

// Chatbot handler (JSON is CORRECT here)
app.post("/chatbot", async (req, res) => {
  try {
    const response = await axios.post(
      "http://127.0.0.1:8000/chat",
      { message: req.body.message },
      { headers: { "Content-Type": "application/json" } }
    );

    res.render("chatbot", {
      userMessage: req.body.message,
      reply: response.data.reply
    });

  } catch (error) {
    console.error("❌ Chatbot error:", error.response?.data || error.message);
    res.render("chatbot", {
      userMessage: req.body.message,
      reply: "Chatbot service is currently unavailable."
    });
  }
});

// ---------------- HISTORY ----------------

// History page
app.get("/history", (req, res) => {
  res.render("history", { predictions });
});

// ---------------- ANALYTICS ----------------

// Analytics page
app.get("/analytics", (req, res) => {
  const labels = predictions.map(p => p.timestamp);
  const values = predictions.map(p => p.prediction);

  res.render("analytics", {
    labels,
    values
  });
});
// Review page
app.get('/review', (req, res) => {
    res.render('review');
});

// Review form handler
app.post('/review', (req, res) => {
    console.log("📝 New Review:", req.body);
    res.redirect('/review');
});

// ---------------- SERVER ----------------

app.listen(3000, () => {
  console.log("✅ Server running on http://localhost:3000");
});
