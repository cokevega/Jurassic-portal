//Assets
import './styles.css';
import importedTyranno from './assets/model/tyrannosaurus-rex/source/bawanglong.glb';
import importedTrice from './assets/model/triceratops/source/triceratops.glb';
import importedMamen from './assets/model/mamen-river-dragon/source/mamenxilong.glb';
import impGrassTexture from './assets/texture/grass/forrest_ground_01_diff_1k.jpg';
import impGrassAOTexture from './assets/texture/grass/forrest_ground_01_ao_1k.jpg';
import impGrassDisTexture from './assets/texture/grass/forrest_ground_01_disp_1k.jpg';
import impGrassNorTexture from './assets/texture/grass/forrest_ground_01_nor_1k.jpg';
import impGrassRoughnessTexture from './assets/texture/grass/forrest_ground_01_rough_1k.jpg';
import importMountain from './assets/texture/mountain1.jpg';
import importEnvMap from './assets/envMap/jurassicEnv.jpeg';
import vertexShader from './shaders/vertex.glsl';
import fragmentShader from './shaders/fragments.glsl';
import natureSound from './assets/sounds/grass-sound.mp3';
//Libraries
import * as THREE from 'three';
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { gsap } from 'gsap';

/**
 * Global scope variables
 */
var renderer, scene, camera, model, envMap, mixer, grass, mountains, light, walls, tyranno,
    trice, mamen, action, portalEffect, portalEffectCorrector, sourceBuffer, allLoaded = false,
    sceneRendered = false;
const context = new AudioContext();
const request = new XMLHttpRequest();
const textureLoader = new THREE.TextureLoader();
const clock = new THREE.Clock();
const config = {
    token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjc1OTcsInByb2plY3RJZCI6MTU3NDksInJvbGUiOjMsImlhdCI6MTYyMTI3NTA1OX0.hMsQ9RZ2VapfW4f7eR_15ROy3T2RL6k0mG0qBQG5gUk",
    mode: OnirixSDK.TrackingMode.Image
}
envMap = textureLoader.load(importEnvMap);
envMap.encoding = THREE.sRGBEncoding;
envMap.mapping = THREE.EquirectangularReflectionMapping;
const modelsMap = new Map();
const modelPositionX = 0.1,
    modelPositionY = -2,
    modelPositionZ = 0.95;
/**
 * Loading screen
 */
const loadingBarElement = document.querySelector('.loading-bar');
const loadingManager = new THREE.LoadingManager();
const gltfLoader = new GLTFLoader(loadingManager)
    //Overlay
const overlayGeometry = new THREE.PlaneGeometry(2, 2, 1, 1)
const overlayMaterial = new THREE.ShaderMaterial({
    uniforms: {
        uAlpha: { value: 1 }
    },
    vertexShader: `
        void main()
        {
            gl_Position = vec4(position, 1.0);
        }
    `,
    fragmentShader: `
    uniform float uAlpha;
        void main()
        {
            gl_FragColor = vec4(0.0, 0.0, 0.0, uAlpha);
        }
    `,
    transparent: true
});
const overlay = new THREE.Mesh(overlayGeometry, overlayMaterial);
const loadingMessage = document.querySelector('.loading-message');

/**
 * Utilities
 */
