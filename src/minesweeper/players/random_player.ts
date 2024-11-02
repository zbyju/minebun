import { Action } from "../action";
import { Minesweeper } from "../minesweeper";
import { Player } from "./player";

export class RandomPlayer extends Player {
  private delayBetweenActions: number;

  constructor(delayBetweenActions: number = 500) {
    super();
    this.delayBetweenActions = delayBetweenActions;
  }

  makeAction(minesweeper: Minesweeper): Promise<Action> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const actions = minesweeper.actions();
        const randomIndex = Math.floor(Math.random() * actions.length);
        resolve(actions[randomIndex]);
      }, this.delayBetweenActions);
    });
  }
}
