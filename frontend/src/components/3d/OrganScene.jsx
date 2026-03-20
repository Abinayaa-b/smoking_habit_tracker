import { Canvas } from '@react-three/fiber'
import { OrbitControls, Stars, Environment, ContactShadows } from '@react-three/drei'
import { Suspense } from 'react'
import OrganMesh from './OrganMesh'
import { useAppStore } from '../../store/useStore'

function SceneContent({ organType, damagePct }) {
  const { organSpeaking } = useAppStore()
  const isSpeaking = organSpeaking === organType

  return (
    <>
      <ambientLight intensity={0.4} />
      <Environment preset="studio" /> {/* HDR Environment lighting */}
      <spotLight position={[5, 10, 5]} intensity={1.5} penumbra={1} castShadow />
      <pointLight position={[-5, 0, -5]} color="#533483" intensity={2.0} /> {/* Rim light */}

      {/* Soft shadows directly underneath the organ */}
      <ContactShadows position={[0, -1.5, 0]} opacity={0.4} scale={10} blur={2} far={4} />

      <Stars radius={80} depth={50} count={2000} factor={3} saturation={0.5} fade speed={0.5} />

      <OrganMesh
        organType={organType}
        damagePct={damagePct}
        isSelected={true}
        isSpeaking={isSpeaking}
      />

      <OrbitControls
        enablePan={false}
        enableZoom={false}
        autoRotate={!isSpeaking}
        autoRotateSpeed={1.5}
        maxPolarAngle={Math.PI * 0.7}
        minPolarAngle={Math.PI * 0.3}
      />
    </>
  )
}

export default function OrganScene({ organType = 'heart', damagePct = 0 }) {
  return (
    <Canvas
      camera={{ position: [0, 0, 4], fov: 50 }}
      gl={{ antialias: true }}
      className="rounded-xl"
    >
      <Suspense fallback={null}>
        <SceneContent organType={organType} damagePct={damagePct} />
      </Suspense>
    </Canvas>
  )
}
