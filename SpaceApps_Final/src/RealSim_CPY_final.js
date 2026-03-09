import * as THREE from 'three';
        import { OrbitControls } from 'three/addons/controls/OrbitControls.js';


const apiKey = "HqvC7ycEft644yAxJtNOq3obHYaLIE8TRT3DxYje";

// Scene
const scene = new THREE.Scene();
// Scen
// ORIGINAL LINE: scene.background = new THREE.Color(0x000000); 

// --- START NEW CODE FOR SKYBOX ---
const cubeTextureLoader = new THREE.CubeTextureLoader();

const skyboxTextures = [
    'Textures/skybox/px.png', 
    'Textures/skybox/nx.png', 
    'Textures/skybox/py.png', 
    'Textures/skybox/ny.png', 
    'Textures/skybox/pz.png', 
    'Textures/skybox/nz.png'  
];

const backgroundTexture = cubeTextureLoader.load(skyboxTextures);
scene.background = backgroundTexture;
// --- END NEW CODE FOR SKYBOX ---

const axisHelper = new THREE.AxesHelper(1000);
scene.add(axisHelper);



// Constants for scaling
const AU_KM = 149597870.7; // 1 AU in km
const AU_UNITS = 100; // Base units for 1 AU
const LENGTH_SCALE = AU_UNITS / AU_KM; // km to sim units
const SIZE_MULTIPLIER = 50; // Scales all lengths (sizes and distances)
let TIME_SCALE = 5000000; // Time acceleration for orbits
let size_SIM_Earth = 500
let size_SIM_Aster = 50
const G = 6.6743e-11; // Gravitational constant (m^3 kg^-1 s^-2)
    const M_SUN_KG = 1.989e30; // Mass of Sun (kg)
    const AU_M = AU_KM * 1000; // AU in meters
// Calculations
const deg2rad = d => d * Math.PI / 180;
const rad2deg = r => r * 180 / Math.PI;
// Sizes (Earth-Sun)
const SUN_RADIUS_KM = 696340; 
const EARTH_RADIUS_KM = 6371; 
// position of earth
let xecl = 0, yecl = 0, zecl = 0;
// orbit of earth
const T = 365.25 * 24 * 3600; // orbital period in seconds
const GM_SUN_KM3_S2 = 1.32712440018e11; // Gravitational constant of the Sun (km^3/s^2)

// Earth base elements at J2000
const earthBase = {
    a: 1.00000261, // AU
    e: 0.01671123,
    i_deg: -0.00001531,
    Omega_deg: 0.0,
    varpi_deg: 102.93768193,
    M_deg: -2.47311027,
    mean_motion_deg_day: 35999.04917617 / 36525 // ≈0.9856 deg/day
};

// Compute initial for Earth
const currentDate = new Date("2025-10-03T00:00:00Z");
const currentJD = dateToJD(currentDate);
const daysSince = currentJD - 2451545.0;
let M_deg = earthBase.M_deg + earthBase.mean_motion_deg_day * daysSince;
M_deg = ((M_deg % 360) + 360) % 360;
const initial_M = deg2rad(M_deg);

// T_days for Earth
const T_days = 360 / earthBase.mean_motion_deg_day;
const earth_T = T_days * 24 * 3600;
let earth_n = 2 * Math.PI / earth_T;
let earth_simTime = initial_M / earth_n;

// Precompute Earth elements in radians
let earth_omega_deg = earthBase.varpi_deg - earthBase.Omega_deg;
let earth_omega = deg2rad(earth_omega_deg);
let earth_Omega = deg2rad(earthBase.Omega_deg);
let earth_i = deg2rad(earthBase.i_deg);
let earth_a_AU = earthBase.a;
let earth_a = earth_a_AU * AU_UNITS * SIZE_MULTIPLIER;
let earth_e = earthBase.e;

// ALL Geometries
const SunGeo = new THREE.SphereGeometry(SUN_RADIUS_KM * LENGTH_SCALE * SIZE_MULTIPLIER, 64, 64);
const EarthGeo = new THREE.SphereGeometry(EARTH_RADIUS_KM * LENGTH_SCALE * SIZE_MULTIPLIER * size_SIM_Earth, 64, 64);

// textureLoader
const textureLoader = new THREE.TextureLoader();
const sunTexture = textureLoader.load('Textures/sun.png');
const earthTexture = textureLoader.load('Textures/earth.jpg');

// Materials
const sunMaterial = new THREE.MeshBasicMaterial({
    map: sunTexture
});
const earthMaterial = new THREE.MeshStandardMaterial({
    map: earthTexture
});

// final Geo
const sun = new THREE.Mesh(SunGeo, sunMaterial);
sun.position.set(0, 0, 0);

const earth = new THREE.Mesh(EarthGeo, earthMaterial);
earth.position.set(0, 0, 0); // Will be updated immediately
earth.rotation.x = Math.PI / 2; 
earth.add(axisHelper);
// Glow:
// Add glow to sun
const glowTexture = new THREE.TextureLoader().load('Textures/glow.png');
const glowMaterial = new THREE.SpriteMaterial({
    map: glowTexture,
    // color: 0xffff00,
    // transparent: true,
    // blending: THREE.AdditiveBlending,
    opacity: 1
});
const sunGlow = new THREE.Sprite(glowMaterial);
sunGlow.scale.set(SUN_RADIUS_KM * LENGTH_SCALE * SIZE_MULTIPLIER*100, 
                  SUN_RADIUS_KM * LENGTH_SCALE * SIZE_MULTIPLIER*100, 1);
sun.add(sunGlow); // Attach to sun so it moves with it





// Moon
// New Moon Constants
const MOON_RADIUS_KM = 1737.4; // Radius of the Moon in km
const EARTH_MOON_DISTANCE_KM = 384400 ; // Semi-major axis in km

// Orbital elements (simplified)
const MOON_ORBIT_PERIOD_DAYS = 27.321;
const MOON_ORBIT_PERIOD_SECONDS = MOON_ORBIT_PERIOD_DAYS * 24 * 3600;

// Moon's angular mean motion (n) in radians per second
const MOON_N = 2 * Math.PI / MOON_ORBIT_PERIOD_SECONDS;
let moon_simTime = 0; // Separate time accumulator for the moon's orbit

// Moon Geometry and Material
const MoonGeo = new THREE.SphereGeometry(MOON_RADIUS_KM * LENGTH_SCALE * SIZE_MULTIPLIER * size_SIM_Earth, 32, 32);
const moonTexture = textureLoader.load('Textures/mars.jpg'); // **You'll need a 'Textures/moon.jpg' file!**
const moonMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000 }); // Bright red, self-lit


const moon = new THREE.Mesh(MoonGeo, moonMaterial);
// moon.position.set(0, 0, 0); // Will be updated
scene.add(moon);










document.getElementById('nowBtn').addEventListener('click', () => {
    const today = new Date();
    const iso = today.toISOString().slice(0,10);
    document.getElementById('date').value = iso;
});

