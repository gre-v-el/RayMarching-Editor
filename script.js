var root = 'https://gre-v-el.github.io/RayMarching-Editor/';

loader = new THREE.FileLoader();


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
THREESCENE.canvas.requestPointerLock = THREESCENE.canvas.requestPointerLock ||
THREESCENE.canvas.mozRequestPointerLock;

document.exitPointerLock = document.exitPointerLock ||
                           document.mozExitPointerLock;

// uniforms for ray marching renderer
var rmUniforms = {
	aspect: { value: THREESCENE.camera.aspect },
	camPos: { value: new THREE.Vector3(0, 0, 0) },
	depthMax: { value: 10 },
	rotation: { value: new THREE.Quaternion().setFromEuler(new THREE.Euler(0, 0, 0)) },
	lightDirection: {value: new THREE.Vector3(0.5, 0.7, 0.6)}
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
		THREESCENE.scene.add(quadDisplay);
	}
}


// vars
var camPos = new THREE.Vector3(0, 0, 2);
var camRotPitch = new THREE.Quaternion();
var camRotYaw = new THREE.Quaternion();

// consts
const moveSpeed = 1;
const mouseSensitivity = 400;

function tick() {


	var dt = THREESCENE.clock.getDelta();

	cameraTick(dt);

	render();

	requestAnimationFrame(tick);
}

function cameraTick(dt) {

	if (CONTROLS.controls.mouseRight) {

		camRotPitch.multiply(new THREE.Quaternion().setFromEuler(new THREE.Euler(CONTROLS.controls.mouseDY / mouseSensitivity, 0, 0)));

		camRotYaw.multiply(new THREE.Quaternion().setFromEuler(new THREE.Euler(0, CONTROLS.controls.mouseDX / mouseSensitivity, 0)));



		camPos.add( new THREE.Vector3(0, 0, 1)
				.applyQuaternion(camRotPitch.clone().invert())
				.applyQuaternion(camRotYaw.clone().invert())
				.multiplyScalar(moveSpeed * dt * (CONTROLS.controls.keys.KeyS - CONTROLS.controls.keys.KeyW))
		);
		camPos.add( new THREE.Vector3(1, 0, 0)
				.applyQuaternion(camRotPitch.clone().invert())
				.applyQuaternion(camRotYaw.clone().invert())
				.multiplyScalar(moveSpeed * dt * (CONTROLS.controls.keys.KeyD - CONTROLS.controls.keys.KeyA))
		);
		camPos.add( new THREE.Vector3(0, 1, 0)
				.applyQuaternion(camRotPitch.clone().invert())
				.applyQuaternion(camRotYaw.clone().invert())
				.multiplyScalar(moveSpeed * dt * (CONTROLS.controls.keys.KeyE - CONTROLS.controls.keys.KeyQ))
		);
	}

	if(CONTROLS.controls.mouseRight && !CONTROLS.prevControls.mouseRight) {
		THREESCENE.canvas.requestPointerLock();
	}
	else if(!CONTROLS.controls.mouseRight && CONTROLS.prevControls.mouseRight){
		document.exitPointerLock();
	}

	CONTROLS.update();
	rmUniforms.camPos.value = camPos;
	rmUniforms.rotation.value = camRotPitch.clone().multiply(camRotYaw);
}

function render() {

	if (THREESCENE.canvas.width !== THREESCENE.canvas.clientWidth || THREESCENE.canvas.height !== THREESCENE.canvas.clientHeight) {
		THREESCENE.renderer.setSize(THREESCENE.canvas.clientWidth, THREESCENE.canvas.clientHeight, false);
		THREESCENE.camera.aspect = THREESCENE.canvas.clientWidth / THREESCENE.canvas.clientHeight;
		THREESCENE.camera.updateProjectionMatrix();
		rmUniforms.aspect.value = THREESCENE.camera.aspect;
	}
	THREESCENE.renderer.render(THREESCENE.scene, THREESCENE.camera);
}

tick();