import { Composition } from "remotion";
import { TCCFlowPromo } from "./TCCFlowPromo";

export const RemotionRoot: React.FC = () => {
  return (
    <Composition
      id="TCCFlowPromo"
      component={TCCFlowPromo}
      durationInFrames={900}
      fps={30}
      width={1080}
      height={1920}
    />
  );
};