document.getElementById('compute').addEventListener('click', () => {
    // read inputs (a in AU, L in degrees)
    const a_input = parseFloat(document.getElementById('a').value) || earth_a_AU;
    const e_input = parseFloat(document.getElementById('e').value) || earth_e;
    const i_deg_input = parseFloat(document.getElementById('i').value) || rad2deg(earth_i);
    const Omega_deg_input = parseFloat(document.getElementById('Omega').value) || rad2deg(earth_Omega);
    const varpi_deg_input = parseFloat(document.getElementById('varpi').value) || (earth_omega_deg + rad2deg(earth_Omega));
    const L_deg_input = parseFloat(document.getElementById('L').value) || 0;
    

    // date -> JD & days since J2000
    let dateInput = document.getElementById('date').value;
    let dateObj = dateInput ? new Date(dateInput + 'T00:00:00Z') : new Date();
    const JD = dateToJD(dateObj);
    const daysSinceJ2000 = JD - 2451545.0; // days since epoch J2000

    // compute mean anomaly at epoch from L and varpi (degrees)
    let M0_deg = L_deg_input - varpi_deg_input;
    M0_deg = ((M0_deg % 360) + 360) % 360;

    // compute mean motion from semi-major axis using Kepler's 3rd law
    const a_km = a_input * AU_KM;
    const period_seconds = 2 * Math.PI * Math.sqrt((a_km ** 3) / GM_SUN_KM3_S2);
    const period_days = period_seconds / 86400;
    const mean_motion_deg_per_day = 360 / period_days;

    // advance M by days since epoch to the chosen date
    let M_deg_now = M0_deg + mean_motion_deg_per_day * daysSinceJ2000;
    M_deg_now = ((M_deg_now % 360) + 360) % 360;
    const M_now = deg2rad(M_deg_now);

    // solve Kepler for E and compute orbital-plane coords
    const E = solveKepler(M_now, e_input);
    const { r, xprime, yprime } = orbitalPlaneCoords(a_input, e_input, E);

    // convert angles to radians for rotation
    const omega_deg = varpi_deg_input - Omega_deg_input; // argument of perihelion
    const omega = deg2rad(omega_deg);
    const Omega = deg2rad(Omega_deg_input);
    const i = deg2rad(i_deg_input);

    // compute ecliptic coords (in AU)
    const ecl = toEcliptic(xprime, yprime, omega, Omega, i);

    // Update global Earth orbital elements so render/updateEarth() uses them
    earth_a_AU = a_input;
    earth_a = earth_a_AU * AU_UNITS * SIZE_MULTIPLIER;
    earth_e = e_input;
    earth_omega = omega;
    earth_Omega = Omega;
    earth_i = i;
    earth_omega_deg = omega_deg;

    // recompute earth_n in rad/sec and set earth_simTime so simulation continues from this M
    const new_period_seconds = period_seconds;
    // earth_n = 2 * Math.PI / period_seconds; // rad / sec
    // earth_simTime is in seconds such that M = earth_n * earth_simTime
    earth_simTime = M_now / earth_n;

    // set earth mesh to computed position (convert AU -> simulation units)
    const posVec = new THREE.Vector3(
        ecl.xecl * AU_UNITS * SIZE_MULTIPLIER,
        ecl.yecl * AU_UNITS * SIZE_MULTIPLIER,
        ecl.zecl * AU_UNITS * SIZE_MULTIPLIER
    );
    earth.position.copy(posVec);

    const orbitPts = [];
        const geom = new THREE.BufferGeometry().setFromPoints(orbitPts);
let earthOrbitLine = new THREE.Line(geom, new THREE.LineBasicMaterial({ color: 'white' }));
    // Optionally rebuild the Earth orbit visual so it matches the new 'a' and 'e'
    if (earthOrbitLine) {
        scene.remove(earthOrbitLine);
        try { earthOrbitLine.geometry.dispose(); } catch(e) {}
        try { earthOrbitLine.material.dispose(); } catch(e) {}
    }

    const steps = 360;
    for (let s = 0; s <= steps; s++) {
        const Mstep = (s / steps) * 2 * Math.PI;
        const Estep = solveKepler(Mstep, earth_e);
        const { xprime: xp, yprime: yp } = orbitalPlaneCoords(earth_a_AU, earth_e, Estep);
        const eclStep = toEcliptic(xp, yp, earth_omega, earth_Omega, earth_i);
        orbitPts.push(new THREE.Vector3(
            eclStep.xecl * AU_UNITS * SIZE_MULTIPLIER,
            eclStep.yecl * AU_UNITS * SIZE_MULTIPLIER,
            eclStep.zecl * AU_UNITS * SIZE_MULTIPLIER
        ));
    }

    scene.add(earthOrbitLine);

    // show result in UI as before
    const out = {
        dateUTC: dateObj.toISOString(),
        JD,
        elements: { a: a_input, e: e_input, i_deg: i_deg_input, Omega_deg: Omega_deg_input, varpi_deg: varpi_deg_input, L_deg: L_deg_input },
        computed: { M_deg: M_deg_now, E_deg: rad2deg(E), r_AU: r, xecl_AU: ecl.xecl, yecl_AU: ecl.yecl, zecl_AU: ecl.zecl }
    };
    document.getElementById('result').textContent = JSON.stringify(out, null, 2);
});










// Earth object
function dateToJD(dateObj) {
    return dateObj.getTime()/86400000 + 2440587.5;
}

function solveKepler(M, e, tol = 1e-8, maxIter = 50) {
    let Mwrap = ((M + Math.PI) % (2*Math.PI)) - Math.PI;
    let E = (e < 0.8) ? Mwrap : Math.PI;
    for (let iter = 0; iter < maxIter; iter++) {
        let f = E - e * Math.sin(E) - Mwrap;
        let fprime = 1 - e * Math.cos(E);
        let dE = f / fprime;
        E = E - dE;
        if (Math.abs(dE) < tol) {
            return E;
        }
    }
    return E;
}

function orbitalPlaneCoords(a, e, E) {
    const cosE = Math.cos(E);
    const sinE = Math.sin(E);
    const r = a * (1 - e * cosE);
    const xprime = a * (cosE - e);
    const yprime = a * Math.sqrt(Math.max(0, 1 - e * e)) * sinE;
    return { r, xprime, yprime };
}

function toEcliptic(xp, yp, omega, Omega, i) {
    const cosw = Math.cos(omega), sinw = Math.sin(omega);
    const cosO = Math.cos(Omega), sinO = Math.sin(Omega);
    const cosI = Math.cos(i), sinI = Math.sin(i);

    const xecl = (cosw * cosO - sinw * sinO * cosI) * xp +
                 (-sinw * cosO - cosw * sinO * cosI) * yp;

    const yecl = (cosw * sinO + sinw * cosO * cosI) * xp +
                 (-sinw * sinO + cosw * cosO * cosI) * yp;

    const zecl = (sinw * sinI) * xp + (cosw * sinI) * yp;

    return { xecl, yecl, zecl };
}

function computeMeanAnomaly(L_deg, varpi_deg) {
    let Mdeg = L_deg - varpi_deg;
    Mdeg = ((Mdeg % 360) + 360) % 360;
    return deg2rad(Mdeg);
}







function getEarthPosition(M) {
    const E = solveKepler(M, earth_e);
    const { xprime, yprime } = orbitalPlaneCoords(earth_a_AU, earth_e, E);
    const { xecl, yecl, zecl } = toEcliptic(xprime, yprime, earth_omega, earth_Omega, earth_i);
    return new THREE.Vector3(xecl * AU_UNITS * SIZE_MULTIPLIER, yecl * AU_UNITS * SIZE_MULTIPLIER, zecl * AU_UNITS * SIZE_MULTIPLIER);
}

// Precompute orbit path for Earth
const earthOrbitPoints = [];
const steps = 360;
for (let step = 0; step <= steps; step++) {
    const M = (step / steps) * 2 * Math.PI;
    earthOrbitPoints.push(getEarthPosition(M));
}

const earthOrbitGeometry = new THREE.BufferGeometry().setFromPoints(earthOrbitPoints);
const earthOrbitMaterial = new THREE.LineBasicMaterial({ color: 'white' });
const earthOrbitLine = new THREE.Line(earthOrbitGeometry, earthOrbitMaterial);
scene.add(earthOrbitLine);


// Set initial Earth position
let initial_E = solveKepler(initial_M, earth_e);
earth.position.copy(initial_E);


















// Light
const amlight = new THREE.AmbientLight('white', 1);
const pointLight = new THREE.PointLight('white', 5);

scene.add(sun, pointLight, amlight, earth, earthOrbitLine);

// Camera
const camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    1000 * SIZE_MULTIPLIER // Adjust far plane for larger orbits
);
camera.position.z = 200 * SIZE_MULTIPLIER; // Scale camera distance

const canvas = document.querySelector('canvas.threejs');
const renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    antialias: true
});
renderer.setSize(window.innerWidth, window.innerHeight);

