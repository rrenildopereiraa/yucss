import { coreUtils } from "@yummacss/core";

const MEDIUM_PREFIXES = new Set([
  "ws",   // ws-nw not ws-n
  "ro",   // ro- not r-
  "tdu",  // tdu- not td-
  "cl",   // cl- not c-
  "tr",   // translate
  "ttx",  // translate-x
  "tty",  // translate-y
  "fw",   // fw-nw not fw-n
]);

const MEDIUM_ENTRIES = new Set([
  "p-s",   // position: static
  "p-st",  // position: sticky
  "tor-b", // transform-origin: bottom
  "tor-c", // transform-origin: center
  "tor-t", // transform-origin: top
  "tor-l", // transform-origin: left (0)
  "tor-r", // transform-origin: right (100%)
]);

const EXPERT_PREFIXES = new Set([
  "sst", "ssa", "sss",               // scroll-snap
  "ob", "obb", "obi", "obx", "oby",  // overscroll
  "bf-b", "bf-g",                    // backdrop filters
  "bbr", "blr", "brr",               // logical border radius (shorthand)
  "bblr", "bbrr",                    // border-bottom-*-radius
  "bber", "bisr", "bier",            // border logical
  "besr", "beer", "bbsr",            // border logical
  "bssr", "bser",                    // border logical
  "bs-o", "bs-i",                    // box-shadow (expert: framework familiarity required)
]);

// tor-bl, tor-br, tor-tl, tor-tr are expert — LightningCSS optimized them
// to coordinate pairs (e.g. "100% 0") instead of readable keywords
const EXPERT_ENTRIES = new Set([
  "tor-bl",
  "tor-br",
  "tor-tl",
  "tor-tr",
]);

// Only these numeric keys are allowed — they are intuitive anchors
const ALLOWED_NUMERIC_KEYS = new Set(["0", "1", "2", "3", "4"]);

function isExcluded(key, value) {
  const isNumeric = !isNaN(Number(key)) && key.trim() !== "";

  // exclude numeric keys not in the whitelist
  if (isNumeric && !ALLOWED_NUMERIC_KEYS.has(key)) return true;

  // exclude hex colors — yumma css only outputs hex (with alpha channel)
  if (value.startsWith("#")) return true;

  return false;
}

function getLevel(prefix, classname) {
  if (EXPERT_ENTRIES.has(classname)) return "expert";
  if (MEDIUM_ENTRIES.has(classname)) return "medium";
  if (EXPERT_PREFIXES.has(prefix)) return "expert";
  if (MEDIUM_PREFIXES.has(prefix)) return "medium";
  return "easy";
}

const utils = coreUtils();

export const POOL = Object.entries(utils)
  .filter(([, utility]) => utility.properties.length === 1)
  .flatMap(([, utility]) =>
    Object.entries(utility.values)
      .filter(([key, value]) => !isExcluded(key, value))
      .map(([key, value]) => {
        const classname = `${utility.prefix}-${key}`;
        return {
          yu: classname,
          css: `${utility.properties[0]}: ${value}`,
          level: getLevel(utility.prefix, classname),
        };
      })
  );