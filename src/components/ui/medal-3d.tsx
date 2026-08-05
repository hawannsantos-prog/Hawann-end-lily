"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Environment, Lightformer } from "@react-three/drei";
import { useReducedMotion } from "framer-motion";
import * as THREE from "three";

/**
 * A championship medal, built from primitives rather than a downloaded model.
 *
 * Procedural geometry is a deliberate choice: a .glb of a medal would be a
 * megabyte-plus asset to host, load and cache, and this shape is a disc, a rim,
 * a boss and a ribbon. Everything here is a few hundred triangles.
 */
function Medal({ tone, spin }: { tone: string; spin: boolean }) {
  const group = useRef<THREE.Group>(null);

  useFrame((state, delta) => {
    if (!group.current) return;
    if (spin) group.current.rotation.y += delta * 0.55;
    // Gentle bob, so the medal has presence even when it isn't spinning.
    group.current.position.y =
      -0.2 + Math.sin(state.clock.elapsedTime * 0.9) * 0.05;
  });

  const metal = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: tone,
        // Not a full 1.0: a fully metallic surface takes *all* its colour from
        // reflections, so with a sparse environment it renders black. 0.85 with
        // a little roughness keeps the metal look and still catches the lights.
        metalness: 0.85,
        roughness: 0.22,
      }),
    [tone],
  );

  const ribbon = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: "#7f1d1d",
        metalness: 0.1,
        roughness: 0.8,
        side: THREE.DoubleSide,
      }),
    [],
  );

  // Cylinders stand on their Y axis; rotating a quarter turn on X lays the
  // disc face-on to the camera.
  const faceCamera: [number, number, number] = [Math.PI / 2, 0, 0];

  return (
    <group ref={group} rotation={[0.12, 0, 0]}>
      {/* Ribbon, folded into a V above the medal. */}
      <mesh
        position={[-0.19, 1.06, 0]}
        rotation={[0, 0, 0.42]}
        material={ribbon}
      >
        <planeGeometry args={[0.3, 1.15]} />
      </mesh>
      <mesh
        position={[0.19, 1.06, 0]}
        rotation={[0, 0, -0.42]}
        material={ribbon}
      >
        <planeGeometry args={[0.3, 1.15]} />
      </mesh>

      {/* Hanging loop. */}
      <mesh position={[0, 0.62, 0]} material={metal}>
        <torusGeometry args={[0.11, 0.028, 12, 32]} />
      </mesh>

      {/* Body of the medal. */}
      <mesh rotation={faceCamera} material={metal}>
        <cylinderGeometry args={[0.62, 0.62, 0.085, 64]} />
      </mesh>

      {/* Raised rim and centre boss, to give the light something to catch.
          No faceCamera here: a torus already lies in the XY plane, so rotating
          it would stand the ring on edge and orbit the disc instead. */}
      <mesh material={metal}>
        <torusGeometry args={[0.55, 0.045, 16, 64]} />
      </mesh>
      <mesh position={[0, 0, 0.06]} rotation={faceCamera} material={metal}>
        <cylinderGeometry args={[0.22, 0.22, 0.03, 32]} />
      </mesh>
    </group>
  );
}

/**
 * Renders one spinning medal, sized by its container — drop it in a square.
 *
 * The render loop is stopped entirely while the medal is off screen, so a phone
 * is not burning battery on geometry nobody is looking at. Device pixel ratio
 * is capped at 1.5: past that the extra pixels cost real frames and buy nothing
 * visible on a shape this simple. Under prefers-reduced-motion it holds still.
 */
export function Medal3D({ tone = "#d4af37" }: { tone?: string }) {
  const reduced = useReducedMotion();
  const host = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const node = host.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      ([entry]) => setVisible(entry.isIntersecting),
      { rootMargin: "120px" },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={host} className="h-full w-full">
      <Canvas
        dpr={[1, 1.5]}
        frameloop={visible ? "always" : "never"}
        gl={{ antialias: true, alpha: true }}
        camera={{ position: [0, 0, 3.1], fov: 42 }}
      >
        {/* Lighting mirrors the CSS stage — cool key from above, red rims from
            both sides — so the 3D and the section around it agree. */}
        <ambientLight intensity={0.5} />
        <directionalLight position={[0, 4, 3]} intensity={2.4} />
        <pointLight position={[-3, 0, 2]} intensity={20} color="#dc2626" />
        <pointLight position={[3, -1, 2]} intensity={14} color="#f87171" />

        {/*
         * Metal needs something to reflect. Rather than fetching an HDRI from a
         * CDN, this builds the environment in-scene from emissive panels — the
         * same softboxes-and-gels rig the CSS stage imitates. Costs one 128px
         * cube render, downloads nothing.
         */}
        <Environment resolution={128}>
          <Lightformer
            form="rect"
            intensity={3}
            position={[0, 4, 2]}
            scale={[8, 4, 1]}
            rotation={[Math.PI / 2, 0, 0]}
            color="#ffffff"
          />
          <Lightformer
            form="rect"
            intensity={6}
            position={[-5, 0, 1]}
            scale={[4, 8, 1]}
            rotation={[0, Math.PI / 2, 0]}
            color="#dc2626"
          />
          <Lightformer
            form="rect"
            intensity={3}
            position={[5, -1, 1]}
            scale={[4, 8, 1]}
            rotation={[0, -Math.PI / 2, 0]}
            color="#f87171"
          />
          <Lightformer
            form="circle"
            intensity={2}
            position={[0, 0, 5]}
            scale={4}
            color="#ffffff"
          />
        </Environment>

        <Medal tone={tone} spin={!reduced} />
      </Canvas>
    </div>
  );
}
