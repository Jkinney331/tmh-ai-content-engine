'use client'

import { useEffect, useMemo, useState } from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import { STLLoader } from 'three/examples/jsm/loaders/STLLoader'
import { Box3, BufferGeometry, Color, Vector3 } from 'three'

interface CadModelViewerProps {
  url: string
}

export function CadModelViewer({ url }: CadModelViewerProps) {
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    setError(null)
  }, [url])

  return (
    <div className="relative h-72 w-full overflow-hidden rounded-lg border border-[color:var(--surface-border)] bg-black/80">
      <Canvas
        camera={{ position: [2, 2, 2], fov: 45 }}
        onCreated={({ gl }) => {
          gl.setClearColor(new Color('#0b0b0f'))
        }}
      >
        <ambientLight intensity={0.6} />
        <directionalLight position={[3, 3, 2]} intensity={1} />
        <directionalLight position={[-3, -2, 2]} intensity={0.5} />
        <gridHelper args={[10, 10, '#1f2937', '#111827']} />
        <CadMesh url={url} onError={setError} />
        <OrbitControls enableDamping makeDefault />
      </Canvas>
      {error && (
        <div className="absolute inset-0 flex items-center justify-center text-sm text-red-300 bg-black/70">
          {error}
        </div>
      )}
    </div>
  )
}

function CadMesh({ url, onError }: { url: string; onError: (message: string | null) => void }) {
  const [geometry, setGeometry] = useState<BufferGeometry | null>(null)

  useEffect(() => {
    let cancelled = false
    const loader = new STLLoader()

    loader.load(
      url,
      (loaded) => {
        if (cancelled) return
        setGeometry(loaded)
        onError(null)
      },
      undefined,
      () => {
        if (cancelled) return
        onError('Failed to load STL file')
      }
    )

    return () => {
      cancelled = true
    }
  }, [url, onError])

  const transform = useMemo(() => {
    if (!geometry) return null
    geometry.computeBoundingBox()
    const box = geometry.boundingBox || new Box3()
    const size = new Vector3()
    const center = new Vector3()
    box.getSize(size)
    box.getCenter(center)
    const maxDim = Math.max(size.x || 1, size.y || 1, size.z || 1)
    const scale = 1.6 / maxDim
    return { center, scale }
  }, [geometry])

  if (!geometry || !transform) {
    return null
  }

  return (
    <mesh
      geometry={geometry}
      rotation={[-Math.PI / 2, 0, 0]}
      scale={[transform.scale, transform.scale, transform.scale]}
      position={[-transform.center.x * transform.scale, -transform.center.y * transform.scale, -transform.center.z * transform.scale]}
    >
      <meshStandardMaterial color="#e2e8f0" metalness={0.2} roughness={0.6} />
    </mesh>
  )
}
