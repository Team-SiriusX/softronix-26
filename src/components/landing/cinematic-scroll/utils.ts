import { Plane, Mesh, Geometry } from 'ogl';

export interface CameraAnimation {
    rotation: number;
    position: { x: number; y: number; z: number };
}

export const getPositionClasses = (position: string) => {
    switch (position) {
        case "center": return "items-center justify-center text-center";
        case "left": return "items-start justify-center pl-10 text-left";
        case "right": return "items-end justify-center pr-10 text-right";
        case "bottom": return "items-center justify-end pb-20 text-center";
        default: return "items-center justify-center";
    }
};

export function drawImageCover(ctx: CanvasRenderingContext2D, img: HTMLImageElement, x: number, y: number, w: number, h: number) {
    const imgRatio = img.width / img.height;
    const winRatio = w / h;
    let newW, newH, newX, newY;

    if (imgRatio > winRatio) {
        newH = h;
        newW = imgRatio * h;
        newX = x + (w - newW) / 2;
        newY = y;
    } else {
        newW = w;
        newH = w / imgRatio;
        newX = x;
        newY = y + (h - newH) / 2;
    }

    ctx.save();
    ctx.rect(x, y, w, h);
    ctx.clip();
    ctx.drawImage(img, newX, newY, newW, newH);
    ctx.restore();
}

// Custom Cylinder Geometry generator for OGL
// OGL doesn't have a built-in CylinderGeometry in the core that allows easy UV manipulation for this specific use case sometimes, 
// so we use a standard approach or a plane wrapped around.
// We can use the OGL primitive if available, or build it.
// Here is a custom one to ensure seams are handled well.
export function createCylinderGeometry(gl: any, radiusTop: number, height: number, radialSegments: number, heightSegments: number) {
    // Basic cylinder generation logic
    const radiusBottom = radiusTop;
    const openEnded = true;
    const thetaStart = 0;
    const thetaLength = Math.PI * 2;

    const vertices = [];
    const normals = [];
    const uvs = [];
    const indices = [];

    const indexArray = [];
    const halfHeight = height / 2;

    // Generate torso
    for (let y = 0; y <= heightSegments; y++) {
        const indexRow = [];
        const v = y / heightSegments;

        for (let x = 0; x <= radialSegments; x++) {
            const u = x / radialSegments;
            const theta = u * thetaLength + thetaStart;
            const sinTheta = Math.sin(theta);
            const cosTheta = Math.cos(theta);

            // vertex
            vertices.push(
                radiusTop * sinTheta, 
                -v * height + halfHeight, 
                radiusTop * cosTheta
            );

            // normal
            normals.push(sinTheta, 0, cosTheta);

            // uv
            uvs.push(u, 1 - v);

            indexRow.push(indices.length);
        }
        indexArray.push(indexRow);
    }

    for (let x = 0; x < radialSegments; x++) {
        for (let y = 0; y < heightSegments; y++) {
            const a = indexArray[y][x];
            const b = indexArray[y + 1][x];
            const c = indexArray[y + 1][x + 1];
            const d = indexArray[y][x + 1];

            indices.push(a, b, d);
            indices.push(b, c, d);
        }
    }

    return new Geometry(gl, {
        position: { size: 3, data: new Float32Array(vertices) },
        normal: { size: 3, data: new Float32Array(normals) },
        uv: { size: 2, data: new Float32Array(uvs) },
        index: { data: new Uint16Array(indices) },
    });
}

// Simple particle geometry (plane) to be instanced or points?
// Let's use points or minimal planes.
export function createParticleGeometry(gl: any, count: number) {
    const position = new Float32Array(count * 3);
    const random = new Float32Array(count * 3);
    
    for (let i = 0; i < count; i++) {
        const i3 = i * 3;
        // Sphere distribution
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.acos((Math.random() * 2) - 1);
        const r = 4 + Math.random() * 2; // radius outside cylinder

        position[i3] = r * Math.sin(phi) * Math.cos(theta);
        position[i3 + 1] = (Math.random() - 0.5) * 10; // spread Y
        position[i3 + 2] = r * Math.sin(phi) * Math.sin(theta);

        random[i3] = Math.random();
        random[i3 + 1] = Math.random();
        random[i3 + 2] = Math.random();
    }

    return new Geometry(gl, {
        position: { size: 3, data: position },
        random: { size: 3, data: random },
    });
}
