// Global State
let hasModel = true;
let predictionCount = 0;
let currentPage = 'dashboard';
let lastPredictionValue = null;
let audioEnabled = true;
let offlinePredictions = [];
let lastPredictionData = null;



function updateDashboard() {

    
    const modelStatus = document.getElementById('modelStatus');
    const predictionCountEl = document.getElementById('predictionCount');

    if (modelStatus) modelStatus.textContent = "Active";
    if (predictionCountEl) predictionCountEl.textContent = predictionCount;
}
// Initialize App
document.addEventListener('DOMContentLoaded', function() {
    initNavigation();
    initSidebar();
    initPredictionForm();
    initChatbot();
    initFeedback();
    updateDashboard();
    renderFeatureImportance();
    
});

const audioToggle = document.getElementById("audioToggle");
if (audioToggle) {
    audioToggle.addEventListener("change", (e) => {
        audioEnabled = e.target.checked;
    });
}

function initNavigation() {
    const navItems = document.querySelectorAll('.nav-item');
    const pages = document.querySelectorAll('.page');
    const pageTitleEl = document.getElementById('pageTitle');

    // 🔹 FORCE initial state (only home visible)
    pages.forEach(page => page.classList.remove('active'));
    document.getElementById("home")?.classList.add("active");

    navItems.forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();

            const pageId = item.getAttribute('data-page');

            // nav active
            navItems.forEach(nav => nav.classList.remove('active'));
            item.classList.add('active');

            // page active
            pages.forEach(page => page.classList.remove('active'));
            document.getElementById(pageId)?.classList.add('active');

            // title
            const label = item.querySelector('.nav-label');
            if (pageTitleEl && label) {
                pageTitleEl.textContent = label.textContent;
            }

                if (pageId === "settings") {
    loadSettings();
}
        });
    });
}

// Sidebar Toggle
function initSidebar() {
    const sidebar = document.getElementById('sidebar');
    const toggleBtn = document.getElementById('toggleSidebar');
    
    toggleBtn.addEventListener('click', () => {
        sidebar.classList.toggle('collapsed');
    });
}

// Prediction Form
function initPredictionForm() {
    const form = document.getElementById('predictionForm');
    const noModelWarning = document.getElementById('noModelWarning');
    const hvacToggle = document.getElementById('hvacToggle');

    if (!form) return;

    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        

        noModelWarning.style.display = 'none';

        const payload = {
            HVACUsage: hvacToggle.checked ? 1 : 0,
            Occupancy: parseInt(document.getElementById('occupancy').value),
            Temperature: parseFloat(document.getElementById('temperature').value),
            RenewableEnergy: parseFloat(document.getElementById('renewable').value),
            Hour: parseInt(document.getElementById('hourOfDay').value),
            IsWeekend: parseInt(document.getElementById('weekend').value)
        };

        showLoadingState();
        updateSystemStatus('predicting');

        try {
            const response = await fetch("http://127.0.0.1:5000/predict", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload)
            });

            const data = await response.json();

            if (data.status === "success") {
                showResult(data.prediction);

// 🔥 STORE FULL CONTEXT FOR AUDIT
lastPredictionData = {
    HVACUsage: payload.HVACUsage,
    Occupancy: payload.Occupancy,
    Temperature: payload.Temperature,
    RenewableEnergy: payload.RenewableEnergy,
    Hour: payload.Hour,
    IsWeekend: payload.IsWeekend,
    prediction: data.prediction
};

predictionCount++;
updateDashboard();
updateSystemStatus('model_loaded');

            } else {
                alert("Prediction failed");
                updateSystemStatus('idle');
            }
        } catch (err) {
            console.error(err);
            alert("Backend not reachable");
            updateSystemStatus('idle');
        }
    });
}

// Show Loading State
function showLoadingState() {
    const empty = document.getElementById('emptyPrediction');
    const result = document.getElementById('resultState');
    const loading = document.getElementById('loadingState');

    if (empty) empty.style.display = 'none';
    if (result) result.style.display = 'none';
    if (loading) loading.style.display = 'flex';
}

// Show Result
function showResult(value) {
    document.getElementById('loadingState').style.display = 'none';
    document.getElementById('resultState').style.display = 'flex';
    document.getElementById('predictionResult').textContent =
        parseFloat(value).toFixed(2);
    updateEnergyInsight(value);
}

