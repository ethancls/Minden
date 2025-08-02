"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { FileIcon, UploadIcon, AlertCircleIcon, CheckCircleIcon } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { importTeamDatasetAction } from "@/server/actions/team-datasets/mutations";

export function ImportForm() {
    const router = useRouter();
    const [isPending, startTransition] = useTransition();
    const [file, setFile] = useState<File | null>(null);
    const [jsonData, setJsonData] = useState<any>(null);
    const [jsonError, setJsonError] = useState<string>("");
    const [formData, setFormData] = useState({
        name: "",
        description: "",
    });

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0];
        if (!selectedFile) return;

        if (!selectedFile.name.endsWith('.json')) {
            setJsonError("Veuillez sélectionner un fichier JSON");
            return;
        }

        setFile(selectedFile);
        setJsonError("");

        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                const jsonContent = JSON.parse(event.target?.result as string);
                setJsonData(jsonContent);
                
                // Auto-remplir le nom si pas défini
                if (!formData.name) {
                    setFormData(prev => ({
                        ...prev,
                        name: selectedFile.name.replace('.json', '')
                    }));
                }
            } catch (error) {
                setJsonError("Format JSON invalide");
                setJsonData(null);
            }
        };
        reader.readAsText(selectedFile);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!file || !jsonData) {
            setJsonError("Veuillez sélectionner un fichier JSON valide");
            return;
        }

        if (!formData.name.trim()) {
            setJsonError("Veuillez saisir un nom pour le dataset");
            return;
        }

        try {
        startTransition(() => {
            importTeamDatasetAction({
                name: formData.name,
                description: formData.description,
                fileName: file.name,
                rawData: jsonData,
            }).then((result) => {
                if (result.success && result.data) {
                    router.push(`/teams/${result.data.id}`);
                } else {
                    setJsonError(result.message || "Erreur lors de l'import");
                }
            }).catch(() => {
                setJsonError("Erreur lors de l'import du dataset");
            });
        });
        } catch (error) {
            setJsonError("Erreur lors de l'import du dataset");
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>Informations du dataset</CardTitle>
                    <CardDescription>
                        Donnez un nom et une description à votre dataset d'équipe
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div>
                        <Label htmlFor="name">Nom du dataset *</Label>
                        <Input
                            id="name"
                            value={formData.name}
                            onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                            placeholder="Ex: Équipe Marketing Q4 2024"
                            required
                        />
                    </div>
                    <div>
                        <Label htmlFor="description">Description</Label>
                        <Textarea
                            id="description"
                            value={formData.description}
                            onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                            placeholder="Description optionnelle du dataset..."
                            rows={3}
                        />
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Fichier JSON</CardTitle>
                    <CardDescription>
                        Sélectionnez un fichier JSON contenant les données d'équipe
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div>
                        <Label htmlFor="file">Fichier JSON *</Label>
                        <Input
                            id="file"
                            type="file"
                            accept=".json"
                            onChange={handleFileChange}
                            required
                        />
                    </div>

                    {/* Exemple de format */}
                    <div className="border rounded-lg p-4 bg-blue-50 dark:bg-blue-950">
                        <h4 className="font-medium mb-2 text-blue-900 dark:text-blue-100">Format JSON attendu :</h4>
                        <pre className="text-xs overflow-auto max-h-32 text-blue-800 dark:text-blue-200">
{`{
  "team": {
    "name": "Équipe Marketing",
    "department": "Marketing",
    "members": [
      {
        "id": "1",
        "name": "Alice Dupont",
        "email": "alice@company.com",
        "role": "Manager",
        "permissions": ["read", "write", "manage_users"]
      },
      {
        "id": "2", 
        "name": "Bob Martin",
        "email": "bob@company.com",
        "role": "Developer",
        "permissions": ["read", "write"]
      }
    ],
    "roles": {
      "Manager": ["read", "write", "delete", "manage_users"],
      "Developer": ["read", "write"],
      "Viewer": ["read"]
    }
  }
}`}
                        </pre>
                    </div>

                    {file && !jsonError && (
                        <Alert>
                            <CheckCircleIcon className="h-4 w-4" />
                            <AlertDescription>
                                <strong>{file.name}</strong> chargé avec succès ({(file.size / 1024).toFixed(1)} KB)
                            </AlertDescription>
                        </Alert>
                    )}

                    {jsonError && (
                        <Alert variant="destructive">
                            <AlertCircleIcon className="h-4 w-4" />
                            <AlertDescription>{jsonError}</AlertDescription>
                        </Alert>
                    )}

                    {jsonData && (
                        <div className="border rounded-lg p-4 bg-muted/50">
                            <h4 className="font-medium mb-2">Aperçu des données</h4>
                            <pre className="text-xs overflow-auto max-h-32">
                                {JSON.stringify(jsonData, null, 2)}
                            </pre>
                        </div>
                    )}
                </CardContent>
            </Card>

            <div className="text-center">
                <Button 
                    type="submit" 
                    disabled={isPending || !file || !jsonData || jsonError !== ""}
                    size="lg"
                >
                    {isPending ? (
                        <>
                            <UploadIcon className="mr-2 h-4 w-4 animate-spin" />
                            Import en cours...
                        </>
                    ) : (
                        <>
                            <UploadIcon className="mr-2 h-4 w-4" />
                            Importer le dataset
                        </>
                    )}
                </Button>
            </div>
        </form>
    );
}
