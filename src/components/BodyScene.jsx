// ============================================================
// BodyScene — react-three-fiber parametric anatomy stage.
//
// This is the deterministic 3D engine described in the design brief:
//   • cinematic key+rim light on the ink-navy stage
//   • the body slowly breathes and gently rotates
//   • each organ's material shifts along a CONTINUOUS 0–1 vitality
//     spectrum (luminosity / tone / glow) — driven by bodyMap scores,
//     reproducible, assembled by data (no generative hallucination)
//
// Assets: drop real glTF anatomy into /public/models/ :
//   body-male.glb / body-female.glb  (with a "bmi" morph target)
//   organ meshes named: brain, heart, lungs, liver, digestive, kidneys, muscles
// Until then it renders calm placeholder proxies so the pipeline is live.
// ============================================================
import { Suspense, useMemo, useRef } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls, useGLTF } from '@react-three/drei'
import * as THREE from 'three'

// vitality 0..100 -> calm visual params (luminous & warm at 100, dim & cool toward 0)
function vitalityLook(v) {
  const t = Math.max(0, Math.min(1, v / 100))
  const healthy = new THREE.Color('#7fb6d8')   // luminous, well-perfused
  const strained = new THREE.Color('#5a6b80')  // dim, quiet (never alarming red)
  const color = strained.clone().lerp(healthy, t)
  return { color, emissive: color.clone().multiplyScalar(0.4), emissiveIntensity: 0.12 + 0.5 * t, opacity: 0.55 + 0.35 * t }
}

// approximate organ placements within a ~1.8m figure (used for placeholder proxies)
const ORGAN_POS = {
  brain: [0, 1.62, 0.02], heart: [-0.04, 1.18, 0.05], lungs: [0, 1.2, 0.04],
  liver: [0.09, 1.02, 0.05], digestive: [0, 0.9, 0.06], kidneys: [0, 0.95, -0.05], muscles: [0, 0.55, 0],
}
const ORGAN_SIZE = { brain: 0.09, heart: 0.07, lungs: 0.13, liver: 0.11, digestive: 0.13, kidneys: 0.06, muscles: 0.1 }

function OrganProxy({ id, vitality }) {
  const ref = useRef()
  const look = useMemo(() => vitalityLook(vitality), [vitality])
  useFrame((s) => { if (ref.current) ref.current.material.emissiveIntensity = look.emissiveIntensity * (0.9 + 0.1 * Math.sin(s.clock.elapsedTime * 1.5)) })
  return (
    <mesh ref={ref} position={ORGAN_POS[id] || [0, 1, 0]}>
      <sphereGeometry args={[ORGAN_SIZE[id] || 0.08, 32, 32]} />
      <meshStandardMaterial color={look.color} emissive={look.emissive} emissiveIntensity={look.emissiveIntensity}
        transparent opacity={0.92} roughness={0.45} metalness={0.05} />
    </mesh>
  )
}

function PlaceholderBody() {
  return (
    <mesh position={[0, 1, 0]}>
      <capsuleGeometry args={[0.26, 1.5, 12, 24]} />
      <meshPhysicalMaterial color="#9fc6e8" transparent opacity={0.16} roughness={0.1} transmission={0.9} thickness={0.5} />
    </mesh>
  )
}

function Figure({ organs }) {
  const group = useRef()
  // gentle breathing + slow rotation
  useFrame((s) => {
    if (!group.current) return
    const b = 1 + Math.sin(s.clock.elapsedTime * 0.9) * 0.012
    group.current.scale.set(b, b, b)
    group.current.rotation.y = Math.sin(s.clock.elapsedTime * 0.12) * 0.25
  })
  return (
    <group ref={group}>
      <PlaceholderBody />
      {(organs || []).map((o) => <OrganProxy key={o.id} id={o.id} vitality={o.vitality ?? o.score ?? 80} />)}
    </group>
  )
}

export default function BodyScene({ organs }) {
  return (
    <Canvas dpr={[1, 2]} camera={{ position: [0, 1.05, 3.2], fov: 35 }} style={{ width: '100%', height: '100%' }}>
      <color attach="background" args={['#0b1430']} />
      <ambientLight intensity={0.5} />
      <directionalLight position={[3, 4, 3]} intensity={1.4} color="#cfe6ff" />
      <directionalLight position={[-3, 2, -2]} intensity={0.7} color="#8fb4e6" />
      <Suspense fallback={null}>
        <Figure organs={organs} />
      </Suspense>
      <OrbitControls enablePan={false} enableZoom={false} autoRotate={false} minPolarAngle={Math.PI / 2.4} maxPolarAngle={Math.PI / 1.8} />
    </Canvas>
  )
}
