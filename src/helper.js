import { H1, H2, H3 } from "./constant";

import H1Icon from "./icons/H1.svg";
import H2Icon from "./icons/H2.svg";
import H3Icon from "./icons/H3.svg";

/**
 * Available header levels
 * @property {number} number - level number
 * @property {string} tag - tag correspondes with level number
 * @property {string} svg - icon
 */

export const LEVELS = [
  {
    number: 1,
    tag: H1,
    svg: H1Icon,
  },
  {
    number: 2,
    tag: H2,
    svg: H2Icon,
  },
  {
    number: 3,
    tag: H3,
    svg: H3Icon,
  },
];

/**
 * Use H1 as default header
 */
const DEFAULT_LEVEL = LEVELS[0];

/**
 * Normalize input data
 * @param {HeaderData} data
 * @return {HeaderData}
 * @private
 */
export const normalizeData = (data) => {
  const newData = {};

  if (typeof data !== "object") {
    data = {};
  }

  newData.text = data.text || "";
  newData.level = parseInt(data.level) || DEFAULT_LEVEL.number;

  if (data.eyebrowTitle) {
    newData.eyebrowTitle = data.eyebrowTitle;
  }

  if (data.footerTitle) {
    newData.footerTitle = data.footerTitle;
  }

  return newData;
};

/**
 * Get current level
 * @return {level}
 */
export const getCurrentLevel = (data) => {
  let level = LEVELS.find((levelItem) => levelItem.number === data.level);

  if (!level) {
    level = DEFAULT_LEVEL;
  }

  return level;
};
