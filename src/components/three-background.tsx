"use client";

import React, { useEffect, useRef } from "react";
import * as THREE from "three";

export default function ThreeBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [mounted, setMounted] = React.useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Renderer setup
    const renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      alpha: true,
      powerPreference: "high-performance",
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(window.innerWidth, window.innerHeight);

    // Scene & Camera
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 100);
    camera.position.z = 30;

    // Responsive sizing
    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener("resize", handleResize);

    // Create 3D waves logic: parametric plane geometry with custom shader
    const geometry = new THREE.PlaneGeometry(120, 120, 75, 75);

    // Custom shader material for Igloo.inc style morphing mesh
    const material = new THREE.ShaderMaterial({
      transparent: true,
      wireframe: true,
      uniforms: {
        uTime: { value: 0.0 },
        uAccentColor: { value: new THREE.Color("#0071e3") },
        uThemeMode: { value: 0.0 }, // 0 for dark, 1 for light
      },
      vertexShader: `
        uniform float uTime;
        varying vec3 vPosition;
        varying float vElevation;

        void main() {
          vec4 modelPosition = modelMatrix * vec4(position, 1.0);
          
          // Parametric wave functions mapping 3D landscapes dynamically
          float elevation = sin(modelPosition.x * 0.05 + uTime * 0.4) * 
                            cos(modelPosition.y * 0.05 + uTime * 0.4) * 4.0;
          elevation += sin(modelPosition.x * 0.1 - uTime * 0.2) * 1.5;
          elevation += cos(modelPosition.y * 0.1 + uTime * 0.3) * 1.5;
          
          modelPosition.z += elevation;

          vec4 viewPosition = viewMatrix * modelPosition;
          vec4 projectedPosition = projectionMatrix * viewPosition;

          gl_Position = projectedPosition;

          vPosition = modelPosition.xyz;
          vElevation = elevation;
        }
      `,
      fragmentShader: `
        uniform vec3 uAccentColor;
        uniform float uThemeMode;
        varying vec3 vPosition;
        varying float vElevation;

        void main() {
          // Adjust opacity based on height variance
          float alpha = (vElevation + 7.0) / 14.0; // Normalized height value [0, 1]
          
          // Falloff grid brightness near outer bounds
          float dist = distance(vPosition.xy, vec2(0.0));
          float fade = 1.0 - smoothstep(10.0, 60.0, dist);
          
          vec3 baseColor = uAccentColor;
          float baseOpacity = uThemeMode > 0.5 ? 0.045 : 0.035;
          
          gl_FragColor = vec4(baseColor, alpha * fade * baseOpacity);
        }
      `,
    });

    const mesh = new THREE.Mesh(geometry, material);
    mesh.rotation.x = -Math.PI * 0.28; // Tilted angle for isometric perspective look
    mesh.position.y = -15; // Placed at base
    scene.add(mesh);

    // Animation Loop
    let animationFrameId: number;
    const clock = new THREE.Clock();

    // Monitor theme mode updates dynamically
    const updateThemeUniform = () => {
      const isDark = document.documentElement.classList.contains("dark");
      material.uniforms.uThemeMode.value = isDark ? 0.0 : 1.0;
      material.uniforms.uAccentColor.value = new THREE.Color(isDark ? "#2997ff" : "#0071e3");
    };

    updateThemeUniform();

    const observer = new MutationObserver(updateThemeUniform);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });

    let isTabVisible = true;
    const handleVisibilityChange = () => {
      isTabVisible = document.visibilityState === "visible";
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);

    const animate = () => {
      if (isTabVisible) {
        const elapsedTime = clock.getElapsedTime();
        material.uniforms.uTime.value = elapsedTime;

        // Slow rotational shift for natural parallax
        mesh.rotation.z = elapsedTime * 0.015;

        renderer.render(scene, camera);
      }
      animationFrameId = requestAnimationFrame(animate);
    };

    animate();

    // Cleanups
    return () => {
      window.removeEventListener("resize", handleResize);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      observer.disconnect();
      cancelAnimationFrame(animationFrameId);
      geometry.dispose();
      material.dispose();
      renderer.dispose();
    };
  }, [mounted]);

  if (!mounted) return null;

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 w-full h-full pointer-events-none -z-50 select-none block"
      style={{ mixBlendMode: "normal" }}
    />
  );
}
