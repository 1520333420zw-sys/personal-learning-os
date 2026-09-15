export type EntityId = string;
export type UserId = string;
export type ISODateString = string;
export type ISODateTimeString = string;

export interface EntityBase {
  id: EntityId;
  userId: UserId;
  createdAt: ISODateTimeString;
  updatedAt: ISODateTimeString;
  revision: number;
}
