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

const TileSymbols = {
  Real: {
    [TileReal.Empty]: "⬜", // Empty tile
    [TileReal.Mine]: "💣", // Mine symbol
  },
  User: {
    [TileUser.Covered]: "⬛", // Covered tile
    [TileUser.Uncovered]: "⬜", // Uncovered tile (could also use numbers)
    [TileUser.Flagged]: "🚩", // Flagged tile
    [TileUser.Exploded]: "💥", // Exploded tile
  },
  Numbers: {
    0: "⬜",
    1: "1 ",
    2: "2 ",
    3: "3 ",
    4: "4 ",
    5: "5 ",
    6: "6 ",
    7: "7 ",
    8: "8 ",
  },
};

export class Tile {
  protected _real: TileReal;
  protected _user: TileUser;
  protected _surroundingMines: number;

  constructor(real: TileReal, user: TileUser, surroundingMines: number) {
    this._real = real;
    this._user = user;
    this._surroundingMines = surroundingMines;
  }

  get real(): TileReal {
    return this._real;
  }

  get user(): TileUser {
    return this._user;
  }

  get surroundingMines(): number {
    return this._surroundingMines;
  }

  set(tileUser: TileUser): void {
    console.log(JSON.stringify(tileUser), tileUser);
    this._user = tileUser;
    console.log(JSON.stringify(tileUser), tileUser);
  }

  isPlayable(): boolean {
    return this._user === TileUser.Covered || this._user === TileUser.Flagged;
  }

  toString(): string {
    if (this.user === TileUser.Uncovered) {
      // @ts-expect-error Indexing with a number
      return TileSymbols.Numbers[this.surroundingMines];
    }
    return TileSymbols.User[this.user];
  }

  toStringReal(): string {
    return TileSymbols.Real[this.real];
  }
}
