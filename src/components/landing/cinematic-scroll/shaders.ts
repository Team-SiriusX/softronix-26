export const cylinderVertex = `
    attribute vec3 position;
    attribute vec2 uv;
    attribute vec3 normal;

    uniform mat4 modelViewMatrix;
    uniform mat4 projectionMatrix;
    uniform mat3 normalMatrix;

    varying vec2 vUv;
    varying vec3 vNormal;

    void main() {
        vUv = uv;
        vNormal = normalMatrix * normal;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
`;

export const cylinderFragment = `
    precision highp float;
    uniform sampler2D tMap;
    uniform float uCount; // number of images
    varying vec2 vUv;
    varying vec3 vNormal;

    void main() {
        // Simple lighting to make it look 3D
        vec3 normal = normalize(vNormal);
        vec3 light = normalize(vec3(1.0, 1.0, 1.0));
        float diffuse = max(dot(normal, light), 0.0);
        
        // Ambient
        float ambient = 0.6;
        float lighting = ambient + diffuse * 0.4;

        // Texture mapping
        // We repeat the texture uCount times horizontally if we mapped it 0-1,
        // but here the texture map itself is 1 big atlas.
        // If UV.x goes 0->1, it covers all images.
        // We just sample directly.
        
        vec4 color = texture2D(tMap, vUv);
        
        // Darken back face (simple trick using normal z or similar)
        // OGL draws both sides, but normals flip?
        // Let's just use the lighting calc.
        
        gl_FragColor = vec4(color.rgb * lighting, color.a);
    }
`;

export const particleVertex = `
    attribute vec3 position;
    attribute vec3 random;
    
    uniform mat4 modelViewMatrix;
    uniform mat4 projectionMatrix;
    uniform float uTime;
    
    varying float vAlpha;

    void main() {
        vec3 pos = position;
        
        // Floating animation
        pos.y += sin(uTime * 0.5 + random.x * 10.0) * 0.2;
        pos.x += cos(uTime * 0.3 + random.y * 10.0) * 0.1;
        
        gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
        gl_PointSize = (2.0 + random.z * 3.0) * (1.0 / -gl_Position.z); // Scale by distance
        
        vAlpha = 0.6 + 0.4 * sin(uTime + random.x * 10.0);
    }
`;

export const particleFragment = `
    precision highp float;
    uniform vec3 uColor;
    varying float vAlpha;

    void main() {
        // Circular particle
        vec2 coord = gl_PointCoord - vec2(0.5);
        if(length(coord) > 0.5) discard;
        
        gl_FragColor = vec4(uColor, vAlpha * 0.5);
    }
`;
