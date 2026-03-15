import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, Float, MeshDistortMaterial, MeshWobbleMaterial, Sparkles, PerspectiveCamera as DreiCamera } from '@react-three/drei';
import * as THREE from 'three';

// Suzuka Circuit Path (Approximate High-Fidelity Spline for a figure-eight)
const suzukaPoints = [
  new THREE.Vector3(0, 0, 0),       // Start/Finish
  new THREE.Vector3(20, 0, 5),      // Turn 1 & 2
  new THREE.Vector3(25, 1, 15),     // S-Curves (Start)
  new THREE.Vector3(20, 2, 25),     // Turns 3 & 4
  new THREE.Vector3(25, 3, 35),     // Turns 5 & 6
  new THREE.Vector3(10, 4, 40),     // Dunlop Curve
  new THREE.Vector3(-5, 5, 35),     // Degner 1 & 2
  new THREE.Vector3(-15, 6, 25),    // Hairpin
  new THREE.Vector3(-5, 7, 10),     // Toward the crossover
  new THREE.Vector3(10, 8, 0),      // The Bridge (Top Level)
  new THREE.Vector3(25, 7, -15),    // Turn 11
  new THREE.Vector3(15, 6, -30),    // Spoon Curve (Part 1)
  new THREE.Vector3(0, 5, -40),     // Spoon Curve (Part 2)
  new THREE.Vector3(-20, 4, -30),   // Backstretch toward 130R
  new THREE.Vector3(-30, 3, -10),   // 130R
  new THREE.Vector3(-20, 2, 0),     // Under the bridge
  new THREE.Vector3(-10, 1, 5),     // Casio Triangle (Chicane)
  new THREE.Vector3(0, 0, 0),       // Return to Start
];

const TrackSpline = ({ predictions }) => {
  const curve = useMemo(() => new THREE.CatmullRomCurve3(suzukaPoints), []);
  const linePoints = useMemo(() => curve.getPoints(200), [curve]);
  
  const lineGeometry = useMemo(() => {
    const geo = new THREE.BufferGeometry().setFromPoints(linePoints);
    return geo;
  }, [linePoints]);

  return (
    <group>
      {/* The main high-fidelity extruded track */}
      <mesh>
        <tubeGeometry args={[curve, 300, 0.4, 16, true]} />
        <meshStandardMaterial 
          color="#222" 
          emissive="#e10600" 
          emissiveIntensity={0.5} 
          roughness={0.1} 
          metalness={1}
        />
      </mesh>

      {/* Futuristic Glowing Neon Outline */}
      <mesh>
        <tubeGeometry args={[curve, 300, 0.45, 8, true]} />
        <meshBasicMaterial color="#e10600" transparent opacity={0.1} wireframe />
      </mesh>

      {/* Sparkles on the track for data feel */}
      <Sparkles 
        count={200} 
        scale={[60, 10, 80]} 
        size={2} 
        speed={0.5} 
        opacity={0.3} 
        color="#e10600"
      />

      {/* Probability Zones (Floating Rings) */}
      {predictions?.map((pred, i) => {
        // Place probability hotspots at strategic points on the track
        const t = (i * 0.33 + 0.1) % 1;
        const pos = curve.getPointAt(t);
        return (
          <Float key={i} speed={2} rotationIntensity={1} floatIntensity={1}>
            <mesh position={[pos.x, pos.y + 2, pos.z]}>
              <ringGeometry args={[0.8, 1.2, 32]} />
              <meshBasicMaterial color="#FFD700" side={THREE.DoubleSide} transparent opacity={0.8} />
              <pointLight color="#FFD700" intensity={5} distance={10} />
            </mesh>
            <mesh position={[pos.x, pos.y + 2, pos.z]} rotation={[Math.PI / 2, 0, 0]}>
               <circleGeometry args={[0.5, 32]} />
               <meshBasicMaterial color="#FFD700" transparent opacity={0.3} />
            </mesh>
          </Float>
        );
      })}
    </group>
  );
};

export default function TrackMap3D({ predictions }) {
  return (
    <div className="w-full h-full min-h-[400px] relative rounded-3xl overflow-hidden bg-gradient-to-b from-black/40 to-black/80 border border-white/5 shadow-2xl">
      <div className="absolute top-6 left-6 z-10 pointer-events-none">
        <span className="text-[10px] font-black text-f1-red uppercase tracking-[0.4em] italic mb-1 block">Circuit Reconstruction</span>
        <h4 className="text-xl font-black italic uppercase tracking-tighter">Suzuka · Internatonal</h4>
      </div>

      <Canvas shadows dpr={[1, 2]}>
        <PerspectiveCamera makeDefault position={[50, 40, 60]} fov={35} />
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 20, 10]} intensity={1.5} color="#e10600" />
        <spotLight position={[-20, 50, 10]} angle={0.15} penumbra={1} intensity={2} color="#fff" />
        
        <Float speed={1.5} rotationIntensity={0.2} floatIntensity={0.5}>
          <TrackSpline predictions={predictions} />
        </Float>

        <OrbitControls 
          enableDamping 
          dampingFactor={0.05} 
          minDistance={30} 
          maxDistance={120} 
          autoRotate 
          autoRotateSpeed={0.5}
          maxPolarAngle={Math.PI / 2.1}
        />
        
        <gridHelper args={[200, 40, '#ffffff', '#222222']} position={[0, -5, 0]} opacity={0.05} transparent />
      </Canvas>

      <div className="absolute bottom-6 right-6 z-10 pointer-events-none flex flex-col items-end">
        <div className="flex items-center gap-2 mb-2">
           <div className="w-2 h-2 rounded-full bg-f1-red shadow-[0_0_8px_#e10600]" />
           <span className="text-[9px] font-black text-white uppercase tracking-widest">Live Telemetry Link</span>
        </div>
        <span className="text-[8px] font-bold text-gray-500 uppercase tracking-widest tabular-nums">Coordinates: 34.8431° N, 136.5411° E</span>
      </div>
    </div>
  );
}
