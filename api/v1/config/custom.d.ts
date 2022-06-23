declare namespace Express {
  export interface Request {
    user?: {
      uuid: string;
      name: string;
      surname: string;
      email: string;
      admin?: boolean;
    };
  }
}
