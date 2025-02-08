import { atomWithHash } from "jotai-location";

export const LINE_HEIGHT_OPTIONS = [0.9, 1, 1.2, 1.5, 2, 2.5] as const;

export type LineHeight = (typeof LINE_HEIGHT_OPTIONS)[number];

export function isLineHeight(value: LineHeight | unknown): value is LineHeight {
  return LINE_HEIGHT_OPTIONS.indexOf(value as LineHeight) !== -1;
}

const lineHeightAtom = atomWithHash<LineHeight>("lineHeight", LINE_HEIGHT_OPTIONS[2]);

export { lineHeightAtom };
