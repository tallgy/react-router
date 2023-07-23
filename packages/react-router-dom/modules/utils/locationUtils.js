import { createLocation } from "history";

/**
 * 返回 to 跳转的 url
 * @param {*} to function or ather
 * @param {*} currentLocation location
 * @returns 
 */
export const resolveToLocation = (to, currentLocation) =>
  typeof to === "function" ? to(currentLocation) : to;

export const normalizeToLocation = (to, currentLocation) => {
  return typeof to === "string"
    // 创建一个 location 属性
    ? createLocation(to, null, null, currentLocation)
    : to;
};
