import React from "react";
import Lottie, { Options } from "react-lottie";

const lottieOptions = {
  loop: true,
  autoplay: true,
  animationData: require("./animations/level-up.json"),
  rendererSettings: {
    preserveAspectRatio: "xMidYMid slice",
  },
};

const LottieAnimation = () => <Lottie options={lottieOptions} />;

export default LottieAnimation;
