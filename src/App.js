import { Suspense, useState, useRef, forwardRef, useEffect, useMemo } from 'react'
import { Canvas, useThree } from '@react-three/fiber'
import { OrbitControls, TransformControls, ContactShadows, useGLTF, useCursor, useHelper, Select, useSelect } from '@react-three/drei'
import { proxy, useSnapshot } from 'valtio'
import { BoxHelper } from 'three'

// Reactive state model, using Valtio ...
const modes = ['translate', 'rotate', 'scale']
const state = proxy({ current: null, mode: 0 })

const Selection = forwardRef(({ children: meshes }, ref) => {
  // const { mouse } = useThree()
  // const [selectedMeshNames, setSelectedMeshNames] = useState([])
  const groupRef = useRef()
  useHelper(groupRef, BoxHelper, 'blue')
  // const snap = useSnapshot(state)
  // const scene = useThree((state) => state.scene)
  const select = useSelect()

  useEffect(() => {
    console.log('select', select)
  }, [select])

  // useEffect(() => {
  //   console.log("snap", snap.selectedMeshNames);
  // }, [snap.selectedMeshNames]);

  // useEffect(() => {
  //   console.log("selectedMeshNames", selectedMeshNames);
  // }, [selectedMeshNames]);

  // useEffect(() => {
  //   setSelectedMeshNames(state.selectedMeshNames);
  // }, [state.selectedMeshNames]);

  // console.log("meshes", meshes);

  // useEffect(() => {
  //   state.selectedMeshNames = [...selectedMeshNames] // set to the global store when useState is sets
  // }, [selectedMeshNames])

  // const nonSelectedMeshes = useMemo(() => first, [second]);

  const { selectedMeshes, nonSelectedMeshes } = useMemo(() => {
    return [...meshes].reduce(
      (result, mesh) => {
        if ([...select.map((selected) => selected.name)].includes(mesh.props.name)) {
          result.selectedMeshes.push(mesh)
          return result
        } else {
          result.nonSelectedMeshes.push(mesh)
          return result
        }
      },
      {
        selectedMeshes: [],
        nonSelectedMeshes: [],
      },
    )
  }, [meshes, select])

  // console.log('meshes', meshes)

  // useEffect(() => {
  //   // console.log("selectedMeshes", [
  //   //   ...selectedMeshes.map((mesh) => mesh.props.name),
  //   // ]);
  //   console.log('selectedMeshes', selectedMeshes)
  // }, [selectedMeshes])

  useEffect(() => {
    console.log('nonSelectedMeshes', [...nonSelectedMeshes.map((mesh) => mesh.props.name)])
  }, [nonSelectedMeshes])

  return (
    <>
      <group ref={groupRef}>{selectedMeshes}</group>
      {/* <Select
        box
        multiple
        // filter={(items) => {
        //   console.log('items', items)
        //   return items
        // }}
        // onChange={(args) => {
        //   setSelectedMeshNames(() => [...args.map((mesh) => mesh.name)]) // get selected meshs(single or multiple), set them to a useState
        // }}
      > */}
      {/* {selectedMeshes.length > 0 && (
          <TransformControls
            object={ref}
            // attach={(<group></group>) as unknown as Object3D}
            // object={(snap.selected).map((mechName: string) =>
            //   scene.getObjectByName(mechName)
            // )}
            mode={modes[snap.mode]}
          />
        )} */}
      {/* {meshes} */}
      {/* {selectedMeshes} */}
      {nonSelectedMeshes}
      {/* </Select> */}
    </>
  )
})

function Model({ name, ...props }) {
  // Ties this component to the state model
  const snap = useSnapshot(state)
  // Fetching the GLTF, nodes is a collection of all the meshes
  // It's cached/memoized, it only gets loaded and parsed once
  const { nodes } = useGLTF('/compressed.glb')
  // Feed hover state into useCursor, which sets document.body.style.cursor to pointer|auto
  const [hovered, setHovered] = useState(false)
  useCursor(hovered)
  return (
    <mesh
      // Click sets the mesh as the new target
      onClick={(e) => (e.stopPropagation(), (state.current = name))}
      // If a click happened but this mesh wasn't hit we null out the target,
      // This works because missed pointers fire before the actual hits
      onPointerMissed={(e) => e.type === 'click' && (state.current = null)}
      // Right click cycles through the transform modes
      onContextMenu={(e) => snap.current === name && (e.stopPropagation(), (state.mode = (snap.mode + 1) % modes.length))}
      onPointerOver={(e) => (e.stopPropagation(), setHovered(true))}
      onPointerOut={(e) => setHovered(false)}
      name={name}
      geometry={nodes[name].geometry}
      material={nodes[name].material}
      material-color={snap.current === name ? '#ff6080' : 'white'}
      {...props}
      dispose={null}
    />
  )
}

function Models() {
  const groupRef = useRef()
  useHelper(groupRef, BoxHelper, 'blue')
  return (
    <group position={[0, 10, 0]}>
      {/* <group ref={groupRef}></group> */}
      <Select
        box
        multiple
        // filter={(items) => {
        //   console.log('items', items)
        //   return items
        // }}
        // onChange={(args) => {
        //   setSelectedMeshNames(() => [...args.map((mesh) => mesh.name)]) // get selected meshs(single or multiple), set them to a useState
        // }}
      >
        <Selection ref={groupRef}>
          <Model name="Curly" position={[1, -11, -20]} rotation={[2, 0, -0]} />
          <Model name="DNA" position={[20, 0, -17]} rotation={[1, 1, -2]} />
          <Model name="Headphones" position={[20, 2, 4]} rotation={[1, 0, -1]} />
          <Model name="Notebook" position={[-21, -15, -13]} rotation={[2, 0, 1]} />
          <Model name="Rocket003" position={[18, 15, -25]} rotation={[1, 1, 0]} />
          <Model name="Roundcube001" position={[-25, -4, 5]} rotation={[1, 0, 0]} scale={0.5} />
          <Model name="Table" position={[1, -4, -28]} rotation={[1, 0, -1]} scale={0.5} />
          <Model name="VR_Headset" position={[7, -15, 28]} rotation={[1, 0, -1]} scale={5} />
          <Model name="Zeppelin" position={[-20, 10, 10]} rotation={[3, -1, 3]} scale={0.005} />
        </Selection>
      </Select>
      <ContactShadows rotation-x={Math.PI / 2} position={[0, -35, 0]} opacity={0.25} width={200} height={200} blur={1} far={50} />
    </group>
  )
}

function Controls() {
  // Get notified on changes to state
  const snap = useSnapshot(state)
  const scene = useThree((state) => state.scene)
  return (
    <>
      {/* As of drei@7.13 transform-controls can refer to the target by children, or the object prop */}
      {snap.current && <TransformControls object={scene.getObjectByName(snap.current)} mode={modes[snap.mode]} />}
      {/* makeDefault makes the controls known to r3f, now transform-controls can auto-disable them when active */}
      <OrbitControls makeDefault minPolarAngle={0} maxPolarAngle={Math.PI / 1.75} />
    </>
  )
}

export default function App() {
  return (
    <Canvas camera={{ position: [0, -10, 80], fov: 50 }} dpr={[1, 2]}>
      <pointLight position={[100, 100, 100]} intensity={0.8} />
      <hemisphereLight color="#ffffff" groundColor="#b9b9b9" position={[-7, 25, 13]} intensity={0.85} />
      <Suspense fallback={null}>
        <Models />
      </Suspense>
      <Controls />
    </Canvas>
  )
}
