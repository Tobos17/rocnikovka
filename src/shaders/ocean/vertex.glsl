#define SCALE 10.0

varying vec2 vUv;

uniform float uTime;

float calculateSurface(float x, float z) {
    float y = 0.0;
    float time = uTime * 0.05;
    y += (sin(x * 1.0 / SCALE + time * 1.0) + sin(x * 2.3 / SCALE + time * 1.5) + sin(x * 3.3 / SCALE + time * 0.4)) / 3.0;
    y += (sin(z * 0.2 / SCALE + time * 1.8) + sin(z * 1.8 / SCALE + time * 1.8) + sin(z * 2.8 / SCALE + time * 0.8)) / 3.0;
    return y;
}

void main() {
    vUv = uv;
    vec3 pos = position;
    
    float strength = 0.75;
    pos.z += strength * calculateSurface(pos.x , -pos.y );
    // pos.z -= strength * calculateSurface(0.0, 0.0);

    gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
}  