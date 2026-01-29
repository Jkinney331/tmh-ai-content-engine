'use client'

import { useEffect, useMemo, useState } from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import { STLLoader } from 'three/examples/jsm/loaders/STLLoader'
import { Box3, BufferGeometry, Color, Vector3 } from 'three'
import { Loader2 } from 'lucide-react'

interface CadModelViewerProps {
  url: string
}

export function CadModelViewer({ url }: CadModelViewerProps) {
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setError(null)
    setLoading(true)
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
        <CadMesh
          url={url}
          onError={(message) => {
            setError(message)
            setLoading(false)
          }}
          onLoad={() => setLoading(false)}
        />
        <OrbitControls enableDamping makeDefault />
      </Canvas>
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/60 text-sm text-muted-foreground">
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Loading 3D preview...
        </div>
      )}
      {error && (
        <div className="absolute inset-0 flex items-center justify-center text-sm text-red-300 bg-black/70">
          {error}
        </div>
      )}
    </div>
  )
}

function CadMesh({
  url,
  onError,
  onLoad
}: {
  url: string
  onError: (message: string | null) => void
  onLoad: () => void
}) {
  const [geometry, setGeometry] = useState<BufferGeometry | null>(null)

  useEffect(() => {
    let cancelled = false
    const loader = new STLLoader()
    const timeout = setTimeout(() => {
      if (!cancelled) {
        onError('STL preview is taking longer than expected.')
      }
    }, 15000)

    loader.load(
      url,
      (loaded) => {
        if (cancelled) return
        setGeometry(loaded)
        onError(null)
        onLoad()
        clearTimeout(timeout)
      },
      undefined,
      () => {
        if (cancelled) return
        onError('Failed to load STL file')
        clearTimeout(timeout)
      }
    )

    return () => {
      cancelled = true
      clearTimeout(timeout)
    }
  }, [url, onError, onLoad])

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
