import { createContext, useContext } from "react";

export const SafeAreaColorContext = createContext({
  topColor: "#F4EDFF",
  bottomColor: "#fff",
});

export const useSafeAreaColors = () => useContext(SafeAreaColorContext);
