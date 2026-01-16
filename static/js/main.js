/**
 * Smart Energy Consumption Analysis
 * Main JavaScript File
 */

// API Base URL
const API_BASE = '';

// Chart instances
let historicalChart, hourlyChart, dailyChart, hvacChart, lightingChart, occupancyChart;

// Initialize on page load
document.addEventListener('DOMContentLoaded', function () {
    console.log('🚀 Smart Energy App Initialized');

    // Load initial data
    loadStatistics();
    loadHistoricalData();
    loadDeviceAnalysis();
    loadPatterns();

    // Setup form submission
    setupPredictionForm();

    // Smooth scrolling
    setupSmoothScroll();

    // Animate stats on scroll
    setupScrollAnimations();
});

/**
 * Load overall statistics
 */
async function loadStatistics() {
    try {
        const response = await fetch(`${API_BASE}/api/statistics`);
        const data = await response.json();

        if (data.success) {
            const stats = data.statistics;

            // Animate counter updates
            animateValue('totalRecords', 0, stats.total_records, 1500);
            animateValue('avgConsumption', 0, stats.avg_consumption, 1500);
            animateValue('maxConsumption', 0, stats.max_consumption, 1500);

            // Update quick stats
            document.getElementById('avgTemp').textContent = `${stats.avg_temperature}°C`;
            document.getElementById('avgHumidity').textContent = `${stats.avg_humidity}%`;
            document.getElementById('avgOccupancy').textContent = stats.avg_occupancy.toFixed(1);
            document.getElementById('stdConsumption').textContent = `${stats.std_consumption} kWh`;
        }
    } catch (error) {
        console.error('Error loading statistics:', error);
    }
}

/**
 * Load historical consumption data
 */
async function loadHistoricalData() {
    try {
        const response = await fetch(`${API_BASE}/api/historical?limit=100`);
        const data = await response.json();

        if (data.success) {
            createHistoricalChart(data.data);
        }
    } catch (error) {
        console.error('Error loading historical data:', error);
    }
}

/**
 * Load device-wise analysis
 */
async function loadDeviceAnalysis() {
    try {
        const response = await fetch(`${API_BASE}/api/device-analysis`);
        const data = await response.json();

        if (data.success) {
            const analysis = data.analysis;

            // Update impact values
            document.getElementById('hvacImpact').textContent = `${analysis.hvac.impact} kWh`;
            document.getElementById('lightingImpact').textContent = `${analysis.lighting.impact} kWh`;

            // Create charts
            createHVACChart(analysis.hvac);
            createLightingChart(analysis.lighting);
            createOccupancyChart(analysis.occupancy);
        }
    } catch (error) {
        console.error('Error loading device analysis:', error);
    }
}

/**
 * Load consumption patterns
 */
async function loadPatterns() {
    try {
        // Load hourly pattern
        const hourlyResponse = await fetch(`${API_BASE}/api/patterns?type=hourly`);
        const hourlyData = await hourlyResponse.json();

        if (hourlyData.success) {
            createHourlyChart(hourlyData.pattern);
        }

        // Load daily pattern
        const dailyResponse = await fetch(`${API_BASE}/api/patterns?type=daily`);
        const dailyData = await dailyResponse.json();

        if (dailyData.success) {
            createDailyChart(dailyData.pattern);
        }
    } catch (error) {
        console.error('Error loading patterns:', error);
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
                loadSuggestions(data.suggestions);
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
    const detailsDiv = document.getElementById('predictionDetails');

    // Animate value
    animateValue('predictionValue', 0, data.prediction, 1000);

    // Show details
    const summary = data.input_summary;
    detailsDiv.innerHTML = `
        <div class="row g-3 text-white">
            <div class="col-6">
                <small>Temperature</small>
                <div class="fw-bold">${summary.temperature}°C</div>
            </div>
            <div class="col-6">
                <small>Humidity</small>
                <div class="fw-bold">${summary.humidity}%</div>
            </div>
            <div class="col-6">
                <small>Occupancy</small>
                <div class="fw-bold">${summary.occupancy} people</div>
            </div>
            <div class="col-6">
                <small>HVAC</small>
                <div class="fw-bold">${summary.hvac}</div>
            </div>
        </div>
    `;

    // Show result
    resultDiv.style.display = 'block';

    // Scroll to result
    setTimeout(() => {
        resultDiv.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }, 100);
}

/**
 * Load and display suggestions
 */
function loadSuggestions(suggestions) {
    const container = document.getElementById('suggestionsContainer');

    container.innerHTML = suggestions.map(suggestion => `
        <div class="col-md-6 col-lg-4">
            <div class="suggestion-card">
                <div class="suggestion-icon">${suggestion.icon}</div>
                <h5 class="suggestion-title">${suggestion.title}</h5>
                <p class="suggestion-message">${suggestion.message}</p>
                <span class="suggestion-savings">
                    <i class="fas fa-piggy-bank me-2"></i>
                    Save ${suggestion.savings}
                </span>
            </div>
        </div>
    `).join('');
}

/**
 * Create historical consumption chart
 */
function createHistoricalChart(data) {
    const ctx = document.getElementById('historicalChart').getContext('2d');

    if (historicalChart) {
        historicalChart.destroy();
    }

    historicalChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: data.timestamps,
            datasets: [{
                label: 'Energy Consumption (kWh)',
                data: data.consumption,
                borderColor: 'rgba(102, 126, 234, 1)',
                backgroundColor: 'rgba(102, 126, 234, 0.1)',
                borderWidth: 2,
                fill: true,
                tension: 0.4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    labels: {
                        color: 'rgba(255, 255, 255, 0.8)'
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        color: 'rgba(255, 255, 255, 0.6)'
                    },
                    grid: {
                        color: 'rgba(255, 255, 255, 0.1)'
                    }
                },
                x: {
                    ticks: {
                        color: 'rgba(255, 255, 255, 0.6)',
                        maxRotation: 45,
                        minRotation: 45
                    },
                    grid: {
                        color: 'rgba(255, 255, 255, 0.1)'
                    }
                }
            }
        }
    });
}