const controls = new OrbitControls(camera, canvas);
controls.enableDamping = true;
controls.autoRotate = false;

window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

const clock = new THREE.Clock();












// NASA Asteroid Storage
const allAsteroids = [];

// Fetch NASA NEO Data
let today = new Date();
const start_date = today.toISOString().slice(0,10);
const end_date = new Date(today.getTime() + 2 * 86400000).toISOString().slice(0,10);
const feedUrl = `https://api.nasa.gov/neo/rest/v1/feed?start_date=${start_date}&end_date=${end_date}&api_key=${apiKey}`;

fetch(feedUrl)
    .then(res => res.json())
    .then(data => {
        console.log("Fetched NEO data:", data);

        for (let date in data.near_earth_objects) {
            data.near_earth_objects[date].forEach(async neo => {
                const diameter = neo.estimated_diameter.meters.estimated_diameter_max;

                try {
                    const lookupUrl = `https://api.nasa.gov/neo/rest/v1/neo/${neo.id}?api_key=${apiKey}`;
                    const resp = await fetch(lookupUrl);
                    const lookupData = await resp.json();
                    const orbitClass = lookupData.orbital_data.orbit_class?.orbit_class_type || "Unknown";
                    const orbitalData = lookupData.orbital_data;
                    
                    console.log(`${neo.name}: ${orbitClass}`);
                    
                    createAsteroidWithRealOrbit(neo.name, orbitClass, diameter, orbitalData);
                } catch (e) {
                    console.error("Error fetching orbit data:", e);
                }
            });
        }
    })
    .catch(err => {
        console.error("Error fetching NEO data:", err);
    });

// Create Asteroid with Real Orbital Elements
function createAsteroidWithRealOrbit(name, orbitClass, diameter, orbitalData) {
    if (!orbitalData) return;
    
    const radius = Math.max((diameter / 1000 / 2) * LENGTH_SCALE * SIZE_MULTIPLIER, size_SIM_Aster);
    
    // Extract and Convert Orbital Elements
    const a_AU = parseFloat(orbitalData.semi_major_axis) || 1.0;
    const a = a_AU * AU_UNITS * SIZE_MULTIPLIER; // Scale orbit with SIZE_MULTIPLIER
    const e = parseFloat(orbitalData.eccentricity) || 0.1;
    const i_deg = parseFloat(orbitalData.inclination) || 5.0;
    const Omega_deg = parseFloat(orbitalData.longitude_of_ascending_node) || 0;
    const omega_deg = parseFloat(orbitalData.argument_of_perihelion) || 0;
    
    const i = deg2rad(i_deg);
    const Omega = deg2rad(Omega_deg);
    const omega = deg2rad(omega_deg);

    // Determine Display Properties
    let color, orbitType;
    if (orbitClass.includes('Apollo') || orbitClass.includes('APO')) {
        color = 'red'; orbitType = 'apollo';
    } else if (orbitClass.includes('Amor') || orbitClass.includes('AMO')) {
        color = 'orange'; orbitType = 'amor';
    } else if (orbitClass.includes('Aten') || orbitClass.includes('ATE')) {
        color = 'green'; orbitType = 'aten';
    } else if (orbitClass.includes('Atira') || orbitClass.includes('IEO') || orbitClass.includes('ATI')) {
        color = 'cyan'; orbitType = 'atira';
    } else {
        color = 'white'; orbitType = 'other';
    }
    
    console.log(`${name}: ${orbitClass} -> ${orbitType} orbit (a=${a_AU.toFixed(2)} AU)`);
    
    // Create asteroid mesh
    const asteroidMaterial = new THREE.MeshStandardMaterial({ 
        color: color, 
        metalness: 0.5, 
        roughness: 0.7 
    });
    const asteroidMesh = new THREE.Mesh(
        new THREE.SphereGeometry(radius, 16, 16), 
        asteroidMaterial
    );
    scene.add(asteroidMesh);

    // Precompute and Draw the Orbit Path
    const T_days = parseFloat(orbitalData.orbital_period) || 365;
    const T_asteroid = T_days * 24 * 3600;
    const n = 2 * Math.PI / T_asteroid;

    const orbitPoints = [];
    const steps = 360;
    
    for (let M_rad = 0; M_rad <= 2 * Math.PI; M_rad += (2 * Math.PI) / steps) {
        const pos = getAsteroidPosition(a, e, i, omega, Omega, M_rad);
        orbitPoints.push(pos);
    }

    const orbitGeometry = new THREE.BufferGeometry().setFromPoints(orbitPoints);
    const orbitMaterial = new THREE.LineBasicMaterial({ color: color, transparent: true, opacity: 0.5 });
    const orbitLine = new THREE.Line(orbitGeometry, orbitMaterial);
    scene.add(orbitLine);
    
    // Define initial position
    let M_start = 0;
    if (orbitalData.epoch_osculation && orbitalData.mean_anomaly && orbitalData.mean_motion) {
        const currentJD = dateToJD(new Date());
        const daysSince = currentJD - parseFloat(orbitalData.epoch_osculation);
        let M_deg = parseFloat(orbitalData.mean_anomaly) + parseFloat(orbitalData.mean_motion) * daysSince;
        M_deg = ((M_deg % 360) + 360) % 360;
        M_start = deg2rad(M_deg);
    } 

    const initialPos = getAsteroidPosition(a, e, i, omega, Omega, M_start);
    asteroidMesh.position.copy(initialPos);

    // Calculate initial perihelion speed
    const a_km = a_AU * AU_KM;
    const v_peri = Math.sqrt(GM_SUN_KM3_S2 * (1 + e) / (a_km * (1 - e)));

    // Store Asteroid Data
    const asteroidData = {
        mesh: asteroidMesh,
        name: name,
        simTime: M_start / n,
        a, e, i, omega, Omega, n,
        period: T_days,
        orbitType: orbitType,
        radius: radius,
        diameter: diameter,
        orbitLine: orbitLine,
        current_v_peri: v_peri,
        radiusMultiplier: 1, // Added for new feature
        originalDiameter: diameter // Added for new feature
        
    };
    
    allAsteroids.push(asteroidData); 
    updateAsteroidDropdown();
}

function getAsteroidPosition(a, e, i, omega, Omega, M) {
    // Note: a is passed in simulation units, but orbitalPlaneCoords expects AU (scaled by 1 / (AU_UNITS * SIZE_MULTIPLIER))
    const E = solveKepler(M, e);
    const { xprime, yprime } = orbitalPlaneCoords(a / (AU_UNITS * SIZE_MULTIPLIER), e, E); // a in AU
    const { xecl, yecl, zecl } = toEcliptic(xprime, yprime, omega, Omega, i);
    return new THREE.Vector3(xecl * AU_UNITS * SIZE_MULTIPLIER, yecl * AU_UNITS * SIZE_MULTIPLIER, zecl * AU_UNITS * SIZE_MULTIPLIER);
}


















// Control Panel Functions
let selectedAsteroid = null;
let cameraFollowing = false;
function updateAsteroidDropdown() {
    const select = document.getElementById('asteroidSelect');
    if (!select) return;
    
    select.innerHTML = '<option value="">-- Choose an asteroid --</option>';
    
    const sortedAsteroids = [...allAsteroids].sort((a, b) => 
        a.name.localeCompare(b.name)
    );
    
    sortedAsteroids.forEach((asteroid, index) => {
        const option = document.createElement('option');
        option.value = index;
        option.textContent = asteroid.name;
        select.appendChild(option);
    });
}

