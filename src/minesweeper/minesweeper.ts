import { Action, ActionType } from "./action";
import { PlayableTile, TileReal, TileUser, isPlayableTile } from "./tile";

enum Evaluation {
  Continue = 0,
  Win = 1,
  Lose = 2,
}

type GridReal = TileReal[][];
type GridUser = TileUser[][];

export class Minesweeper {
  private size: number;
  private numberOfMines: number;
  private gridReal: GridReal;
  private gridUser: GridUser;
  private result: Evaluation;

  constructor(size: number, numberOfMines: number) {
    this.size = size;
    this.result = Evaluation.Continue;
    this.numberOfMines = numberOfMines;
    this.gridReal = Minesweeper.createGridReal(size, numberOfMines);
    this.gridUser = Minesweeper.createGridUser(size);
  }

  atReal(x: number, y: number): TileReal {
    return this.gridReal[y][x];
  }

  atUser(x: number, y: number): TileUser {
    console.log(this.gridUser[y][x]);
    console.log(this.gridUser[y]);
    console.log(this.gridUser);
    return this.gridUser[y][x];
  }

  set(x: number, y: number, value: TileUser): void {
    this.gridUser[y][x] = value;
  }

  actions(): Set<Action> {
    const positions = this.gridUser.flatMap((row, y) =>
      row.map((tile, x) => [x, y, tile]),
    );
    const actions = positions
      .filter(([_, __, tile]) => tile === TileUser.Uncovered)
      .flatMap(([x, y, _]) => [
        { x: x, y: y, type: ActionType.Uncover },
        { x: x, y: y, type: ActionType.Flag },
      ]);
    return new Set(actions);
  }

  private makeActionFlag(
    x: number,
    y: number,
    tileUser: PlayableTile,
    _tileReal: TileReal,
  ): boolean {
    if (tileUser === TileUser.Uncovered) {
      this.set(x, y, TileUser.Flagged);
    } else if (tileUser === TileUser.Flagged) {
      this.set(x, y, TileUser.Uncovered);
    }
    return true;
  }

  private makeActionUncover(
    x: number,
    y: number,
    _tileUser: PlayableTile,
    tileReal: TileReal,
  ): boolean {
    if (tileReal === TileReal.Mine) {
      this.set(x, y, TileUser.Exploded);
    } else if (tileReal === TileReal.Empty) {
      this.set(x, y, TileUser.Covered);
    }
    return true;
  }

  makeAction(action: Action): boolean {
    const tileUser = this.atUser(action.x, action.y);
    console.log(1);
    if (tileUser === undefined) return false;

    // Tile must be uncovered or flagged
    console.log(2);
    if (!isPlayableTile(tileUser)) return false;

    const tileReal = this.atReal(action.x, action.y);
    console.log(3);
    if (tileReal === undefined) return false;

    if (action.type === ActionType.Flag) {
      return this.makeActionFlag(action.x, action.y, tileUser, tileReal);
    }

    return this.makeActionUncover(action.x, action.y, tileUser, tileReal);
  }

  askForAction(): [number, number, ActionType] {
    const action = prompt(
      "Where do you want to sweep? [Format: `x,y` to uncover or `x;y` to flag]",
    );
    if (action === null) {
      console.error("Invalid action (action null)");
      return this.askForAction();
    }
    const regex = /(\d+)[,;](\d+)/;
    const match = regex.exec(action);
    if (match === null) {
      console.error("Invalid action (regex failed)");
      return this.askForAction();
    }
    const x = parseInt(match[1]);
    const y = parseInt(match[2]);
    if (x < 0 || x >= this.size || y < 0 || y >= this.size) {
      console.error("Invalid action (out of bounds)");
      return this.askForAction();
    }

    if (action.includes(";")) {
      return [x, y, ActionType.Flag];
    } else {
      return [x, y, ActionType.Uncover];
    }
  }

  toStringGrid<T>(
    grid: T[][],
    tileToString: (x: T) => string,
    title: string = "",
  ): string {
    let str = "  ";
    let r = 0;
    if (title !== "") str += title + "\n";
    const size = grid.length;
    // Print x coords
    for (let c = 0; c < size; c++) {
      str += c;
    }
    // Print top border
    str += "\n +";
    for (let c = 0; c < size; c++) {
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
    for (let c = 0; c < size; c++) {
      str += "-";
    }
    str += "+\n  ";
    // Print x coords
    for (let c = 0; c < size; c++) {
      str += c;
    }
    str += "\n";
    return str;
  }

  toStringUser(): string {
    const tileToString = (tile: TileUser) =>
      tile === TileUser.Covered
        ? "#"
        : tile === TileUser.Flagged
          ? "F"
          : tile === TileUser.Uncovered
            ? " "
            : tile === TileUser.Exploded
              ? "X"
              : "?";
    return this.toStringGrid(this.gridUser, tileToString);
  }

  toStringReal(): string {
    const tileToString = (tile: TileReal) =>
      tile === TileReal.Mine ? "X" : "o";
    return this.toStringGrid(this.gridReal, tileToString);
  }

  printState() {
    console.log(this.toStringReal());
    console.log(this.toStringUser());
  }

  play(): void {
    console.log("Welcome to MineBun!");

    while (this.result === Evaluation.Continue) {
      this.printState();

      const [x, y, a] = this.askForAction();
      const action = { x, y, type: a };
      console.log(
        `Making action: ${JSON.stringify(action)} ${action.type === ActionType.Flag ? "flag" : "uncover"}`,
      );
      const okAction = this.makeAction(action);
      if (!okAction) {
        console.error("Invalid action (action not valid)");
        continue;
      }
      this.evaluate();
    }

    this.printState();
    if (this.result === Evaluation.Win) {
      this.win();
    }
    if (this.result === Evaluation.Lose) {
      this.lose();
    }
  }

  lose(): void {
    console.log("You lose!");
  }

  win(): void {
    console.log("You win!");
  }

  evaluate(): void {
    this.result = this.calculateEvaluation();
  }
  calculateEvaluation(): Evaluation {
    // Is exploded
    for (const row of this.gridUser) {
      for (const tile of row) {
        if (tile === TileUser.Exploded) {
          return Evaluation.Lose;
        }
      }
    }

    // Is win
    let flagsCount = 0;
    for (const row of this.gridUser) {
      for (const tile of row) {
        if (tile === TileUser.Uncovered) {
          return Evaluation.Continue;
        }

        if (tile === TileUser.Flagged) {
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

  private static createGridReal(
    size: number,
    numberOfMines: number,
  ): TileReal[][] {
    const grid: GridReal = new Array(size)
      .fill(0)
      .map((_) => new Array(size).fill(0).map((_) => TileReal.Empty));

    for (let currentNumberOfMines = 0; currentNumberOfMines < numberOfMines; ) {
      const index = Math.floor(Math.random() * size * size);
      const x = Math.floor(index % size);
      const y = Math.floor(index / size);

      const val = grid[y][x];
      if (val === TileReal.Mine) continue;

      grid[y][x] = TileReal.Mine;
      ++currentNumberOfMines;
    }
    return grid;
  }

  private static createGridUser(size: number): TileUser[][] {
    const grid: GridUser = new Array(size)
      .fill(0)
      .map((_) => new Array(size).fill(0).map((_) => TileUser.Uncovered));

    return grid;
  }
}