// System Status
function updateSystemStatus(status) {
    const statusBadge = document.getElementById('statusBadge');
    const statusLabel = statusBadge.querySelector('.status-label');
    
    statusBadge.className = 'status-badge';
    
    switch(status) {
        case 'idle':
            statusLabel.textContent = 'Waiting for Input';
            break;
        case 'model_loaded':
            statusBadge.classList.add('active');
            statusLabel.textContent = 'Model Loaded';
            break;
        case 'predicting':
            statusBadge.classList.add('predicting');
            statusLabel.textContent = 'Predicting...';
            break;
    }
}

async function sendMessage(text) {
    if (!text.trim()) return;

    const backendUrl = "http://127.0.0.1:5000"; // Define your backend base URL
    addMessage(text, "user");
    document.getElementById("chatInput").value = "";

    try {
        const res = await fetch(`${backendUrl}/chat`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ message: text })
        });

        if (!res.ok) throw new Error("Server responded with an error");

        const data = await res.json();
        console.log("🤖 Chat response:", data);

        let displayMessage = "";
        let audioPath = data.audio_url || data.audio; // Handle both key names

        if (data.type === "prediction") {
            displayMessage = `🔮 Predicted Energy: ${data.prediction} kWh\n\n${data.response}`;
            if(audioEnabled){
            speakText(data.response);
            }   // 👈 only explanation
        } else {
            displayMessage = data.response;
            if (audioEnabled) {
            speakText(displayMessage);
}

        }


        addMessage(displayMessage, "bot");
        if (audioEnabled) {
        speakText(displayMessage);
}


        

    } catch (err) {
        console.error("❌ Fetch error:", err);
        addMessage("⚠️ Chat server not reachable. Check if Flask is running on port 5000.", "bot");
    }
}

// Chatbot
function initChatbot() {
    const chatInput = document.getElementById("chatInput");
    const chatSend = document.getElementById("chatSend");

    if (!chatInput || !chatSend) {
        console.error("❌ Chat input or button not found");
        return;
    }

    chatSend.addEventListener("click", () => {
        console.log("📤 Chat send clicked");
        const message = chatInput.value;
        sendMessage(message);
    });

    chatInput.addEventListener("keydown", (e) => {
        if (e.key === "Enter") {
            console.log("⌨️ Enter pressed");
            const message = chatInput.value;
            sendMessage(message);
        }
    });
}


