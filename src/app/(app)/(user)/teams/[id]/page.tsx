import { AppPageShell } from "@/app/(app)/_components/page-shell";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ArrowLeftIcon, EyeIcon, UsersIcon, Building2Icon, ShieldIcon } from "lucide-react";
import Link from "next/link";
import { getTeamDatasetByIdQuery } from "@/server/actions/team-datasets/queries";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { notFound } from "next/navigation";

interface TeamDatasetPageProps {
    params: {
        id: string;
    };
}

export const metadata = {
    title: "Détails du dataset",
    description: "Affichage détaillé des données d'équipe importées",
};

export default async function TeamDatasetPage({ params }: TeamDatasetPageProps) {
    try {
        const dataset = await getTeamDatasetByIdQuery(params.id);
        
        if (!dataset.rawData || !Array.isArray(dataset.rawData)) {
            return notFound();
        }

        const rawData = dataset.rawData as any[];

        // Analyse des données pour créer des statistiques
        const stats = {
            totalUsers: rawData.length,
            teams: new Set(rawData.map(user => user.team)).size,
            departments: new Set(rawData.map(user => user.department)).size,
            totalRights: rawData.reduce((acc, user) => acc + (user.rights?.length || 0), 0),
            uniqueRights: new Set(rawData.flatMap(user => 
                user.rights?.map((right: any) => right.rightId) || []
            )).size,
            applications: new Set(rawData.flatMap(user => 
                user.rights?.map((right: any) => right.application) || []
            )).size,
        };

        // Regroupement par équipe
        const teamGroups = rawData.reduce((acc, user) => {
            if (!acc[user.team]) {
                acc[user.team] = [];
            }
            acc[user.team].push(user);
            return acc;
        }, {} as Record<string, any[]>);

        return (
            <AppPageShell
                title={dataset.name}
                description={dataset.description || "Dataset d'équipe importé"}
            >
                <div className="w-full space-y-6">
                    {/* Header avec navigation */}
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                            <Link href="/teams">
                                <Button variant="outline" size="sm">
                                    <ArrowLeftIcon className="mr-2 h-4 w-4" />
                                    Retour
                                </Button>
                            </Link>
                            <div>
                                <h1 className="text-3xl font-bold tracking-tight">{dataset.name}</h1>
                                <p className="text-muted-foreground">
                                    {dataset.description || "Aucune description"}
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center space-x-2">
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
                            {dataset.status === "completed" && (
                                <Link href={`/teams/${dataset.id}/visualize`}>
                                    <Button>
                                        <EyeIcon className="mr-2 h-4 w-4" />
                                        Visualiser
                                    </Button>
                                </Link>
                            )}
                        </div>
                    </div>

                    {/* Informations du dataset */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Informations du dataset</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                                <div>
                                    <span className="text-muted-foreground">Fichier:</span>
                                    <p className="font-medium">{dataset.fileName}</p>
                                </div>
                                <div>
                                    <span className="text-muted-foreground">Importé le:</span>
                                    <p className="font-medium">{format(dataset.importedAt, "dd/MM/yyyy à HH:mm", { locale: fr })}</p>
                                </div>
                                <div>
                                    <span className="text-muted-foreground">Importé par:</span>
                                    <p className="font-medium">{dataset.importedByUser.name}</p>
                                </div>
                                {dataset.lastAnalyzedAt && (
                                    <div>
                                        <span className="text-muted-foreground">Analysé le:</span>
                                        <p className="font-medium">{format(dataset.lastAnalyzedAt, "dd/MM/yyyy à HH:mm", { locale: fr })}</p>
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Statistiques globales */}
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                        <Card>
                            <CardContent className="p-6">
                                <div className="flex items-center space-x-2">
                                    <UsersIcon className="h-4 w-4 text-muted-foreground" />
                                    <div>
                                        <p className="text-2xl font-bold">{stats.totalUsers}</p>
                                        <p className="text-xs text-muted-foreground">Utilisateurs</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardContent className="p-6">
                                <div className="flex items-center space-x-2">
                                    <Building2Icon className="h-4 w-4 text-muted-foreground" />
                                    <div>
                                        <p className="text-2xl font-bold">{stats.teams}</p>
                                        <p className="text-xs text-muted-foreground">Équipes</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardContent className="p-6">
                                <div className="flex items-center space-x-2">
                                    <Building2Icon className="h-4 w-4 text-muted-foreground" />
                                    <div>
                                        <p className="text-2xl font-bold">{stats.departments}</p>
                                        <p className="text-xs text-muted-foreground">Départements</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardContent className="p-6">
                                <div className="flex items-center space-x-2">
                                    <ShieldIcon className="h-4 w-4 text-muted-foreground" />
                                    <div>
                                        <p className="text-2xl font-bold">{stats.totalRights}</p>
                                        <p className="text-xs text-muted-foreground">Droits totaux</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardContent className="p-6">
                                <div className="flex items-center space-x-2">
                                    <ShieldIcon className="h-4 w-4 text-muted-foreground" />
                                    <div>
                                        <p className="text-2xl font-bold">{stats.uniqueRights}</p>
                                        <p className="text-xs text-muted-foreground">Droits uniques</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardContent className="p-6">  
                                <div className="flex items-center space-x-2">
                                    <Building2Icon className="h-4 w-4 text-muted-foreground" />
                                    <div>
                                        <p className="text-2xl font-bold">{stats.applications}</p>
                                        <p className="text-xs text-muted-foreground">Applications</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Données par équipe */}
                    <div className="space-y-6">
                        <h2 className="text-2xl font-bold">Répartition par équipes</h2>
                        <div className="grid gap-6 lg:grid-cols-2">
                            {Object.entries(teamGroups).map(([teamName, teamUsers]) => (
                                <Card key={teamName}>
                                    <CardHeader>
                                        <CardTitle className="flex items-center justify-between">
                                            <span>{teamName}</span>
                                            <Badge variant="secondary">{(teamUsers as any[]).length} utilisateurs</Badge>
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="space-y-4">
                                            {(teamUsers as any[]).map((user: any, idx: number) => (
                                                <div key={user.userId} className="border rounded-lg p-4">
                                                    <div className="flex items-start justify-between mb-2">
                                                        <div>
                                                            <h4 className="font-medium">{user.userName}</h4>
                                                            <p className="text-sm text-muted-foreground">{user.position}</p>
                                                            <p className="text-xs text-muted-foreground">
                                                                Embauché le {format(new Date(user.hireDate), "dd/MM/yyyy", { locale: fr })}
                                                            </p>
                                                        </div>
                                                        <Badge variant="outline">{user.department}</Badge>
                                                    </div>
                                                    <Separator className="my-2" />
                                                    <div>
                                                        <h5 className="text-sm font-medium mb-2">Droits d'accès ({user.rights?.length || 0})</h5>
                                                        <div className="grid grid-cols-1 gap-1">
                                                            {user.rights?.slice(0, 5).map((right: any) => (
                                                                <div key={right.rightId} className="text-xs bg-muted/50 rounded px-2 py-1">
                                                                    <span className="font-medium">{right.rightName}</span>
                                                                    <span className="text-muted-foreground ml-1">({right.application})</span>
                                                                </div>
                                                            ))}
                                                            {user.rights?.length > 5 && (
                                                                <div className="text-xs text-muted-foreground mt-1">
                                                                    +{user.rights.length - 5} autres droits...
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    </div>
                </div>
            </AppPageShell>
        );
    } catch (error) {
        console.error("Erreur lors du chargement du dataset:", error);
        return notFound();
    }
}
