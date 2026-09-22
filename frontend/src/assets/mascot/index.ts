import griffinCharacter from "./griffin-character.webp";
import griffinLogin from "../griffin-login.webp";
import griffin404 from "./griffin-404.webp";
import griffinArena from "./griffin-arenaPage.webp";
import griffinTests from "./griffin-testspage.webp";
import griffinTestGood from "./griffin-test-goodResult.webp";
import griffinTestMedium from "./griffin-test-mediumResult.webp";
import griffinTestBad from "./griffin-test-badResult.webp";

export const MASCOT_IMAGES = {
  hero: griffinCharacter,
  login: griffinLogin,
  notFound: griffin404,
  arena: griffinArena,
  tests: griffinTests,
  testGood: griffinTestGood,
  testMedium: griffinTestMedium,
  testBad: griffinTestBad,
} as const;

export type MascotVariant = keyof typeof MASCOT_IMAGES;