// Add Chat Message
function addMessage(text, sender) {
    const chatMessages = document.getElementById('chatMessages');
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${sender}`;
    
    const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    
    const avatarSvg = sender === 'bot' 
        ? '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>'
        : '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>';
    
    messageDiv.innerHTML = `
        <div class="message-avatar">${avatarSvg}</div>
        <div class="message-content">
            <p>${text}</p>
            <span class="message-time">${time}</span>
        </div>
    `;
    
    chatMessages.appendChild(messageDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

// Feedback Form
function initFeedback() {
    const feedbackForm = document.getElementById("submitFeedback");
    const feedbackCard = document.getElementById("feedbackForm");
    const successMessage = document.getElementById("feedbackSuccess");
    const submitAnother = document.getElementById("submitAnother");

    if (!feedbackForm) return;

    feedbackForm.addEventListener("submit", async (e) => {
        e.preventDefault();

        const payload = {
            name: feedbackForm.querySelector('input[type="text"]').value,
            email: feedbackForm.querySelector('input[type="email"]').value,
            category: feedbackForm.querySelector("select").value,
            message: feedbackForm.querySelector("textarea").value
        };

        const res = await fetch("http://127.0.0.1:5000/submit-feedback", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
        });

        const data = await res.json();

        if (data.status === "success") {
            feedbackCard.style.display = "none";
            successMessage.style.display = "block";
            feedbackForm.reset();
        }
    });

    submitAnother.addEventListener("click", () => {
        successMessage.style.display = "none";
        feedbackCard.style.display = "block";
    });
}


// Utility: Format Numbers
function formatNumber(num) {
    return num.toLocaleString('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    });
}

// Utility: Validate Input
function validateInput(value, min, max) {
    const num = parseFloat(value);
    return !isNaN(num) && num >= min && num <= max;
}

// newwwww
const themeToggle = document.getElementById("themeToggle");

if (themeToggle) {
    themeToggle.addEventListener("change", () => {
        document.body.classList.toggle("light-theme");
        localStorage.setItem(
            "theme",
            document.body.classList.contains("light-theme") ? "light" : "dark"
        );
    });

    // Load saved theme
    if (localStorage.getItem("theme") === "light") {
        document.body.classList.add("light-theme");
        themeToggle.checked = true;
    }
}

function loadSettings() {
    const user = JSON.parse(localStorage.getItem("user"));
    if (!user) return;

    // Profile top section
    document.getElementById("profileName").textContent = user.name;
    document.getElementById("profileEmail").textContent = user.email;

    // Form inputs
    document.getElementById("setName").value = user.name;
    document.getElementById("setEmail").value = user.email;
}


function updateProfile() {
    const name = document.getElementById("setName").value.trim();
    const email = document.getElementById("setEmail").value.trim().toLowerCase();

    if (!name || !email) {
        alert("Name and Email are required");
        return;
    }

    const user = JSON.parse(localStorage.getItem("user"));
    if (!user) return;

    user.name = name;
    user.email = email;

    localStorage.setItem("user", JSON.stringify(user));

    // Update UI immediately
    document.getElementById("profileName").textContent = name;
    document.getElementById("profileEmail").textContent = email;

    alert("Profile updated successfully");
}

// const user = JSON.parse(localStorage.getItem("user"));
// if (user) {
//     document.getElementById("headerUserName").textContent = user.name;
// }



function renderFeatureImportance() {
    const ctx = document.getElementById("featureImportanceChart");
    if (!ctx) return;

    new Chart(ctx, {
        type: "bar",
        data: {
            labels: [
                "HVAC Usage",
                "Occupancy",
                "Temperature",
                "Hour of Day",
                "Weekend",
                "Renewable Energy"
            ],
            datasets: [{
                label: "Importance Score",
                data: [0.35, 0.25, 0.18, 0.12, 0.06, 0.04], // example importance
                backgroundColor: [
                    "#3b82f6",
                    "#8b5cf6",
                    "#22c55e",
                    "#f59e0b",
                    "#ef4444",
                    "#14b8a6"
                ],
                borderRadius: 6
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: { display: false }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: "Relative Importance"
                    }
                }
            }
        }
    });
}

function renderAuditFeatureChart(inputs) {
    const ctx = document.getElementById("auditFeatureChart");
    if (!ctx) return;

    const data = [
        inputs.HVACUsage ? 0.35 : 0.15,
        inputs.Occupancy / 100,
        inputs.Temperature / 50,
        inputs.Hour / 24,
        inputs.IsWeekend ? 0.1 : 0.05,
        inputs.RenewableEnergy / 100
    ];

    new Chart(ctx, {
        type: "bar",
        data: {
            labels: [
                "HVAC",
                "Occupancy",
                "Temperature",
                "Hour",
                "Weekend",
                "Renewable"
            ],
            datasets: [{
                label: "Impact Score",
                data: data,
                backgroundColor: "#3b82f6",
                borderRadius: 6
            }]
        },
        options: {
            responsive: true,
            plugins: { legend: { display: false } },
            scales: {
                y: { beginAtZero: true }
            }
        }
    });
}


function updateEnergyInsight(prediction) {
    const hvac = document.getElementById("hvacToggle")?.checked;
    const occupancy = parseInt(document.getElementById("occupancy")?.value || 0);
    const insightEl = document.getElementById("energyInsight");

    if (!insightEl) return;

    if (hvac && occupancy > 100) {
        insightEl.textContent = "High usage due to HVAC & high occupancy";
        insightEl.style.color = "#ef4444";
    } else {
        insightEl.textContent = "Energy usage within optimal range";
        insightEl.style.color = "#10b981";
    }
}



document.addEventListener("DOMContentLoaded", () => {
    const getStartedBtn = document.getElementById("getStartedBtn");

    if (getStartedBtn) {
        getStartedBtn.addEventListener("click", () => {
            // 1️⃣ Hide all pages
            document.querySelectorAll(".page").forEach(p =>
                p.classList.remove("active")
            );

            // 2️⃣ Show Prediction page
            document.getElementById("prediction").classList.add("active");

            // 3️⃣ Update sidebar active state
            document.querySelectorAll(".nav-item").forEach(n =>
                n.classList.remove("active")
            );

            const predictionNav = document.querySelector(
                '.nav-item[data-page="prediction"]'
            );
            if (predictionNav) predictionNav.classList.add("active");

            // 4️⃣ Update header title
            const pageTitle = document.getElementById("pageTitle");
            if (pageTitle) pageTitle.textContent = "Energy Prediction";
        });
    }
});



async function offlinePredict() {
    const fileInput = document.getElementById("offlineFile");
    const status = document.getElementById("offlineStatus");

    if (!fileInput.files.length) {
        alert("Please upload a CSV file");
        return;
    }

    const formData = new FormData();
    formData.append("file", fileInput.files[0]); // MUST be "file"

    status.textContent = "Uploading file and predicting...";

    try {
        const res = await fetch("http://127.0.0.1:5000/offline-predict", {
            method: "POST",
            body: formData
        });

        const data = await res.json();

        if (data.status === "success") {
            status.textContent = "Prediction completed successfully";
            renderOfflineTable(data.predictions); // table UI
        } else {
            status.textContent = "Prediction failed";
        }

    } catch (err) {
        console.error(err);
        status.textContent = "Backend not reachable";
    }
}


function renderOfflineTable(predictions) {
    const tableCard = document.getElementById("offlineTableCard");
    const tbody = document.querySelector("#offlineTable tbody");
    offlinePredictions = predictions;
    document.getElementById("downloadCsvBtn").style.display = "inline-block";


    tbody.innerHTML = "";

    predictions.forEach(row => {
        const tr = document.createElement("tr");

        tr.innerHTML = `
            <td>${row.HVACUsage}</td>
            <td>${row.Occupancy}</td>
            <td>${row.Temperature}</td>
            <td>${row.RenewableEnergy}</td>
            <td>${row.Hour}</td>
            <td>${row.IsWeekend}</td>
            <td><strong>${row.PredictedEnergy.toFixed(2)}</strong></td>
        `;

        tbody.appendChild(tr);
    });

    tableCard.style.display = "block";
}

function downloadPredictedCSV() {
    if (!offlinePredictions.length) {
        alert("No prediction data available");
        return;
    }

    const headers = Object.keys(offlinePredictions[0]);
    const rows = offlinePredictions.map(row =>
        headers.map(h => row[h]).join(",")
    );

    const csvContent =
        headers.join(",") + "\n" + rows.join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = "predicted_energy.csv";
    a.click();

    URL.revokeObjectURL(url);
}


// ---------- SPEECH TO TEXT (Browser) ----------
let recognition;
const micBtn = document.getElementById("micBtn");
const voiceStatus = document.getElementById("voiceStatus");

if ("webkitSpeechRecognition" in window || "SpeechRecognition" in window) {
    const SpeechRecognition =
        window.SpeechRecognition || window.webkitSpeechRecognition;

    recognition = new SpeechRecognition();
    recognition.lang = "en-US";
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onstart = () => {
        if (voiceStatus) voiceStatus.textContent = "Listening...";
    };

    recognition.onend = () => {
        if (voiceStatus) voiceStatus.textContent = "";
    };

    recognition.onerror = (event) => {
        console.error("Speech recognition error:", event.error);
        if (voiceStatus) voiceStatus.textContent = "Voice error";
    };

    recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        console.log("🎤 Voice input:", transcript);

        const chatInput = document.getElementById("chatInput");
        chatInput.value = transcript;

        // Automatically send message
        sendMessage(transcript);
    };

    if (micBtn) {
        micBtn.addEventListener("click", () => {
            recognition.start();
        });
    }
} else {
    if (micBtn) micBtn.disabled = true;
    console.warn("Speech recognition not supported in this browser");
}
// ---------- TEXT TO SPEECH ----------
function speakText(text) {
    if (!audioEnabled) return;

    if (!("speechSynthesis" in window)) {
        console.warn("Text-to-speech not supported");
        return;
    }

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "en-US";
    utterance.rate = 1;
    utterance.pitch = 1;

    window.speechSynthesis.cancel(); // stop previous speech
    window.speechSynthesis.speak(utterance);
}

document.addEventListener("DOMContentLoaded", () => {

    let recognition;
    const micBtn = document.getElementById("micBtn");
    const voiceStatus = document.getElementById("voiceStatus");

    if (!micBtn) return;

    if ("webkitSpeechRecognition" in window || "SpeechRecognition" in window) {
        const SpeechRecognition =
            window.SpeechRecognition || window.webkitSpeechRecognition;

        recognition = new SpeechRecognition();
        recognition.lang = "en-US";
        recognition.continuous = false;
        recognition.interimResults = false;

        recognition.onstart = () => {
            micBtn.style.color = "#16a34a"; // green
            if (voiceStatus) voiceStatus.textContent = "Listening...";
        };

        recognition.onend = () => {
            micBtn.style.color = "";
            if (voiceStatus) voiceStatus.textContent = "";
        };

        recognition.onresult = (event) => {
            const transcript = event.results[0][0].transcript;
            sendMessage(transcript);
        };

        micBtn.addEventListener("click", () => recognition.start());

    } else {
        micBtn.disabled = true;
    }

});

const muteBtn = document.getElementById("muteBtn");
const volumeOnIcon = document.getElementById("volumeOnIcon");
const volumeOffIcon = document.getElementById("volumeOffIcon");

if (muteBtn) {
    muteBtn.addEventListener("click", () => {
        audioEnabled = !audioEnabled;

        volumeOnIcon.style.display = audioEnabled ? "block" : "none";
        volumeOffIcon.style.display = audioEnabled ? "none" : "block";

        window.speechSynthesis.cancel(); // stop current speech
    });
}


document.getElementById("docUpload")?.addEventListener("change", async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const status = document.getElementById("uploadStatus");
    status.textContent = "Extracting inputs from document...";

    const formData = new FormData();
    formData.append("file", file);

    try {
        const res = await fetch("http://127.0.0.1:5000/extract-inputs", {
            method: "POST",
            body: formData
        });

        const data = await res.json();

        if (data.status === "success") {
            // auto-fill fields
            document.getElementById("hvacToggle").checked = data.inputs.HVACUsage === 1;
            document.getElementById("occupancy").value = data.inputs.Occupancy;
            document.getElementById("temperature").value = data.inputs.Temperature;
            document.getElementById("renewable").value = data.inputs.RenewableEnergy;
            document.getElementById("hourOfDay").value = data.inputs.Hour;
            document.getElementById("weekend").value = data.inputs.IsWeekend;

            status.textContent = "Inputs extracted successfully ✔";
        } else {
            status.textContent = "Could not extract inputs";
        }
    } catch (err) {
        console.error(err);
        status.textContent = "Backend not reachable";
    }
});


document.getElementById("generateAudit").addEventListener("click", async () => {
    try {
        const res = await fetch("http://127.0.0.1:5000/audit");
        const data = await res.json();

        if (data.status !== "success") {
            alert("Run prediction first");
            return;
        }

        renderAudit(data.audit);
    } catch (err) {
        console.error(err);
        alert("Audit service not reachable");
    }
});

function renderAudit(audit) {
    // SCORE
    document.getElementById("efficiencyScore").textContent = audit.score;
    document.getElementById("riskLevel").textContent =
        `Risk Level: ${audit.risk}`;

    // COLOR LOGIC
    const scoreCircle = document.getElementById("efficiencyScore");
    scoreCircle.className = "score-circle";
    scoreCircle.classList.add(audit.risk.toLowerCase());

    // SYSTEM OVERVIEW
    document.getElementById("auditHVAC").textContent =
        audit.inputs.HVACUsage ? "ON" : "OFF";
    document.getElementById("auditOccupancy").textContent =
        audit.inputs.Occupancy;
    document.getElementById("auditTemp").textContent =
        audit.inputs.Temperature;
    document.getElementById("auditRenewable").textContent =
        audit.inputs.RenewableEnergy;
    document.getElementById("auditHour").textContent =
        audit.inputs.Hour;
    document.getElementById("auditWeekend").textContent =
        audit.inputs.IsWeekend ? "Yes" : "No";

    // ENERGY
    document.getElementById("auditEnergy").textContent =
        `${audit.energy} kWh`;
    document.getElementById("analysisSummary").textContent =
        audit.summary;

    // INEFFICIENCIES
    const ineffList = document.getElementById("inefficiencyList");
    ineffList.innerHTML = "";
    audit.inefficiencies.forEach(item => {
        const li = document.createElement("li");
        li.textContent = item;
        ineffList.appendChild(li);
    });

    // RECOMMENDATIONS
    const recList = document.getElementById("recommendationList");
    recList.innerHTML = "";
    audit.recommendations.forEach(item => {
        const li = document.createElement("li");
        li.textContent = item;
        recList.appendChild(li);
    });
    renderAuditFeatureChart(lastPredictionData);

}


document.addEventListener("DOMContentLoaded", () => {
    const pdfBtn = document.getElementById("downloadPDF");

    if (!pdfBtn) return;

    pdfBtn.addEventListener("click", () => {
        window.open(
            "http://127.0.0.1:5000/audit-pdf",
            "_blank"
        );
    });
});







