declare namespace Express {
  import { UserObj } from "../src/models";
  export interface Request {
    user?: UserObj;
  }
}