//Load all models
function loadModels() {
    loadingManager.onProgress = (itemUrl, itemsLoaded, itemsTotal) => {
        const progressRatio = itemsLoaded / itemsTotal / 3;
        loadingBarElement.style.transform = `scaleX(${progressRatio})`;
    }
    gltfLoader.load(
        importedTyranno,
        (gltf) => {
            gltf.scene.scale.set(0.18, 0.18, 0.18);
            gltf.scene.position.set(modelPositionX, modelPositionY, modelPositionZ);
            gltf.scene.rotation.set(-0.5 * Math.PI, -0.3 * Math.PI, 0);
            gltf.scene.traverse((child) => {
                if (child instanceof THREE.Mesh) {
                    child.material.envMap = envMap;
                    child.castShadow = true;
                    child.material.envMapIntensity = 0.2;
                    child.material.needsUpdate = true;
                    child.material.map.encoding = THREE.sRGBEncoding;
                }
            });
            tyranno = gltf;
            modelsMap.set('23689972b9e14816bfd742dd9c6427e8', tyranno);
            loadingManager.onProgress = (itemUrl, itemsLoaded, itemsTotal) => {
                const progressRatio = itemsLoaded / itemsTotal / 3 + 1 / 3;
                loadingBarElement.style.transform = `scaleX(${progressRatio})`;
            }
            gltfLoader.load(
                importedTrice,
                (gltf) => {
                    gltf.scene.scale.set(0.25, 0.25, 0.25);
                    gltf.scene.position.set(modelPositionX, modelPositionY, modelPositionZ);
                    gltf.scene.rotation.set(-0.5 * Math.PI, -0.3 * Math.PI, 0);
                    gltf.scene.traverse((child) => {
                        if (child instanceof THREE.Mesh) {
                            child.material.envMap = envMap;
                            child.castShadow = true;
                            child.material.envMapIntensity = 0.15;
                            child.material.needsUpdate = true;
                            child.material.map.encoding = THREE.sRGBEncoding;
                        }
                    });
                    trice = gltf;
                    modelsMap.set('9958e7563ca24a1abd8d44f66e348a1a', trice);
                    loadingManager.onLoad = () => {
                        loadingMessage.style.display = "none";
                        window.setTimeout(() => {
                            gsap.to(overlayMaterial.uniforms.uAlpha, {
                                duration: 3,
                                value: 0,
                                delay: 1,
                                onComplete: () => {
                                    scene.remove(overlay);
                                }
                            });
                            loadingBarElement.classList.add('ended');
                            loadingBarElement.style.transform = '';
                            allLoaded = true;
                        }, 500);
                    };
                    loadingManager.onProgress = (itemUrl, itemsLoaded, itemsTotal) => {
                        const progressRatio = itemsLoaded / itemsTotal / 3 + 2 / 3;
                        loadingBarElement.style.transform = `scaleX(${progressRatio})`;
                    }
                    gltfLoader.load(
                        importedMamen,
                        (gltf) => {
                            gltf.scene.scale.set(0.12, 0.15, 0.15);
                            gltf.scene.position.set(modelPositionX, modelPositionY, modelPositionZ - 0.12);
                            gltf.scene.rotation.set(-0.5 * Math.PI, -0.35 * Math.PI, 0);
                            gltf.scene.traverse((child) => {
                                if (child instanceof THREE.Mesh) {
                                    child.castShadow = true;
                                    child.material.envMap = envMap;
                                    child.material.envMapIntensity = 0.2;
                                    child.material.needsUpdate = true;
                                    child.material.map.encoding = THREE.sRGBEncoding;
                                }
                            });
                            gltf.scene.castShadow = true;
                            mamen = gltf;
                            modelsMap.set('b40c017062bb48c9a39e8d0aed9b2f1d', mamen);
                        }
                    );
                }
            );
        }
    );
}
//Add corresponding model
const addModel = (id) => {
        model = modelsMap.get(id);
        mixer = new THREE.AnimationMixer(model.scene);
        action = mixer.clipAction(model.animations[0]);
        action.play();
        scene.add(model.scene);
    }
    //Grass texture treatment
const textureTreatment = (texture) => {
        texture.wrapS = THREE.RepeatWrapping;
        texture.wrapT = THREE.RepeatWrapping;
        texture.repeat.x = 10;
        texture.repeat.y = 6;
    }
    //Load grass
