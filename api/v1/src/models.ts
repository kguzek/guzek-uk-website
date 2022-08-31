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

export interface InvalidOrder {
  id: string;
  fields: string[];
}