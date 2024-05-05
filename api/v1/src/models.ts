import { Page, PageContent, Token, TuLalem, User } from "./sequelize";

export type RequestMethod = "GET" | "PUT" | "POST" | "DELETE" | "PATCH";

export interface RecipientData {
  name: string;
  firstName?: string;
  lastName?: string;
  company: string;
  street: string;
  house: string;
  apartment: null;
  place: string;
  postalCode: string;
  countryIsoAlfa2Code: string;
  phoneNumber: string;
  email: string;
  pni?: string;
}

export interface Order {
  id: string;
  contentDesc: string;
  cost: number;
  recipientData: RecipientData;
}

export const ORDER_ATTRIBUTES = [
  "id",
  "contentDesc",
  "cost",
  "recipientData",
] as (keyof Order)[];

export type LatLngObj = { lat: number; lng: number };
export type LatLngArr = [number, number];
export type LatLng = LatLngObj | LatLngArr;

export type ModelType =
  | typeof Page
  | typeof PageContent
  | typeof User
  | typeof Token
  | typeof TuLalem;

export interface UserObj {
  uuid: string;
  username: string;
  email: string;
  admin?: boolean;
}
