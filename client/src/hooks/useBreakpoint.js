import { useEffect, useState } from "react";

const QUERIES = {
  phone: "(max-width: 767px)",
  tablet: "(min-width: 768px) and (max-width: 1023px)",
  desktop: "(min-width: 1024px)",
  mdUp: "(min-width: 768px)",
};

function getBreakpointState() {
  if (typeof window === "undefined") {
    return { isPhone: false, isTablet: false, isDesktop: true, isMdUp: true };
  }
  return {
    isPhone: window.matchMedia(QUERIES.phone).matches,
    isTablet: window.matchMedia(QUERIES.tablet).matches,
    isDesktop: window.matchMedia(QUERIES.desktop).matches,
    isMdUp: window.matchMedia(QUERIES.mdUp).matches,
  };
}

export default function useBreakpoint() {
  const [state, setState] = useState(getBreakpointState);

  useEffect(() => {
    const mediaLists = Object.values(QUERIES).map((query) =>
      window.matchMedia(query),
    );

    const update = () => setState(getBreakpointState());

    mediaLists.forEach((mql) => {
      mql.addEventListener("change", update);
    });
    update();

    return () => {
      mediaLists.forEach((mql) => {
        mql.removeEventListener("change", update);
      });
    };
  }, []);

  return state;
}
