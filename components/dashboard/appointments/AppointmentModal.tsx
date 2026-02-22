// components/dashboard/appointments/AppointmentModal.tsx
"use client";

import { useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import {
  CalendarIcon,
  PhoneCall,
  Mail,
  Car,
  Clock,
  MessageSquare,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Calendar as CalendarEditIcon,
  History,
  User,
  MapPin,
} from "lucide-react";
import { DatePicker } from "./DatePicker";
import { AppointmentData } from "@/types/appoitement";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";
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

// Types et Interfaces
interface AppointmentModalProps {
  appointment: AppointmentData;
  open: boolean;
  onClose: () => void;
  onUpdate: () => void;
}

type ActionType = "confirm" | "cancel" | "modify" | "complete" | null;

// Configuration des statuts
const statusConfig = {
  PENDING: {
    label: "En attente",
    icon: AlertTriangle,
    color: "text-yellow-500",
    bgColor: "bg-yellow-500/10",
    desc: "En attente de confirmation",
  },
  CONFIRMED: {
    label: "Confirmé",
    icon: CheckCircle,
    color: "text-green-500",
    bgColor: "bg-green-500/10",
    desc: "Rendez-vous confirmé",
  },
  MODIFIED: {
    label: "Modifié",
    icon: History,
    color: "text-blue-500",
    bgColor: "bg-blue-500/10",
    desc: "Date modifiée, en attente de confirmation",
  },
  CANCELLED: {
    label: "Annulé",
    icon: XCircle,
    color: "text-red-500",
    bgColor: "bg-red-500/10",
    desc: "Rendez-vous annulé",
  },
  COMPLETED: {
    label: "Terminé",
    icon: CheckCircle,
    color: "text-gray-500",
    bgColor: "bg-gray-500/10",
    desc: "Rendez-vous terminé",
  },
} as const;

// Composants utilitaires
const StatusBadge = ({ status }: { status: keyof typeof statusConfig }) => {
  const config = statusConfig[status];
  const Icon = config.icon;

  return (
    <div
      className={cn(
        "flex flex-col items-start gap-2",
        config.bgColor,
        "p-4 rounded-lg w-full"
      )}
    >
      <div className="flex items-center gap-2">
        <Icon className={cn("h-5 w-5", config.color)} />
        <span className={cn("font-medium", config.color)}>{config.label}</span>
      </div>
      <span className="text-sm text-white/70">{config.desc}</span>
    </div>
  );
};

const InfoSection = ({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) => (
  <div className="space-y-4">
    <h3 className="text-lg font-semibold text-white border-l-4 border-red-500 pl-3">
      {title}
    </h3>
    {children}
  </div>
);

function AppointmentModal({
  appointment,
  open,
  onClose,
  onUpdate,
}: AppointmentModalProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [newDate, setNewDate] = useState<Date>(
    new Date(appointment.requestedDate)
  );
  const [loading, setLoading] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [actionType, setActionType] = useState<ActionType>(null);

  const handleAction = async (action: ActionType) => {
    if (!action) return;

    try {
      setLoading(true);
      let url = `/api/appointments/${appointment.id}`;
      let method = "PATCH";
      let body: any = {};

      switch (action) {
        case "confirm":
          body = { status: "CONFIRMED" };
          break;
        case "cancel":
          url = `/api/appointments/${appointment.id}/cancel`;
          method = "DELETE";
          break;
        case "modify":
          body = {
            requestedDate: newDate,
            status: "MODIFIED",
          };
          break;
        case "complete":
          body = { status: "COMPLETED" };
          break;
      }

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        ...(method !== "DELETE" && { body: JSON.stringify(body) }),
      });

      if (!response.ok) {
        throw new Error(`Erreur lors de l'action ${action}`);
      }

      const data = await response.json();

      if (data.error) {
        throw new Error(data.error);
      }

      const actionLabels = {
        confirm: "confirmé",
        cancel: "annulé",
        modify: "modifié",
        complete: "terminé",
      };

      toast.success(`Rendez-vous ${actionLabels[action]} avec succès`);
      onUpdate();
      onClose();
    } catch (error) {
      console.error("Erreur:", error);
      toast.error(
        error instanceof Error ? error.message : "Une erreur est survenue"
      );
    } finally {
      setLoading(false);
      setShowConfirmDialog(false);
      setActionType(null);
    }
  };

  const handleStartAction = (action: ActionType) => {
    setActionType(action);
    setShowConfirmDialog(true);
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onClose}>
        <DialogContent className="max-w-2xl p-0 bg-black">
          {/* En-tête avec gradient */}
          <div className="relative h-40 bg-gradient-to-br from-red-500 to-red-800">
            <div className="absolute inset-0 bg-black/50" />
            <div className="absolute bottom-0 left-0 right-0 p-6">
              <div className="flex flex-col gap-4">
                <StatusBadge status={appointment.status} />
                <h2 className="text-2xl font-bold text-white">
                  Détails du rendez-vous
                </h2>
              </div>
            </div>
          </div>

          <ScrollArea className="max-h-[calc(100vh-15rem)]">
            <div className="p-6 space-y-8">
              {/* Informations client */}
              <InfoSection title="Client">
                <div className="grid gap-4">
                  <div className="flex items-center gap-3 text-white/80">
                    <div className="h-10 w-10 rounded-full bg-white/5 flex items-center justify-center">
                      <User className="h-5 w-5 text-red-500" />
                    </div>
                    <div>
                      <div className="text-sm text-white/60">Nom complet</div>
                      <div className="font-medium">
                        {appointment.client.firstName}{" "}
                        {appointment.client.lastName}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 text-white/80">
                    <div className="h-10 w-10 rounded-full bg-white/5 flex items-center justify-center">
                      <PhoneCall className="h-5 w-5 text-red-500" />
                    </div>
                    <div>
                      <div className="text-sm text-white/60">Téléphone</div>
                      <div>{appointment.client.phone}</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 text-white/80">
                    <div className="h-10 w-10 rounded-full bg-white/5 flex items-center justify-center">
                      <Mail className="h-5 w-5 text-red-500" />
                    </div>
                    <div>
                      <div className="text-sm text-white/60">Email</div>
                      <div>{appointment.client.email}</div>
                    </div>
                  </div>

                  {appointment.client.address && (
                    <div className="flex items-center gap-3 text-white/80">
                      <div className="h-10 w-10 rounded-full bg-white/5 flex items-center justify-center">
                        <MapPin className="h-5 w-5 text-red-500" />
                      </div>
                      <div>
                        <div className="text-sm text-white/60">Adresse</div>
                        <div>{appointment.client.address}</div>
                      </div>
                    </div>
                  )}
                </div>
              </InfoSection>

              {/* Véhicule */}
              <InfoSection title="Véhicule">
                <div className="bg-white/5 p-4 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Car className="h-5 w-5 text-red-500" />
                    <div>
                      <div className="text-white font-medium">
                        {appointment.vehicle.brand} {appointment.vehicle.model}
                      </div>
                      <div className="text-sm text-white/60">
                        Année {appointment.vehicle.year}
                        {appointment.vehicle.trim &&
                          ` - ${appointment.vehicle.trim}`}
                      </div>
                    </div>
                  </div>
                </div>
              </InfoSection>

              {/* Date et heure */}
              <InfoSection title="Date et heure">
                {isEditing ? (
                  <div className="bg-white/5 p-4 rounded-lg">
                    <DatePicker
                      selectedDate={newDate}
                      onDateSelect={setNewDate}
                    />
                  </div>
                ) : (
                  <div className="bg-white/5 p-4 rounded-lg flex items-center gap-3">
                    <Clock className="h-5 w-5 text-red-500" />
                    <div>
                      <div className="text-white font-medium">
                        {format(new Date(appointment.requestedDate), "PPPP", {
                          locale: fr,
                        })}
                      </div>
                      <div className="text-sm text-white/60">
                        {format(new Date(appointment.requestedDate), "HH:mm", {
                          locale: fr,
                        })}
                      </div>
                    </div>
                  </div>
                )}
              </InfoSection>

              {/* Type de service */}
              <InfoSection title="Service">
                <div className="bg-white/5 p-4 rounded-lg">
                  <div className="text-white">{appointment.service}</div>
                </div>
              </InfoSection>

              {/* Description */}
              {appointment.description && (
                <InfoSection title="Description">
                  <div className="bg-white/5 p-4 rounded-lg">
                    <div className="flex items-start gap-3">
                      <MessageSquare className="h-5 w-5 text-red-500 mt-1 flex-shrink-0" />
                      <p className="text-white/80">{appointment.description}</p>
                    </div>
                  </div>
                </InfoSection>
              )}

              {/* Actions */}
              <div className="flex flex-wrap gap-3 pt-4">
                {/* Actions pour les rendez-vous en attente */}
                {appointment.status === "PENDING" && (
                  <>
                    <Button
                      className="bg-green-500 hover:bg-green-600"
                      disabled={loading}
                      onClick={() => handleStartAction("confirm")}
                    >
                      <CheckCircle className="mr-2 h-4 w-4" />
                      Confirmer
                    </Button>
                    <Button
                      variant="destructive"
                      disabled={loading}
                      onClick={() => handleStartAction("cancel")}
                    >
                      <XCircle className="mr-2 h-4 w-4" />
                      Refuser
                    </Button>
                  </>
                )}

                {/* Actions pour modification de date */}
                {(appointment.status === "PENDING" ||
                  appointment.status === "CONFIRMED") && (
                  <Button
                    variant={isEditing ? "destructive" : "secondary"}
                    disabled={loading}
                    onClick={() => setIsEditing(!isEditing)}
                  >
                    <CalendarEditIcon className="mr-2 h-4 w-4" />
                    {isEditing ? "Annuler" : "Modifier la date"}
                  </Button>
                )}

                {isEditing && (
                  <Button
                    className="bg-blue-500 hover:bg-blue-600"
                    disabled={loading}
                    onClick={() => handleStartAction("modify")}
                  >
                    <Clock className="mr-2 h-4 w-4" />
                    Sauvegarder la modification
                  </Button>
                )}

                {/* Actions pour les rendez-vous confirmés */}
                {appointment.status === "CONFIRMED" && !isEditing && (
                  <>
                    <Button
                      variant="destructive"
                      disabled={loading}
                      onClick={() => handleStartAction("cancel")}
                    >
                      <XCircle className="mr-2 h-4 w-4" />
                      Annuler le rendez-vous
                    </Button>
                    <Button
                      className="bg-green-500 hover:bg-green-600"
                      disabled={loading}
                      onClick={() => handleStartAction("complete")}
                    >
                      <CheckCircle className="mr-2 h-4 w-4" />
                      Marquer comme terminé
                    </Button>
                  </>
                )}
              </div>
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>

      {/* Dialogue de confirmation */}
      <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <AlertDialogContent className="bg-black border border-white/10">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-white">
              {actionType === "confirm" && "Confirmer le rendez-vous"}
              {actionType === "cancel" && "Annuler le rendez-vous"}
              {actionType === "modify" && "Modifier la date"}
              {actionType === "complete" && "Terminer le rendez-vous"}
            </AlertDialogTitle>
            <AlertDialogDescription className="text-white/70">
              {actionType === "confirm" && (
                <>
                  Voulez-vous confirmer ce rendez-vous pour le{" "}
                  <span className="font-medium text-white">
                    {format(
                      new Date(appointment.requestedDate),
                      "PPP à HH:mm",
                      { locale: fr }
                    )}
                  </span>
                  ?<br />
                  Un email de confirmation sera envoyé à{" "}
                  {appointment.client.firstName} {appointment.client.lastName}.
                </>
              )}
              {actionType === "cancel" && (
                <>
                  Êtes-vous sûr de vouloir annuler ce rendez-vous avec{" "}
                  <span className="font-medium text-white">
                    {appointment.client.firstName} {appointment.client.lastName}
                  </span>
                  ?<br />
                  Un email d'annulation sera automatiquement envoyé au client.
                </>
              )}
              {actionType === "modify" && (
                <>
                  Confirmer la modification du rendez-vous pour le{" "}
                  <span className="font-medium text-white">
                    {format(newDate, "PPP à HH:mm", { locale: fr })}
                  </span>
                  ?<br />
                  Le client recevra un email avec ce nouveau créneau et devra le
                  confirmer.
                </>
              )}
              {actionType === "complete" && (
                <>
                  Confirmez-vous que ce rendez-vous est terminé ?<br />
                  <span className="text-sm text-white/60">
                    Cette action ne peut pas être annulée.
                  </span>
                </>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              onClick={() => {
                setShowConfirmDialog(false);
                setActionType(null);
              }}
              className="bg-white/5 text-white hover:bg-white/10 border-white/10"
            >
              Annuler
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => actionType && handleAction(actionType)}
              className={cn(
                "text-white",
                actionType === "confirm" && "bg-green-500 hover:bg-green-600",
                actionType === "cancel" && "bg-red-500 hover:bg-red-600",
                actionType === "modify" && "bg-blue-500 hover:bg-blue-600",
                actionType === "complete" && "bg-gray-500 hover:bg-gray-600",
                loading && "opacity-50 cursor-not-allowed"
              )}
              disabled={loading}
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white/20 border-t-white" />
                  Traitement en cours...
                </div>
              ) : (
                <>
                  {actionType === "confirm" && "Confirmer le rendez-vous"}
                  {actionType === "cancel" && "Annuler le rendez-vous"}
                  {actionType === "modify" && "Modifier la date"}
                  {actionType === "complete" && "Marquer comme terminé"}
                </>
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

export default AppointmentModal;
