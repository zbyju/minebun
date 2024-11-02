import { Game } from "./game";
import { Minesweeper } from "./minesweeper";
import { HumanPlayer } from "./players/human_player";
import { Player } from "./players/player";
import { RandomPlayer } from "./players/random_player";

type Messages = {
  WELCOME: string;
  ASK_PLAYER_SELECTION: string;
  ASK_GRID: string;
  ASK_GAME_END: string;
  ASK_MINE_COUNT: string;
  VALID_OPTIONS: string;
};

export class Manager {
  private messages: Messages;

  constructor(messages?: Messages | undefined) {
    this.messages = {
      WELCOME: "Welcome to MineBun!",
      ASK_PLAYER_SELECTION: "What player do you want to play with?",
      ASK_GRID: "What grid size do you want to play on?",
      ASK_GAME_END: "Do you want to play again?",
      ASK_MINE_COUNT: "How many mines do you want on the grid?",
      VALID_OPTIONS: "Valid options are:",
      ...messages,
    };
  }

  introduce(): void {
    console.log(this.messages.WELCOME);
  }

  generateOptions(valids: (string | number | boolean)[]): string[] {
    const options: string[] = valids.map((v) => {
      if (typeof v === "string") return v;
      if (typeof v === "number") return v.toString();
      if (v === true) return "y";
      if (v === false) return "n";
      return "?";
    });
    return options;
  }

  optionsToString(options: string[], short: boolean = false): string {
    return short
      ? `valid=[${options.join(", ")}]`
      : `${this.messages.VALID_OPTIONS} [${options.join(", ")}]`;
  }

  askPlayerSelection(): Player {
    const options = this.generateOptions([0, 1]);
    const player = prompt(
      `${this.messages.ASK_PLAYER_SELECTION}\n${this.optionsToString(options)}`,
    );

    if (player === null || !options.includes(player)) {
      console.error(
        `Invalid player selection (player=${player}; ${this.optionsToString(options, true)})`,
      );
      return this.askPlayerSelection();
    }

    const selectedPlayer =
      player === "0" ? new HumanPlayer() : new RandomPlayer();
    return selectedPlayer;
  }

  askGrid(): Minesweeper {
    const optionsGrid = this.generateOptions([2, 3, 4, 5, 6, 7, 8, 9, 10]);
    const grid = prompt(
      `${this.messages.ASK_GRID}\n${this.optionsToString(optionsGrid)}`,
    );

    if (grid === null || !optionsGrid.includes(grid)) {
      console.error(
        `Invalid grid size (grid=${grid}; ${this.optionsToString(optionsGrid, true)})`,
      );
      return this.askGrid();
    }

    const optionsCount = this.generateOptions([1, 2, 3, 4, 5]);
    const count = prompt(
      `${this.messages.ASK_MINE_COUNT}\n${this.optionsToString(optionsCount)}`,
    );
    if (count === null || !optionsCount.includes(count)) {
      console.error(
        `Invalid mine count (count=${count}; ${this.optionsToString(optionsCount, true)})`,
      );
      return this.askGrid();
    }

    const s = parseInt(grid);
    const c = parseInt(count);
    return new Minesweeper(s, c);
  }

  askPlayAgain(): boolean {
    const options = this.generateOptions([true, false]);
    const gameEnd = prompt(
      `${this.messages.ASK_GAME_END}\n${this.optionsToString(options)}`,
    );

    if (gameEnd === null || !options.includes(gameEnd)) {
      console.error(
        `Invalid answer (${gameEnd}, ${this.optionsToString(options, true)})`,
      );
      return this.askPlayAgain();
    }
    return gameEnd === "y";
  }

  async start() {
    this.introduce();
    const player = this.askPlayerSelection();
    const minesweeper = this.askGrid();
    const game = new Game(minesweeper, player);

    await game.play();

    if (this.askPlayAgain()) {
      this.start();
    }
  }
}
