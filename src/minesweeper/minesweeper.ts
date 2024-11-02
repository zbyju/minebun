import { Action, ActionType } from "./action";
import { Tile, TileReal, TileUser } from "./tile";

export enum Evaluation {
  Continue = 0,
  Win = 1,
  Lose = 2,
}

export class Minesweeper {
  private size: number;
  private numberOfMines: number;
  private grid: Tile[][];

  constructor(size: number, numberOfMines: number) {
    this.size = size;
    this.numberOfMines = numberOfMines;
    this.grid = Minesweeper.createGrid(size, numberOfMines);
  }

  get gridSize(): number {
    return this.size;
  }

  at(x: number, y: number): Tile | undefined {
    if (x < 0 || x >= this.size || y < 0 || y >= this.size) return undefined;
    return this.grid[y][x];
  }

  set(x: number, y: number, value: TileUser): void {
    const tile = this.at(x, y);
    if (tile === undefined) {
      return;
    }
    tile.set(value);
  }

  actions(): Action[] {
    const positions = this.grid.flatMap((row, y) =>
      row.map((tile, x) => [x, y, tile] as const),
    );
    const actions = positions
      .filter(([_, __, tile]) => tile.user === TileUser.Uncovered)
      .flatMap(([x, y, _]) => [
        { x: x, y: y, type: ActionType.Uncover },
        { x: x, y: y, type: ActionType.Flag },
      ]);
    return actions;
  }

  private makeActionFlag(x: number, y: number, tile: Tile): boolean {
    if (tile.user === TileUser.Covered) {
      this.set(x, y, TileUser.Flagged);
    } else if (tile.user === TileUser.Flagged) {
      this.set(x, y, TileUser.Covered);
    }
    return true;
  }

  private makeActionUncover(x: number, y: number, tile: Tile): boolean {
    if (tile.real === TileReal.Mine) {
      this.set(x, y, TileUser.Exploded);
    } else if (tile.real === TileReal.Empty) {
      this.set(x, y, TileUser.Uncovered);
    }
    return true;
  }

  makeAction(action: Action): boolean {
    const tile = this.at(action.x, action.y);
    if (tile === undefined) return false;

    // Tile must be uncovered or flagged
    if (!tile.isPlayable()) {
      return false;
    }

    if (action.type === ActionType.Flag) {
      return this.makeActionFlag(action.x, action.y, tile);
    }

    return this.makeActionUncover(action.x, action.y, tile);
  }

  toStringGrid(
    grid: Tile[][],
    tileToString: (x: Tile) => string,
    title: string = "",
  ): string {
    let str = "  ";
    let r = 0;
    if (title !== "") str += title + "\n";
    const size = grid.length;
    // Print x coords
    for (let c = 0; c < size; c++) {
      str += c + " ";
    }
    // Print top border
    str += "\n +";
    for (let c = 0; c < size * 2; c++) {
      str += "-";
    }
    str += "+\n";
    // Print grid with y coords
    for (const row of grid) {
      str += `${r}|`;
      for (const tile of row) {
        const tileString = tileToString(tile);
        str += tileString;
      }
      str += `|${r}\n`;
      r++;
    }
    // Print top border
    str += " +";
    for (let c = 0; c < size * 2; c++) {
      str += "-";
    }
    str += "+\n  ";
    // Print x coords
    for (let c = 0; c < size; c++) {
      str += c + " ";
    }
    str += "\n";
    return str;
  }

  toStringUser(): string {
    const tileToString = (tile: Tile) => tile.toString();
    return this.toStringGrid(this.grid, tileToString);
  }

  toStringReal(): string {
    const tileToString = (tile: Tile) => tile.toStringReal();
    return this.toStringGrid(this.grid, tileToString);
  }

  printState() {
    console.log(this.toStringReal());
    console.log(this.toStringUser());
  }

  evaluate(): Evaluation {
    // Is exploded
    for (const row of this.grid) {
      for (const tile of row) {
        if (tile.user === TileUser.Exploded) {
          return Evaluation.Lose;
        }
      }
    }

    // Is win
    let flagsCount = 0;
    for (let y = 0; y < this.size; y++) {
      for (let x = 0; x < this.size; x++) {
        const tile = this.at(x, y);
        if (tile === undefined) {
          continue;
        }

        if (tile.user === TileUser.Flagged && tile.real === TileReal.Mine) {
          flagsCount++;
        }
      }
    }
    if (flagsCount === this.numberOfMines) return Evaluation.Win;

    return Evaluation.Continue;
  }

  static createGame(size: number, numberOfMines: number): Minesweeper {
    return new Minesweeper(size, numberOfMines);
  }

  static getSurroundingMines(grid: TileReal[][], x: number, y: number): number {
    let surroundingMines = 0;
    const vectors = [
      [-1, 0],
      [1, 0],
      [0, -1],
      [0, 1],
      [-1, -1],
      [-1, 1],
      [1, -1],
      [1, 1],
    ];

    for (const [dx, dy] of vectors) {
      const x2 = x + dx;
      const y2 = y + dy;
      if (x2 < 0 || x2 >= grid.length || y2 < 0 || y2 >= grid[0].length) {
        continue;
      }

      const tile = grid[y2][x2];
      if (tile === TileReal.Mine) {
        surroundingMines++;
      }
    }
    return surroundingMines;
  }

  private static createGrid(size: number, numberOfMines: number): Tile[][] {
    const gridReal: TileReal[][] = new Array(size)
      .fill(0)
      .map((_) => new Array(size).fill(0).map((_) => TileReal.Empty));

    for (let currentNumberOfMines = 0; currentNumberOfMines < numberOfMines; ) {
      const index = Math.floor(Math.random() * size * size);
      const x = Math.floor(index % size);
      const y = Math.floor(index / size);

      const val = gridReal[y][x];
      if (val === TileReal.Mine) continue;

      gridReal[y][x] = TileReal.Mine;
      ++currentNumberOfMines;
    }

    const grid: Tile[][] = [];
    for (let y = 0; y < size; y++) {
      grid.push([]);
      for (let x = 0; x < size; x++) {
        const tileReal = gridReal[y][x];
        const surroundingMines = Minesweeper.getSurroundingMines(
          gridReal,
          x,
          y,
        );
        const tile = new Tile(tileReal, TileUser.Covered, surroundingMines);
        grid[y].push(tile);
      }
    }

    return grid;
  }
}
