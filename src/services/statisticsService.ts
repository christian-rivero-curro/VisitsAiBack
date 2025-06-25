const JSON_SERVER_URL_STATS = process.env.JSON_SERVER_URL;

export const getStatistics = async () => {
    const visitsResponse = await fetch(`${JSON_SERVER_URL_STATS}/visits`);
    const visits = await visitsResponse.json();

    // La lógica de cálculo se mantiene, ya que los campos necesarios
    // (status, createdAt, visit.orgUnit) siguen estando en el nivel superior del objeto.
    // No son necesarios cambios aquí.

    // 1. Summary
    const totalVisits = visits.length;
    const activeVisits = visits.filter((v: any) => v.status === 'active').length;
    const distinctOrgUnits = new Set(visits.map((v: any) => v.visit.orgUnit)).size;

    // 2. By Weekday
    const weekdayCounts: { [key: string]: number } = { 'Dilluns': 0, 'Dimarts': 0, 'Dimecres': 0, 'Dijous': 0, 'Divendres': 0 };
    const dayNames = ['Diumenge', 'Dilluns', 'Dimarts', 'Dimecres', 'Dijous', 'Divendres', 'Dissabte'];
    
    visits.forEach((v: any) => {
        const dayIndex = new Date(v.createdAt).getDay();
        if (dayIndex >= 1 && dayIndex <= 5) {
            const dayName = dayNames[dayIndex];
            weekdayCounts[dayName]++;
        }
    });

    const byWeekday = Object.entries(weekdayCounts).map(([day, count]) => ({ day, count }));

    // 3. By Org Unit
    const orgUnitCounts: { [key: string]: number } = {};
    visits.forEach((v: any) => {
        const orgUnit = v.visit.orgUnit || 'Sense especificar';
        orgUnitCounts[orgUnit] = (orgUnitCounts[orgUnit] || 0) + 1;
    });

    const byOrgUnit = Object.entries(orgUnitCounts)
        .filter(([_, count]) => count > 1)
        .map(([orgUnit, count]) => ({ orgUnit, count }))
        .sort((a, b) => b.count - a.count);

    return {
        summary: { totalVisits, activeVisits, distinctOrgUnits },
        byWeekday,
        byOrgUnit
    };
};
