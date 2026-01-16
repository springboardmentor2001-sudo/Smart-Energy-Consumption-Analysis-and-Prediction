import { useRef, useEffect, useState } from "react";
import * as THREE from "three";
import { Zap } from "lucide-react";

interface EnergyOrbProps {
  className?: string;
}

interface InteractiveState {
  mouseX: number;
  mouseY: number;
  isAnimating: boolean;
  intensity: number;
  zoom: number;
  colorIndex: number;
  energySurge: number;
  lastClickTime: number;
}

const COLOR_SCHEMES = [
  { hex: 0x14b8a6, hsl: [0.47, 0.8, 0.5] }, // Teal
  { hex: 0x3b82f6, hsl: [0.58, 1, 0.5] },   // Blue
  { hex: 0xf59e0b, hsl: [0.08, 1, 0.5] },   // Amber
  { hex: 0xec4899, hsl: [0.92, 1, 0.5] },   // Pink
  { hex: 0x8b5cf6, hsl: [0.75, 1, 0.5] },   // Purple
  { hex: 0x10b981, hsl: [0.42, 0.8, 0.5] }, // Green
];

export function EnergyOrb({ className }: EnergyOrbProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [webGLFailed, setWebGLFailed] = useState(false);
  const [isAnimating, setIsAnimating] = useState(true);
  const [intensity, setIntensity] = useState(1);
  const [colorIndex, setColorIndex] = useState(0);
  const interactiveRef = useRef<InteractiveState>({
    mouseX: 0,
    mouseY: 0,
    isAnimating: true,
    intensity: 1,
    zoom: 5,
    colorIndex: 0,
    energySurge: 0,
    lastClickTime: 0,
  });
  const sceneRef = useRef<{
    scene: THREE.Scene;
    camera: THREE.PerspectiveCamera;
    renderer: THREE.WebGLRenderer;
    orb: THREE.Mesh;
    particles: THREE.Points;
    rings: THREE.Group;
    innerOrb: THREE.Mesh;
    core: THREE.Mesh;
    orbMaterial: THREE.MeshBasicMaterial;
    innerOrbMaterial: THREE.MeshBasicMaterial;
    particleMaterial: THREE.PointsMaterial;
    ringMaterials: THREE.MeshBasicMaterial[];
    explosionParticles: THREE.Points[];
  } | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const container = containerRef.current;
    const width = container.clientWidth;
    const height = container.clientHeight;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
    camera.position.z = 5;

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({
        alpha: true,
        antialias: true,
      });
    } catch (error) {
      console.warn("WebGL not available, showing fallback");
      setWebGLFailed(true);
      return;
    }
    
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    const currentColor = COLOR_SCHEMES[0];
    const orbGeometry = new THREE.IcosahedronGeometry(1.5, 4);
    const orbMaterial = new THREE.MeshBasicMaterial({
      color: currentColor.hex,
      wireframe: true,
      transparent: true,
      opacity: 0.6,
    });
    const orb = new THREE.Mesh(orbGeometry, orbMaterial);
    scene.add(orb);

    const innerOrbGeometry = new THREE.IcosahedronGeometry(1.2, 2);
    const innerOrbMaterial = new THREE.MeshBasicMaterial({
      color: currentColor.hex,
      wireframe: true,
      transparent: true,
      opacity: 0.3,
    });
    const innerOrb = new THREE.Mesh(innerOrbGeometry, innerOrbMaterial);
    orb.add(innerOrb);

    const coreGeometry = new THREE.SphereGeometry(0.5, 32, 32);
    const coreMaterial = new THREE.MeshBasicMaterial({
      color: currentColor.hex,
      transparent: true,
      opacity: 0.4,
    });
    const core = new THREE.Mesh(coreGeometry, coreMaterial);
    orb.add(core);

    // Main particles
    const particleCount = 200;
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount; i++) {
      const radius = 2 + Math.random() * 2;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);

      positions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
      positions[i * 3 + 2] = radius * Math.cos(phi);

      const color = new THREE.Color().setHSL(currentColor.hsl[0], currentColor.hsl[1], currentColor.hsl[2] + Math.random() * 0.3);
      colors[i * 3] = color.r;
      colors[i * 3 + 1] = color.g;
      colors[i * 3 + 2] = color.b;
    }

    const particleGeometry = new THREE.BufferGeometry();
    particleGeometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    particleGeometry.setAttribute("color", new THREE.BufferAttribute(colors, 3));

    const particleMaterial = new THREE.PointsMaterial({
      size: 0.05,
      vertexColors: true,
      transparent: true,
      opacity: 0.8,
      blending: THREE.AdditiveBlending,
    });

    const particles = new THREE.Points(particleGeometry, particleMaterial);
    scene.add(particles);

    // Rings
    const rings = new THREE.Group();
    const ringMaterials: THREE.MeshBasicMaterial[] = [];
    for (let i = 0; i < 3; i++) {
      const ringGeometry = new THREE.RingGeometry(2 + i * 0.3, 2.05 + i * 0.3, 64);
      const ringMaterial = new THREE.MeshBasicMaterial({
        color: currentColor.hex,
        transparent: true,
        opacity: 0.2 - i * 0.05,
        side: THREE.DoubleSide,
      });
      ringMaterials.push(ringMaterial);
      const ring = new THREE.Mesh(ringGeometry, ringMaterial);
      ring.rotation.x = Math.PI / 2 + (i * Math.PI) / 8;
      ring.rotation.z = (i * Math.PI) / 6;
      rings.add(ring);
    }
    scene.add(rings);

    // Add ambient light for better visibility
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.3);
    scene.add(ambientLight);

    sceneRef.current = {
      scene,
      camera,
      renderer,
      orb,
      particles,
      rings,
      innerOrb,
      core,
      orbMaterial,
      innerOrbMaterial,
      particleMaterial,
      ringMaterials,
      explosionParticles: [],
    };

    let animationId: number;
    const clock = new THREE.Clock();

    const createExplosion = () => {
      if (!sceneRef.current) return;
      const explosionCount = 50;
      const positions = new Float32Array(explosionCount * 3);
      const colors = new Float32Array(explosionCount * 3);

      for (let i = 0; i < explosionCount; i++) {
        positions[i * 3] = (Math.random() - 0.5) * 2;
        positions[i * 3 + 1] = (Math.random() - 0.5) * 2;
        positions[i * 3 + 2] = (Math.random() - 0.5) * 2;

        const color = new THREE.Color().setHSL(
          COLOR_SCHEMES[interactiveRef.current.colorIndex].hsl[0],
          COLOR_SCHEMES[interactiveRef.current.colorIndex].hsl[1],
          0.6
        );
        colors[i * 3] = color.r;
        colors[i * 3 + 1] = color.g;
        colors[i * 3 + 2] = color.b;
      }

      const geometry = new THREE.BufferGeometry();
      geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
      geometry.setAttribute("color", new THREE.BufferAttribute(colors, 3));

      const material = new THREE.PointsMaterial({
        size: 0.1,
        vertexColors: true,
        transparent: true,
        opacity: 1,
        blending: THREE.AdditiveBlending,
      });

      const explosionPoints = new THREE.Points(geometry, material);
      sceneRef.current.scene.add(explosionPoints);
      sceneRef.current.explosionParticles.push(explosionPoints);

      return { points: explosionPoints, material, createdAt: clock.getElapsedTime() };
    };

    const explosions: ReturnType<typeof createExplosion>[] = [];

    const animate = () => {
      animationId = requestAnimationFrame(animate);
      const elapsed = clock.getElapsedTime();
      const state = interactiveRef.current;

      if (state.isAnimating) {
        const speed = 0.1 * state.intensity;
        orb.rotation.x = elapsed * speed;
        orb.rotation.y = elapsed * speed * 1.5;
        innerOrb.rotation.x = -elapsed * speed * 2;
        innerOrb.rotation.y = -elapsed * speed * 2.5;

        particles.rotation.y = elapsed * speed * 0.5;
        particles.rotation.x = elapsed * speed * 0.3;

        rings.children.forEach((ring, i) => {
          ring.rotation.z = elapsed * (speed * (0.1 + i * 0.05));
        });
      }

      // Mouse-based rotation
      orb.rotation.x += (state.mouseY * 0.5 - orb.rotation.x) * 0.05;
      orb.rotation.y += (state.mouseX * 0.5 - orb.rotation.y) * 0.05;

      // Zoom
      camera.position.z += (state.zoom - camera.position.z) * 0.1;

      // Energy surge effect
      if (state.energySurge > 0) {
        state.energySurge -= 0.02;
        orb.scale.set(1 + state.energySurge * 0.3, 1 + state.energySurge * 0.3, 1 + state.energySurge * 0.3);
      }

      const scale = 1 + Math.sin(elapsed * 2 * state.intensity) * 0.05 * state.intensity;
      core.scale.set(scale, scale, scale);

      if (particles.material instanceof THREE.PointsMaterial) {
        particles.material.opacity = 0.8 * state.intensity;
      }

      // Update explosions
      explosions.forEach((exp, idx) => {
        if (!exp) return;
        const age = elapsed - exp.createdAt;
        if (age > 1) {
          sceneRef.current?.scene.remove(exp.points);
          explosions.splice(idx, 1);
        } else {
          const posAttr = exp.points.geometry.attributes.position as THREE.BufferAttribute;
          const pos = posAttr.array as Float32Array;
          for (let i = 0; i < pos.length; i += 3) {
            pos[i] *= 1.05;
            pos[i + 1] *= 1.05;
            pos[i + 2] *= 1.05;
          }
          posAttr.needsUpdate = true;
          exp.material.opacity = 1 - age;
        }
      });

      renderer.render(scene, camera);
    };

    animate();

    const handleMouseMove = (e: MouseEvent) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5;
      const y = (e.clientY - rect.top) / rect.height - 0.5;
      interactiveRef.current.mouseX = x;
      interactiveRef.current.mouseY = y;
    };

    const handleMouseLeave = () => {
      interactiveRef.current.mouseX = 0;
      interactiveRef.current.mouseY = 0;
    };

    const handleClick = () => {
      const now = Date.now();
      if (now - interactiveRef.current.lastClickTime < 300) {
        // Double click - explosion
        interactiveRef.current.energySurge = 1;
        createExplosion();
      } else {
        // Single click - toggle animation
        interactiveRef.current.isAnimating = !interactiveRef.current.isAnimating;
        setIsAnimating(interactiveRef.current.isAnimating);
      }
      interactiveRef.current.lastClickTime = now;
    };

    const handleDoubleClick = () => {
      // Change color
      interactiveRef.current.colorIndex = (interactiveRef.current.colorIndex + 1) % COLOR_SCHEMES.length;
      setColorIndex(interactiveRef.current.colorIndex);
      const newColor = COLOR_SCHEMES[interactiveRef.current.colorIndex];
      
      if (sceneRef.current) {
        sceneRef.current.orbMaterial.color.setHex(newColor.hex);
        sceneRef.current.innerOrbMaterial.color.setHex(newColor.hex);
        sceneRef.current.particleMaterial.color?.setHex(newColor.hex);
        sceneRef.current.ringMaterials.forEach(m => m.color.setHex(newColor.hex));
      }
    };

    const handleMouseEnter = () => {
      interactiveRef.current.intensity = 1.5;
      setIntensity(1.5);
    };

    const handleMouseLeaveIntensity = () => {
      interactiveRef.current.intensity = 1;
      setIntensity(1);
    };

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      interactiveRef.current.zoom = Math.max(2, Math.min(10, interactiveRef.current.zoom + e.deltaY * 0.005));
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      const speed = 0.2;
      switch (e.key) {
        case "ArrowUp":
          interactiveRef.current.mouseY = Math.max(-1, interactiveRef.current.mouseY - speed);
          break;
        case "ArrowDown":
          interactiveRef.current.mouseY = Math.min(1, interactiveRef.current.mouseY + speed);
          break;
        case "ArrowLeft":
          interactiveRef.current.mouseX = Math.max(-1, interactiveRef.current.mouseX - speed);
          break;
        case "ArrowRight":
          interactiveRef.current.mouseX = Math.min(1, interactiveRef.current.mouseX + speed);
          break;
        case " ":
          e.preventDefault();
          handleClick();
          break;
      }
    };

    const handleResize = () => {
      if (!containerRef.current || !sceneRef.current) return;
      const newWidth = containerRef.current.clientWidth;
      const newHeight = containerRef.current.clientHeight;
      sceneRef.current.camera.aspect = newWidth / newHeight;
      sceneRef.current.camera.updateProjectionMatrix();
      sceneRef.current.renderer.setSize(newWidth, newHeight);
    };

    container.addEventListener("mousemove", handleMouseMove);
    container.addEventListener("mouseleave", handleMouseLeave);
    container.addEventListener("mouseenter", handleMouseEnter);
    container.addEventListener("click", handleClick);
    container.addEventListener("dblclick", handleDoubleClick);
    container.addEventListener("wheel", handleWheel, { passive: false });
    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("resize", handleResize);

    return () => {
      cancelAnimationFrame(animationId);
      container.removeEventListener("mousemove", handleMouseMove);
      container.removeEventListener("mouseleave", handleMouseLeave);
      container.removeEventListener("mouseenter", handleMouseEnter);
      container.removeEventListener("click", handleClick);
      container.removeEventListener("dblclick", handleDoubleClick);
      container.removeEventListener("wheel", handleWheel);
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("resize", handleResize);
      renderer.dispose();
      container.removeChild(renderer.domElement);
    };
  }, []);

  if (webGLFailed) {
    return (
      <div
        className={`w-full h-full min-h-[400px] flex items-center justify-center ${className || ""}`}
        data-testid="three-canvas-fallback"
      >
        <div className="relative">
          <div className="absolute inset-0 bg-primary/20 blur-3xl rounded-full animate-pulse" />
          <div className="relative p-12 bg-gradient-to-br from-primary/20 to-primary/5 rounded-full border border-primary/30">
            <Zap className="w-24 h-24 text-primary animate-pulse" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className={`w-full h-full min-h-[400px] cursor-crosshair transition-opacity ${className || ""}`}
      aria-hidden="true"
      data-testid="three-canvas"
      title={`${isAnimating ? 'Pause' : 'Resume'} • Double-click to change colors • Scroll to zoom • Arrow keys to rotate`}
    />
  );
}
