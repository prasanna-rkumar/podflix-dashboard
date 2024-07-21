import { Composition } from "remotion";
import PodFlixVideo from "./PodFlixVideo";

export const MyComposition = () => {
  return (
    <Composition
      durationInFrames={240}
      fps={24}
      id="PodFlix"
      width={1920}
      height={1080}
      component={PodFlixVideo}
    />
  )
};