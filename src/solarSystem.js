import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { plane } from 'three/examples/jsm/Addons.js';
import { distance, roughness, step, texture } from 'three/tsl';
console.log(OrbitControls)

// Main Code

// Scene
const scene = new THREE.Scene();
// maths
const xecl = -0.9591730229790553;
const yecl =  0.25309696040000407;
const zecl = -2.5819454116667943e-7;
const AU_TO_UNIT = 1;





// Geomateries
const sphereGeo = new THREE.SphereGeometry(1, 64, 64)

// textureLoader
const textureLoader = new THREE.TextureLoader()
const cubeTexturelLoader= new THREE.CubeTextureLoader()
// textures
const sunTexture = textureLoader.load('Textures/sun.png')
const earthTexture = textureLoader.load('Textures/earth.jpg')
const marsTexture = textureLoader.load('Textures/mars.jpg')

cubeTexturelLoader.setPath('Textures/cubeMap')
const backgroundCube = cubeTexturelLoader.load( [
	'px.png', 'nx.png',
	'py.png', 'ny.png',
	'pz.png', 'nz.png'
]);








// Materials
const sunMaterial = new THREE.MeshBasicMaterial({
    map: sunTexture
})
const earthMaterial = new THREE.MeshStandardMaterial({
    map: earthTexture
})
const marsMaterial = new THREE.MeshStandardMaterial({
    map: marsTexture
})
const moonmaterial = new THREE.MeshStandardMaterial({
    color: 'Gray'
})
// final Geo
const sun = new THREE.Mesh(sphereGeo, sunMaterial)
sun.scale.setScalar(5)

// const earth = new THREE.Mesh(sphereGeo, earthMaterial)
// earth.position.x = 10

// // Moon
// const moonMaterical = new THREE.MeshBasicMaterial({
//     color: 'gray'
// })
// const moon= new THREE.Mesh(sphereGeo, moonMaterical)
// moon.scale.setScalar(0.5)
// moon.position.x = 2













const planets = [
    {
        name: 'Earth',
        radius: 1,
        distance: 20,
        speed: 0.005,
        material: earthMaterial,
        moons: [
            {
                name: 'Moon',
                radius: 0.3,
                distance: 3,
                speed: .015
            }
        ]
    },
    {
        name: 'Mars',
        radius: 2,
        distance: 30,
        speed: 0.01,
        material: marsMaterial,
        moons: [
            {
                name: 'phobos',
                radius: 0.1,
                distance: 2,
                speed: .002
            }
        ]
    }
];






const createPlanet = (planet) => {
    const planetMesh = new THREE.Mesh(sphereGeo, planet.material)
    planetMesh.scale.setScalar(planet.radius)
    planetMesh.position.x = planet.distance
    return planetMesh
}
const createMoon = (moon) => {
        const moonMesh = new THREE.Mesh(
        sphereGeo,
        moonmaterial
    )
        moonMesh.scale.setScalar(moon.radius)
    moonMesh.position.x = moon.distance
    return moonMesh
}

const planetMeshes = planets.map((planet) => {

    const planetMesh = createPlanet(planet)
    scene.add(planetMesh)

    planet.moons.forEach(moon => {
        const moonMesh = createMoon(moon)
        planetMesh.add(moonMesh)
    });
    return planetMesh
})


// math









// light
const amlight= new THREE.AmbientLight('white', 1)

const pointLight= new THREE.PointLight('white', 5)
// add scene
// earth.add(moon)
scene.add(sun, pointLight, amlight)

scene.background = new THREE.Color(0x000000)












// Camera
const camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    300
);
camera.position.z = 12



const canvas = document.querySelector('canvas.threejs'); // ✅ FIXED
const renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    antialias: true
});
renderer.setSize(window.innerWidth, window.innerHeight);

const controls = new OrbitControls(camera, canvas)
controls.enableDamping = true
controls.autoRotate = true

window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
})


// clock
// const clock = new THREE.Clock()
// let prevTime = 0
// Scene
const renderloop = () => {
    // const currenTime = clock.getElapsedTime()
    
    // earth.rotation.y += 0.05
    // earth.position.x = Math.sin(currenTime) * 10
    // earth.position.z = Math.cos(currenTime) * 10
    
    // moon.position.x=  Math.sin(currenTime) * 2
    // moon.position.z = Math.cos(currenTime) * 2


    planetMeshes.forEach((planet, planetIndex) => {
        planet.rotation.y += planets[planetIndex].speed
        planet.position.x = Math.sin(planet.rotation.y) * planets[planetIndex].distance
        planet.position.z = Math.cos(planet.rotation.y) * planets[planetIndex].distance
        planet.children.forEach((moon, moonIndex) => {
            moon.rotation.y += planets[planetIndex].moons[moonIndex].speed
            moon.position.x = Math.sin(moon.rotation.y) * planets[planetIndex].moons[moonIndex].distance
            moon.position.z = Math.cos(moon.rotation.y) * planets[planetIndex].moons[moonIndex].distance
        })
    });
    
    renderer.render(scene, camera);
    window.requestAnimationFrame(renderloop)
}
renderloop()