function updateAsteroidInfo() {
    const infoDiv = document.getElementById('asteroidInfo');
    if (!infoDiv || !selectedAsteroid) {
        infoDiv.innerHTML = '<div class="no-selection">No asteroid selected</div>';
        return;
    }
    
    const orbitType = selectedAsteroid.orbitType || 'unknown';
    const orbitTypeCapitalized = orbitType.charAt(0).toUpperCase() + orbitType.slice(1);
    const v_peri_km_s = selectedAsteroid.current_v_peri.toFixed(2);
    const radiusMultiplier = selectedAsteroid.radiusMultiplier || 1; // Get the multiplier
    
    infoDiv.innerHTML = `
        <div class="info-item">
            <span class="info-label">Name:</span>
            <span class="info-value">${selectedAsteroid.name}</span>
        </div>
        <div class="info-item">
            <span class="info-label">Orbit Type:</span>
            <span class="info-value">
                <span class="orbit-indicator orbit-${selectedAsteroid.orbitType}"></span>
                ${orbitTypeCapitalized}
            </span>
        </div>
        <div class="info-item">
            <span class="info-label">Perihelion Speed:</span>
            <span class="info-value">${v_peri_km_s} km/s</span>
        </div>
        <div class="info-item">
            <span class="info-label">Radius (visual):</span>
            <span class="info-value">${selectedAsteroid.radius.toFixed(2)} units</span>
        </div>
        <div class="info-item">
            <span class="info-label">Radius Multiplier:</span>
            <span class="info-value">${radiusMultiplier.toFixed(2)}×</span>
        </div>
        <div class="info-item">
            <span class="info-label">Diameter:</span>
            <span class="info-value">${selectedAsteroid.diameter.toFixed(2)} m</span>
        </div>
        <div class="info-item">
            <span class="info-label">Orbital Period:</span>
            <span class="info-value">${selectedAsteroid.period.toFixed(1)} days</span>
        </div>
    `;
}

document.addEventListener('DOMContentLoaded', () => {
    const select = document.getElementById('asteroidSelect');
    const whatIfButtonContainer = document.getElementById('whatIfButtonContainer');
    const whatIfButton = document.getElementById('whatIfButton');
    const whatIfButton_rest = document.getElementById('ResetCam');
    const EarthFollow = document.getElementById('EarthFollow');
    const speedControlPanel = document.getElementById('speedControlPanel');
    const RadiusControlPanel = document.getElementById('RadiusControlPanel');
    const selectedAsteroidName = document.getElementById('selectedAsteroidName');
    const speedSlider = document.getElementById('speedSlider');
    const speedValue = document.getElementById('speedValue');
    const applySpeed = document.getElementById('applySpeed');
    const solarSpeedSlider = document.getElementById('solarSpeedSlider');
    const solarSpeedValue = document.getElementById('solarSpeedValue');
    const earthSizeSlider = document.getElementById('earthSizeSlider');
    const earthSizeValue = document.getElementById('earthSizeValue');
    const asteroidSizeSlider = document.getElementById('asteroidSizeSlider');
    const asteroidSizeValue = document.getElementById('asteroidSizeValue');
    const radiusSlider = document.getElementById('radiusSlider');
    const radiusValue = document.getElementById('radiusValue');
    const applyRadius = document.getElementById('applyRadius');
    const selectedAsteroidRadiusName = document.getElementById('selectedAsteroidRadiusName');
     const createAsteroidBtn = document.getElementById('createAsteroidBtn');
    const newAsteroidSpeed = document.getElementById('newAsteroidSpeed');
    const newAsteroidSpeedValue = document.getElementById('newAsteroidSpeedValue');
    const newAsteroidRadius = document.getElementById('newAsteroidRadius');
    const newAsteroidRadiusValue = document.getElementById('newAsteroidRadiusValue');
    const cancelFollowBtn = document.getElementById('cancelFollowBtn');
    const randomHitBtn = document.getElementById('randomHitBtn');
    

    
    if (select) {
        select.addEventListener('change', (e) => {
            const index = parseInt(e.target.value);
            if (!isNaN(index) && allAsteroids[index]) {
                selectedAsteroid = allAsteroids[index];
                updateAsteroidInfo();
                whatIfButtonContainer.style.display = 'block';
                speedControlPanel.style.display = 'none';
                highlightSelectedAsteroid();
                cameraFollowing = true;
                controls.enableRotate = true;
            } else {
                selectedAsteroid = null;
                updateAsteroidInfo();
                clearHighlight();
                whatIfButtonContainer.style.display = 'none';
                speedControlPanel.style.display = 'none';
                cameraFollowing = false;
            }
        });
    }
    
    if (whatIfButton) {
        whatIfButton.addEventListener('click', () => {
            if (selectedAsteroid) {
                speedControlPanel.style.display = 'block';
                RadiusControlPanel.style.display = 'block';
                selectedAsteroidName.textContent = `Asteroid: ${selectedAsteroid.name}`;
                selectedAsteroidRadiusName.textContent = `Asteroid: ${selectedAsteroid.name}`; // Set Radius Name
                
                // Reset Speed controls
                speedSlider.value = 1;
                speedValue.textContent = '1.00×';
                
                // Reset Radius controls
                radiusSlider.value = selectedAsteroid.radiusMultiplier || 1;
                radiusValue.textContent = (selectedAsteroid.radiusMultiplier || 1).toFixed(2) + '×';
                
                // Hide calculation outputs
                document.getElementById('speedCalculation').style.display = 'none';
                document.getElementById('radiusCalculation').style.display = 'none';
                
                speedControlPanel.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
            }
        });
    }
    if (whatIfButton_rest) {
        whatIfButton_rest.addEventListener('click', () => {
            cameraFollowing = false
            
        });
    }
    if (EarthFollow) {
        EarthFollow.addEventListener('click', () => {
            cameraFollowing = true
            
        });
    }
    
    if (speedSlider) {
        speedSlider.addEventListener('input', (e) => {
            const value = parseFloat(e.target.value);
            speedValue.textContent = value.toFixed(2) + '×';
        });
    }

    if (applySpeed) {
        applySpeed.addEventListener('click', () => {
            if (selectedAsteroid) {
                const multiplier = parseFloat(speedSlider.value);
                if (!selectedAsteroid.originalA) {
                    selectedAsteroid.originalA = selectedAsteroid.a;
                    selectedAsteroid.originalE = selectedAsteroid.e;
                    selectedAsteroid.originalN = selectedAsteroid.n;
                    selectedAsteroid.original_v_peri = selectedAsteroid.current_v_peri;
                    selectedAsteroid.original_period = selectedAsteroid.period;
                }
                updateOrbitAfterSpeedChange(selectedAsteroid, multiplier);
                const calculationDiv = document.getElementById('speedCalculation');
                const formulaElement = document.getElementById('calculationFormula');
                const resultElement = document.getElementById('calculationResult');
                if (calculationDiv && formulaElement && resultElement) {
                    calculationDiv.style.display = 'block';
                    const original_v = selectedAsteroid.original_v_peri;
                    const new_v = multiplier * original_v;
                    formulaElement.textContent = `${multiplier.toFixed(2)} × ${original_v.toFixed(2)}`;
                    resultElement.textContent = `= ${new_v.toFixed(2)} km/s`;
                }
                updateAsteroidInfo();
                selectedAsteroid.simTime = 0;
            }
        });
    }
    
    if (solarSpeedSlider) {
        // Set the initial value from the existing TIME_SCALE
        solarSpeedSlider.value = TIME_SCALE;
        solarSpeedValue.textContent = TIME_SCALE.toLocaleString();

        solarSpeedSlider.addEventListener('input', (e) => {
            const newSpeed = parseInt(e.target.value);
            // 1. Update the global TIME_SCALE variable
            TIME_SCALE = newSpeed;
            
            // 2. Update the display text
            solarSpeedValue.textContent = newSpeed.toLocaleString();
            
            // Log the change for debugging (optional)
            console.log(`TIME_SCALE updated to: ${TIME_SCALE}`);
        });
    }

if (radiusSlider) {
    radiusSlider.addEventListener('input', (e) => {
        const value = parseFloat(e.target.value);
        radiusValue.textContent = value.toFixed(2) + '×';
    });
}

if (applyRadius) {
    applyRadius.addEventListener('click', () => {
        if (selectedAsteroid) {
            const multiplier = parseFloat(radiusSlider.value);

            // Store original elements if not done (to support resets)
            if (!selectedAsteroid.originalA) {
                selectedAsteroid.originalA = selectedAsteroid.a;
                selectedAsteroid.originalE = selectedAsteroid.e;
                selectedAsteroid.originalN = selectedAsteroid.n;
                selectedAsteroid.original_period = selectedAsteroid.period;
            }

            // --- CORE FUNCTION CALL ---
            updateOrbitAfterRadiusChange(selectedAsteroid, multiplier);

            // Update internal multiplier state
            selectedAsteroid.radiusMultiplier = multiplier;

            // Update UI display
            updateAsteroidInfo(); 
            selectedAsteroid.simTime = 0;

            // Optional: Show a calculation/note in the UI
            const calculationDiv = document.getElementById('radiusCalculation');
            if (calculationDiv) {
                calculationDiv.style.display = 'block';
                document.getElementById('radiusFormula').textContent = `New Radius Multiplier: ${multiplier.toFixed(2)}×`;
                document.getElementById('radiusResult').textContent = `New Semi-Major Axis (a) scaled by: ${multiplier.toFixed(2)}×`;
            }
        }
    });
    }
    


      if (newAsteroidSpeed) {
        newAsteroidSpeed.addEventListener('input', (e) => {
            newAsteroidSpeedValue.textContent = parseFloat(e.target.value).toFixed(2) + '×';
        });
    }

    if (newAsteroidRadius) {
        newAsteroidRadius.addEventListener('input', (e) => {
            newAsteroidRadiusValue.textContent = parseFloat(e.target.value).toFixed(1) + '×';
        });
    }

    if (createAsteroidBtn) {
        createAsteroidBtn.addEventListener('click', createCustomAsteroid);
    }
   if (cancelFollowBtn) {
        cancelFollowBtn.addEventListener('click', () => {
            cameraFollowing = false;
            controls.enabled = true;
            console.log("Camera following cancelled. Manual controls re-enabled.");
        });
    }

    if (randomHitBtn) {
        randomHitBtn.addEventListener('click', () => {
            createRandomHit();
        });
    }
    if (earthSizeSlider) {
        // Initial setup for the Earth slider
        earthSizeSlider.value = size_SIM_Earth;
        earthSizeValue.textContent = size_SIM_Earth;

        earthSizeSlider.addEventListener('input', (e) => {
            const newScale = parseInt(e.target.value);
            // 1. Update the global variable
            size_SIM_Earth = newScale;
            
            // 2. Update the display text
            earthSizeValue.textContent = newScale;
            
            // 3. Immediately re-scale the Earth mesh
            // Get the original geometry radius without the size_SIM_Earth multiplier
            const originalRadius = EARTH_RADIUS_KM * LENGTH_SCALE * SIZE_MULTIPLIER;
            
            // Create a new geometry with the updated size_SIM_Earth
            const newEarthGeo = new THREE.SphereGeometry(
                originalRadius * size_SIM_Earth, 64, 64
            );

            // Dispose of the old geometry to free memory
            earth.geometry.dispose(); 
            // Assign the new geometry
            earth.geometry = newEarthGeo;

            console.log(`Earth visual scale updated to: ${size_SIM_Earth}`);
        });
    }
});

