import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { plane } from 'three/examples/jsm/Addons.js';
import { distance, roughness, step, texture } from 'three/tsl';


// Main Code

// Scene
const scene = new THREE.Scene();



// Geomateries
const sphereGeo = new THREE.SphereGeometry(1, 16, 16)

// textureLoader
const textureLoader = new THREE.TextureLoader()
// const cubeTexturelLoader= new THREE.CubeTextureLoader()
// textures
const astertext = textureLoader.load('Textures/aster.jpg')

// Materials
const asteriodMaterial = new THREE.MeshBasicMaterial({
    map: astertext
})
const astriodFinal = new THREE.Mesh(sphereGeo, asteriodMaterial);
astriodFinal.scale.setScalar(2)

// light
const amlight= new THREE.AmbientLight('white', 0.8)
const pointLight = new THREE.PointLight('white', 5)

// add scene
// earth.add(moon)
scene.background= 
scene.add(astriodFinal)














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
    
    astriodFinal.rotation.y += 0.05
    // earth.position.x = Math.sin(currenTime) * 10
    // earth.position.z = Math.cos(currenTime) * 10
    
    // moon.position.x=  Math.sin(currenTime) * 2
    // moon.position.z = Math.cos(currenTime) * 2

    renderer.render(scene, camera);
    window.requestAnimationFrame(renderloop)
}
renderloop()