const loadGrass = () => {
        //Texture
        const grassTexture = textureLoader.load(
            impGrassTexture,
            (grassTexture) => {
                textureTreatment(grassTexture);
            }
        );
        grassTexture.encoding = THREE.sRGBEncoding;
        const grassAOTexture = textureLoader.load(
            impGrassAOTexture,
            (grassAOTexture) => {
                textureTreatment(grassAOTexture);
            }
        );
        const grassDisplacementTexture = textureLoader.load(
            impGrassDisTexture,
            (grassDisplacementTexture) => {
                textureTreatment(grassDisplacementTexture);
            }
        );
        const grassNormalScaleTexture = textureLoader.load(
            impGrassNorTexture,
            (grassNormalScaleTexture) => {
                textureTreatment(grassNormalScaleTexture);
            }
        );
        const grassRoughnessTexture = textureLoader.load(
            impGrassRoughnessTexture,
            (grassRoughnessTexture) => {
                textureTreatment(grassRoughnessTexture);
            }
        );
        //Component
        const grassMaterial = new THREE.MeshStandardMaterial({
            map: grassTexture,
            aoMap: grassAOTexture,
            normalScale: grassNormalScaleTexture,
            roughness: grassRoughnessTexture,
            displacementMap: grassDisplacementTexture,
            displacementScale: 0.1
        });
        const grassGeometry = new THREE.PlaneGeometry(10, 10, 1000, 1000);
        grass = new THREE.Mesh(grassGeometry, grassMaterial);
        grass.position.y = -5.1;
        grass.rotation.x = 1.1 * Math.PI;
        grass.receiveShadow = true;
        grassGeometry.dispose();
    }
    //Load mountains
const loadMountains = () => {
        //Texture
        const mountainsTexture = textureLoader.load(
            importMountain
        );
        mountainsTexture.encoding = THREE.sRGBEncoding;
        //Component
        const mountainsMaterial = new THREE.MeshBasicMaterial({
            map: mountainsTexture,
        });
        const mountainsGeometry = new THREE.PlaneGeometry(10, 5);
        mountains = new THREE.Mesh(mountainsGeometry, mountainsMaterial);
        mountains.position.y = -3.5;
        mountains.position.z = -1.7;
        mountains.rotation.x = 1.5 * Math.PI;
        mountainsGeometry.dispose();
    }
    //Instantiate walls
function createWall(width, height, x, z) {
    const geometry = new THREE.PlaneGeometry(width, height);
    const material = new THREE.MeshBasicMaterial({
        color: 'pink',
        colorWrite: false
    });
    let wall = new THREE.Mesh(geometry, material);
    wall.position.x = x;
    wall.position.z = z;
    wall.rotation.x = -0.5 * Math.PI;
    wall.material.side = THREE.DoubleSide;
    walls.add(wall);
    geometry.dispose();
}
//Load walls
const loadWalls = () => {
    walls = new THREE.Group();
    //Left
    createWall(10, 1.5, -5.6, 0);
    //Right
    createWall(10, 1.5, 5.6, 0);
    //Above
    createWall(10, 10, 0, -5.6);
    //Bottom
    createWall(10, 10, 0, 5.6);
}

//Onirix SDK
function setupRenderer(rendererCanvas) {
    const width = rendererCanvas.width;
    const height = rendererCanvas.height;
    // Initialize renderer with rendererCanvas provided by Onirix SDK
    renderer = new THREE.WebGLRenderer({ canvas: rendererCanvas, alpha: true });
    renderer.setClearColor(0x000000, 0);
    renderer.setSize(width, height);
    renderer.outputEncoding = THREE.sRGBEncoding;
    renderer.physicallyCorrectLights = true;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    // Ask Onirix SDK for camera parameters to create a 3D camera that fits with the AR projection.
    const cameraParams = OX.getCameraParameters();
    camera = new THREE.PerspectiveCamera(cameraParams.fov, cameraParams.aspect, 0.1, 1000);
    camera.matrixAutoUpdate = false;
    // Add some lights
    const ambientLight = new THREE.AmbientLight(0xcccccc, 1);
    scene.add(ambientLight);
    light = new THREE.DirectionalLight('#ffffff', 6);
    light.position.x = 0.5;
    light.position.y = 2;
    light.position.z = -1;
    light.castShadow = true;
    scene.add(light);
}

