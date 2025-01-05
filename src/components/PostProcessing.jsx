import {
  Bloom,
  BrightnessContrast,
  EffectComposer,
  Vignette,
} from "@react-three/postprocessing";

export const PostProcessing = () => {
  return (
    <EffectComposer>
      <Bloom
        intensity={2}
        luminanceThreshold={2.3}
        luminanceSmoothing={0.1}
        mipmapBlur={true}
      />
      <Vignette offset={0.1} darkness={0.85} />
      <BrightnessContrast brightness={-0.1} contrast={-0.15} />
    </EffectComposer>
  );
};
