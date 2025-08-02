import { AppPageShell } from "@/app/(app)/_components/page-shell";
import { ImportForm } from "./_components/import-form";

export const metadata = {
    title: "Importer des données d'équipe",
    description: "Importez un fichier JSON contenant les informations de votre équipe et leurs droits",
};

export default function ImportPage() {
    return (
        <AppPageShell
            title="Importer des données d'équipe"
            description="Importez un fichier JSON contenant les informations de votre équipe et leurs droits"
        >
            <div className="max-w-2xl mx-auto">
                <ImportForm />
            </div>
        </AppPageShell>
    );
}
