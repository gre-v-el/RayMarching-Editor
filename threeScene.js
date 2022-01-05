var THREESCENE = (function(){

	// three.js setups
	var canvasHTML = document.getElementById('canvas');
	var sceneThree = new THREE.Scene();
	var rendererThree = new THREE.WebGLRenderer({ canvas: canvasHTML, antialias: false });
	var cameraThree = new THREE.PerspectiveCamera(45, canvasHTML.clientWidth / canvasHTML.clientWidth, 1, 1000);
	var clock = new THREE.Clock();
	

	return {
		canvas: canvasHTML,
		scene: sceneThree,
		renderer: rendererThree,
		camera: cameraThree,
		clock: clock
	};
})();