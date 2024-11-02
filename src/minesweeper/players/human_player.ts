import { Action, ActionType } from "../action";
import { Minesweeper } from "../minesweeper";
import { Player } from "./player";

export class HumanPlayer extends Player {
  makeAction(minesweeper: Minesweeper): Promise<Action> {
    return new Promise((resolve) => {
      const action = this.askForAction(minesweeper.gridSize);
      resolve(action);
    });
  }

  askForAction(maxSize: number): Action {
    const action = prompt(
      "Where do you want to sweep? [Format: `x,y` to uncover or `x;y` to flag]",
    );
    if (action === null) {
      console.error("Invalid action (action null)");
      return this.askForAction(maxSize);
    }
    const regex = /(\d+)[,;](\d+)/;
    const match = regex.exec(action);
    if (match === null) {
      console.error("Invalid action (regex failed)");
      return this.askForAction(maxSize);
    }
    const x = parseInt(match[1]);
    const y = parseInt(match[2]);
    if (x < 0 || x >= maxSize || y < 0 || y >= maxSize) {
      console.error("Invalid action (out of bounds)");
      return this.askForAction(maxSize);
    }

    if (action.includes(";")) {
      return { x, y, type: ActionType.Flag };
    } else {
      return { x, y, type: ActionType.Uncover };
    }
  }
}
