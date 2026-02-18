
export interface DonationRecord {
  id: string;
  no: number | string;
  name: string;
  dates: string[];
  type: string;
}

export interface HeaderConfig {
  topHeader: string;
  subHeader: string;
  mosqueName: string;
  hijriYear: string;
  masehiYear: string;
}
