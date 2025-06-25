const JSON_SERVER_URL = process.env.JSON_SERVER_URL;

export const getStatistics = async () => {
    if (!JSON_SERVER_URL) {
        throw new Error('JSON_SERVER_URL environment variable is not configured');
    }

    try {
        const visitsResponse = await fetch(`${JSON_SERVER_URL}/visits`);
        
        if (!visitsResponse.ok) {
            throw new Error(`Failed to fetch visits: ${visitsResponse.status} ${visitsResponse.statusText}`);
        }
        
        const visits = await visitsResponse.json();

        // Validar que la respuesta sea un array
        if (!Array.isArray(visits)) {
            throw new Error('Invalid response format: expected array of visits');
        }

        // 1. Summary
        const totalVisits = visits.length;
        const activeVisits = visits.filter((v: any) => v.status === 'active').length;
        
        // Obtener unidades organizacionales únicas de forma más robusta
        const orgUnits = visits
            .map((v: any) => v.visit?.orgUnit)
            .filter((orgUnit: any) => orgUnit && orgUnit.trim() !== '')
            .filter((orgUnit: any, index: number, arr: any[]) => arr.indexOf(orgUnit) === index);
        
        const distinctOrgUnits = orgUnits.length;

        // 2. By Weekday
        const weekdayCounts: { [key: string]: number } = {
            'Dilluns': 0,
            'Dimarts': 0,
            'Dimecres': 0,
            'Dijous': 0,
            'Divendres': 0
        };
        
        const dayNames = ['Diumenge', 'Dilluns', 'Dimarts', 'Dimecres', 'Dijous', 'Divendres', 'Dissabte'];
        
        visits.forEach((v: any) => {
            if (v.createdAt) {
                try {
                    const date = new Date(v.createdAt);
                    const dayIndex = date.getDay();
                    
                    // Solo días laborables (Lunes a Viernes)
                    if (dayIndex >= 1 && dayIndex <= 5) {
                        const dayName = dayNames[dayIndex];
                        if (weekdayCounts.hasOwnProperty(dayName)) {
                            weekdayCounts[dayName]++;
                        }
                    }
                } catch (error) {
                    console.warn(`Invalid date format in visit: ${v.createdAt}`);
                }
            }
        });

        const byWeekday = Object.entries(weekdayCounts).map(([day, count]) => ({ day, count }));

        // 3. By Org Unit
        const orgUnitCounts: { [key: string]: number } = {};
        
        visits.forEach((v: any) => {
            const orgUnit = v.visit?.orgUnit?.trim() || 'Sense especificar';
            orgUnitCounts[orgUnit] = (orgUnitCounts[orgUnit] || 0) + 1;
        });

        const byOrgUnit = Object.entries(orgUnitCounts)
            .filter(([_, count]) => count > 1) // Solo mostrar unidades con más de 1 visita
            .map(([orgUnit, count]) => ({ orgUnit, count }))
            .sort((a, b) => b.count - a.count); // Ordenar por cantidad descendente

        return {
            summary: { 
                totalVisits, 
                activeVisits, 
                distinctOrgUnits 
            },
            byWeekday,
            byOrgUnit
        };
        
    } catch (error) {
        if (error instanceof Error) {
            throw error;
        }
        throw new Error('Unknown error occurred while fetching statistics');
    }
};