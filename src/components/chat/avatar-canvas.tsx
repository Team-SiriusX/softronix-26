"use client";

import { useRef, useEffect } from "react";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";

import { VisemeFrame } from "@/hooks/use-tts";

// ─── MODULE-LEVEL SINGLETONS ───
let _renderer: THREE.WebGLRenderer | null = null;
let _scene: THREE.Scene | null = null;
let _camera: THREE.PerspectiveCamera | null = null;
let _modelLoaded = false;
let _activeCanvas: HTMLCanvasElement | null = null;

const _state = {
    mixer: null as THREE.AnimationMixer | null,
    morphMesh: null as THREE.Mesh | null,
    morphIndices: { aa: -1, ee: -1, oh: -1, blinkLeft: -1, blinkRight: -1 },
    viseme: { aa: 0, ee: 0, oh: 0, blink: 0 },
    visemeTarget: { aa: 0, ee: 0, oh: 0, blink: 0 },
    nextBlinkTime: 3,
    isBlinking: false,
    mouseX: 0,
    mouseY: 0,
    model: null as THREE.Group | null,
    clock: new THREE.Clock(),
};

function disposeRenderer() {
    if (_renderer) {
        _renderer.dispose();
        _renderer = null;
    }
    if (_scene) {
        _scene.traverse((obj) => {
            if ((obj as THREE.Mesh).isMesh) {
                const mesh = obj as THREE.Mesh;
                mesh.geometry?.dispose();
                if (Array.isArray(mesh.material)) {
                    mesh.material.forEach((m) => m.dispose());
                } else if (mesh.material) {
                    mesh.material.dispose();
                }
            }
        });
        _scene = null;
    }
    _camera = null;
    _modelLoaded = false;
    _activeCanvas = null;
    _state.model = null;
    _state.mixer = null;
    _state.morphMesh = null;
}

interface AvatarCanvasProps {
    isSpeaking: boolean;
    viseme: VisemeFrame;
    className?: string;
}

