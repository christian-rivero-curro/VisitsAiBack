import { VisitRegistrationPayload } from '../types';

const JSON_SERVER_URL = process.env.JSON_SERVER_URL;

/**
 * Crea una nueva visita.
 * Construye un objeto con una estructura anidada (visitor, visit, visitDetails)
 * que se corresponde con el nuevo modelo de datos en `db.json`.
 */
/**
 * Crea una nueva visita.
 * Construye un objeto con una estructura anidada (visitor, visit, visitDetails)
 * que se corresponde con el nuevo modelo de datos en `db.json`.
 */
export const createVisit = async (payload: VisitRegistrationPayload) => {
  const { visitor, visitDetails, visit } = payload;
  const createdAt = new Date();

  // Obtener datos del empleado
  const employeeData = await getEmployeeById(visit.employeeId);

  // --- INICIO DE LA MODIFICACIÓN ---

  // 1. Obtener todas las visitas para encontrar el ID máximo
  const allVisitsResponse = await fetch(`${JSON_SERVER_URL}/visits`);
  if (!allVisitsResponse.ok) {
    throw new Error('Failed to fetch visits for ID calculation');
  }
  const allVisits = await allVisitsResponse.json();

  // 2. Calcular el nuevo ID
  const maxId = allVisits.reduce((max: number, v: any) => {
    const currentId = parseInt(v.id, 10);
    return !isNaN(currentId) && currentId > max ? currentId : max;
  }, 0);

  const newVisitId = maxId + 1;

  // --- FIN DE LA MODIFICACIÓN ---

  const visitToCreate = {
    id: newVisitId.toString(), // Asignar el nuevo ID
    visitor: {
      dni: visitor.dni,
      name: visitor.name,
      company: visitor.company
    },
    visit: {
      ...employeeData
    },
    visitDetails: {
      reason: visitDetails.reason,
      cardNumber: visitDetails.cardNumber,
      visitors: visitDetails.visitors,
      color: visitDetails.color,
      observations: visitDetails.observations,
      date: createdAt.toISOString().split('T')[0],
      hourIni: createdAt.toTimeString().split(' ')[0],
      hourFi: null,
    },
    status: 'active',
    createdAt: createdAt.toISOString()
  };

  const response = await fetch(`${JSON_SERVER_URL}/visits`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(visitToCreate)
  });

  if (!response.ok) {
    throw new Error('Failed to create visit in json-server');
  }
  
  return response.json();
};


/**
 * Obtiene una lista de visitas aplicando los filtros proporcionados.
 */
export const getVisits = async (filters: any) => {
    const query = new URLSearchParams();
    
    // Filtros básicos que json-server puede manejar directamente
    if (filters.status) {
        query.append('status', filters.status);
    }

    const response = await fetch(`${JSON_SERVER_URL}/visits?${query.toString()}`);
    if (!response.ok) {
        throw new Error('Failed to fetch visits');
    }

    let visits = await response.json();
    
    // Filtrado manual para campos anidados y fechas
    if (filters.name_like) {
        const searchTerm = filters.name_like.toLowerCase();
        visits = visits.filter((v: any) => 
            v.visitor?.name?.toLowerCase().includes(searchTerm)
        );
    }
    
    if (filters.dni_like) {
        const searchTerm = filters.dni_like.toLowerCase();
        visits = visits.filter((v: any) => 
            v.visitor?.dni?.toLowerCase().includes(searchTerm)
        );
    }
    
    if (filters.startDate) {
        const start = new Date(filters.startDate);
        start.setHours(0, 0, 0, 0);
        visits = visits.filter((v: any) => new Date(v.createdAt) >= start);
    }
    
    if (filters.endDate) {
        const end = new Date(filters.endDate);
        end.setHours(23, 59, 59, 999);
        visits = visits.filter((v: any) => new Date(v.createdAt) <= end);
    }

    // Ordenar por fecha de creación descendente
    visits.sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    // Aplanar la respuesta para compatibilidad con el frontend
    return visits.map((v: any) => ({
        ...v,
        visitor: {
            ...v.visitor,
            ...v.visitDetails
        }
    }));
};

/**
 * Da de baja una visita actualizando su estado y hora de fin.
 * Primero obtiene la visita completa, modifica los campos necesarios y la actualiza.
 */
export const dischargeVisitor = async (id: number, observations: string) => {
    // Primero obtenemos la visita completa
    const getResponse = await fetch(`${JSON_SERVER_URL}/visits/${id}`);
    if (!getResponse.ok) {
        throw new Error('Failed to fetch visit for update');
    }
    
    const currentVisit = await getResponse.json();
    const endTime = new Date();
    
    // Actualizamos la estructura completa
    const updatedVisit = {
        ...currentVisit,
        status: 'completed',
        endTime: endTime.toISOString(),
        dischargeObservations: observations,
        visitDetails: {
            ...currentVisit.visitDetails,
            hourFi: endTime.toTimeString().split(' ')[0]
        }
    };

    const response = await fetch(`${JSON_SERVER_URL}/visits/${id}`, {
        method: 'PUT', // Usamos PUT para reemplazar el objeto completo
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedVisit)
    });

    if (!response.ok) {
        throw new Error('Failed to update visit in json-server');
    }
};

/**
 * Función auxiliar para obtener los datos de un empleado por su ID.
 */
async function getEmployeeById(id: number) {
    const res = await fetch(`${JSON_SERVER_URL}/employees/${id}`);
    if (!res.ok) {
        console.error(`Employee with id ${id} not found.`);
        return {};
    }
    const employee = await res.json();
    const { id: empId, ...rest } = employee;
    return rest;
}