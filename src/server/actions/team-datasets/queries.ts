"use server";

import { db } from "@/server/db";
import { teamDatasets } from "@/server/db/schema";
import { protectedProcedure } from "@/server/procedures";
import { getOrganizations } from "@/server/actions/organization/queries";
import { unstable_noStore as noStore } from "next/cache";
import { and, desc, eq } from "drizzle-orm";

/**
 * Récupère tous les datasets d'équipes pour l'organisation courante
 */
export async function getTeamDatasetsQuery() {
    noStore();
    const { user } = await protectedProcedure();
    const { currentOrg } = await getOrganizations();

    return await db.query.teamDatasets.findMany({
        where: eq(teamDatasets.orgId, currentOrg.id),
        orderBy: desc(teamDatasets.importedAt),
        with: {
            importedByUser: {
                columns: {
                    id: true,
                    name: true,
                    email: true,
                },
            },
        },
    });
}

/**
 * Récupère un dataset spécifique par son ID
 */
export async function getTeamDatasetByIdQuery(id: string) {
    noStore();
    const { user } = await protectedProcedure();
    const { currentOrg } = await getOrganizations();

    const dataset = await db.query.teamDatasets.findFirst({
        where: and(
            eq(teamDatasets.id, id),
            eq(teamDatasets.orgId, currentOrg.id)
        ),
        with: {
            importedByUser: {
                columns: {
                    id: true,
                    name: true,
                    email: true,
                },
            },
        },
    });

    if (!dataset) {
        throw new Error("Dataset non trouvé ou accès refusé");
    }

    return dataset;
}
