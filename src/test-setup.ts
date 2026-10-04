const LIGHT_THEME_PREFERRED_BY_SYSTEM = { matches: false } as MediaQueryList;

window.matchMedia = () => LIGHT_THEME_PREFERRED_BY_SYSTEM;
