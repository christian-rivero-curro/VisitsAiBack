import { VisitRegistrationPayload } from '../types';

const JSON_SERVER_URL = process.env.JSON_SERVER_URL;

/**
 * Crea una nueva visita.
 * Construye un objeto con una estructura anidada (visitor, visit, visitDetails)
 * que se corresponde con el nuevo modelo de datos en `db.json`.
 */
export const createVisit = async (payload: VisitRegistrationPayload) => {
  const { visitor, visitDetails, visit } = payload;
  const createdAt = new Date();

  const visitToCreate = {
    visitor: {
      dni: visitor.dni,
      name: visitor.name,
      company: visitor.company
    },
    visit: {
      ...(await getEmployeeById(visit.employeeId))
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
 * Combina la búsqueda por campos anidados con el filtrado manual por fechas
 * y "aplana" la respuesta para mantener la compatibilidad con el frontend.
 */
export const getVisits = async (filters: any) => {
    const query = new URLSearchParams();
    if (filters.status) query.append('status', filters.status);
    if (filters.name_like) query.append('visitor.name_like', filters.name_like);
    if (filters.dni_like) query.append('visitor.dni_like', filters.dni_like);

    const response = await fetch(`${JSON_SERVER_URL}/visits?${query.toString()}`);
    if (!response.ok) {
        throw new Error('Failed to fetch visits');
    }

    let visits = await response.json();
    
    // Filtrado manual por fechas (fusionado desde la versión anterior)
    if (filters.startDate) {
        const start = new Date(filters.startDate);
        start.setHours(0,0,0,0);
        visits = visits.filter((v: any) => new Date(v.createdAt) >= start);
    }
    if (filters.endDate) {
        const end = new Date(filters.endDate);
        end.setHours(23,59,59,999);
        visits = visits.filter((v: any) => new Date(v.createdAt) <= end);
    }

    // Ordenar por fecha de creación descendente
    visits.sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    // APLANAMOS LA RESPUESTA: Se combinan `visitor` y `visitDetails`
    // para que el frontend no necesite cambios en cómo muestra los datos.
    return visits.map((v: any) => ({
      ...v,
      visitor: {
        ...v.visitor,
        ...v.visitDetails
      }
    }));
};

/**
 * Da de baja una visita, actualizando su estado, la hora de fin y las observaciones.
 * Actualiza tanto los campos de nivel superior como los campos anidados en `visitDetails`.
 */
export const dischargeVisitor = async (id: number, observations: string) => {
  const endTime = new Date();
  
  const response = await fetch(`${JSON_SERVER_URL}/visits/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      status: 'completed',
      endTime: endTime.toISOString(),
      dischargeObservations: observations,
      visitDetails: {
          hourFi: endTime.toTimeString().split(' ')[0]
      }
    }),
  });

  if (!response.ok) {
    throw new Error('Failed to update visit in json-server');
  }
};

/**
 * Función auxiliar para obtener los datos de un empleado por su ID.
 * Excluye el 'id' del empleado para que la estructura coincida con la anidada en la visita.
 */
async function getEmployeeById(id: number) {
    const res = await fetch(`${JSON_SERVER_URL}/employees/${id}`);
    if (!res.ok) {
      console.error(`Employee with id ${id} not found.`);
      return {};
    };
    const employee = await res.json();
    const { id: empId, ...rest } = employee;
    return rest;
}