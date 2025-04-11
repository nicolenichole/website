import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { Sky } from 'three/examples/jsm/objects/Sky.js';


// Scene setup
const scene = new THREE.Scene();

// Increase far clipping distance to allow for the huge sky scale
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000000);
camera.position.set(-4, 14, -12);
camera.updateProjectionMatrix();

const renderer = new THREE.WebGLRenderer();

// render
renderer.setSize( window.innerWidth, window.innerHeight );
renderer.setAnimationLoop( animate );
document.body.appendChild( renderer.domElement );

// Create the sky
const sky = new Sky();
sky.scale.setScalar(450000); // Large scale to cover the scene
scene.add(sky);

// Access the sky shader uniforms
const skyUniforms = sky.material.uniforms;

// Set uniform values – adjust these parameters to get the desired look
skyUniforms['turbidity'].value = 8;
skyUniforms['rayleigh'].value = 1.5;
skyUniforms['mieCoefficient'].value = 0.005;
skyUniforms['mieDirectionalG'].value = 0.8;

// Create a vector to define the sun's position and set it using spherical coordinates
const sun = new THREE.Vector3();
const elevation = 15; // degrees
const azimuth = 180;  // degrees
const phi = THREE.MathUtils.degToRad(90 - elevation);
const theta = THREE.MathUtils.degToRad(azimuth);
sun.setFromSphericalCoords(1, phi, theta);
skyUniforms['sunPosition'].value.copy(sun);

camera.position.set(-4, 14, -12);

// adding light
const ambientLight = new THREE.AmbientLight(0xffffff, 1);  // General light with white color
scene.add(ambientLight);

const hemiLight = new THREE.HemisphereLight(0xA4DDED, 0x46624E, 3); // Sky color, ground color, intensity
scene.add(hemiLight);

// orbit
const controls = new OrbitControls( camera, renderer.domElement );
controls.enableDamping = true;
controls.target.set(-3.3, 13.5, -10);
controls.update();

// Global variables for manual camera movement
let targetCameraPosition = new THREE.Vector3();
let targetControlsTarget = new THREE.Vector3(); // Orbit Controls target
let moveCamera = false; // flag to trigger camera movement
const lerpFactor = 0.05; // adjust for speed (smaller value = slower movement)


// Clicking objects
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2(); // stores mouse coordinates in 2D vector

// Load a glTF resource
const loader = new GLTFLoader();
loader.load(
	// resource URL
	'models/gltf/cottage2.glb',
	// called when the resource is loaded
	function ( gltf ) {

		const model = gltf.scene;  // "model" is assigned to the loaded scene (root object)
        model.scale.set(1, 1, 1);  // Scale the model (optional)
        scene.add(model);  // Add the loaded model to your Three.js scene

		// Moving (Positioning) the Model
		model.position.set(0,0,0); // Set x, y, z coordinates
		

	},
	// called while loading is progressing
	function ( xhr ) {
		console.log( ( xhr.loaded / xhr.total * 100 ) + '% loaded' );

	},
	// called when loading has errors
	function ( error ) {
		console.log( 'An error happened' );

	}
	
);

// Sets up a click event to call onMouseClick whenever the user clicks
window.addEventListener('click', onMouseClick, false);

function onMouseClick(event) {
	// Convert mouse coordinates to normalized device coordinates (-1 to +1)
	mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
	mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
	
	// Set raycaster using these coordinates and the camera
	raycaster.setFromCamera(mouse, camera);
	// Intersect objects in the scene. The "true" flag is to check all descendants
	const intersects = raycaster.intersectObjects(scene.children, true);
	
	if (intersects.length > 0) {
		// Get the first (closest) intersected object
		let clickedObject = intersects[0].object;
		console.log("Clicked object:", clickedObject.name, clickedObject.userData);
		
		// Traverse upward in case the clickable identifier is on a parent
		while (clickedObject && 
			   !["welcome", "projects", "credits", "enter", "exit"].includes(clickedObject.name.toLowerCase().trim())) {
		  clickedObject = clickedObject.parent;
		}
		
		if (clickedObject) {
			const name = clickedObject.name.trim().toLowerCase();
			if (name === "welcome") {
				window.location.href = "welcome.html";
			} else if (name === "projects") {
				window.location.href = "projects.html";
			} else if (name === "credits") {
				window.location.href = "credits.html";
			} else if (name === "enter") {
				controls.enabled = false;

				// Define target camera position
				targetCameraPosition.set(-4, 15, 2);
				targetControlsTarget.set(-4, 15, 3);         // desired new target for controls
				moveCamera = true;

			} else if (name === "exit") {
				controls.enabled = false;

				// Define target camera position
				targetCameraPosition.set(-4, 14, -12);
				targetControlsTarget.set(-3.3, 13.5, -10);         // desired new target for controls
				moveCamera = true;
			}
		}
	}
}

function animate() {
    requestAnimationFrame(animate);
    
    if (controls.enabled) controls.update();
    
    if (moveCamera) {
        // Lerp camera position toward target position
        camera.position.lerp(targetCameraPosition, lerpFactor);

        // Lerp controls' target toward the new target position
        controls.target.lerp(targetControlsTarget, lerpFactor);
        
        // Optionally, call controls.update() so internal state stays in sync
        controls.update();
        
        // Check if we've nearly reached the camera's target
        if (camera.position.distanceTo(targetCameraPosition) < 0.1) {
            // Snap both camera position and controls.target to their final positions
            camera.position.copy(targetCameraPosition);
            controls.target.copy(targetControlsTarget);
            
            // Stop the movement and re-enable controls permanently
            moveCamera = false;
            controls.enabled = true;
            console.log("Camera and target reached, controls re-enabled with updated target");
        }
    }
    
    renderer.render(scene, camera);
}

