declare module 'three/examples/jsm/loaders/STLLoader' {
  import { Loader, BufferGeometry } from 'three'

  export class STLLoader extends Loader {
    constructor()
    load(
      url: string,
      onLoad: (geometry: BufferGeometry) => void,
      onProgress?: (event: ProgressEvent) => void,
      onError?: (error: unknown) => void
    ): void
    parse(data: ArrayBuffer | string): BufferGeometry
  }
}