/**
 * Create hourly pattern chart
 */
function createHourlyChart(data) {
    const ctx = document.getElementById('hourlyChart').getContext('2d');

    if (hourlyChart) {
        hourlyChart.destroy();
    }

    hourlyChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: data.hours.map(h => `${h}:00`),
            datasets: [{
                label: 'Avg Consumption',
                data: data.consumption,
                backgroundColor: 'rgba(254, 225, 64, 0.6)',
                borderColor: 'rgba(254, 225, 64, 1)',
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: {
                    display: false
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        color: 'rgba(255, 255, 255, 0.6)'
                    },
                    grid: {
                        color: 'rgba(255, 255, 255, 0.1)'
                    }
                },
                x: {
                    ticks: {
                        color: 'rgba(255, 255, 255, 0.6)'
                    },
                    grid: {
                        display: false
                    }
                }
            }
        }
    });
}

/**
 * Create daily pattern chart
 */
function createDailyChart(data) {
    const ctx = document.getElementById('dailyChart').getContext('2d');

    if (dailyChart) {
        dailyChart.destroy();
    }

    dailyChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: data.days,
            datasets: [{
                label: 'Avg Consumption',
                data: data.consumption,
                backgroundColor: 'rgba(0, 242, 254, 0.6)',
                borderColor: 'rgba(0, 242, 254, 1)',
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: {
                    display: false
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        color: 'rgba(255, 255, 255, 0.6)'
                    },
                    grid: {
                        color: 'rgba(255, 255, 255, 0.1)'
                    }
                },
                x: {
                    ticks: {
                        color: 'rgba(255, 255, 255, 0.6)'
                    },
                    grid: {
                        display: false
                    }
                }
            }
        }
    });
}

/**
 * Create HVAC chart
 */
function createHVACChart(data) {
    const ctx = document.getElementById('hvacChart').getContext('2d');

    if (hvacChart) {
        hvacChart.destroy();
    }

    hvacChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: ['HVAC On', 'HVAC Off'],
            datasets: [{
                data: [data.on, data.off],
                backgroundColor: [
                    'rgba(102, 126, 234, 0.8)',
                    'rgba(102, 126, 234, 0.3)'
                ],
                borderWidth: 0
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        color: 'rgba(255, 255, 255, 0.8)',
                        padding: 15
                    }
                }
            }
        }
    });
}

/**
 * Create Lighting chart
 */
function createLightingChart(data) {
    const ctx = document.getElementById('lightingChart').getContext('2d');

    if (lightingChart) {
        lightingChart.destroy();
    }

    lightingChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: ['Lighting On', 'Lighting Off'],
            datasets: [{
                data: [data.on, data.off],
                backgroundColor: [
                    'rgba(254, 225, 64, 0.8)',
                    'rgba(254, 225, 64, 0.3)'
                ],
                borderWidth: 0
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        color: 'rgba(255, 255, 255, 0.8)',
                        padding: 15
                    }
                }
            }
        }
    });
}

/**
 * Create Occupancy chart
 */
function createOccupancyChart(data) {
    const ctx = document.getElementById('occupancyChart').getContext('2d');

    if (occupancyChart) {
        occupancyChart.destroy();
    }

    const labels = Object.keys(data).sort((a, b) => parseInt(a) - parseInt(b));
    const values = labels.map(key => data[key]);

    occupancyChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels.map(l => `${l} people`),
            datasets: [{
                label: 'Consumption',
                data: values,
                borderColor: 'rgba(0, 242, 254, 1)',
                backgroundColor: 'rgba(0, 242, 254, 0.1)',
                borderWidth: 2,
                fill: true,
                tension: 0.4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: {
                    display: false
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        color: 'rgba(255, 255, 255, 0.6)'
                    },
                    grid: {
                        color: 'rgba(255, 255, 255, 0.1)'
                    }
                },
                x: {
                    ticks: {
                        color: 'rgba(255, 255, 255, 0.6)'
                    },
                    grid: {
                        display: false
                    }
                }
            }
        }
    });
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
 * Setup scroll animations
 */
function setupScrollAnimations() {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate-fade-in');
            }
        });
    }, {
        threshold: 0.1
    });

    document.querySelectorAll('.glass-card').forEach(card => {
        observer.observe(card);
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
console.log('%cPowered by LSTM Neural Networks', 'color: #764ba2; font-size: 12px;');
