// Asteroid Impact Results Calculator
class AsteroidImpactCalculator {
    constructor() {
        this.initializeEventListeners();
        this.updateSliderValues();
    }

    initializeEventListeners() {
        // Update slider value displays in real-time
        document.getElementById('diameter').addEventListener('input', this.updateSliderValues.bind(this));
        document.getElementById('speed').addEventListener('input', this.updateSliderValues.bind(this));
        document.getElementById('angle').addEventListener('input', this.updateSliderValues.bind(this));
        document.getElementById('density').addEventListener('input', this.updateSliderValues.bind(this));

        // Simulate button click
        document.getElementById('simulateBtn').addEventListener('click', this.simulateImpact.bind(this));
    }

    updateSliderValues() {
        const diameter = document.getElementById('diameter').value;
        const speed = document.getElementById('speed').value;
        const angle = document.getElementById('angle').value;
        const density = document.getElementById('density').value;

        document.getElementById('diameterValue').textContent = `${diameter} meters`;
        document.getElementById('speedValue').textContent = `${speed} km/s`;
        document.getElementById('angleValue').textContent = `${angle}°`;
        document.getElementById('densityValue').textContent = `${density} kg/m³`;
    }

    simulateImpact() {
        // Get current parameter values
        const diameter = parseFloat(document.getElementById('diameter').value);
        const speed = parseFloat(document.getElementById('speed').value);
        const angle = parseFloat(document.getElementById('angle').value);
        const density = parseFloat(document.getElementById('density').value);

        // Calculate impact results
        const results = this.calculateImpactResults(diameter, speed, angle, density);

        // Display results
        this.displayResults(results);

        // Show results panel with animation
        const resultsPanel = document.getElementById('resultsPanel');
        resultsPanel.style.display = 'block';
        resultsPanel.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }

    calculateImpactResults(diameter, speed, angle, density) {
        // Convert units
        const radius = diameter / 2; // meters
        const speedMs = speed * 1000; // m/s
        const angleRad = (angle * Math.PI) / 180; // radians

        // Calculate asteroid properties
        const volume = (4/3) * Math.PI * Math.pow(radius, 3); // m³
        const mass = volume * density; // kg

        // Calculate kinetic energy (E = 1/2 * m * v²)
        const kineticEnergy = 0.5 * mass * Math.pow(speedMs, 2); // Joules
        const energyMegatons = kineticEnergy / (4.184e15); // Convert to megatons TNT

        // Calculate crater dimensions (simplified Barringer formula)
        const craterDiameter = 1.8 * Math.pow(energyMegatons, 0.22) * Math.pow(Math.sin(angleRad), 0.33) * 1000; // meters
        const craterDepth = craterDiameter / 5; // simplified ratio

        // Calculate destruction zones (simplified model)
        const fireball = Math.pow(energyMegatons, 0.4) * 1.5; // km
        const airBlast = Math.pow(energyMegatons, 0.33) * 8; // km radius for significant damage
        const thermalRadiation = Math.pow(energyMegatons, 0.41) * 7; // km radius for burns
        const seismicEffect = Math.pow(energyMegatons, 0.25) * 15; // km radius for ground shaking

        // Environmental effects
        const ejectaMass = mass * 100; // simplified: 100x asteroid mass in ejecta
        const earthquakeMagnitude = Math.min(3 + Math.log10(energyMegatons) * 0.8, 10);
        
        return {
            asteroidMass: mass,
            kineticEnergy: kineticEnergy,
            energyMegatons: energyMegatons,
            craterDiameter: craterDiameter,
            craterDepth: craterDepth,
            fireball: fireball,
            airBlast: airBlast,
            thermalRadiation: thermalRadiation,
            seismicEffect: seismicEffect,
            ejectaMass: ejectaMass,
            earthquakeMagnitude: earthquakeMagnitude
        };
    }

    formatNumber(num, decimals = 2) {
        if (num >= 1e9) {
            return (num / 1e9).toFixed(decimals) + ' billion';
        } else if (num >= 1e6) {
            return (num / 1e6).toFixed(decimals) + ' million';
        } else if (num >= 1e3) {
            return (num / 1e3).toFixed(decimals) + ' thousand';
        }
        return num.toFixed(decimals);
    }

