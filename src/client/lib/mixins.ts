import { CSSObject } from "@emotion/react";
import { entries, fromEntries } from "./entries";

export const pointerFine = (style: CSSObject): CSSObject => ({
  "@media (hover: hover) and (pointer: fine)": style,
});

export const pointerCoarse = (style: CSSObject): CSSObject => ({
  "@media (hover: none) and (any-pointer: coarse)": style,
});

const viewportMaker =
  (breakpoint: number) =>
  (style: CSSObject): CSSObject => ({
    [`@media (max-width: ${breakpoint}px)`]: style,
  });

export const breakpoint = {
  XS: 479,
  S: 769,
  M: 991,
  L: 1199,
  XL: 1919,
  XXL: 2559,
} as const;
export const viewport = fromEntries(
  entries(breakpoint).map(([k, v]) => [k, viewportMaker(v)])
);