function updatePose(pose) {
    // When a new pose is detected, update the 3D camera
    let modelViewMatrix = new THREE.Matrix4();
    modelViewMatrix = modelViewMatrix.fromArray(pose);
    camera.matrix = modelViewMatrix;
    camera.matrixWorldNeedsUpdate = true;
}

function onResize() {
    // When device orientation changes, it is required to update camera params.
    const width = renderer.domElement.width;
    const height = renderer.domElement.height;
    const cameraParams = OX.getCameraParameters();
    camera.fov = cameraParams.fov;
    camera.aspect = cameraParams.aspect;
    camera.updateProjectionMatrix();
    renderer.setSize(width, height);
}

function render() {
    // Just render the scene
    renderer.render(scene, camera);
}

function renderLoop() {
    const deltaTime = clock.getDelta();
    const elapsedTime = clock.getElapsedTime();
    if (portalEffect) {
        portalEffect.material.uniforms.uTime.value = elapsedTime;
    }
    if (mixer) mixer.update(deltaTime);
    renderer.physicallyCorrectLights = true;
    render();
    requestAnimationFrame(() => renderLoop());
}

const loadPortalEffect = () => {
    //Portal effect
    const geometry = new THREE.CircleBufferGeometry(0.6, 64);
    const material = new THREE.ShaderMaterial({
        vertexShader,
        fragmentShader,
        uniforms: {
            uTime: { value: 0 }
        },
        transparent: true
    });
    portalEffect = new THREE.Mesh(geometry, material);
    portalEffect.rotation.x = -0.5 * Math.PI;
    geometry.dispose();
    //Portal effect corrector
    const correctorGeometry = new THREE.TorusGeometry(0.8, 0.2, 128, 128);
    const correctorMaterial = new THREE.MeshBasicMaterial({
        color: 'pink',
        colorWrite: false
    });
    portalEffectCorrector = new THREE.Mesh(correctorGeometry, correctorMaterial);
    portalEffectCorrector.rotation.x = -0.5 * Math.PI;
}

const loadSound = () => {
    request.open('GET', natureSound, true);
    request.responseType = 'arraybuffer';
    request.onload = () => {
        let undecodedAudio = request.response;
        context.decodeAudioData(undecodedAudio, (buffer) => {
            sourceBuffer = context.createBufferSource();
            sourceBuffer.buffer = buffer;
            sourceBuffer.connect(context.destination);
            sourceBuffer.start(context.currentTime);
            context.suspend();
        });
    }
    request.send();
}

OX.init(config).then(rendererCanvas => {
    // Create an empty scene
    scene = new THREE.Scene();
    //Load all models
    scene.add(overlay);
    //Load all content
    loadModels();
    loadPortalEffect();
    loadSound();
    loadWalls();
    loadGrass();
    loadMountains();
    // Setup ThreeJS renderer
    setupRenderer(rendererCanvas);
    // Initialize render loop
    renderLoop();
    OX.subscribe(OnirixSDK.Events.OnDetected, function(id) {
        if (allLoaded) {
            console.log("Detected Image: " + id);
            // Diplay 3D model
            scene.add(portalEffect);
            scene.add(portalEffectCorrector);
            scene.add(walls);
            scene.add(grass);
            scene.add(mountains);
            addModel(id);
            context.resume();
            // It is useful to synchronize scene background with the camera feed
            scene.background = new THREE.VideoTexture(OX.getCameraFeed());
            sceneRendered = true;
        }
    });
    OX.subscribe(OnirixSDK.Events.OnPose, function(pose) {
        updatePose(pose);
    });
    OX.subscribe(OnirixSDK.Events.OnLost, function(id) {
        if (allLoaded && sceneRendered) {
            console.log("Lost Image: " + id);
            // Hide 3D model
            scene.remove(portalEffect);
            scene.remove(portalEffectCorrector);
            scene.remove(model.scene);
            scene.remove(grass);
            scene.remove(mountains);
            scene.remove(walls);
            context.suspend();
            scene.background = null;
        }
    });
    OX.subscribe(OnirixSDK.Events.OnResize, function() {
        onResize();
    });
}).catch((error) => {
    console.log(error);
});