let originalMaterial = null;

function highlightSelectedAsteroid() {
    clearHighlight();
    if (selectedAsteroid) {
        originalMaterial = {
            asteroid: selectedAsteroid,
            material: selectedAsteroid.mesh.material
        };
        const highlightMaterial = new THREE.MeshStandardMaterial({
            color: 'white',
            metalness: 0.7,
            roughness: 0.3,
            emissive: 'white',
            emissiveIntensity: 0.5,
        });
        selectedAsteroid.mesh.material = highlightMaterial;
    }
}

function clearHighlight() {
    if (originalMaterial) {
        originalMaterial.asteroid.mesh.material = originalMaterial.material;
        originalMaterial = null;
    }
}

if (asteroidSizeSlider) {
        // Initial setup for the Asteroid slider
        asteroidSizeSlider.value = size_SIM_Aster;
        asteroidSizeValue.textContent = size_SIM_Aster;

        asteroidSizeSlider.addEventListener('input', (e) => {
            const newScale = parseInt(e.target.value);
            // 1. Update the global variable
            size_SIM_Aster = newScale;
            
            // 2. Update the display text
            asteroidSizeValue.textContent = newScale;
            
            // 3. Re-scale all existing asteroid meshes
            // Note: Since asteroids use the size_SIM_Aster as a minimum size, 
            // we must recalculate their radius based on their real diameter 
            // OR the new minimum size.
            
            allAsteroids.forEach(asteroid => {
                // Recalculate the radius based on real size or new minimum size
                const newRadius = Math.max(
                    (asteroid.diameter / 1000 / 2) * LENGTH_SCALE * SIZE_MULTIPLIER, size_SIM_Aster);
                
                // Update the stored radius for display/collision
                asteroid.radius = newRadius;
                
                // Update the mesh geometry
                if (asteroid.mesh.geometry) {
                    // Create a new geometry with the updated radius
                    const newAsteroidGeo = new THREE.SphereGeometry(newRadius, 16, 16);
                    
                    // Dispose of the old geometry to free memory
                    asteroid.mesh.geometry.dispose(); 
                    // Assign the new geometry
                    asteroid.mesh.geometry = newAsteroidGeo;
                }
            });

            console.log(`Asteroid visual scale updated to: ${size_SIM_Aster}`);
        });
    }




















let hasRedirected = false;

function updateAllAsteroidOrbits(delta) {
    allAsteroids.forEach(asteroid => {
        asteroid.simTime += delta * TIME_SCALE;
        const M = (asteroid.n * asteroid.simTime) % (2 * Math.PI);
        const pos = getAsteroidPosition(asteroid.a, asteroid.e, asteroid.i, asteroid.omega, asteroid.Omega, M);
        asteroid.mesh.position.copy(pos);
        
        // Check collision with Earth
        checkCollision(asteroid);
    });
}
function checkCollision(asteroid) {
    // If we've already redirected, stop checking for collisions
    if (hasRedirected) {
        return;
    }

    const distanceVector = new THREE.Vector3().subVectors(asteroid.mesh.position, earth.position);
    const distance = distanceVector.length();
    
    // The visible Earth radius in your simulation
    const earthRadius = EARTH_RADIUS_KM * LENGTH_SCALE * SIZE_MULTIPLIER * 500;
    const asteroidRadius = asteroid.radius;
    const collisionThreshold = earthRadius + asteroidRadius;
    
    if (distance < collisionThreshold) {
        if (!asteroid.hasCollided) {
            asteroid.hasCollided = true;
            
            // 1. Calculate the vector from Earth's center to the collision point
            const collisionPoint = distanceVector.clone().normalize().multiplyScalar(earthRadius);
            
            // 2. Convert to Latitude and Longitude
            const { lat, lon } = cartesianToLatLon(collisionPoint);
            
            // 3. Log the collision details
            console.log(`\n!!! COLLISION DETECTED: ${asteroid.name} hit Earth !!!`);
            console.log(`Collision location: Latitude is: ${lat.toFixed(4)}°, Longitude is: ${lon.toFixed(4)}°`);
            console.log(`Impact Velocity (approx): ${asteroid.current_v_peri.toFixed(2)} km/s`);

            // --- REDIRECTION LOGIC WITH DATA EXPORT ---
            if (!hasRedirected) {
                hasRedirected = true; // Set flag
                // Stop the animation loop immediately (optional but recommended)
                cancelAnimationFrame(animationFrameId); 

                // Collect and format the data
                const realRadiusMeters = asteroid.diameter / 2; // Calculate the real radius in meters
                
                const data = {
                    name: asteroid.name,
                    speed: asteroid.current_v_peri.toFixed(2), // km/s
                    latitude: lat.toFixed(4), // degrees
                    longitude: lon.toFixed(4), // degrees
                    // CHANGE THIS LINE: Exporting the real radius in meters
                    radius: realRadiusMeters.toFixed(2) 
                };

                // Create URL search parameters
                const params = new URLSearchParams();
                for (const key in data) {
                    params.append(key, key === 'radius' ? realRadiusMeters.toFixed(2) : data[key]);
                }
                
                // Construct the new URL
                const targetUrl = "LIVE_Last.html?" + params.toString();
                
                // Redirect to the desired page
                window.location.href = targetUrl;
            }
            // --- END REDIRECTION LOGIC ---
            
        }
    } else {
        asteroid.hasCollided = false;
    }
}

