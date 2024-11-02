import { Action } from "../action";
import { Minesweeper } from "../minesweeper";

export abstract class Player {
  abstract makeAction(minesweeper: Minesweeper): Promise<Action>;
}
