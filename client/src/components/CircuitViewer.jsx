import { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Line, Html, Environment, Text } from '@react-three/drei';
import * as THREE from 'three';

// Generate a simple procedural racetrack shape based on the round number
// In a full production app, you'd load actual .glb files here.
function generateTrackPoints(seed) {
  const points = [];
  const segments = 60;
  for (let i = 0; i <= segments; i++) {
    const t = i / segments;
    const angle = t * Math.PI * 2;
    // Mutate radius using sine waves based on the "seed" (round number) for variety
    const r = 2 + Math.sin(angle * 3 + seed) * 0.8 + Math.cos(angle * 2 - seed) * 0.5;
    points.push(new THREE.Vector3(Math.cos(angle) * r, 0, Math.sin(angle) * r));
  }
  return points;
}

function Circuit({ trackData }) {
  const lineRef = useRef();
  
  // Memoize the track to avoid regenerating on every frame
  const points = useMemo(() => generateTrackPoints(trackData.round), [trackData.round]);
  
  // Slowly rotate the track automatically
  useFrame((state) => {
    if (lineRef.current) {
      lineRef.current.rotation.y = state.clock.elapsedTime * 0.1;
    }
  });

  return (
    <group ref={lineRef}>
      {/* The neon ribbon for the track */}
      <Line 
        points={points}
        color="#E10600" // F1 Red
        lineWidth={6}
        dashed={false}
      />
      {/* Glow effect duplicate */}
      <Line 
        points={points}
        color="#ff4d4d"
        lineWidth={15}
        transparent
        opacity={0.2}
      />

      {/* Start/Finish Line Marker */}
      <mesh position={points[0]}>
        <sphereGeometry args={[0.2, 16, 16]} />
        <meshStandardMaterial color="#ffffff" emissive="#aaaaaa" emissiveIntensity={0.5} />
        <Html distanceFactor={10} position={[0, 0.5, 0]} center>
          <div className="bg-f1-dark/90 text-white text-xs font-bold px-2 py-1 rounded border border-white/20 whitespace-nowrap backdrop-blur-sm shadow-xl">
            🏁 S/F Line
          </div>
        </Html>
      </mesh>
      
      {/* Sector 2 Marker */}
      <mesh position={points[Math.floor(points.length * 0.4)]}>
        <sphereGeometry args={[0.1, 16, 16]} />
        <meshStandardMaterial color="#f1bc05" />
        <Html distanceFactor={10} position={[0, 0.5, 0]} center>
          <div className="bg-f1-dark/80 text-[#f1bc05] text-[10px] font-bold px-1.5 py-0.5 rounded border border-[#f1bc05]/30">
            Sector 2
          </div>
        </Html>
      </mesh>
      
      {/* Sector 3 Marker */}
      <mesh position={points[Math.floor(points.length * 0.75)]}>
        <sphereGeometry args={[0.1, 16, 16]} />
        <meshStandardMaterial color="#f1bc05" />
        <Html distanceFactor={10} position={[0, 0.5, 0]} center>
          <div className="bg-f1-dark/80 text-[#f1bc05] text-[10px] font-bold px-1.5 py-0.5 rounded border border-[#f1bc05]/30">
            Sector 3
          </div>
        </Html>
      </mesh>
    </group>
  );
}

export default function CircuitViewer({ trackData }) {
  if (!trackData) return null;

  return (
    <div className="w-full h-full min-h-[300px] bg-gradient-to-b from-black to-f1-dark/80 rounded-xl overflow-hidden border border-white/10 relative">
      <div className="absolute top-4 left-4 z-10 pointer-events-none">
        <h4 className="text-white font-black text-xl flex items-center gap-2">
          <span>{trackData.flag}</span> {trackData.grandPrixName}
        </h4>
        <p className="text-gray-400 text-sm">Interactive 3D Preview</p>
      </div>
      
      <Canvas camera={{ position: [0, 4, 6], fov: 50 }}>
        {/* Adds studio lighting reflections */}
        <Environment preset="city" />
        <ambientLight intensity={0.5} />
        <directionalLight position={[10, 10, 5]} intensity={1} />
        
        <Circuit trackData={trackData} />
        
        {/* Allow users to click and drag to orbit the camera */}
        <OrbitControls 
          enablePan={false} 
          minPolarAngle={Math.PI / 6} 
          maxPolarAngle={Math.PI / 2.1} 
          minDistance={3}
          maxDistance={12}
          autoRotate={false}
        />
      </Canvas>
    </div>
  );
}
