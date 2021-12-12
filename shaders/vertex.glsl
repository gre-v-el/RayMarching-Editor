uniform float aspect;

varying vec2 UV;

void main() {
	UV = (uv - vec2(0.5)) * vec2(aspect, 1);
	gl_Position = vec4(position.x, position.y, 0, 1.0);
}