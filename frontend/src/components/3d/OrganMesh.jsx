import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import { Float } from '@react-three/drei'
import * as THREE from 'three'

/**
 * Organ specific colors used during shader blending.
 */
const organColors = {
  heart: { healthy: '#ff4d6d', damaged: '#2d0a0a' },
  lungs: { healthy: '#ffb6c1', damaged: '#1a1a1a' },
  brain: { healthy: '#e8d5ec', damaged: '#4a3a4a' },
  liver: { healthy: '#a52a2a', damaged: '#3b1c1c' }
}

export default function OrganMesh({ organType = 'heart', damagePct = 0, isSelected = false, isSpeaking = false }) {
  const groupRef = useRef()
  
  const damageFactor = damagePct / 100.0 // Normalize 0 - 1
  const colors = organColors[organType] || organColors.heart

  const customUniforms = useMemo(() => ({
    uDamage: { value: damageFactor },
    uHealthyColor: { value: new THREE.Color(colors.healthy) },
    uDamagedColor: { value: new THREE.Color(colors.damaged) },
    uTime: { value: 0 }
  }), [colors])

  // Update uniforms when damage or time changes
  useFrame((state) => {
    if (!groupRef.current) return
    const t = state.clock.elapsedTime
    
    if (customUniforms.uTime) { customUniforms.uTime.value = t }
    if (customUniforms.uDamage) {
      customUniforms.uDamage.value = THREE.MathUtils.lerp(customUniforms.uDamage.value, damagePct / 100.0, 0.05)
    }

    // Animation speed control
    const speedFactor = 1.0 - (damageFactor * 0.5)

    if (organType === 'heart') {
      const beat = Math.sin(t * speedFactor * 5) * 0.06 * speedFactor
      // Double beat imitation
      const beat2 = Math.sin(t * speedFactor * 5 + 1.5) * 0.03 * speedFactor
      groupRef.current.scale.setScalar(1 + Math.max(0, beat + beat2))
    } else if (organType === 'lungs') {
      const breath = Math.sin(t * speedFactor * 1.5) * 0.08 * speedFactor
      groupRef.current.scale.set(1 + breath, 1 + breath * 1.2, 1 + breath)
    } else if (organType === 'liver') {
      const organic = Math.sin(t * speedFactor * 0.5) * 0.02
      groupRef.current.rotation.z = Math.sin(t * 0.5) * 0.05
      groupRef.current.scale.set(1 + organic, 1, 1 + organic)
    } else if (organType === 'brain') {
      const pulse = Math.sin(t * speedFactor * 2) * 0.01
      groupRef.current.scale.setScalar(1 + pulse)
      groupRef.current.rotation.y = t * speedFactor * 0.1
    }

    if (isSpeaking) {
      groupRef.current.scale.multiplyScalar(1 + Math.sin(t * 15) * 0.02)
    }
  })

  const handleCompile = useMemo(() => (shader) => {
    shader.uniforms.uDamage = customUniforms.uDamage
    shader.uniforms.uHealthyColor = customUniforms.uHealthyColor
    shader.uniforms.uDamagedColor = customUniforms.uDamagedColor
    shader.uniforms.uTime = customUniforms.uTime

    // Brain needs extreme vertex displacement to look like a brain
    shader.vertexShader = shader.vertexShader.replace(
      `#include <begin_vertex>`,
      `#include <begin_vertex>
      if (${organType === 'brain' ? '1.0' : '0.0'} > 0.5) {
         // Create sulci/gyri organ folds
         float folds = sin(position.x * 15.0) * cos(position.y * 15.0) * sin(position.z * 15.0);
         transformed += normal * abs(folds) * 0.06;
      }
      `
    )

    shader.fragmentShader = shader.fragmentShader.replace(
      `#include <common>`,
      `#include <common>
      uniform float uDamage;
      uniform vec3 uHealthyColor;
      uniform vec3 uDamagedColor;
      uniform float uTime;
      
      float hash(vec2 p) { return fract(1e4 * sin(17.0 * p.x + p.y * 0.1) * (0.1 + abs(sin(p.y * 13.0 + p.x)))); }
      float noise(vec2 x) {
          vec2 i = floor(x);
          vec2 f = fract(x);
          float a = hash(i);
          float b = hash(i + vec2(1.0, 0.0));
          float c = hash(i + vec2(0.0, 1.0));
          float d = hash(i + vec2(1.0, 1.0));
          vec2 u = f * f * (3.0 - 2.0 * f);
          return mix(a, b, u.x) + (c - a) * u.y * (1.0 - u.x) + (d - b) * u.x * u.y;
      }
      `
    )

    shader.fragmentShader = shader.fragmentShader.replace(
      `#include <color_fragment>`,
      `#include <color_fragment>
      
      vec3 finalColor = diffuseColor.rgb;
      
      float n1 = noise(vViewPosition.xy * 2.0);
      float n2 = noise(vViewPosition.xy * 5.0);
      
      if (uDamage > 0.2 && uDamage <= 0.4) {
        finalColor = mix(finalColor, uDamagedColor, 0.3 * uDamage);
      } 
      else if (uDamage > 0.4 && uDamage <= 0.7) {
        float patchMask = smoothstep(1.0 - uDamage, 1.2 - uDamage, n1);
        finalColor = mix(finalColor, uDamagedColor, patchMask * 0.8);
      } 
      else if (uDamage > 0.7) {
        float cracks = smoothstep(0.4, 0.45, noise(vViewPosition.xy * 10.0)) * smoothstep(0.45, 0.4, noise(vViewPosition.xy * 10.0 + 0.1));
        finalColor = mix(finalColor, vec3(0.02), cracks * uDamage);
        
        float heavyMask = smoothstep(0.0, 1.0, n1 + n2*0.5);
        finalColor = mix(finalColor, uDamagedColor, heavyMask * uDamage * 0.9);
      }

      diffuseColor = vec4(finalColor, diffuseColor.a);
      `
    )
  }, [customUniforms, organType])

  const organMaterial = <meshStandardMaterial 
    color={colors.healthy} 
    roughness={0.5} 
    metalness={0.1} 
    onBeforeCompile={handleCompile}
    emissive={colors.healthy}
    emissiveIntensity={0.1 + (isSpeaking ? 0.2 : 0)}
  />

  return (
    <Float speed={1.2} rotationIntensity={0.15} floatIntensity={0.2}>
      <group ref={groupRef}>
        
        {organType === 'heart' && (
          <group position={[0, -0.2, 0]}>
            {/* Main Ventricle */}
            <mesh scale={[1, 1.1, 0.8]} position={[0, 0, 0]}>
               <sphereGeometry args={[0.9, 64, 64]} />
               {organMaterial}
            </mesh>
            {/* Aorta Arch */}
            <mesh scale={[0.4, 0.6, 0.4]} position={[0.2, 0.8, -0.1]} rotation={[0, 0, -0.3]}>
               <capsuleGeometry args={[0.5, 1, 32, 32]} />
               {organMaterial}
            </mesh>
            {/* Pulmonary Artery */}
            <mesh scale={[0.3, 0.5, 0.3]} position={[-0.3, 0.7, 0.1]} rotation={[0, 0, 0.4]}>
               <capsuleGeometry args={[0.5, 1, 32, 32]} />
               {organMaterial}
            </mesh>
          </group>
        )}

        {organType === 'lungs' && (
          <group position={[0, -0.3, 0]}>
            {/* Left Lung */}
            <mesh scale={[0.8, 1.3, 0.8]} position={[-0.75, 0, 0]} rotation={[0, 0, -0.1]}>
              <sphereGeometry args={[0.8, 64, 64]} />
              {organMaterial}
            </mesh>
            {/* Right Lung (slightly larger) */}
            <mesh scale={[0.85, 1.35, 0.85]} position={[0.75, 0, 0]} rotation={[0, 0, 0.1]}>
              <sphereGeometry args={[0.8, 64, 64]} />
              {organMaterial}
            </mesh>
            {/* Trachea */}
            <mesh position={[0, 1.4, 0]}>
              <cylinderGeometry args={[0.15, 0.15, 0.8, 32]} />
              {organMaterial}
            </mesh>
          </group>
        )}

        {organType === 'brain' && (
          <group position={[0, 0, 0]}>
            {/* Hemispheres with vertex fold displacement applied via shader */}
            <mesh scale={[1.0, 0.85, 1.2]} position={[-0.05, 0, 0]}>
              <sphereGeometry args={[1, 128, 128]} />
              {organMaterial}
            </mesh>
          </group>
        )}

        {organType === 'liver' && (
          <group position={[0, 0, 0]}>
            {/* Asymmetrical liver base */}
            <mesh scale={[1.6, 0.9, 1.0]} position={[0.2, 0, 0]} rotation={[0, 0, -0.2]}>
              <sphereGeometry args={[0.9, 64, 64]} />
              {organMaterial}
            </mesh>
            {/* Left lobe */}
            <mesh scale={[0.7, 0.6, 0.7]} position={[-0.8, 0.2, 0]}>
              <sphereGeometry args={[0.8, 64, 64]} />
              {organMaterial}
            </mesh>
          </group>
        )}

      </group>
    </Float>
  )
}
