// ─────────────────────────────
// MODELO DE EMPLEADO
// ─────────────────────────────
export interface Employee {
  id: number;
  name: string;
  dg: string;
  orgUnit: string;
  service: string;
  location: string;
  phone: string;
}

// ─────────────────────────────
// VISITANTE RECIBIDO EN UNA VISITA
// ─────────────────────────────
export interface VisitVisitor {
  dni: string;
  name: string;
  company: string;
  cardNumber: string;
  visitors: number;
  color: string;
}

// ─────────────────────────────
// DETALLES DEL EMPLEADO EN UNA VISITA
// ─────────────────────────────
export interface VisitEmployee {
  name: string;
  dg: string;
  orgUnit: string;
  service: string;
  location: string;
  phone: string;
}

// ─────────────────────────────
// VISITA CONSULTADA (GET /visits)
// ─────────────────────────────
export interface VisitResponse {
  id: number;
  visitor: VisitVisitor;
  visit: VisitEmployee;
  createdAt: string;
  endTime?: string;
  status: 'pending' | 'active' | 'completed';
}

// ─────────────────────────────
// VISITA A CREAR (POST /visits)
// ─────────────────────────────
export interface VisitCreationPayload {
  visitor: {
    dni: string;
    name: string;
    company: string;
  };
  visitDetails: {
    reason: string;
    cardNumber: string;
    visitors: number;
    color: string;
    observations: string;
  };
  visit: VisitEmployee & { employeeId: number };
  status: 'pending';
  createdAt: string;
}

// ─────────────────────────────
// RESPUESTA A CREACIÓN DE VISITA
// ─────────────────────────────
export interface VisitCreationResponse {
  visitId: number;
  id: number;
}

// ─────────────────────────────
// ACTUALIZACIÓN DE VISITA (PATCH)
// ─────────────────────────────
export interface VisitUpdatePayload {
  status: 'completed';
  endTime: string;
  dischargeObservations: string;
}

// ─────────────────────────────
// FILTROS PARA CONSULTA DE VISITAS
// ─────────────────────────────
export interface VisitFilters {
  dni_like?: string;
  name_like?: string;
  status?: 'pending' | 'active' | 'completed';
  date?: string; // formato 'YYYY-MM-DD'
}


// export interface Delegacio {
//   id: number;
//   nom: string;
//   adreca?: string;
//   utilitzaTarjeta: boolean;
// }

// export interface Color {
//   codi: string;
//   descripcio?: string;
// }

// export interface Treballador {
//   id: number;
//   dni: string;
//   nomComplet: string;
//   numero?: string;
//   servei?: string;
//   ubicacio?: string;
//   rol: 'master' | 'admin' | 'common';
//   delegacioId?: number;
// }

// export interface Sala {
//   id: number;
//   descripcio: string;
//   ubicacio?: string;
//   delegacioId: number;
//   colorCodi?: string;
// }

// export interface Visitante {
//   id: number;
//   dni: string;
//   nom: string;
//   empresa?: string;
//   motiu?: string;
//   numVisitants: number;
//   sexe?: 'H' | 'D' | 'A';
//   observacions?: string;
//   desconegut: boolean;
// }

// export interface Visita {
//   id: number;
//   visitanteId: number;
//   treballadorId: number;
//   delegacioId: number;
//   data: string;
//   horaInici: string;
//   horaFi?: string;
//   tarjetaId?: string;
//   pendent: boolean;
//   observacions?: string;
// }

// export interface VisitDetails {
//   visitor: {
//     dni: string;
//     name: string;
//     company?: string;
//     cardNumber: string;
//     visitors: number;
//     color: string;
//   };
//   visitDetails: {
//     reason: string;
//     cardNumber: string;
//     visitors: number;
//     color?: string;
//     observations?: string;
//   };
//   visit: {
//     employeeId: number;
//   };
// }

// export interface User {
//   id: string;
//   fullName: string;
//   role: string;
//   building: string;
//   lastAccess: string;
// }
