export enum TileReal {
  Empty = 0,
  Mine = 1,
}

export enum TileUser {
  Covered = 0,
  Uncovered = 1,
  Flagged = 2,
  Exploded = 3,
}
export type PlayableTile = Extract<
  TileUser,
  TileUser.Uncovered | TileUser.Flagged
>;
export function isPlayableTile(tile: TileUser): tile is PlayableTile {
  return tile === TileUser.Uncovered || tile === TileUser.Flagged;
}
