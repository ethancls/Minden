"use client";

import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { startRegistration } from "@simplewebauthn/browser";
import { useCallback, useEffect, useState } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { useTranslations } from "next-intl";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { TrashIcon } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";

interface Passkey {
  id: string;
  name: string;
  transports: string;
  createdAt: string;
  lastUsedAt: string | null;
}

export function PasskeysSettings() {
  const t = useTranslations("settings.passkeys");
  const [passkeys, setPasskeys] = useState<Passkey[]>([]);
  const [newPasskeyName, setNewPasskeyName] = useState("");
  const [isAdding, setIsAdding] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [keyToDelete, setKeyToDelete] = useState<Passkey | null>(null);

  const fetchPasskeys = useCallback(async () => {
    setIsFetching(true);
    try {
      const resp = await fetch("/api/auth/passkeys");
      if (!resp.ok) throw new Error("Failed to fetch passkeys");
      const data = await resp.json();
      setPasskeys(data);
    } catch {
      toast.error(t("fetchError"));
    } finally {
      setIsFetching(false);
    }
  }, [t]);

  useEffect(() => {
    fetchPasskeys();
  }, [fetchPasskeys]);

  async function addPasskey() {
    if (!newPasskeyName.trim()) {
      toast.error(t("nameRequiredError"));
      return;
    }
    setIsAdding(true);
    try {
      const resp = await fetch("/api/auth/webauthn/registration/options", {
        method: "POST",
      });
      if (!resp.ok) throw new Error("Failed to get registration options");
      const options = await resp.json();
      const attestation = await startRegistration(options);
      const verifyResp = await fetch(
        "/api/auth/webauthn/registration/verify",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: newPasskeyName,
            credential: attestation,
          }),
        }
      );

      if (!verifyResp.ok) {
        const errorData = await verifyResp.json();
        throw new Error(errorData.error || "Verification failed");
      }

      toast.success(t("addSuccess"));
      setNewPasskeyName("");
      setIsAddDialogOpen(false);
      await fetchPasskeys();
    } catch (e: unknown) {
      console.error(e);
      // Check for specific error messages and translate them
      let errorMsg = t("addError");
      if (e instanceof Error) {
        if (e.message.includes("authenticator was previously registered") || e.message === "AUTHENTICATOR_PREVIOUSLY_REGISTERED") {
          errorMsg = t("errors.authenticatorPreviouslyRegistered");
        } else if (e.message === "Failed to get registration options" || e.message === "REGISTRATION_OPTIONS_ERROR") {
          errorMsg = t("errors.registrationOptionsError");
        } else if (e.message === "VERIFICATION_FAILED") {
          errorMsg = t("errors.verificationError");
        } else if (e.message === "MISSING_CREDENTIAL_DATA") {
          errorMsg = t("errors.missingCredentialData");
        } else if (e.message === "UNAUTHORIZED") {
          errorMsg = t("errors.unauthorized");
        } else if (e.message === "INVALID_INPUT") {
          errorMsg = t("errors.invalidInput");
        } else if (e.message === "NO_CHALLENGE") {
          errorMsg = t("errors.noChallenge");
        } else if (e.message) {
          errorMsg = `${t("addError")}: ${e.message}`;
        }
      } else {
        errorMsg = t("errors.generalError");
      }
      toast.error(errorMsg);
    } finally {
      setIsAdding(false);
    }
  }

  async function deletePasskey() {
    if (!keyToDelete) return;
    try {
      const resp = await fetch("/api/auth/passkeys", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: keyToDelete.id }),
      });

      if (!resp.ok) {
        throw new Error("Failed to delete passkey");
      }

      toast.success(t("deleteSuccess"));
      await fetchPasskeys();
    } catch {
      toast.error(t("deleteError"));
    } finally {
      setKeyToDelete(null);
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString(undefined, {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>{t("title")}</CardTitle>
            <CardDescription>{t("description")}</CardDescription>
          </div>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button>{t("addButton")}</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{t("addDialog.title")}</DialogTitle>
                <DialogDescription>
                  {t("addDialog.description")}
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-2">
                <label htmlFor="passkey-name" className="text-sm font-medium">
                  {t("addDialog.inputLabel")}
                </label>
                <Input
                  id="passkey-name"
                  value={newPasskeyName}
                  onChange={(e) => setNewPasskeyName(e.target.value)}
                  placeholder={t("addDialog.inputPlaceholder")}
                />
              </div>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setIsAddDialogOpen(false)}
                >
                  {t("addDialog.cancel")}
                </Button>
                <Button onClick={addPasskey} disabled={isAdding}>
                  {isAdding ? t("addDialog.adding") : t("addDialog.add")}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        {isFetching ? (
          <p>{t("loading")}</p>
        ) : passkeys.length === 0 ? (
          <p className="text-sm text-muted-foreground">{t("noKeys")}</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t("table.name")}</TableHead>
                <TableHead>{t("table.createdAt")}</TableHead>
                <TableHead>{t("table.lastUsed")}</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {passkeys.map((key) => (
                <TableRow key={key.id}>
                  <TableCell className="font-medium">{key.name}</TableCell>
                  <TableCell>{formatDate(key.createdAt)}</TableCell>
                  <TableCell>
                    {key.lastUsedAt ? (
                      formatDate(key.lastUsedAt)
                    ) : (
                      <Badge variant="outline">{t("table.neverUsed")}</Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setKeyToDelete(key)}
                    >
                      <TrashIcon className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>

      <AlertDialog
        open={keyToDelete !== null}
        onOpenChange={(open) => !open && setKeyToDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("deleteDialog.title")}</AlertDialogTitle>
            <AlertDialogDescription>
              {t("deleteDialog.description", { name: keyToDelete?.name })}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t("deleteDialog.cancel")}</AlertDialogCancel>
            <AlertDialogAction onClick={deletePasskey}>
              {t("deleteDialog.delete")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
}