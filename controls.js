var CONTROLS = (function(){
	var controls = {
		keys: {
			KeyW: false,
			KeyA: false,
			KeyS: false,
			KeyD: false,
			KeyE: false,
			KeyQ: false,
		},
		mouseLeft: false, mouseRight: false, mouseX: 0, mouseY: 0, mouseDX: 0, mouseDY: 0
	}
	var prevControls = {};
	Object.assign(prevControls, controls);
	Object.assign(prevControls.keys, controls.keys);

	function update(){

		Object.assign(prevControls, controls);
		Object.assign(prevControls.keys, controls.keys);

		controls.mouseDY = 0;
		controls.mouseDX = 0;
	}

		document.addEventListener('contextmenu', event => event.preventDefault());


		document.onkeydown = function (e) {
			controls.keys[e.code] = true;
		};
		document.onkeyup = function (e) {
			controls.keys[e.code] = false;
		};
		
		document.onmousedown = function (e) {
			if(e.button == 0) controls.mouseLeft = true;
			if(e.button == 2) controls.mouseRight = true;
		};
		document.onmouseup = function (e) {
			if(e.button == 0) controls.mouseLeft = false;
			if(e.button == 2) controls.mouseRight = false;
		};
		
		document.onmousemove = function (e) {
			controls.mouseDX += e.movementX;
			controls.mouseDY += e.movementY;
		
			controls.mouseX = e.clientX;
			controls.mouseY = e.clientY;
		}
	
	return {
		update: update,
		controls: controls,
		prevControls: prevControls
	};
})();