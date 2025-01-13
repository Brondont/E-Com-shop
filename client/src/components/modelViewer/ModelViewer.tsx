import React, { Suspense, useCallback, useEffect, useState } from "react";
import { useLoader, useThree } from "@react-three/fiber";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Stage } from "@react-three/drei";
import { Box, CircularProgress, Typography } from "@mui/material";
import { useFeedback } from "../../FeedbackAlertContext";

interface ModelProps {
  modelPath: string;
  onLoad?: () => void;
  onError?: (error: Error) => void;
}

const Model = ({ modelPath, onLoad, onError }: ModelProps) => {
  const { scene: threeScene } = useThree();
  const { showFeedback } = useFeedback();

  const gltf = useLoader(GLTFLoader, modelPath, (loader) => {
    const originalLoad = loader.load;
    loader.load = (url, onLoad, onProgress, onError) => {
      fetch(url)
        .then((response) => {
          if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
          }
          return response;
        })
        .then(() => {
          originalLoad.call(loader, url, onLoad, onProgress, onError);
        })
        .catch((error) => {
          console.error(`Failed to load model: ${error.message}`);
          showFeedback(`Failed to load model: ${error.message}`, false);
          onError?.(error);
        });
    };

    loader.manager.onStart = () => console.log("Loading started");
    loader.manager.onProgress = (url, itemsLoaded, itemsTotal) => {
      console.log(`Loading: ${itemsLoaded}/${itemsTotal}`);
    };
    loader.manager.onError = (url) => {
      console.error(`Error loading: ${url}`);
      showFeedback(`Failed to load model from: ${url}`, false);
      onError?.(new Error(`Failed to load model: ${url}`));
    };
    loader.manager.onLoad = () => {
      console.log("Loading complete");
      onLoad?.();
    };
  });

  useEffect(() => {
    return () => {
      if (gltf) {
        gltf.scene.traverse((object: any) => {
          if (object.geometry) {
            object.geometry.dispose();
          }
          if (object.material) {
            if (Array.isArray(object.material)) {
              object.material.forEach((material: any) => material.dispose());
            } else {
              object.material.dispose();
            }
          }
        });
        threeScene.remove(gltf.scene);
      }
    };
  }, [gltf, threeScene]);

  return <primitive object={gltf.scene} />;
};

interface SceneProps {
  modelPath: string;
  showLoading?: boolean;
  isVisible?: boolean;
}

const Scene = ({
  modelPath,
  showLoading = true,
  isVisible = true,
}: SceneProps) => {
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);
  const [isGrabbing, setIsGrabbing] = useState(false);

  // Control mounting based on visibility
  useEffect(() => {
    if (isVisible) {
      setMounted(true);
    } else {
      // Add small delay before unmounting to allow for transitions
      const timer = setTimeout(() => {
        setMounted(false);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [isVisible]);

  const handleLoad = () => {
    setLoading(false);
  };

  const handleError = (error: Error) => {
    setLoading(false);
  };

  const handlePointerDown = useCallback(() => {
    setIsGrabbing(true);
  }, []);

  const handlePointerUp = useCallback(() => {
    setIsGrabbing(false);
  }, []);

  // Don't render anything if not visible
  if (!mounted) {
    return null;
  }
  return (
    <Box
      sx={{
        position: "relative",
        width: "100%",
        height: "100vh",
        display: isVisible ? "block" : "none",
      }}
    >
      {loading && showLoading && (
        <Box
          sx={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            bgcolor: "rgba(0, 0, 0, 0.7)",
            zIndex: 10,
          }}
        >
          <CircularProgress size={60} sx={{ mb: 2 }} />
          <Typography variant="h6" color="white">
            Loading 3D Model...
          </Typography>
          <Typography variant="body2" color="white" sx={{ mt: 1 }}>
            Please wait while we prepare your model
          </Typography>
        </Box>
      )}

      <Box
        sx={{
          width: "100%",
          height: "100%",
          cursor: isGrabbing ? "grabbing" : "grab",
        }}
      >
        {mounted && ( // Only mount Canvas when component is mounted
          <Canvas
            gl={{ antialias: true }}
            camera={{ position: [0, 0, 5], fov: 50, zoom: 0.6 }}
            onPointerDown={handlePointerDown}
            onPointerUp={handlePointerUp}
            onPointerLeave={handlePointerUp}
          >
            <Suspense fallback={null}>
              <Stage environment="warehouse">
                <Model
                  modelPath={modelPath}
                  onLoad={handleLoad}
                  onError={handleError}
                />
              </Stage>
              <OrbitControls autoRotate={true} />
            </Suspense>
          </Canvas>
        )}
      </Box>
    </Box>
  );
};

export default Scene;
