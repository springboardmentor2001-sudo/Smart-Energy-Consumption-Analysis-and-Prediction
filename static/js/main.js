/**
 * Smart Energy - Easy Analysis
 * Simplified JavaScript
 */

// API Base URL
const API_BASE = '';

// Initialize on page load
document.addEventListener('DOMContentLoaded', function () {
    console.log('🚀 Smart Energy App Initialized');

    // Load analysis data
    loadEasyAnalysis();

    // Setup form submission
    setupPredictionForm();

    // Smooth scrolling
    setupSmoothScroll();
});

/**
 * Load easy-to-understand analysis
 */
async function loadEasyAnalysis() {
    try {
        // Get statistics
        const statsResponse = await fetch(`${API_BASE}/api/statistics`);
        const statsData = await statsResponse.json();

        // Get patterns
        const hourlyResponse = await fetch(`${API_BASE}/api/patterns?type=hourly`);
        const hourlyData = await hourlyResponse.json();

        const dailyResponse = await fetch(`${API_BASE}/api/patterns?type=daily`);
        const dailyData = await dailyResponse.json();

        // Get device analysis
        const deviceResponse = await fetch(`${API_BASE}/api/device-analysis`);
        const deviceData = await deviceResponse.json();

        if (statsData.success) {
            const stats = statsData.statistics;

            // Update analysis cards
            document.getElementById('avgUsage').textContent = `${stats.avg_consumption} kWh`;
            document.getElementById('peakUsage').textContent = `${stats.max_consumption} kWh`;

            // Calculate potential savings (15% of average)
            const savings = (stats.avg_consumption * 0.15 * 30).toFixed(0);
            document.getElementById('savingsPotential').textContent = `₹${savings}/mo`;
        }

        if (hourlyData.success) {
            const pattern = hourlyData.pattern;
            // Find peak hour
            const maxIndex = pattern.consumption.indexOf(Math.max(...pattern.consumption));
            const peakHour = pattern.hours[maxIndex];
            document.getElementById('peakHour').textContent = `${peakHour}:00 - ${peakHour + 1}:00`;
        }

        if (dailyData.success) {
            const pattern = dailyData.pattern;
            // Find peak day
            const maxIndex = pattern.consumption.indexOf(Math.max(...pattern.consumption));
            const peakDay = pattern.days[maxIndex];
            document.getElementById('peakDay').textContent = peakDay;
        }

        if (deviceData.success) {
            const analysis = deviceData.analysis;

            // Calculate total and percentages
            const total = analysis.hvac.on + analysis.lighting.on;
            const hvacPercent = ((analysis.hvac.on / total) * 100).toFixed(0);
            const lightPercent = ((analysis.lighting.on / total) * 100).toFixed(0);
            const otherPercent = (100 - hvacPercent - lightPercent).toFixed(0);

            // Update device bars
            document.getElementById('hvacBar').style.width = `${hvacPercent}%`;
            document.getElementById('hvacPercent').textContent = `${hvacPercent}%`;

            document.getElementById('lightBar').style.width = `${lightPercent}%`;
            document.getElementById('lightPercent').textContent = `${lightPercent}%`;

            document.getElementById('otherBar').style.width = `${otherPercent}%`;
            document.getElementById('otherPercent').textContent = `${otherPercent}%`;
        }

    } catch (error) {
        console.error('Error loading analysis:', error);
    }
}

/**
 * Setup prediction form
 */
function setupPredictionForm() {
    const form = document.getElementById('predictionForm');

    form.addEventListener('submit', async function (e) {
        e.preventDefault();

        // Show loading
        showLoading();

        // Get form data
        const formData = new FormData(form);
        const inputData = {};

        formData.forEach((value, key) => {
            // Convert numeric fields
            if (['Temperature', 'Humidity', 'SquareFootage', 'Occupancy', 'RenewableEnergy'].includes(key)) {
                inputData[key] = parseFloat(value);
            } else {
                inputData[key] = value;
            }
        });

        try {
            const response = await fetch(`${API_BASE}/api/predict`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(inputData)
            });

            const data = await response.json();

            if (data.success) {
                displayPredictionResult(data);

                // Scroll to result
                setTimeout(() => {
                    document.getElementById('predictionResult').scrollIntoView({
                        behavior: 'smooth',
                        block: 'nearest'
                    });
                }, 100);
            } else {
                alert('Error: ' + data.error);
            }
        } catch (error) {
            console.error('Prediction error:', error);
            alert('Failed to get prediction. Please try again.');
        } finally {
            hideLoading();
        }
    });
}

/**
 * Display prediction result
 */
function displayPredictionResult(data) {
    const resultDiv = document.getElementById('predictionResult');
    const valueSpan = document.getElementById('predictionValue');

    // Animate value
    animateValue('predictionValue', 0, data.prediction, 1000);

    // Show result
    resultDiv.style.display = 'block';
}

/**
 * Animate number counter
 */
function animateValue(id, start, end, duration) {
    const element = document.getElementById(id);
    if (!element) return;

    const range = end - start;
    const increment = range / (duration / 16);
    let current = start;

    const timer = setInterval(() => {
        current += increment;
        if ((increment > 0 && current >= end) || (increment < 0 && current <= end)) {
            current = end;
            clearInterval(timer);
        }
        element.textContent = Math.round(current * 100) / 100;
    }, 16);
}

/**
 * Setup smooth scrolling
 */
function setupSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
}

/**
 * Show loading overlay
 */
function showLoading() {
    document.getElementById('loadingOverlay').classList.add('active');
}

/**
 * Hide loading overlay
 */
function hideLoading() {
    document.getElementById('loadingOverlay').classList.remove('active');
}

// Log app info
console.log('%c⚡ Smart Energy App', 'color: #667eea; font-size: 20px; font-weight: bold;');
console.log('%cEasy Analysis Mode', 'color: #764ba2; font-size: 12px;');