// Function to update Earth's position and rotation
function updateEarth(delta) {
    earth_simTime += delta * TIME_SCALE;
    const M = (earth_n * earth_simTime) % (2 * Math.PI);
    const pos = getEarthPosition(M);
    earth.position.copy(pos);

    // New code for self-spin: 366 revolves per 1 orbit
    const rotationAngle = M * 366; 
    earth.rotation.y = rotationAngle;
}

// Location of the hit

/**
 * Converts a 3D Cartesian vector (relative to the Earth's center) 
 * to Geographic Latitude and Longitude.
 * @param {THREE.Vector3} cartesian - The collision point vector.
 * @returns {{lat: number, lon: number}} - Latitude and Longitude in degrees.
 */
function cartesianToLatLon(cartesian) {
    // The texture mapping assumes the Z-axis is 'up' for the poles 
    // when calculating standard spherical coordinates, but in Three.js/astronomy, 
    // the Y-axis is often 'up' (north pole) and Z is 'out' (ecliptic).
    // Assuming standard Three.js setup where Y is the pole axis:
    
    // Y-axis is North/South. Latitude is the angle from the XZ-plane.
    const latitudeRad = Math.asin(cartesian.y / cartesian.length());
    
    // Longitude is the angle in the XZ-plane, measured from the +Z axis towards +X.
    // However, THREE.js often uses the -Z axis for the prime meridian (0 longitude).
    // Let's use the XZ-plane and atan2 for the angle:
    // Longitude is measured from the prime meridian (often 0 on the +X or -Z axis) 
    // towards the East (+Y or +X direction).
    
    // In many planet renderings: +Z is Prime Meridian, +X is 90 degrees East (using Y as the pole)
    // Here, we'll use X and Z: Z is often forward/out, X is right/left.
    const longitudeRad = Math.atan2(cartesian.x, cartesian.z); 
    
    // Convert to degrees
    const lonDeg = rad2deg(longitudeRad);
    const latDeg = rad2deg(latitudeRad);
    
    // Normalize longitude from -180 to 180 degrees
    const lon = ((lonDeg + 180) % 360) - 180;
    
    return { 
        lat: latDeg, 
        lon: lon 
    };
}


/**
 * Function to update the orbit based on the user-provided radius law: a ∝ r.
 * This function was moved out of the applySpeed listener to resolve the ReferenceError.
 */
function updateOrbitAfterRadiusChange(asteroid, radiusMultiplier) {
    // Constants from the provided code and law
    const GM_SUN = GM_SUN_KM3_S2; // Gravitational constant of the Sun (M * G)
    const RHO = 7.96; // Density constant (not used in the simplified 'a ∝ r' model)

    // Retrieve original semi-major axis (in simulation AU units)
    const original_a = asteroid.originalA; 
    
    // Apply the simplified proportionality: a_new = a_orig * multiplier
    let new_a_au = original_a * radiusMultiplier;

    // Use the original eccentricity (e) and inclination (i)
    const new_e = asteroid.originalE; 

    // Update the asteroid's properties
    asteroid.a = new_a_au; // Keep in AU (scaled)
    asteroid.e = new_e;

    // Recalculate Period (T) and Mean Motion (n) from the new semi-major axis
    // Convert 'a' back to kilometers for the Kepler's 3rd Law calculation
    const new_a_km = new_a_au * AU_KM / (AU_UNITS * SIZE_MULTIPLIER); 
    const new_T_seconds = 2 * Math.PI * Math.sqrt((new_a_km ** 3) / GM_SUN);
    asteroid.period = new_T_seconds / 86400; // days
    asteroid.n = 2 * Math.PI / new_T_seconds; // rad/sec
    
    // Rebuild the visual orbit path
    rebuildOrbitForAsteroid(asteroid);
    console.log(`${asteroid.name} orbit updated by radius: a=${(new_a_km/AU_KM).toFixed(4)} AU, e=${new_e.toFixed(4)}, T=${asteroid.period.toFixed(1)} days`);
}

function updateOrbitAfterSpeedChange(asteroid, speedMultiplier) {
    const GM_sun = GM_SUN_KM3_S2;
    const original_a_km = asteroid.originalA * (AU_KM / (AU_UNITS * SIZE_MULTIPLIER));
    const original_e = asteroid.originalE;
    const r_peri_km = original_a_km * (1 - original_e);
    const v_peri_original = Math.sqrt(GM_sun * (1 + original_e) / (original_a_km * (1 - original_e)));
    const v_peri_new = v_peri_original * speedMultiplier;
    const new_a_inv = (2 / r_peri_km) - (v_peri_new ** 2 / GM_sun);
    
    let new_a_km, new_e;
    if (new_a_inv <= 0) {
        console.warn(`${asteroid.name}: Speed too high, orbit becomes hyperbolic`);
        new_a_km = original_a_km * 2;
        new_e = 0.95;
    } else {
        new_a_km = 1 / new_a_inv;
        new_e = 1 - (r_peri_km / new_a_km);
    }
    
    new_e = Math.max(0, Math.min(new_e, 0.99));
    asteroid.a = new_a_km * (AU_UNITS * SIZE_MULTIPLIER / AU_KM);
    asteroid.e = new_e;
    const new_T_seconds = 2 * Math.PI * Math.sqrt((new_a_km ** 3) / GM_sun);
    asteroid.period = new_T_seconds / 86400;
    asteroid.n = 2 * Math.PI / new_T_seconds;
    asteroid.current_v_peri = v_peri_new;
    rebuildOrbitForAsteroid(asteroid);
    console.log(`${asteroid.name} orbit updated: a=${(new_a_km/AU_KM).toFixed(4)} AU, e=${new_e.toFixed(4)}, T=${asteroid.period.toFixed(1)} days`);
}

function rebuildOrbitForAsteroid(asteroid) {
    if (asteroid.orbitLine) {
        scene.remove(asteroid.orbitLine);
        asteroid.orbitLine.geometry.dispose();
        asteroid.orbitLine.material.dispose();
    }
    
    if (!asteroid.a || asteroid.a <= 0 || isNaN(asteroid.a)) {
        console.error(`Invalid semi-major axis for ${asteroid.name}: ${asteroid.a}`);
        return;
    }
    
    const orbitPoints = [];
    const steps = 360;
    for (let M_rad = 0; M_rad <= 2 * Math.PI; M_rad += (2 * Math.PI) / steps) {
        const pos = getAsteroidPosition(
            asteroid.a, 
            asteroid.e, 
            asteroid.i, 
            asteroid.omega, 
            asteroid.Omega, 
            M_rad
        );
        orbitPoints.push(pos);
    }
    
    const orbitGeometry = new THREE.BufferGeometry().setFromPoints(orbitPoints);
    let color;
    if (asteroid.e >= 1.0) {
        color = 0xff00ff;
    } else {
        switch(asteroid.orbitType) {
            case 'apollo': color = 0xff0000; break;
            case 'amor': color = 0xff9900; break;
            case 'aten': color = 0x00ff00; break;
            case 'atira': color = 0x00ffff; break;
            default: color = 0xffffff;
        }
    }
    
    const orbitMaterial = new THREE.LineBasicMaterial({ 
        color: color, 
        transparent: true, 
        opacity: 0.6 
    });
    
    asteroid.orbitLine = new THREE.Line(orbitGeometry, orbitMaterial);
    scene.add(asteroid.orbitLine);
    
    const initialPos = getAsteroidPosition(
        asteroid.a, asteroid.e, asteroid.i, 
        asteroid.omega, asteroid.Omega, 0
    );
    asteroid.mesh.position.copy(initialPos);
    asteroid.simTime = 0;
}








