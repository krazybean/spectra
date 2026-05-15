"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import type { SpectraEvent } from "@/lib/events/types";

type EventPulse = {
  age: number;
  direction: number;
  hue: THREE.Color;
  kind: SpectraEvent["type"];
  lifetime: number;
  strength: number;
};

const colorByEvent: Record<SpectraEvent["type"], THREE.Color> = {
  agent_thinking: new THREE.Color("#39ffd7"),
  tool_call: new THREE.Color("#8f5cff"),
  file_written: new THREE.Color("#ff6b3d"),
  task_completed: new THREE.Color("#f9ff6a"),
  git_commit: new THREE.Color("#6aff9e"),
  build_started: new THREE.Color("#64a8ff"),
  build_completed: new THREE.Color("#f9ff6a"),
  error_state: new THREE.Color("#ff3d5f")
};

const eventProfile: Record<
  SpectraEvent["type"],
  { lifetime: number; energy: number; directional: boolean }
> = {
  agent_thinking: { lifetime: 3.2, energy: 0.26, directional: false },
  tool_call: { lifetime: 1.1, energy: 0.58, directional: true },
  file_written: { lifetime: 1.8, energy: 0.46, directional: false },
  task_completed: { lifetime: 3.8, energy: 0.9, directional: false },
  git_commit: { lifetime: 2.0, energy: 0.5, directional: false },
  build_started: { lifetime: 2.4, energy: 0.44, directional: true },
  build_completed: { lifetime: 3.2, energy: 0.74, directional: false },
  error_state: { lifetime: 2.6, energy: 0.82, directional: false }
};

const tmpColor = new THREE.Color();

