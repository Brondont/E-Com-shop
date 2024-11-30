import { OrbitControls, PerspectiveCamera, Stage } from "@react-three/drei";
import { Canvas, useThree, extend } from "@react-three/fiber";
import React, { Suspense, useState, useCallback } from "react";
import { ComputerModel } from "./ComputerModel";

const ModelContainer: React.FC = () => {
  const [isGrabbing, setIsGrabbing] = useState(false);

  const handlePointerDown = useCallback(() => {
    setIsGrabbing(true);
  }, []);

  const handlePointerUp = useCallback(() => {
    setIsGrabbing(false);
  }, []);

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        cursor: isGrabbing ? "grabbing" : "grab",
      }}
    >
      <Canvas
        onPointerDown={handlePointerDown}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerUp}
      >
        <Suspense fallback="Loading...">
          <Stage environment="night">
            <ComputerModel />
          </Stage>
          <directionalLight color="white" position={[0, -5, 0]} />
          <PerspectiveCamera position={[-1, 0, 1.8]} zoom={0.7} makeDefault />
          <OrbitControls enableZoom={false} autoRotate />
        </Suspense>
      </Canvas>
    </div>
  );
};

export default ModelContainer;

