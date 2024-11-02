import { Evaluation, Minesweeper } from "./minesweeper";
import { Player } from "./players/player";

export class Game {
  private minesweeper: Minesweeper;
  private player: Player;
  private state: Evaluation;

  constructor(minesweeper: Minesweeper, player: Player) {
    this.minesweeper = minesweeper;
    this.player = player;
    this.state = minesweeper.evaluate();
  }

  printState(): void {
    this.minesweeper.printState();
    console.log("What do you want to do?");
  }

  async play() {
    while (this.state === Evaluation.Continue) {
      this.printState();
      const action = await this.player.makeAction(this.minesweeper);
      if (!action) {
        console.error("Invalid action (action not valid)");
        continue;
      }
      console.log(`Making action: ${JSON.stringify(action)}`);
      this.minesweeper.makeAction(action);
      this.state = this.minesweeper.evaluate();
    }

    this.printState();
    if (this.state === Evaluation.Win) {
      console.log("You win!");
    }
    if (this.state === Evaluation.Lose) {
      console.log("You lose!");
    }
  }
}
