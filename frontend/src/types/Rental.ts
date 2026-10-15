
export interface RentalCustomer {
_id: string;
name: string;
phone: string;
isGold: boolean;
}

export interface RentalMovie {
_id: string;
title: string;
dailyRentalRate: number;
}

export interface Rental {
  _id: string;
  customer: RentalCustomer;
  movie: RentalMovie;
  dateOut: string;
  dateReturned?: string;
  rentalFee?: number;
  isArchived?: boolean;
  archivedAt?: string;
  archivedBy?: string;
  archiveReason?: string;
}
