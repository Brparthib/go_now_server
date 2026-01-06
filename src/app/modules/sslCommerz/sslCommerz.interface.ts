export type SSLPurpose = "SUBSCRIPTION" | "VERIFIED_BADGE";

export interface ISSLCommerzInit {
  transactionId: string;
  amount: number;

  // customer
  name: string;
  email: string;
  phoneNumber: string;
  address: string;

  // product metadata
  purpose: SSLPurpose; // subscription or badge
  productName: string; // e.g. "TravelBuddy Subscription (Monthly)"
}