export default function AvatarCanvas({
    isSpeaking,
    viseme,
    className,
}: AvatarCanvasProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);

    // Store props in refs so animation loop reads latest values
    const isSpeakingRef = useRef(isSpeaking);
    const visemeRef = useRef(viseme);
    isSpeakingRef.current = isSpeaking;
    visemeRef.current = viseme;

    const animFrameRef = useRef(0);
    const disposedRef = useRef(false);

    useEffect(() => {
        const container = containerRef.current;
        const canvas = canvasRef.current;
        if (!container || !canvas) return;

        disposedRef.current = false;

        // If canvas changed (e.g. HMR), dispose old renderer
        if (_activeCanvas && _activeCanvas !== canvas) {
            disposeRenderer();
        }

        // ─── Create renderer (module-level singleton) ───
        if (!_renderer) {
            try {
                _renderer = new THREE.WebGLRenderer({
                    canvas,
                    antialias: true,
                    alpha: true,
                    powerPreference: "default",
                });
                _renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
                _renderer.toneMapping = THREE.ACESFilmicToneMapping;
                _renderer.toneMappingExposure = 1.1;
                _activeCanvas = canvas;
            } catch (e) {
                console.error("[Avatar] WebGL init failed:", e);
                return;
            }
        }

        _renderer.setSize(container.clientWidth, container.clientHeight);

        // ─── Create scene ───
        if (!_scene) {
            _scene = new THREE.Scene();
            _scene.add(new THREE.AmbientLight(0xffffff, 0.8));

            const keyLight = new THREE.DirectionalLight(0xffffff, 1.2);
            keyLight.position.set(1, 2, 2);
            _scene.add(keyLight);

            const fillLight = new THREE.DirectionalLight(0xffeeb1, 0.5);
            fillLight.position.set(-2, 0, 2);
            _scene.add(fillLight);

            const rimLight = new THREE.SpotLight(0xbadfff, 2.0);
            rimLight.position.set(0, 2, -2);
            _scene.add(rimLight);
        }

        // ─── Create camera ───
        if (!_camera) {
            _camera = new THREE.PerspectiveCamera(
                35,
                container.clientWidth / container.clientHeight,
                0.1,
                100
            );
            _camera.position.set(0, 0.1, 1.2);
        }
        _camera.aspect = container.clientWidth / container.clientHeight;
        _camera.updateProjectionMatrix();

        // ─── Load model ───
        if (!_modelLoaded) {
            _modelLoaded = true;
            const loader = new GLTFLoader();
            loader.load(
                "/avatar.glb",
                (gltf) => {
                    if (disposedRef.current || !_scene) return;

                    const model = gltf.scene;
                    _state.model = model;

                    const box = new THREE.Box3().setFromObject(model);
                    const size = box.getSize(new THREE.Vector3());
                    const center = box.getCenter(new THREE.Vector3());
                    const scale = 0.65 / size.y;
                    model.scale.set(scale, scale, scale);
                    model.position.y = 0.1;
                    model.position.z = -center.z;

                    model.traverse((child) => {
                        if ((child as THREE.Mesh).isMesh) {
                            const mesh = child as THREE.Mesh;
                            if (mesh.material) {
                                const mat = mesh.material as THREE.MeshStandardMaterial;
                                mat.depthWrite = true;
                                mat.metalness = 0.1;
                                mat.roughness = 0.6;
                            }
                            if (mesh.morphTargetDictionary && mesh.morphTargetInfluences) {
                                const dict = mesh.morphTargetDictionary;
                                _state.morphMesh = mesh;
                                _state.morphIndices = {
                                    aa: dict["JawOpen"] ?? dict["AA"] ?? -1,
                                    ee: dict["EE"] ?? -1,
                                    oh: dict["OH"] ?? dict["LipsFunnel"] ?? -1,
                                    blinkLeft: dict["EyeBlink_L"] ?? -1,
                                    blinkRight: dict["EyeBlink_R"] ?? -1,
                                };
                                console.log("[Avatar] Morph mapped:", _state.morphIndices);
                            }
                        }
                    });

                    _scene.add(model);

                    if (gltf.animations.length) {
                        _state.mixer = new THREE.AnimationMixer(model);
                        const idle = gltf.animations.find((a) =>
                            a.name.toLowerCase().includes("idle")
                        );
                        if (idle) _state.mixer.clipAction(idle).play();
                    }

                    console.log("[Avatar] Model ready");
                },
                undefined,
                (err) => console.error("[Avatar] Load error:", err)
            );
        }

        // ─── Event listeners ───
        const onMouseMove = (e: MouseEvent) => {
            _state.mouseX = ((e.clientX / window.innerWidth) * 2 - 1) * 0.15;
            _state.mouseY = ((e.clientY / window.innerHeight) * 2 - 1) * 0.1;
        };

        const onResize = () => {
            if (!container || disposedRef.current || !_renderer || !_camera) return;
            const w = container.clientWidth;
            const h = container.clientHeight;
            _camera.aspect = w / h;
            _camera.updateProjectionMatrix();
            _renderer.setSize(w, h);
        };

        window.addEventListener("mousemove", onMouseMove);
        window.addEventListener("resize", onResize);
        const ro = new ResizeObserver(onResize);
        ro.observe(container);

        // ─── Animation loop ───
        _state.clock = new THREE.Clock();

        function animate() {
            if (disposedRef.current) return;
            animFrameRef.current = requestAnimationFrame(animate);

            if (!_renderer || !_scene || !_camera) return;

            const delta = _state.clock.getDelta();
            const time = _state.clock.getElapsedTime();

            if (_state.mixer) _state.mixer.update(delta);

            if (_state.model) {
                // Head look
                const ix = Math.sin(time * 0.5) * 0.03;
                const iy = Math.sin(time * 0.3) * 0.03;
                _state.model.rotation.y += (_state.mouseX + ix - _state.model.rotation.y) * 0.05;
                _state.model.rotation.x += (_state.mouseY + iy - _state.model.rotation.x) * 0.05;

                // Blink
                if (time > _state.nextBlinkTime && !_state.isBlinking) {
                    _state.isBlinking = true;
                    _state.visemeTarget.blink = 1;
                    setTimeout(() => {
                        _state.visemeTarget.blink = 0;
                        setTimeout(() => {
                            _state.isBlinking = false;
                            _state.nextBlinkTime = time + 2 + Math.random() * 4;
                        }, 150);
                    }, 100);
                }

                // Lip sync from viseme data
                const speaking = isSpeakingRef.current;
                const v = visemeRef.current;

                if (speaking) {
                    _state.visemeTarget.aa = v.aa;
                    _state.visemeTarget.ee = v.ee;
                    _state.visemeTarget.oh = v.oh;
                } else {
                    _state.visemeTarget.aa = 0;
                    _state.visemeTarget.ee = 0;
                    _state.visemeTarget.oh = 0;
                }

                // Lerp for smooth transitions
                _state.viseme.aa += (_state.visemeTarget.aa - _state.viseme.aa) * 0.25;
                _state.viseme.ee += (_state.visemeTarget.ee - _state.viseme.ee) * 0.25;
                _state.viseme.oh += (_state.visemeTarget.oh - _state.viseme.oh) * 0.25;
                _state.viseme.blink += (_state.visemeTarget.blink - _state.viseme.blink) * 0.5;

                // Apply morphs
                const { morphMesh, morphIndices, viseme } = _state;
                if (morphMesh?.morphTargetInfluences) {
                    const infl = morphMesh.morphTargetInfluences;
                    if (morphIndices.aa >= 0) infl[morphIndices.aa] = viseme.aa;
                    if (morphIndices.ee >= 0) infl[morphIndices.ee] = viseme.ee;
                    if (morphIndices.oh >= 0) infl[morphIndices.oh] = viseme.oh;
                    if (morphIndices.blinkLeft >= 0) infl[morphIndices.blinkLeft] = viseme.blink;
                    if (morphIndices.blinkRight >= 0) infl[morphIndices.blinkRight] = viseme.blink;
                }
            }

            _renderer.render(_scene, _camera);
        }

        animate();

        // ─── Cleanup: only stop loop & listeners, keep renderer alive ───
        return () => {
            disposedRef.current = true;
            cancelAnimationFrame(animFrameRef.current);
            window.removeEventListener("mousemove", onMouseMove);
            window.removeEventListener("resize", onResize);
            ro.disconnect();
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <div ref={containerRef} className={className} style={{ position: "relative" }}>
            <canvas
                ref={canvasRef}
                style={{ width: "100%", height: "100%", display: "block" }}
            />
        </div>
    );
}