// create you asteriod
// Add this function to RealSim.js
function createCustomAsteroid() {
    // 1. Define Necessary Constants (Safeguard against undefined error)
    // Note: If G, M_SUN_KG, AU_M are already defined globally, you can skip this block.
    // For safety, we define them here:
    const G = 6.6743e-11;       // Gravitational constant (m^3 kg^-1 s^-2)
    const M_SUN_KG = 1.989e30;  // Mass of Sun (kg)
    const AU_M = AU_KM * 1000;  // AU in meters (AU_KM assumed global)
    const GM = G * M_SUN_KG;    // Standard Gravitational Parameter

    // 2. Get User Inputs
    const name = document.getElementById('newAsteroidName').value || "Custom NEO";
    const orbitType = document.getElementById('newOrbitType').value;
    
    // Get direct values
    const userVelocity_kms = parseFloat(document.getElementById('newAsteroidVelocity').value);
    const userDiameter_m = parseFloat(document.getElementById('newAsteroidDiameter').value);
    
    // Input validation
    if (isNaN(userVelocity_kms) || isNaN(userDiameter_m) || userVelocity_kms <= 0 || userDiameter_m <= 0) {
        console.error("Invalid velocity or diameter input.");
        alert("Please enter valid positive numbers for Velocity and Diameter.");
        return;
    }

    // 3. Select Base Orbital Elements
    let baseElements;
    switch(orbitType) {
        // ... (Apollo, Amor, Aten, Atira baseElements logic remains here)
        case 'apollo': baseElements = { a: 1.5, e: 0.4, i_deg: 10 }; break;
        case 'amor': baseElements = { a: 2.0, e: 0.3, i_deg: 5 }; break;
        case 'aten': baseElements = { a: 0.85, e: 0.3, i_deg: 15 }; break;
        case 'atira': baseElements = { a: 0.7, e: 0.2, i_deg: 5 }; break;
        default: baseElements = { a: 1.2, e: 0.2, i_deg: 5 }; 
    }

    const orbitalData = {
        // ... (Randomization and conversion to strings for initial orbitalData remains here)
        semi_major_axis: baseElements.a.toString(),
        eccentricity: baseElements.e.toString(),
        inclination: baseElements.i_deg.toString(),
        longitude_of_ascending_node: (Math.random() * 360).toString(),
        argument_of_perihelion: (Math.random() * 360).toString(),
        mean_anomaly: (Math.random() * 360).toString(),
        orbital_period: (365.25 * Math.pow(baseElements.a, 1.5)).toString(), 
        mean_motion: (360 / (365.25 * Math.pow(baseElements.a, 1.5))).toString(),
        epoch_osculation: dateToJD(new Date("2000-01-01T12:00:00Z")).toString()
    };
    
    // 4. Create Initial Asteroid Object
    createAsteroidWithRealOrbit(
        name, 
        orbitType.toUpperCase(), 
        userDiameter_m, 
        orbitalData
    );

    const newAsteroid = allAsteroids[allAsteroids.length - 1];
    newAsteroid.semi_major_axis = parseFloat(orbitalData.semi_major_axis);
newAsteroid.eccentricity = parseFloat(orbitalData.eccentricity);

    
    // 5. Apply User Velocity (The critical step)
    
    // Calculate perihelion distance (q) of the base orbit in meters
    const a_m = parseFloat(newAsteroid.semi_major_axis) * AU_M;
    const e = parseFloat(newAsteroid.eccentricity);
    const q_m = a_m * (1 - e); // Perihelion distance in meters

    // Calculate the escape velocity at q (in km/s)
    // v_esc = sqrt(2 * GM / r)
    const v_escape_m_s = Math.sqrt(2 * GM / q_m);
    const v_escape_kms = v_escape_m_s / 1000;
    
    let finalVelocity_kms = userVelocity_kms;
    let speedMultiplier = 1.0;

    // ERROR CHECK/CLAMP: If user velocity exceeds escape velocity, it will cause NaN (negative semi-major axis)
    if (finalVelocity_kms >= v_escape_kms) {
        finalVelocity_kms = v_escape_kms * 0.999; // Clamp just below escape velocity
        alert(`Warning: Velocity clamped to ${finalVelocity_kms.toFixed(2)} km/s to prevent escape from the solar system.`);
        console.warn(`Initial velocity ${userVelocity_kms.toFixed(2)} km/s exceeded escape velocity.`);
    }

    // Now calculate the base velocity for the initial orbit (for comparison)
    // v_peri = sqrt(GM * ( (2/r) - (1/a) ))
    const v_peri_base_m_s = Math.sqrt(GM * ((2 / q_m) - (1 / a_m)));
    const v_peri_base_kms = v_peri_base_m_s / 1000;

    // Calculate the multiplier needed for the existing physics function to hit the user's desired speed
    speedMultiplier = finalVelocity_kms / v_peri_base_kms; 
    
    // Store original elements before modification (Important for any resets)
    newAsteroid.originalA = newAsteroid.a;
    newAsteroid.originalE = newAsteroid.e;
    newAsteroid.originalN = newAsteroid.n;
    newAsteroid.original_period = newAsteroid.period;
    newAsteroid.original_v_peri = newAsteroid.current_v_peri; 

    // Apply the speed law, which rebuilds the orbit using the calculated multiplier
    // This is where the old orbit elements are replaced by the new ones derived from finalVelocity_kms
    updateOrbitAfterSpeedChange(newAsteroid, speedMultiplier);
    
    newAsteroid.simTime = 0; 

    // 6. Apply Visual Diameter (Mesh Geometry)
    // Calculate radius from user's diameter
    const finalRadius = (userDiameter_m / 1000 / 2) * LENGTH_SCALE * SIZE_MULTIPLIER;
    
    newAsteroid.radius = Math.max(finalRadius, size_SIM_Aster); 
    
    if (newAsteroid.mesh.geometry) {
        newAsteroid.mesh.geometry.dispose(); 
        newAsteroid.mesh.geometry = new THREE.SphereGeometry(newAsteroid.radius, 16, 16);
    }
    
    // 7. Select the new asteroid and update the UI
    const selectElement = document.getElementById('asteroidSelect');
    if (selectElement) {
        updateAsteroidDropdown();
        selectElement.value = allAsteroids.length - 1; 
        selectElement.dispatchEvent(new Event('change')); 
    }
    
    console.log(`Custom asteroid '${name}' created. Final Velocity: ${finalVelocity_kms.toFixed(2)} km/s. Diameter: ${userDiameter_m.toFixed(0)} m.`);
}











