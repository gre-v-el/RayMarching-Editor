const fragment = /*glsl*/ `

// per-frame variables
uniform vec3 camPos;
uniform vec4 rotation;
uniform float depthMax;
// per-pixel variables
varying vec2 UV;

const float PI = 3.141592653589793238;

// sd primitives
float sdSphere( vec3 p, float r ){
  return length(p)-r;
}
float sdBox( vec3 p, vec3 b )
{
  vec3 q = abs(p) - b;
  return length(max(q,0.0)) + min(max(q.x,max(q.y,q.z)),0.0);
}
float sdRoundBox( vec3 p, vec3 b, float r )
{
  vec3 q = abs(p) - b;
  return length(max(q,0.0)) + min(max(q.x,max(q.y,q.z)),0.0) - r;
}
float sdPlane( vec3 p, vec3 n, float h )
{
  // n must be normalized
  return dot(p,n) + h;
}

// sd scene
float sdScene(vec3 p){
	return min(
		sdRoundBox(p, vec3(0.2, 0.4, 0.3), 0.05),
		sdBox(p + vec3(0., 0.6, 0.), vec3(1., 0.05, 1.)));
}

// sd utilities
vec3 calcNormal( vec3 p ) // for function f(p)
{
    const float h = 0.0001; // replace by an appropriate value
    const vec2 k = vec2(1,-1);
    return normalize( k.xyy*sdScene( p + k.xyy*h ) + 
                      k.yyx*sdScene( p + k.yyx*h ) + 
                      k.yxy*sdScene( p + k.yxy*h ) + 
                      k.xxx*sdScene( p + k.xxx*h ) );
}

// quaternion
vec3 qtransform( vec4 q, vec3 v ){ 
	return v + 2.0*cross(cross(v, q.xyz ) + q.w*v, q.xyz);
} 

void main() {

	vec3 ray = normalize(vec3(UV, -0.7));
	ray = qtransform(rotation, ray);
	vec3 rayPos = camPos;

	float depth = 0.;
	for(int i = 0; i < 256; i++){

		float t = sdScene(rayPos);
		depth += t;

		rayPos += t * ray;
		
		if(t < 0.0001 || depth>depthMax) break;
	}

	vec3 col = vec3(0.);
	if(depth < depthMax){
		vec3 normal = calcNormal(rayPos);

		//col = vec3(depth/depthMax);
		//col = vec3(normal);
		col = vec3(max(dot(vec3(0.5, 0.7, 0.6), normal), 0.) + 0.05);
	}


	gl_FragColor = vec4(col, 1);
}
`;

export default fragment;