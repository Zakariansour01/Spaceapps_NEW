import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { roughness, step } from 'three/tsl';
console.log(OrbitControls)

// new pane = new Pane()

// Scene
const scene = new THREE.Scene();

// ---
// Object
const cubeGeometry = new THREE.BoxGeometry(1, 1, 1, 5, 5);
const Geonew = new THREE.TorusKnotGeometry(0.5, .15, 100, 16)
const Geonewshp = new THREE.SphereGeometry(1)

// const cubeGeometry = new THREE.SphereGeometry(0.5, 16, 16);
// const cubeGeometry = new THREE.TorusKnotGeometry(  10, 3, 100, 16 );
// const cubeMaterial = new THREE.MeshBasicMaterial({
//   color: "darkviolet",
//   transparent: true,
//   wireframe: false,
//   opacity: 0.5
  
// });
// cubeMaterial.color= new THREE.Color('Blue')
// const cubeMaterial_text = new THREE.MeshBasicMaterial()



// Textures but because the roughness is not working.
const textureLoader = new THREE.TextureLoader()
const textureTest = textureLoader.load('Textures/metal-compartments-bl/metal-compartments-bl/metal-compartments_albedo.png');
const textureTest_roughness = textureLoader.load('Textures/metal-compartments-bl/metal-compartments-bl/metal-compartments_roughness.png')
const textureTest_noraml = textureLoader.load('Textures/metal-compartments-bl/metal-compartments-bl/metal-compartments_normal-ogl.png')
const textureTest_ao = textureLoader.load('Textures/metal-compartments-bl/metal-compartments-bl/metal-compartments_ao.png')


const cubeMaterial_text = new THREE.MeshStandardMaterial({
  normalMap: textureTest_noraml,
  roughnessMap: textureTest_roughness,

});

const uv2 = new THREE.BufferAttribute(cubeGeometry.attributes.uv.array, 2)
cubeGeometry.setAttribute('uv2', uv2)
cubeMaterial_text.aoMap = textureTest_ao

const cubeMaterial = new THREE.MeshStandardMaterial()
const matericalshine = new THREE.MeshPhongMaterial({
  specular: 0xffffff,
  shininess: 90,
  reflectivity: 0.1
    
})
// Correct usage
const material_2 = new THREE.MeshStandardMaterial({
  color: 0xffffff,  // white
  roughness: 0.1,   // between 0.0 (shiny) and 1.0 (rough)
  metalness: 0.5  // optional, between 0.0 and 1.0
  
});
const material_3 = new THREE.MeshPhysicalMaterial({
  color: 0xffffff,
  roughness: 0.3,
  metalness: 0.8,

  // Clearcoat layer
  clearcoat: 1.0,        // range: 0.0 → 1.0 (strength of the coating)

});


const cubeMesh = new THREE.Mesh(cubeGeometry, cubeMaterial_text);
const cubeMesh2 = new THREE.Mesh(cubeGeometry, cubeMaterial_text);
const cubeMesh3 = new THREE.Mesh(cubeGeometry, cubeMaterial_text);
const complexGeo = new THREE.Mesh(Geonew, matericalshine)
const complexGeoshphere = new THREE.Mesh(Geonewshp, cubeMaterial_text)
const planGeo = new THREE.PlaneGeometry(1, 1)
const materialForPlane = new THREE.MeshBasicMaterial()
const plane = new THREE.Mesh(planGeo, materialForPlane)
plane.position.z = 1;
cubeMesh3.position.z = 5
complexGeo.position.y = 3
complexGeoshphere.position.z=3




const group = new THREE.Group();
group.add(cubeMesh)
group.add(cubeMesh2)
group.add(cubeMesh3)
group.add(complexGeo)
group.add(complexGeoshphere)
group.add(plane)

scene.add(group)
scene.add(cubeMesh);


const temVector = new THREE.Vector3(0, 1, 0) 
cubeMesh.position.copy(temVector)
cubeMesh.position.x = 3


const axisHelper = new THREE.AxesHelper(5)
// cubeMesh2.add(axisHelper)
scene.add(axisHelper)



// ---

// colors
// materialForPlane.side = THREE.DoubleSide 
// // materialForPlane.side = THREE.FrontSide
// materialForPlane.color=new THREE.Color('red')
// materialForPlane.opacity = 0.3;

// const fog = new THREE.Fog('white', 1, 10)
// scene.fog = fog
// // cubeMaterial.fog = false
scene.background = new THREE.Color('black')



const light = new THREE.AmbientLight('white', 1)
scene.add(light)

const pointLight = new THREE.PointLight('white', 20)
pointLight.position.set(1, 3, 1)
scene.add(pointLight)

// pane.addInput(matericalshine, 'Shineiness', {
//   min: 0,
//   max: 100,
//   step: 1
// })
matericalshine.color = new THREE.Color('darkviolet')
material_2.color= new THREE.Color('green')



// ---
// Scale
cubeMesh.scale.set(0, 2, 3)
cubeMesh.scale.x = 3


// rotation
cubeMesh.rotation.reorder('YXZ')
cubeMesh2.rotation.x = Math.PI * 0.25
cubeMesh2.rotation.x = THREE.MathUtils.degToRad(90)


// ---
// Camera
const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  300
);
camera.position.z = 12
camera.position.y = 3
camera.position.x = -3


// console.log(cubeMesh.position.distanceTo(camera.position))

// const aspectratio = window.innerWidth / window.innerHeight;

// const camera = new THREE.OrthographicCamera(
//   -1*aspectratio,
//   1*aspectratio,
//   1,
//   -1,
//   0.1,
//   100
// )
// camera.position.z = 5;


// ---
// Custom object (buffer Geomatery)

// const vertices = new Float32Array([
//   0, 0, 0,
//   0, 2, 0,
//   2, 0, 0 
// ])

// const bufferAttt = new THREE.BufferAttribute(vertices, 3)
// const geometry = new THREE.BufferGeometry()
// geometry.setAttribute('position', bufferAttt)
// const cubeMesh = new THREE.Mesh(geometry, cubeMaterial);
// scene.add(cubeMesh);


// ---
// Renderer
const canvas = document.querySelector('canvas.threejs'); // ✅ FIXED
const renderer = new THREE.WebGLRenderer({
  canvas: canvas,
  antialias: true
});
renderer.setSize(window.innerWidth, window.innerHeight);

// const maxPix= Math.min(window.devicePixelRatio, 2)
// renderer.setPixelRatio(maxPix)

// controls
const controls = new OrbitControls(camera, canvas)
controls.enableDamping = true
controls.autoRotate = true

window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
})

// ---



// texture

textureTest.repeat.set(5, 5)
textureTest.wrapS = THREE.RepeatWrapping
textureTest.wrapT = THREE.RepeatWrapping



// cubeMaterial_text.color= new THREE.Color('red')
// ---





// clock
const clock = new THREE.Clock()
let prevTime = 0


// scene
const renderloop = () => {

  // group.children.forEach((child) => {
  //   if (child instanceof THREE.Mesh) {
  //     child.rotation.y += 0.1
  //   }
  // })


  const currenTime = clock.getElapsedTime()
  const delta = currenTime - prevTime
  prevTime = currenTime
  cubeMesh3.scale.x = Math.sin(currenTime)
  
  cubeMesh.rotation.y += THREE.MathUtils.degToRad(1) * delta * 50

  controls.update()
  renderer.render(scene, camera);
  window.requestAnimationFrame(renderloop)
}
renderloop()