export function SpectraField({
  latestEvent
}: {
  latestEvent: SpectraEvent | null;
}) {
  const mountRef = useRef<HTMLDivElement | null>(null);
  const eventRef = useRef<SpectraEvent | null>(null);

  useEffect(() => {
    eventRef.current = latestEvent;
  }, [latestEvent]);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) {
      return;
    }

    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2("#020308", 0.034);

    const camera = new THREE.PerspectiveCamera(
      56,
      window.innerWidth / window.innerHeight,
      0.1,
      140
    );
    camera.position.set(0, 1.8, 20);

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: "high-performance"
    });
    renderer.setClearColor("#020308", 0);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(window.innerWidth, window.innerHeight);
    mount.appendChild(renderer.domElement);

    const root = new THREE.Group();
    const deepSpace = new THREE.Group();
    const lattice = new THREE.Group();
    const foreground = new THREE.Group();
    scene.add(deepSpace, root, lattice, foreground);

    const plasma = new THREE.Color("#39ffd7");
    const violet = new THREE.Color("#8f5cff");
    const ember = new THREE.Color("#ff6b3d");
    const gold = new THREE.Color("#f9ff6a");

    const deepCount = 900;
    const deepBase = new Float32Array(deepCount * 3);
    const deepPositions = new Float32Array(deepCount * 3);
    const deepColors = new Float32Array(deepCount * 3);
    const deepSeeds = new Float32Array(deepCount);

    for (let i = 0; i < deepCount; i += 1) {
      const radius = 18 + Math.random() * 46;
      const angle = Math.random() * Math.PI * 2;
      const depth = -38 + Math.random() * 28;
      deepBase[i * 3] = Math.cos(angle) * radius;
      deepBase[i * 3 + 1] = (Math.random() - 0.48) * 25;
      deepBase[i * 3 + 2] = depth + Math.sin(angle) * radius * 0.15;
      deepSeeds[i] = Math.random() * 1000;
      tmpColor.copy(plasma).lerp(violet, Math.random() * 0.7);
      deepColors[i * 3] = tmpColor.r;
      deepColors[i * 3 + 1] = tmpColor.g;
      deepColors[i * 3 + 2] = tmpColor.b;
    }

    const deepGeometry = new THREE.BufferGeometry();
    deepGeometry.setAttribute("position", new THREE.BufferAttribute(deepPositions, 3));
    deepGeometry.setAttribute("color", new THREE.BufferAttribute(deepColors, 3));
    const deepMaterial = new THREE.PointsMaterial({
      size: 0.026,
      vertexColors: true,
      transparent: true,
      opacity: 0.24,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });
    const deepParticles = new THREE.Points(deepGeometry, deepMaterial);
    deepSpace.add(deepParticles);

    const particleCount = 1450;
    const basePositions = new Float32Array(particleCount * 3);
    const particlePositions = new Float32Array(particleCount * 3);
    const baseColors = new Float32Array(particleCount * 3);
    const particleColors = new Float32Array(particleCount * 3);
    const particleSeeds = new Float32Array(particleCount);

    for (let i = 0; i < particleCount; i += 1) {
      const radius = 3.2 + Math.random() * 18;
      const angle = Math.random() * Math.PI * 2;
      const height = (Math.random() - 0.5) * 12;
      const depthSkew = Math.sin(angle * 2.0) * 2.2;
      basePositions[i * 3] = Math.cos(angle) * radius;
      basePositions[i * 3 + 1] = height;
      basePositions[i * 3 + 2] = Math.sin(angle) * radius + depthSkew;
      particleSeeds[i] = Math.random() * 1000;

      tmpColor.copy(plasma).lerp(violet, Math.random() * 0.58);
      if (Math.random() > 0.9) {
        tmpColor.lerp(ember, 0.42);
      }
      baseColors[i * 3] = tmpColor.r;
      baseColors[i * 3 + 1] = tmpColor.g;
      baseColors[i * 3 + 2] = tmpColor.b;
      particleColors[i * 3] = tmpColor.r;
      particleColors[i * 3 + 1] = tmpColor.g;
      particleColors[i * 3 + 2] = tmpColor.b;
    }

    const particleGeometry = new THREE.BufferGeometry();
    particleGeometry.setAttribute(
      "position",
      new THREE.BufferAttribute(particlePositions, 3)
    );
    particleGeometry.setAttribute(
      "color",
      new THREE.BufferAttribute(particleColors, 3)
    );
    const particleMaterial = new THREE.PointsMaterial({
      size: 0.038,
      vertexColors: true,
      transparent: true,
      opacity: 0.62,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });
    const particles = new THREE.Points(particleGeometry, particleMaterial);
    root.add(particles);

    const foregroundCount = 180;
    const foregroundBase = new Float32Array(foregroundCount * 3);
    const foregroundPositions = new Float32Array(foregroundCount * 3);
    const foregroundSeeds = new Float32Array(foregroundCount);

    for (let i = 0; i < foregroundCount; i += 1) {
      foregroundBase[i * 3] = (Math.random() - 0.5) * 30;
      foregroundBase[i * 3 + 1] = (Math.random() - 0.5) * 15;
      foregroundBase[i * 3 + 2] = 4 + Math.random() * 9;
      foregroundSeeds[i] = Math.random() * 1000;
    }

    const foregroundGeometry = new THREE.BufferGeometry();
    foregroundGeometry.setAttribute(
      "position",
      new THREE.BufferAttribute(foregroundPositions, 3)
    );
    const foregroundMaterial = new THREE.PointsMaterial({
      color: "#dffff8",
      size: 0.028,
      transparent: true,
      opacity: 0.14,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });
    const foregroundDust = new THREE.Points(
      foregroundGeometry,
      foregroundMaterial
    );
    foreground.add(foregroundDust);

    const coreGroup = new THREE.Group();
    root.add(coreGroup);

    const core = new THREE.Mesh(
      new THREE.SphereGeometry(0.42, 32, 32),
      new THREE.MeshBasicMaterial({
        color: "#dcfff8",
        transparent: true,
        opacity: 0.34,
        blending: THREE.AdditiveBlending,
        depthWrite: false
      })
    );
    coreGroup.add(core);

    const halo = new THREE.Mesh(
      new THREE.SphereGeometry(1.24, 32, 32),
      new THREE.MeshBasicMaterial({
        color: "#39ffd7",
        transparent: true,
        opacity: 0.055,
        blending: THREE.AdditiveBlending,
        depthWrite: false
      })
    );
    coreGroup.add(halo);

    const ringMaterials = [plasma, violet, ember].map(
      (color, index) =>
        new THREE.MeshBasicMaterial({
          color,
          transparent: true,
          opacity: index === 0 ? 0.22 : 0.13,
          blending: THREE.AdditiveBlending,
          depthWrite: false
        })
    );
    const rings = [2.8, 4.9, 7.2].map((radius, index) => {
      const ring = new THREE.Mesh(
        new THREE.TorusGeometry(radius, 0.008 + index * 0.004, 8, 160),
        ringMaterials[index]
      );
      ring.rotation.x = Math.PI * (0.5 + index * 0.08);
      ring.rotation.y = index * 0.56;
      coreGroup.add(ring);
      return ring;
    });

    const nodeGroup = new THREE.Group();
    lattice.add(nodeGroup);

    const nodes: THREE.Mesh[] = [];
    const nodeGeometry = new THREE.SphereGeometry(0.075, 18, 18);
    for (let i = 0; i < 18; i += 1) {
      const material = new THREE.MeshBasicMaterial({
        color: i % 3 === 0 ? "#ff8f6a" : "#39ffd7",
        transparent: true,
        opacity: 0.56,
        blending: THREE.AdditiveBlending,
        depthWrite: false
      });
      const node = new THREE.Mesh(nodeGeometry, material);
      const ring = i % 3 === 0 ? 4.9 : i % 3 === 1 ? 7.1 : 9.4;
      const angle = (i / 18) * Math.PI * 2;
      node.position.set(
        Math.cos(angle) * ring,
        Math.sin(i * 1.43) * 2.9,
        Math.sin(angle) * ring * 0.72
      );
      nodeGroup.add(node);
      nodes.push(node);
    }

    const connectionGeometry = new THREE.BufferGeometry();
    const connectionPositions = new Float32Array(nodes.length * 2 * 3);
    connectionGeometry.setAttribute(
      "position",
      new THREE.BufferAttribute(connectionPositions, 3)
    );
    const connectionMaterial = new THREE.LineBasicMaterial({
      color: "#8fffee",
      transparent: true,
      opacity: 0.18,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });
    const connections = new THREE.LineSegments(
      connectionGeometry,
      connectionMaterial
    );
    lattice.add(connections);

    const wavePoints = new Float32Array(128 * 3);
    const waveGeometry = new THREE.BufferGeometry();
    waveGeometry.setAttribute("position", new THREE.BufferAttribute(wavePoints, 3));
    const waveMaterial = new THREE.LineBasicMaterial({
      color: "#ff8b64",
      transparent: true,
      opacity: 0.36,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });
    const wave = new THREE.Line(waveGeometry, waveMaterial);
    wave.position.set(0, -4.15, 1.6);
    foreground.add(wave);

    const rayGeometry = new THREE.BufferGeometry();
    const rayPositions = new Float32Array(18 * 2 * 3);
    rayGeometry.setAttribute("position", new THREE.BufferAttribute(rayPositions, 3));
    const rayMaterial = new THREE.LineBasicMaterial({
      color: "#8f5cff",
      transparent: true,
      opacity: 0,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });
    const directionalRays = new THREE.LineSegments(rayGeometry, rayMaterial);
    root.add(directionalRays);

    const clock = new THREE.Clock();
    const pulses: EventPulse[] = [];
    const nodeFlash = new Float32Array(nodes.length);
    let lastEventId: string | null = null;
    let energy = 0.32;
    let resonance = 0;
    let directionalAngle = 0;
    let animationFrame = 0;

    const onResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };

    window.addEventListener("resize", onResize);

    const animate = () => {
      const delta = Math.min(clock.getDelta(), 0.033);
      const elapsed = clock.elapsedTime;
      const current = eventRef.current;

      if (current && current.id !== lastEventId) {
        lastEventId = current.id;
        const profile = eventProfile[current.type];
        directionalAngle = profile.directional
          ? Math.random() * Math.PI * 2
          : directionalAngle + Math.PI * 0.33;
        pulses.push({
          age: 0,
          direction: directionalAngle,
          hue: colorByEvent[current.type],
          kind: current.type,
          lifetime: profile.lifetime,
          strength: current.intensity
        });
        energy = Math.min(1.7, energy + profile.energy * current.intensity);

        if (current.type === "file_written") {
          const start = Math.floor(Math.random() * nodes.length);
          for (let i = 0; i < nodes.length; i += 1) {
            const distance = Math.abs(i - start);
            nodeFlash[i] = Math.max(nodeFlash[i], Math.max(0, 1 - distance * 0.16));
          }
        }

        if (current.type === "task_completed") {
          resonance = 1;
          nodeFlash.fill(1);
        }
      }

      energy += (0.28 - energy) * delta * 0.75;
      resonance += (0 - resonance) * delta * 0.55;

      for (let i = pulses.length - 1; i >= 0; i -= 1) {
        pulses[i].age += delta;
        if (pulses[i].age > pulses[i].lifetime) {
          pulses.splice(i, 1);
        }
      }

      const breath = 0.5 + Math.sin(elapsed * 0.82) * 0.5;
      const slowBreath = 0.5 + Math.sin(elapsed * 0.31 + 1.4) * 0.5;

      const deepAttribute = deepGeometry.attributes.position;
      for (let i = 0; i < deepCount; i += 1) {
        const baseIndex = i * 3;
        const seed = deepSeeds[i];
        const x = deepBase[baseIndex];
        const y = deepBase[baseIndex + 1];
        const z = deepBase[baseIndex + 2];
        const drift = Math.sin(elapsed * 0.08 + seed) * 0.8;
        deepAttribute.setXYZ(
          i,
          x + Math.sin(elapsed * 0.05 + seed * 0.3) * 0.9,
          y + drift,
          z + Math.cos(elapsed * 0.04 + seed) * 1.6
        );
      }
      deepAttribute.needsUpdate = true;
      deepMaterial.opacity = 0.16 + slowBreath * 0.09;

      const positionAttribute = particleGeometry.attributes.position;
      const colorAttribute = particleGeometry.attributes.color;

      for (let i = 0; i < particleCount; i += 1) {
        const baseIndex = i * 3;
        const seed = particleSeeds[i];
        const x = basePositions[baseIndex];
        const y = basePositions[baseIndex + 1];
        const z = basePositions[baseIndex + 2];
        const distance = Math.sqrt(x * x + z * z);
        const angle = Math.atan2(z, x);
        const flow =
          elapsed * (0.08 + energy * 0.035) +
          seed +
          Math.sin(elapsed * 0.07 + distance) * 0.25;
        const orbitalDrift =
          angle + elapsed * 0.018 + Math.sin(seed + elapsed * 0.11) * 0.07;
        let radialOffset = Math.sin(flow + distance * 0.44) * (0.18 + energy * 0.1);
        let verticalOffset =
          Math.sin(flow * 1.2 + distance * 0.31) * (0.22 + breath * 0.16);
        let colorMix = 0;
        tmpColor.setRGB(
          baseColors[baseIndex],
          baseColors[baseIndex + 1],
          baseColors[baseIndex + 2]
        );

        for (const pulse of pulses) {
          const progress = pulse.age / pulse.lifetime;
          const falloff = 1 - progress;
          const ringSpeed =
            pulse.kind === "agent_thinking"
              ? 8.2
              : pulse.kind === "tool_call"
                ? 22
                : pulse.kind === "file_written"
                  ? 13
                  : 18;
          const width =
            pulse.kind === "agent_thinking"
              ? 5.5
              : pulse.kind === "tool_call"
                ? 1.15
                : pulse.kind === "file_written"
                  ? 2.1
                  : 4.2;
          const ring = progress * ringSpeed;
          const ringDelta = Math.abs(distance - ring);
          const ringInfluence = Math.max(0, 1 - ringDelta / width) * falloff;
          const directional =
            pulse.kind !== "tool_call"
              ? 1
              : Math.max(0, Math.cos(angle - pulse.direction)) ** 9;

          if (ringInfluence > 0) {
            const force = ringInfluence * directional * pulse.strength;
            radialOffset += force * (pulse.kind === "tool_call" ? 1.4 : 0.62);
            verticalOffset += force * (pulse.kind === "agent_thinking" ? 0.34 : 0.82);
            colorMix = Math.max(colorMix, force * 0.55);
            tmpColor.lerp(pulse.hue, Math.min(0.75, force * 0.42));
          }
        }

        positionAttribute.setXYZ(
          i,
          Math.cos(orbitalDrift) * (distance + radialOffset),
          y + verticalOffset,
          Math.sin(orbitalDrift) * (distance + radialOffset)
        );

        const shimmer = 0.75 + Math.sin(seed + elapsed * 1.7) * 0.18 + colorMix;
        colorAttribute.setXYZ(
          i,
          tmpColor.r * shimmer,
          tmpColor.g * shimmer,
          tmpColor.b * shimmer
        );
      }

      positionAttribute.needsUpdate = true;
      colorAttribute.needsUpdate = true;
      particleMaterial.opacity = 0.42 + energy * 0.16;
      particleMaterial.size = 0.032 + energy * 0.012;

      const foregroundAttribute = foregroundGeometry.attributes.position;
      for (let i = 0; i < foregroundCount; i += 1) {
        const baseIndex = i * 3;
        const seed = foregroundSeeds[i];
        foregroundAttribute.setXYZ(
          i,
          foregroundBase[baseIndex] + Math.sin(elapsed * 0.12 + seed) * 0.6,
          foregroundBase[baseIndex + 1] + Math.cos(elapsed * 0.16 + seed) * 0.32,
          foregroundBase[baseIndex + 2] + Math.sin(elapsed * 0.08 + seed) * 1.1
        );
      }
      foregroundAttribute.needsUpdate = true;
      foregroundMaterial.opacity = 0.08 + energy * 0.045;

      root.rotation.y = elapsed * 0.014;
      root.rotation.x = Math.sin(elapsed * 0.13) * 0.035;
      lattice.rotation.y = -elapsed * 0.025;
      lattice.rotation.z = Math.sin(elapsed * 0.09) * 0.04;
      foreground.rotation.y = Math.sin(elapsed * 0.06) * 0.028;

      core.scale.setScalar(1 + energy * 0.48 + resonance * 0.9 + breath * 0.07);
      halo.scale.setScalar(1.2 + energy * 1.3 + resonance * 2.2 + slowBreath * 0.22);
      (core.material as THREE.MeshBasicMaterial).opacity =
        0.18 + energy * 0.16 + resonance * 0.2;
      (halo.material as THREE.MeshBasicMaterial).opacity =
        0.035 + energy * 0.042 + resonance * 0.08;

      rings.forEach((ring, index) => {
        ring.rotation.z =
          elapsed * (0.045 + index * 0.018) * (index % 2 === 0 ? 1 : -1);
        ring.rotation.y += delta * (0.08 + energy * 0.05) * (index === 1 ? -1 : 1);
        const scale = 1 + breath * 0.025 + energy * (0.08 + index * 0.02);
        ring.scale.setScalar(scale + resonance * (0.22 + index * 0.18));
        ringMaterials[index].opacity =
          0.08 + energy * 0.065 + resonance * (0.1 - index * 0.018);
      });

      nodes.forEach((node, index) => {
        nodeFlash[index] += (0 - nodeFlash[index]) * delta * 1.65;
        const material = node.material as THREE.MeshBasicMaterial;
        const pulse =
          Math.sin(elapsed * 1.6 + index * 1.17) * 0.18 +
          Math.sin(elapsed * 0.47 + index) * 0.12;
        const scale = 1.0 + energy * 0.34 + pulse + nodeFlash[index] * 2.2;
        node.scale.setScalar(Math.max(0.7, scale));
        material.opacity = 0.22 + energy * 0.18 + nodeFlash[index] * 0.42;
        material.color.copy(nodeFlash[index] > 0.12 ? ember : plasma).lerp(
          gold,
          resonance * 0.5
        );
      });

      for (let i = 0; i < nodes.length; i += 1) {
        const a = nodes[i];
        const b = nodes[(i + 5) % nodes.length];
        connectionPositions[i * 6] = a.position.x;
        connectionPositions[i * 6 + 1] = a.position.y;
        connectionPositions[i * 6 + 2] = a.position.z;
        connectionPositions[i * 6 + 3] = b.position.x;
        connectionPositions[i * 6 + 4] = b.position.y;
        connectionPositions[i * 6 + 5] = b.position.z;
      }
      connectionGeometry.attributes.position.needsUpdate = true;
      connectionMaterial.opacity = 0.06 + energy * 0.08 + resonance * 0.12;

      let toolPulse: EventPulse | undefined;
      for (let i = pulses.length - 1; i >= 0; i -= 1) {
        if (pulses[i].kind === "tool_call") {
          toolPulse = pulses[i];
          break;
        }
      }
      rayMaterial.opacity = toolPulse
        ? Math.max(0, 1 - toolPulse.age / toolPulse.lifetime) * 0.46
        : rayMaterial.opacity * 0.9;
      if (toolPulse) {
        for (let i = 0; i < 18; i += 1) {
          const spread = (i - 8.5) * 0.035;
          const angle = toolPulse.direction + spread;
          const length = 7 + i * 0.36;
          rayPositions[i * 6] = Math.cos(angle) * 0.7;
          rayPositions[i * 6 + 1] = Math.sin(i * 0.8) * 0.25;
          rayPositions[i * 6 + 2] = Math.sin(angle) * 0.7;
          rayPositions[i * 6 + 3] = Math.cos(angle) * length;
          rayPositions[i * 6 + 4] = Math.sin(i * 0.8) * 0.25;
          rayPositions[i * 6 + 5] = Math.sin(angle) * length;
        }
        rayGeometry.attributes.position.needsUpdate = true;
        rayMaterial.color.copy(violet).lerp(plasma, 0.35);
      }

      const waveIntensity = 0.25 + energy * 0.42 + resonance * 0.6;
      for (let i = 0; i < 128; i += 1) {
        const pct = i / 127;
        const x = (pct - 0.5) * 19;
        const carrier = Math.sin(pct * Math.PI * 8 + elapsed * 1.8);
        const sub = Math.sin(pct * Math.PI * 21 - elapsed * 1.12) * 0.18;
        const breathWave = Math.sin(elapsed * 0.74 + pct * Math.PI * 2) * 0.1;
        wavePoints[i * 3] = x;
        wavePoints[i * 3 + 1] = (carrier * 0.36 + sub + breathWave) * waveIntensity;
        wavePoints[i * 3 + 2] =
          -1.4 + Math.sin(pct * Math.PI * 2 + elapsed * 0.62) * 0.45;
      }
      waveGeometry.attributes.position.needsUpdate = true;
      waveMaterial.opacity = 0.14 + energy * 0.15 + resonance * 0.18;
      waveMaterial.color.copy(ember).lerp(gold, resonance * 0.8);

      camera.position.x = Math.sin(elapsed * 0.07) * 1.6;
      camera.position.y = 1.8 + Math.sin(elapsed * 0.083) * 0.42 + resonance * 0.22;
      camera.position.z = 20 + Math.sin(elapsed * 0.05) * 1.1 - energy * 0.55;
      camera.lookAt(0, Math.sin(elapsed * 0.11) * 0.36, 0);

      renderer.render(scene, camera);
      animationFrame = window.requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.cancelAnimationFrame(animationFrame);
      window.removeEventListener("resize", onResize);
      mount.removeChild(renderer.domElement);
      deepGeometry.dispose();
      deepMaterial.dispose();
      particleGeometry.dispose();
      particleMaterial.dispose();
      foregroundGeometry.dispose();
      foregroundMaterial.dispose();
      core.geometry.dispose();
      (core.material as THREE.Material).dispose();
      halo.geometry.dispose();
      (halo.material as THREE.Material).dispose();
      rings.forEach((ring) => ring.geometry.dispose());
      ringMaterials.forEach((material) => material.dispose());
      nodeGeometry.dispose();
      nodes.forEach((node) => (node.material as THREE.Material).dispose());
      connectionGeometry.dispose();
      connectionMaterial.dispose();
      waveGeometry.dispose();
      waveMaterial.dispose();
      rayGeometry.dispose();
      rayMaterial.dispose();
      renderer.dispose();
    };
  }, []);

  return (
    <div
      ref={mountRef}
      className="absolute inset-0 z-0 bg-[radial-gradient(circle_at_50%_46%,#071516_0%,#03050b_48%,#010104_100%)]"
      aria-hidden="true"
    />
  );
}