// random hit
function createRandomHit() {
    console.log("Creating random asteroid hit...");
    


    const randomName = `Random-${Math.floor(Math.random() * 10000)}`;
    const orbitTypes = ['apollo', 'amor', 'aten', 'atira'];
    const randomOrbitType = orbitTypes[Math.floor(Math.random() * orbitTypes.length)];
    const randomVelocity = 11 + Math.random() * (72 - 11);
    const randomDiameter = 10 + Math.random() * (50 - 5);
    
    const G = 6.6743e-11;
    const M_SUN_KG = 1.989e30;
    const AU_M = AU_KM * 1000;
    const GM = G * M_SUN_KG;
    
    let baseElements;
    switch(randomOrbitType) {
        case 'apollo': baseElements = { a: 1.5, e: 0.4, i_deg: 10 }; break;
        case 'amor': baseElements = { a: 2.0, e: 0.3, i_deg: 5 }; break;
        case 'aten': baseElements = { a: 0.85, e: 0.3, i_deg: 15 }; break;
        case 'atira': baseElements = { a: 0.7, e: 0.2, i_deg: 5 }; break;
        default: baseElements = { a: 1.2, e: 0.2, i_deg: 5 }; 
    }
    
    const orbitalData = {
        semi_major_axis: baseElements.a.toString(),
        eccentricity: baseElements.e.toString(),
        inclination: baseElements.i_deg.toString(),
        longitude_of_ascending_node: (Math.random() * 360).toString(),
        argument_of_perihelion: (Math.random() * 360).toString(),
        mean_anomaly: (Math.random() * 360).toString(),
        orbital_period: (365.25 * Math.pow(baseElements.a, 1.5)).toString(),
        mean_motion: (360 / (365.25 * Math.pow(baseElements.a, 1.5))).toString(),
        epoch_osculation: dateToJD(new Date("2000-01-01T12:00:00Z")).toString()
    };
    
    createAsteroidWithRealOrbit(randomName, randomOrbitType.toUpperCase(), randomDiameter, orbitalData);
    
    const newAsteroid = allAsteroids[allAsteroids.length - 1];
    newAsteroid.semi_major_axis = parseFloat(orbitalData.semi_major_axis);
    newAsteroid.eccentricity = parseFloat(orbitalData.eccentricity);
    
    const a_m = parseFloat(newAsteroid.semi_major_axis) * AU_M;
    const e = parseFloat(newAsteroid.eccentricity);
    const q_m = a_m * (1 - e);
    const v_escape_m_s = Math.sqrt(2 * GM / q_m);
    const v_escape_kms = v_escape_m_s / 1000;
    
    let finalVelocity_kms = randomVelocity;
    if (finalVelocity_kms >= v_escape_kms) {
        finalVelocity_kms = v_escape_kms * 0.999;
    }
    
    const v_peri_base_m_s = Math.sqrt(GM * ((2 / q_m) - (1 / a_m)));
    const v_peri_base_kms = v_peri_base_m_s / 1000;
    const speedMultiplier = finalVelocity_kms / v_peri_base_kms;
    
    newAsteroid.originalA = newAsteroid.a;
    newAsteroid.originalE = newAsteroid.e;
    newAsteroid.originalN = newAsteroid.n;
    newAsteroid.original_period = newAsteroid.period;
    newAsteroid.original_v_peri = newAsteroid.current_v_peri;
    
    updateOrbitAfterSpeedChange(newAsteroid, speedMultiplier);
    newAsteroid.simTime = 0;
    
    const finalRadius = (randomDiameter / 1000 / 2) * LENGTH_SCALE * SIZE_MULTIPLIER;
    newAsteroid.radius = Math.max(finalRadius, size_SIM_Aster);
    
    if (newAsteroid.mesh.geometry) {
        newAsteroid.mesh.geometry.dispose();
        newAsteroid.mesh.geometry = new THREE.SphereGeometry(newAsteroid.radius, 16, 16);
    }
    
    const earthPos = earth.position.clone();
    const randomAngle1 = Math.random() * Math.PI * 2;
    const randomAngle2 = Math.random() * Math.PI;
const distance = (EARTH_RADIUS_KM * LENGTH_SCALE * SIZE_MULTIPLIER * 500) * 0.5; // Half of collision thresh
    const offsetX = distance * Math.sin(randomAngle2) * Math.cos(randomAngle1);
    const offsetY = distance * Math.sin(randomAngle2) * Math.sin(randomAngle1);
    const offsetZ = distance * Math.cos(randomAngle2);
    const startPos = earthPos.clone().add(new THREE.Vector3(offsetX, offsetY, offsetZ));
    newAsteroid.mesh.position.copy(startPos);
    
    const selectElement = document.getElementById('asteroidSelect');
    if (selectElement) {
        updateAsteroidDropdown();
        selectElement.value = allAsteroids.length - 1;
        selectElement.dispatchEvent(new Event('change'));
    }
    
    console.log(`Random hit: ${randomName}, ${finalVelocity_kms.toFixed(2)} km/s, ${randomDiameter.toFixed(0)}m, ${randomOrbitType}`);
    alert(`Random asteroid created!\nName: ${randomName}\nVelocity: ${finalVelocity_kms.toFixed(2)} km/s\nDiameter: ${randomDiameter.toFixed(0)}m\nType: ${randomOrbitType.toUpperCase()}`);

    // Force immediate collision check
setTimeout(() => {
    checkCollision(newAsteroid);
}, 100); // Small delay to ensure everything is set up
    
    
    
    // Immediately trigger redirect with random asteroid data
if (!hasRedirected) {
    hasRedirected = true;
    cancelAnimationFrame(animationFrameId);
    
    const realRadiusMeters = randomDiameter / 2;
    const randomLat = (Math.random() - 0.5) * 180; // -90 to 90
    const randomLon = (Math.random() - 0.5) * 360; // -180 to 180
    
    const data = {
        name: randomName,
        speed: finalVelocity_kms.toFixed(2),
        latitude: randomLat.toFixed(4),
        longitude: randomLon.toFixed(4),
        radius: realRadiusMeters.toFixed(2)
    };
    
    const params = new URLSearchParams();
    for (const key in data) {
        params.append(key, data[key]);
    }
    
    window.location.href = "LIVE_Last.html?" + params.toString();
}
}









/**
 * Updates the Moon's position orbiting the Earth.
 * @param {number} delta - Time elapsed since the last frame (in seconds).
 */
function updateMoon(delta) {
    // Accumulate simulation time for the Moon's orbit
    moon_simTime += delta * TIME_SCALE; 
    
    // Calculate the angular position (Mean Anomaly M)
    const M_moon = (MOON_N * moon_simTime) % (2 * Math.PI);
    
    // Orbital Radius in simulation units
    const moon_orbit_radius = EARTH_MOON_DISTANCE_KM * LENGTH_SCALE * SIZE_MULTIPLIER* 20; // I ADD THE 20 BEAUSE THE ISSUDE OF SCAL
    
    // Calculate Moon's position in Earth's local coordinate system
    // Using XY plane for horizontal orbit (parallel to ecliptic)
    const localX = moon_orbit_radius * Math.cos(M_moon);
    const localY = moon_orbit_radius * Math.sin(M_moon);
    const localZ = 0; // Orbit in XY plane (horizontal)
    
    // Create offset vector and add to Earth's current position
    const moonOffset = new THREE.Vector3(localX, localY, localZ);
    moon.position.copy(earth.position).add(moonOffset);
    
    // Optional: Add self-spin (tidally locked - one rotation per orbit)
    moon.rotation.y = -M_moon;
}



let animationFrameId; // Must be declared *outside* the function

function renderloop() {
    animationFrameId = requestAnimationFrame(renderloop); 
    
    // 1. Calculate delta FIRST to avoid the ReferenceError
    const delta = clock.getDelta();
    
    // 2. Update all orbiting objects
    updateEarth(delta);
    updateAllAsteroidOrbits(delta);
    updateMoon(delta); // ADD THIS LINE 
    
    if (selectedAsteroid) {
        updateAsteroidInfo();
    }

    // 3. Camera/Controls Logic
    if (cameraFollowing) {
        let target;
        if (selectedAsteroid) {
            // Follow Asteroid
            target = selectedAsteroid.mesh.position;
            const offset = new THREE.Vector3(50 * SIZE_MULTIPLIER, 30 * SIZE_MULTIPLIER, 50 * SIZE_MULTIPLIER);
            const targetPos = target.clone().add(offset);
            camera.position.lerp(targetPos, 0.1);
            controls.enabled = true; // Enable manual rotation/zoom on the asteroid
        } else {
            // Follow Earth
            target = earth.position;
            const offset = new THREE.Vector3(10 * SIZE_MULTIPLIER, 10 * SIZE_MULTIPLIER, 20 * SIZE_MULTIPLIER);
            const targetPos = target.clone().add(offset);
            camera.position.lerp(targetPos, 0.1); 
            controls.enabled = false; // Disable manual controls while following Earth
        }
        
        // Apply lookAt and controls target update once
        camera.lookAt(target);
        controls.target.copy(target);

    } else {
        // Camera NOT Following (Free Orbit Mode)
        controls.enabled = true; // Ensure manual controls are enabled
    }

    // 4. Render and Update Controls
    controls.update();
    renderer.render(scene, camera);
}
renderloop();