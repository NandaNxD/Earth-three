import * as THREE from 'three'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'
import GUI from 'lil-gui'
import earthVertexShader from './shaders/earth/vertex.glsl'
import earthFragmentShader from './shaders/earth/fragment.glsl'
import atmosphereVertexShader from './shaders/atmosphere/vertex.glsl'
import atmosphereFragmentShader from './shaders/atmosphere/fragment.glsl'
import loaderVertexShader from './shaders/loader/vertex.glsl'
import loaderFragmentShader from './shaders/loader/fragment.glsl'
import gsap from "gsap";

/**
 * Base
 */
// Debug
const gui = new GUI()

gui.close();
gui.hide();

// Text Element
const domTextContent=document.getElementById('non-gl-content-container');

console.log(domTextContent)

// Loader Dom Element
const loaderEl=document.querySelector('.loader');

// Canvas
const canvas = document.querySelector('canvas.webgl')

// Scene
const scene = new THREE.Scene()


// Overlay
const overlayGeometry=new THREE.PlaneGeometry(2,2,1,1);
const overlayMaterial=new THREE.ShaderMaterial({
    transparent:true,
    vertexShader:loaderVertexShader,
    fragmentShader:loaderFragmentShader,
    uniforms:{
        uAlpha:new THREE.Uniform(1)
    }
});
const overlayMesh=new THREE.Mesh(overlayGeometry,overlayMaterial);

scene.add(overlayMesh);


// Loaders
const textureLoader = new THREE.TextureLoader()

const earthDayTexture=textureLoader.load('./earth/day.jpg')
earthDayTexture.colorSpace=THREE.SRGBColorSpace;
earthDayTexture.anisotropy=8;

const earthNightTexture=textureLoader.load('./earth/night.jpg')
earthNightTexture.colorSpace=THREE.SRGBColorSpace;
earthNightTexture.anisotropy=8;

const earthSpecularCloudsTexture=textureLoader.load('./earth/specularClouds.jpg');
earthSpecularCloudsTexture.anisotropy=8;

textureLoader.manager.onLoad=()=>{

    gsap.to(overlayMaterial.uniforms.uAlpha,{value:0,duration:1})
   
    loaderEl.classList.add('hide');
    
    setTimeout(()=>{
        domTextContent.classList.remove('hide');
        gui.show();
    },500)
    
}

textureLoader.manager.onProgress=(url, loaded, total)=>{
    loaderEl.style.transform=`scaleX(${(loaded/total)})`;
}

/**
 * Earth
 */
const earthParameters={}

earthParameters.atmosphereDayColor='#00aaff';
earthParameters.atmosphereTwilightColor='#ff6600';


// Mesh

const earthGeometry = new THREE.SphereGeometry(2, 64, 64)
const earthMaterial = new THREE.ShaderMaterial({
    vertexShader: earthVertexShader,
    fragmentShader: earthFragmentShader,
    uniforms:
    {
        uDayTexture:new THREE.Uniform(earthDayTexture),
        uNightTexture:new THREE.Uniform(earthNightTexture),
        uSpecularCloudTexture:new THREE.Uniform(earthSpecularCloudsTexture),
        uSunDirection:new THREE.Uniform(new THREE.Vector3(0,0,1)),
        uAtmosphereDayColor:new THREE.Uniform(new THREE.Color(earthParameters.atmosphereDayColor)),
        uAtmosphereTwilightColor:new THREE.Uniform(new THREE.Color(earthParameters.atmosphereTwilightColor)),
    }
})
const earth = new THREE.Mesh(earthGeometry, earthMaterial)
scene.add(earth);

/**
 * Atmosphere
 */

const atmosphereMaterial=new THREE.ShaderMaterial({
    transparent:true,
    side:THREE.BackSide,
    vertexShader:atmosphereVertexShader,
    fragmentShader:atmosphereFragmentShader,
    uniforms:
    {
        uSunDirection:new THREE.Uniform(new THREE.Vector3(0,0,1)),
        uAtmosphereDayColor:new THREE.Uniform(new THREE.Color(earthParameters.atmosphereDayColor)),
        uAtmosphereTwilightColor:new THREE.Uniform(new THREE.Color(earthParameters.atmosphereTwilightColor)),
    }
});

const atmosphere=new THREE.Mesh(earthGeometry,atmosphereMaterial);

atmosphere.scale.set(1.04,1.04,1.04);

scene.add(atmosphere);


gui.addColor(earthParameters,'atmosphereDayColor').onChange(()=>{
    earthMaterial.uniforms.uAtmosphereDayColor.value.set(earthParameters.atmosphereDayColor);
    atmosphereMaterial.uniforms.uAtmosphereDayColor.value.set(earthParameters.atmosphereDayColor);
})

gui.addColor(earthParameters,'atmosphereTwilightColor').onChange(()=>{
    earthMaterial.uniforms.uAtmosphereTwilightColor.value.set(earthParameters.atmosphereTwilightColor);
    atmosphereMaterial.uniforms.uAtmosphereTwilightColor.value.set(earthParameters.atmosphereTwilightColor);
})


/**
 * Sun
 */

const sunSpherical=new THREE.Spherical(1,Math.PI*0.5,0.5);
const sunDirection=new THREE.Vector3();


const debugSun=new THREE.Mesh(new THREE.IcosahedronGeometry(0.1,2),new THREE.MeshBasicMaterial());
// scene.add(debugSun);

const updateSun=()=>{
    sunDirection.setFromSpherical(sunSpherical);
    earthMaterial.uniforms.uSunDirection.value.copy(sunDirection);
    atmosphereMaterial.uniforms.uSunDirection.value.copy(sunDirection);

    debugSun.position.copy(sunDirection).multiplyScalar(5);
}

sunSpherical.theta=-0.87;


updateSun();

gui.add(sunSpherical,'phi').min(0).max(Math.PI).onChange(updateSun);
gui.add(sunSpherical,'theta').min(-Math.PI).max(Math.PI).onChange(updateSun);



/**
 * Sizes
 */
const sizes = {
    width: window.innerWidth,
    height: window.innerHeight,
    pixelRatio: Math.min(window.devicePixelRatio, 2)
}

window.addEventListener('resize', () =>
{
    // Update sizes
    sizes.width = window.innerWidth
    sizes.height = window.innerHeight
    sizes.pixelRatio = Math.min(window.devicePixelRatio, 2)

    // Update camera
    camera.aspect = sizes.width / sizes.height
    camera.updateProjectionMatrix()

    // Update renderer
    renderer.setSize(sizes.width, sizes.height)
    renderer.setPixelRatio(sizes.pixelRatio)
})

/**
 * Camera
 */
// Base camera
const camera = new THREE.PerspectiveCamera(25, sizes.width / sizes.height, 0.1, 100)
camera.position.x = 7
camera.position.y = 5
camera.position.z = 4

scene.add(camera)

// Controls
const controls = new OrbitControls(camera, canvas)
// controls.enableZoom=false;
controls.enableDamping = true

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    antialias: true
})
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(sizes.pixelRatio)
renderer.setClearColor('#000011')



/**
 * Animate
 */
const clock = new THREE.Clock()

const tick = () =>
{
    const elapsedTime = clock.getElapsedTime()

    earth.rotation.y = elapsedTime * 0.1

    // Update controls
    controls.update()

    // Render
    renderer.render(scene, camera)

    // Call tick again on the next frame
    window.requestAnimationFrame(tick)
}

tick()