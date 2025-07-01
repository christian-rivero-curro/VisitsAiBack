export interface Delegacio {
  id: number;
  nom: string;
  adreca?: string;
  utilitza_tarjeta: boolean;
}

export interface Color {
  codi: string;
  descripcio?: string;
}

export interface Treballador {
  id: number;
  dni: string;
  nom_complet?: string;
  primer_cognom: string;
  segon_cognom?: string;
  numero?: string;
  codi_servei?: string;
  destacat1?: string;
  destacat2?: string;
  tipus_registre?: string;
  usuari?: string;
  capcalera?: string;
  extern?: string;
  direccio_general?: string;
  unitat_organica?: string;
  servei?: string;
  ubicacio?: string;
  rol: 'master' | 'admin' | 'common';
  ordre_recepcio?: number;
  delegacio_id?: number;
}

export interface Sala {
  id: number;
  descripcio: string;
  ubicacio?: string;
  delegacio_id: number;
  color_codi?: string;
}

export interface Visitante {
  id: number;
  dni: string;
  nom: string;
  empresa?: string;
  motiu?: string;
  num_visitants: number;
  sexe?: 'H' | 'D' | 'A';
  observacions?: string;
  desconegut: boolean;
}

export interface Visita {
  id: number;
  visitante_id: number;
  treballador_id: number;
  delegacio_id: number;
  data_visita: string;
  hora_ini: string;
  hora_fi?: string;
  tarjeta_id?: string;
  pendent: boolean;
  observacions?: string;
}

// Mantener compatibilidad con el frontend
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
}

export interface VisitDetails {
  reason: string;
  cardNumber: string;
  visitors: number;
  color: string;
  observations: string;
}

export interface VisitRegistrationPayload {
  visitor: VisitorData;
  visitDetails: VisitDetails;
  visit: {
    employeeId: number;
  };
}

export interface User {
  id: string;
  fullName: string;
  role: string;
  building: string;
  lastAccess: string;
}