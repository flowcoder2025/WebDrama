import React from "react";
import { Composition } from "remotion";
import { Drama } from "./Drama";

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="DramaShorts"
        component={Drama}
        durationInFrames={1800}
        fps={30}
        width={1080}
        height={1920}
        defaultProps={{
          specPath: "",
          assetsDir: "",
          format: "shorts",
        }}
      />
      <Composition
        id="DramaLongform"
        component={Drama}
        durationInFrames={27000}
        fps={30}
        width={1920}
        height={1080}
        defaultProps={{
          specPath: "",
          assetsDir: "",
          format: "longform",
        }}
      />
    </>
  );
};
