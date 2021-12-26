// per-frame variables
uniform vec3 camPos;
uniform vec4 rotation;
uniform float depthMax;
uniform vec3 lightDirection;

// per-pixel variables
varying vec2 UV;

// consts
const float PI = 3.141592653589793238;
const float PROXIMITY_EPSILON = 0.0001;
const float SHADOW_SOFTNESS = 0.2;

const vec3 color = vec3(0.0, 0.6784, 0.3961);
const float ambientMult = 0.3;
const float diffuseMult = 0.8;
const float specularMult = 0.2;
const float roughness = 0.05;
const float metallic = 0.;

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
  return dot(p,n) + h;
}

float sdMandelbulb(vec3 pos) {
	int iter = 5;
	float power = 8.;
	float bailout = 2.5;

	vec3 z = pos;
	float dr = 1.0;
	float r = 0.0;
	for (int i = 0; i < iter; i++) {
		r = length(z);
		if (r>bailout) break;
		
		// convert to polar coordinates
		float theta = acos(z.z/r);
		float phi = atan(z.y,z.x);
		dr =  pow( r, power-1.0)*power*dr + 1.0;
		
		// scale and rotate the point
		float zr = pow( r,power);
		theta = theta*power;
		phi = phi*power;
		
		// convert back to cartesian coordinates
		z = zr*vec3(sin(theta)*cos(phi), sin(phi)*sin(theta), cos(theta));
		z+=pos;
	}
	return 0.5*log(r)*r/dr;
}

float sdMenger(vec3 p){

	float d = sdBox(p,vec3(1.0));
	vec4 res = vec4( d, 1.0, 0.0, 0.0 );

	float s = 1.0;
	for( int m=0; m<8; m++ )
	{
		vec3 a = mod( p*s, 2.0 )-1.0;
		s *= 3.0;
		vec3 r = abs(1.0 - 3.0*abs(a));

		float da = max(r.x,r.y);
		float db = max(r.y,r.z);
		float dc = max(r.z,r.x);
		float c = (min(da,min(db,dc))-1.0)/s;

		if( c>d )
		{
			d = c;
			res = vec4( d, 0.2*da*db*dc, (1.0+float(m))/4.0, 0.0 );
		}
	}

	return res.x;
}

// operations
float smin(float a, float b, float k)
{
    float res = exp2( -k*a ) + exp2( -k*b );
    return -log2( res )/k;
}
float diff(float a, float b){
	return max(a, -b);
}

// sd scene
float sdScene(vec3 p){

	return min(diff(min(sdMenger(p + vec3(0.6, 0., 0.)), sdMandelbulb(p - vec3(0.6, 0., 0.))), sdBox(p, vec3(0.6, 1.5, 1.5))),
			sdBox(p + vec3(0., 1.5, 0.), vec3(6., 0.05, 4.)));
}

// sd utilities
vec3 calcNormal( vec3 p ) // for function f(p)
{
    const float h = PROXIMITY_EPSILON;
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

	// main march
	vec3 viewRayDirection = normalize(vec3(UV, -0.7));
	viewRayDirection = qtransform(rotation, viewRayDirection);
	vec3 viewRayPos = camPos;

	float viewRayDist;
	float viewDepth = 0.;
	for(int i = 0; i < 256; i++){

		viewRayDist = sdScene(viewRayPos);
		viewDepth += viewRayDist;

		viewRayPos += viewRayDist * viewRayDirection;
		
		if(viewRayDist < PROXIMITY_EPSILON || viewDepth>depthMax) break;
	}

	// after-hit things:
	vec3 normal = calcNormal(viewRayPos);

	// shadow march 
	vec3 shadowRayDirection = lightDirection;
	vec3 shadowRayPos = viewRayPos + normal*PROXIMITY_EPSILON*2.;

	float shadowRayDist;
	float shadowDepth = PROXIMITY_EPSILON;
	float shadow = 1.;
	for(int i = 0; i < 64; i++){

		shadowRayDist = sdScene(shadowRayPos);

		shadowRayPos += shadowRayDist * shadowRayDirection;
		shadowDepth += shadowRayDist;

		shadow = min(shadow, shadowRayDist/SHADOW_SOFTNESS/shadowDepth);

		if(shadowDepth>2.*depthMax) break;
	}
	shadow = max(shadow, 0.);


	// calculate color
	vec3 col;
	if(viewDepth < depthMax){ // scene
		
		// Phong lighting
		float dotLightNormal = dot(lightDirection, normal);

		float ambient = ambientMult;
		float diffuse = diffuseMult * max(dotLightNormal, 0.);
		float specular = shadow * min(specularMult*( pow(max(dot((2.*dotLightNormal*normal - lightDirection), -viewRayDirection), 0.), 1./roughness) ), 1.);

		//float illumination = ambient + diffuse + specular;

		// other
		float fresnel = 1.-dot(normal, -viewRayDirection);

		// final
		col = specular + vec3(ambient + diffuse) * color * (0.2 + 0.8*shadow);
	}
	else{ // background
		vec3 light = vec3(0.5098, 0.8196, 1.0);
		vec3 dark = vec3(0.0, 0.3882, 0.6118);
		col = (viewRayDirection.y*0.5 + 0.5)*(light-dark) + dark;
	}


	gl_FragColor = vec4(col, 1);
}