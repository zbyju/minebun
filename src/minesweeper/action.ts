export enum ActionType {
  Uncover = 0,
  Flag = 1,
}

export interface Action {
  x: number;
  y: number;
  type: ActionType;
}
