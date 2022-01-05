import * as THREE from 'https://threejs.org/build/three.module.js'

import { Vector3, Quaternion, Euler } from 'https://threejs.org/build/three.module.js'

var root = ''//'https://gre-v-el.github.io/RayMarching-Editor/';

import * as CONTROLS from './controls.js'

// three.js setups
var canvasHTML = document.getElementById('canvas');
var sceneThree = new THREE.Scene();
var rendererThree = new THREE.WebGLRenderer({ canvas: canvasHTML, antialias: false });
var cameraThree = new THREE.PerspectiveCamera(45, canvasHTML.clientWidth / canvasHTML.clientWidth, 1, 1000);
var clock = new THREE.Clock();
var loader = new THREE.FileLoader();

// fps view
var script = document.createElement('script');
script.onload = function () {
	var stats = new Stats();
	document.body.appendChild(stats.dom);
	requestAnimationFrame(function loop() {
		stats.update(); requestAnimationFrame(loop)
	});
};
script.src = '//mrdoob.github.io/stats.js/build/stats.min.js';
document.head.appendChild(script);

// lock pointer when moving
canvasHTML.requestPointerLock = canvasHTML.requestPointerLock ||
		canvasHTML.mozRequestPointerLock;

document.exitPointerLock = document.exitPointerLock ||
                           document.mozExitPointerLock;

// uniforms for ray marching renderer
var rmUniforms = {
	aspect: { value: cameraThree.aspect },
	camPos: { value: new Vector3(0, 0, 0) },
	depthMax: { value: 10 },
	rotation: { value: new Quaternion().setFromEuler(new Euler(0, 0, 0)) },
	lightDirection: {value: new Vector3(0.5, 0.7, 0.6)}
};

// load shaders
var vertex = '';
var fragment = '';
loader.load(root + '/shaders/fragment.glsl', function (data) { fragment = data; countLoads(); })
loader.load(root + '/shaders/vertex.glsl', function (data) { vertex = data; countLoads(); })

var loadsLeft = 2;
function countLoads() {
	loadsLeft--;
	if (loadsLeft == 0) {
		// main display setup
		var quadDisplay = new THREE.Mesh(
			new THREE.PlaneGeometry(2, 2),
			new THREE.ShaderMaterial({
				vertexShader: vertex,
				fragmentShader: fragment,
				uniforms: rmUniforms,
				depthWrite: false,
				depthTest: false
			})
		);
		sceneThree.add(quadDisplay);
	}
}

CONTROLS.init();

// vars
var camPos = new Vector3(0, 0, 2);
var camRotPitch = new Quaternion();
var camRotYaw = new Quaternion();

// consts
const moveSpeed = 1;
const mouseSensitivity = 400;

function tick() {

	var dt = clock.getDelta();

	cameraTick(dt);

	render();

	requestAnimationFrame(tick);
}

function cameraTick(dt) {

	if (CONTROLS.controls.mouseRight) {

		camRotPitch.multiply(new Quaternion().setFromEuler(new Euler(CONTROLS.controls.mouseDY / mouseSensitivity, 0, 0)));

		camRotYaw.multiply(new Quaternion().setFromEuler(new Euler(0, CONTROLS.controls.mouseDX / mouseSensitivity, 0)));


		camPos.add( new Vector3(0, 0, 1)
				.applyQuaternion(camRotPitch.clone().invert())
				.applyQuaternion(camRotYaw.clone().invert())
				.multiplyScalar(moveSpeed * dt * (CONTROLS.controls.s - CONTROLS.controls.w))
		);
		camPos.add( new Vector3(1, 0, 0)
				.applyQuaternion(camRotPitch.clone().invert())
				.applyQuaternion(camRotYaw.clone().invert())
				.multiplyScalar(moveSpeed * dt * (CONTROLS.controls.d - CONTROLS.controls.a))
		);
		camPos.add( new Vector3(0, 1, 0)
				.applyQuaternion(camRotPitch.clone().invert())
				.applyQuaternion(camRotYaw.clone().invert())
				.multiplyScalar(moveSpeed * dt * (CONTROLS.controls.e - CONTROLS.controls.q))
		);
	}

	if(CONTROLS.controls.mouseRight && !CONTROLS.prevControls.mouseRight) {
		canvasHTML.requestPointerLock();
	}
	else if(!CONTROLS.controls.mouseRight && CONTROLS.prevControls.mouseRight){
		document.exitPointerLock();
	}

	CONTROLS.update();
	rmUniforms.camPos.value = camPos;
	rmUniforms.rotation.value = camRotPitch.clone().multiply(camRotYaw);
}

function render() {

	if (canvasHTML.width !== canvasHTML.clientWidth || canvasHTML.height !== canvasHTML.clientHeight) {
		rendererThree.setSize(canvasHTML.clientWidth, canvasHTML.clientHeight, false);
		cameraThree.aspect = canvasHTML.clientWidth / canvasHTML.clientHeight;
		cameraThree.updateProjectionMatrix();
		rmUniforms.aspect.value = cameraThree.aspect;
	}
	rendererThree.render(sceneThree, cameraThree);
}

tick();