    displayResults(results) {
        const resultsContent = document.getElementById('resultsContent');
        
        resultsContent.innerHTML = `
            <div class="results-grid">
                <div class="result-card energy">
                    <div class="result-icon">💥</div>
                    <div class="result-info">
                        <h4>Impact Energy</h4>
                        <div class="result-value">${this.formatNumber(results.energyMegatons)} MT</div>
                        <div class="result-subtitle">TNT Equivalent</div>
                    </div>
                </div>

                <div class="result-card crater">
                    <div class="result-icon">🕳️</div>
                    <div class="result-info">
                        <h4>Crater Size</h4>
                        <div class="result-value">${this.formatNumber(results.craterDiameter/1000, 1)} km</div>
                        <div class="result-subtitle">Diameter, ${this.formatNumber(results.craterDepth)} m deep</div>
                    </div>
                </div>

                <div class="result-card fireball">
                    <div class="result-icon">🔥</div>
                    <div class="result-info">
                        <h4>Fireball</h4>
                        <div class="result-value">${results.fireball.toFixed(1)} km</div>
                        <div class="result-subtitle">Radius of fireball</div>
                    </div>
                </div>

                <div class="result-card airblast">
                    <div class="result-icon">✈️</div>
                    <div class="result-info">
                        <h4>Air Blast</h4>
                        <div class="result-value">${results.airBlast.toFixed(1)} km</div>
                        <div class="result-subtitle">Significant damage radius</div>
                    </div>
                </div>

                <div class="result-card thermal">
                    <div class="result-icon">🌡️</div>
                    <div class="result-info">
                        <h4>Thermal Radiation</h4>
                        <div class="result-value">${results.thermalRadiation.toFixed(1)} km</div>
                        <div class="result-subtitle">3rd degree burn radius</div>
                    </div>
                </div>

                <div class="result-card seismic">
                    <div class="result-icon">📱</div>
                    <div class="result-info">
                        <h4>Earthquake</h4>
                        <div class="result-value">${results.earthquakeMagnitude.toFixed(1)}</div>
                        <div class="result-subtitle">Magnitude (${results.seismicEffect.toFixed(1)} km radius)</div>
                    </div>
                </div>
            </div>

            <div class="detailed-results">
                <h4>Detailed Analysis</h4>
                <div class="detail-row">
                    <span>Asteroid Mass:</span>
                    <span>${this.formatNumber(results.asteroidMass/1e9)} billion kg</span>
                </div>
                <div class="detail-row">
                    <span>Kinetic Energy:</span>
                    <span>${results.kineticEnergy.toExponential(2)} Joules</span>
                </div>
                <div class="detail-row">
                    <span>Ejected Material:</span>
                    <span>${this.formatNumber(results.ejectaMass/1e9)} billion kg</span>
                </div>
            </div>

            <div class="comparison-section">
                <h4>Energy Comparison</h4>
                <div class="comparison-item">
                    ${this.getEnergyComparison(results.energyMegatons)}
                </div>
            </div>
        `;
    }

    getEnergyComparison(megatons) {
        if (megatons < 0.001) {
            return "Equivalent to a small hand grenade";
        } else if (megatons < 0.02) {
            return "Equivalent to the Hiroshima bomb (15 kt)";
        } else if (megatons < 1) {
            return "Equivalent to a large nuclear weapon";
        } else if (megatons < 50) {
            return "Equivalent to the largest hydrogen bombs";
        } else if (megatons < 1000) {
            return "Equivalent to a large volcanic eruption";
        } else if (megatons < 100000) {
            return "Similar to the asteroid that killed the dinosaurs";
        } else {
            return "🌍 Global extinction-level event";
        }
    }
}

// CSS styles for the results display (add to your CSS file)
const resultStyles = `
.results-panel {
    background: linear-gradient(135deg, #1a1a2e, #16213e);
    border-radius: 15px;
    padding: 30px;
    margin-top: 30px;
    border: 1px solid rgba(255, 255, 255, 0.1);
    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
    animation: slideUp 0.6s ease-out;
}

@keyframes slideUp {
    from {
        opacity: 0;
        transform: translateY(30px);
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
}

.results-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    gap: 20px;
    margin-bottom: 30px;
}

.result-card {
    background: rgba(255, 255, 255, 0.05);
    border-radius: 12px;
    padding: 20px;
    border: 1px solid rgba(255, 255, 255, 0.1);
    transition: all 0.3s ease;
    display: flex;
    align-items: center;
    gap: 15px;
}

.result-card:hover {
    transform: translateY(-5px);
    background: rgba(255, 255, 255, 0.08);
    box-shadow: 0 15px 30px rgba(0, 0, 0, 0.2);
}

.result-icon {
    font-size: 2.5rem;
    opacity: 0.8;
}

.result-info h4 {
    margin: 0 0 5px 0;
    color: #fff;
    font-size: 1.1rem;
}

.result-value {
    font-size: 1.8rem;
    font-weight: bold;
    color: #00d4ff;
    margin: 5px 0;
}

.result-subtitle {
    color: #aaa;
    font-size: 0.9rem;
}

.detailed-results {
    background: rgba(0, 0, 0, 0.2);
    border-radius: 10px;
    padding: 20px;
    margin-bottom: 20px;
}

.detailed-results h4 {
    color: #fff;
    margin-bottom: 15px;
    border-bottom: 2px solid #00d4ff;
    padding-bottom: 5px;
}

.detail-row {
    display: flex;
    justify-content: space-between;
    padding: 8px 0;
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.detail-row:last-child {
    border-bottom: none;
}

.comparison-section {
    background: rgba(255, 165, 0, 0.1);
    border-radius: 10px;
    padding: 20px;
    border: 1px solid rgba(255, 165, 0, 0.3);
}

.comparison-section h4 {
    color: #ffa500;
    margin-bottom: 10px;
}

.comparison-item {
    font-size: 1.1rem;
    color: #fff;
    text-align: center;
    padding: 10px;
}

/* Responsive design */
@media (max-width: 768px) {
    .results-grid {
        grid-template-columns: 1fr;
    }
    
    .result-card {
        padding: 15px;
    }
    
    .result-value {
        font-size: 1.5rem;
    }
}
`;

// Inject styles
const styleSheet = document.createElement("style");
styleSheet.textContent = resultStyles;
document.head.appendChild(styleSheet);

// Initialize the calculator when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    new AsteroidImpactCalculator();
});

// Export for use in other modules if needed
window.AsteroidImpactCalculator = AsteroidImpactCalculator;