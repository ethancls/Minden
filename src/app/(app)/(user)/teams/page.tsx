import { AppPageShell } from "@/app/(app)/_components/page-shell";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PlusIcon, FileIcon, UsersIcon, EyeIcon } from "lucide-react";
import Link from "next/link";
import { getTeamDatasetsQuery } from "@/server/actions/team-datasets/queries";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

export const metadata = {
    title: "Analyse d'équipes",
    description: "Importez et analysez les structures d'équipes et leurs droits d'accès",
};

export default async function TeamsPage() {
    const datasets = await getTeamDatasetsQuery();

    return (
        <AppPageShell
            title="Analyse d'équipes"
            description="Importez et analysez les structures d'équipes et leurs droits d'accès"
        >
            <div className="w-full space-y-6">
                {/* Header avec bouton d'import */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Datasets d'équipes</h1>
                        <p className="text-muted-foreground">
                            Gérez vos imports de données d'équipes et visualisez les structures organisationnelles
                        </p>
                    </div>
                    <Link href="/teams/import">
                        <Button>
                            <PlusIcon className="mr-2 h-4 w-4" />
                            Importer des données
                        </Button>
                    </Link>
                </div>

                {/* Liste des datasets */}
                {datasets.length === 0 ? (
                    <Card>
                        <CardContent className="flex flex-col items-center justify-center py-12">
                            <UsersIcon className="h-12 w-12 text-muted-foreground mb-4" />
                            <h3 className="text-lg font-semibold mb-2">Aucun dataset importé</h3>
                            <p className="text-muted-foreground text-center mb-6">
                                Commencez par importer un fichier JSON contenant les données de votre équipe
                            </p>
                            <Link href="/teams/import">
                                <Button>
                                    <PlusIcon className="mr-2 h-4 w-4" />
                                    Importer votre premier dataset
                                </Button>
                            </Link>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                        {datasets.map((dataset) => (
                            <Card key={dataset.id} className="hover:shadow-md transition-shadow">
                                <CardHeader>
                                    <div className="flex items-start justify-between">
                                        <div className="flex items-center space-x-2">
                                            <FileIcon className="h-5 w-5 text-muted-foreground" />
                                            <CardTitle className="text-lg">{dataset.name}</CardTitle>
                                        </div>
                                        <Badge 
                                            variant={
                                                dataset.status === "completed" ? "default" :
                                                dataset.status === "processing" ? "secondary" :
                                                dataset.status === "failed" ? "destructive" : "outline"
                                            }
                                        >
                                            {dataset.status === "completed" ? "Terminé" :
                                             dataset.status === "processing" ? "En cours" :
                                             dataset.status === "failed" ? "Échec" : "En attente"}
                                        </Badge>
                                    </div>
                                    <CardDescription>
                                        {dataset.description || "Aucune description"}
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-4">
                                        <div className="text-sm text-muted-foreground">
                                            <p><strong>Fichier :</strong> {dataset.fileName}</p>
                                            <p><strong>Importé le :</strong> {format(dataset.importedAt, "dd/MM/yyyy à HH:mm", { locale: fr })}</p>
                                            {dataset.lastAnalyzedAt && (
                                                <p><strong>Analysé le :</strong> {format(dataset.lastAnalyzedAt, "dd/MM/yyyy à HH:mm", { locale: fr })}</p>
                                            )}
                                        </div>

                                        {/* Statistiques des données */}
                                        {dataset.rawData && Array.isArray(dataset.rawData) && (
                                            <div className="bg-muted/50 rounded-lg p-3">
                                                <h4 className="font-medium text-sm mb-2">Statistiques</h4>
                                                <div className="grid grid-cols-2 gap-2 text-sm">
                                                    <div>
                                                        <span className="text-muted-foreground">Utilisateurs:</span>
                                                        <span className="ml-1 font-medium">{(dataset.rawData as any[]).length}</span>
                                                    </div>
                                                    <div>
                                                        <span className="text-muted-foreground">Équipes:</span>
                                                        <span className="ml-1 font-medium">
                                                            {new Set((dataset.rawData as any[]).map((user: any) => user.team)).size}
                                                        </span>
                                                    </div>
                                                    <div>
                                                        <span className="text-muted-foreground">Départements:</span>
                                                        <span className="ml-1 font-medium">
                                                            {new Set((dataset.rawData as any[]).map((user: any) => user.department)).size}
                                                        </span>
                                                    </div>
                                                    <div>
                                                        <span className="text-muted-foreground">Droits totaux:</span>
                                                        <span className="ml-1 font-medium">
                                                            {(dataset.rawData as any[]).reduce((acc: number, user: any) => 
                                                                acc + (user.rights?.length || 0), 0
                                                            )}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        )}                                        <div className="flex items-center justify-between pt-4">
                                            <Link href={`/teams/${dataset.id}`}>
                                                <Button variant="outline" size="sm">
                                                    <EyeIcon className="mr-2 h-4 w-4" />
                                                    Voir les détails
                                                </Button>
                                            </Link>
                                            {dataset.status === "completed" && (
                                                <Link href={`/teams/${dataset.id}/visualize`}>
                                                    <Button size="sm">
                                                        Visualiser
                                                    </Button>
                                                </Link>
                                            )}
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}
            </div>
        </AppPageShell>
    );
}