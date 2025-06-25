export interface Employee {
  id: number;
  name: string;
  dg: string;
  orgUnit: string;
  service: string;
  location: string;
  phone: string;
}

export interface VisitorData {
  dni: string;
  name: string;
  company: string;
  reason: string;
  cardNumber: string;
  visitors: number;
  color: string;
  observations: string;
}

export interface VisitRegistrationPayload {
  visitor: VisitorData;
  visit: {
    employeeId: number;
  };
}