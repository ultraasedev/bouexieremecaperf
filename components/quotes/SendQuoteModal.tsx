import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { getEmailTemplate } from '@/lib/emailTemplate';
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import dynamic from "next/dynamic";
import { toast } from "@/components/ui/use-toast";
import { Loader2, PaperclipIcon, X } from "lucide-react";

const Editor = dynamic(() => import("@/components/ui/editor"), { ssr: false });

const sendQuoteSchema = z.object({
  to: z
    .array(z.string().email("Email invalide"))
    .min(1, "Au moins un destinataire est requis"),
  cc: z.array(z.string().email("Email invalide")).optional(),
  bcc: z.array(z.string().email("Email invalide")).optional(),
  subject: z.string().min(1, "L'objet est requis"),
  message: z.string().min(1, "Le message est requis"),
});

interface SendQuoteModalProps {
  open: boolean;
  onClose: () => void;
  data: any;
}

export default function SendQuoteModal({
  open,
  onClose,
  data,
}: SendQuoteModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [attachments, setAttachments] = useState<File[]>([]);
  const [previewMode, setPreviewMode] = useState<"edit" | "preview">("edit");

  const defaultTemplate = `
    <div>
      <p>Bonjour,</p>
      <p>Veuillez trouver ci-joint le devis n°${data.number} correspondant à nos prestations.</p>
      <p>N'hésitez pas à nous contacter pour toute question ou précision.</p>
      <p>Bien cordialement,</p>
    </div>
  `;

  const form = useForm({
    resolver: zodResolver(sendQuoteSchema),
    defaultValues: {
      to: data.clientInfo?.email ? [data.clientInfo.email] : [],
      cc: [],
      bcc: [],
      subject: `Devis n°${data.number} - Bouexiere Meca Performance`,
      message: defaultTemplate,
    },
  });

  const handleFileAdd = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      const newFiles = Array.from(files);
      setAttachments((prev) => [...prev, ...newFiles]);
    }
  };

  const handleFileRemove = (index: number) => {
    setAttachments((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSend = async (formData: z.infer<typeof sendQuoteSchema>) => {
    setIsLoading(true);
    try {
      if (!data.id) {
        toast({
          title: "Erreur",
          description:
            "Veuillez d'abord sauvegarder le devis avant de l'envoyer",
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Envoi en cours",
        description: "Le devis est en cours d'envoi...",
        duration: 2000,
      });

      const sendData = new FormData();
      sendData.append("data", JSON.stringify(formData));
      sendData.append("quoteId", data.id);
      attachments.forEach((file) => {
        sendData.append("attachments", file);
      });

      const response = await fetch(`/api/quotes/${data.id}/send`, {
        method: "POST",
        body: sendData, // Utilisez sendData au lieu de formData
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Erreur lors de l'envoi");
      }

      toast({
        title: "Succès",
        description: "Le devis a été envoyé avec succès",
      });

      onClose();
    } catch (error) {
      console.error("Erreur:", error);
      let errorMessage = "Impossible d'envoyer le devis";

      if (error instanceof Error) {
        if (error.message.includes("RESEND_API_KEY")) {
          errorMessage =
            "Configuration email manquante. Veuillez configurer la clé Resend.";
        } else if (error.message.includes("recipient")) {
          errorMessage = "Adresse email du destinataire invalide";
        } else {
          errorMessage = error.message;
        }
      }

      toast({
        title: "Erreur d'envoi",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Envoyer le devis</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSend)} className="space-y-6">
            <div className="space-y-4">
              <FormField
                control={form.control}
                name="to"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Destinataire(s)</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="email@exemple.fr (séparer les emails par des virgules)"
                        value={field.value.join(", ")}
                        onChange={(e) => {
                          const emails = e.target.value
                            .split(",")
                            .map((email) => email.trim());
                          field.onChange(emails);
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="cc"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Cc</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Copie (optionnel)"
                          value={field.value?.join(", ") || ""}
                          onChange={(e) => {
                            const emails = e.target.value
                              .split(",")
                              .map((email) => email.trim());
                            field.onChange(emails);
                          }}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="bcc"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Cci</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Copie cachée (optionnel)"
                          value={field.value?.join(", ") || ""}
                          onChange={(e) => {
                            const emails = e.target.value
                              .split(",")
                              .map((email) => email.trim());
                            field.onChange(emails);
                          }}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <FormField
              control={form.control}
              name="subject"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Objet</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="space-y-2">
              <Label>Message</Label>
              <Tabs defaultValue="edit">
                <TabsList>
                  <TabsTrigger value="edit">Éditer</TabsTrigger>
                  <TabsTrigger value="preview">Aperçu</TabsTrigger>
                </TabsList>
                <TabsContent value="edit">
                  <FormField
                    control={form.control}
                    name="message"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <Editor
                            value={field.value}
                            onChange={field.onChange}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </TabsContent>
                <TabsContent value="preview">
                  <div
                    className="border rounded-lg p-4 min-h-[300px]"
                    dangerouslySetInnerHTML={{
                      __html: getEmailTemplate({
                        quoteNumber: data.number,
                        message: form.watch("message"),
                      }),
                    }}
                  />
                </TabsContent>
              </Tabs>
            </div>

            {/* Pièces jointes */}
            <div className="space-y-2">
              <Label>Pièces jointes</Label>
              <div className="border rounded-lg p-4 space-y-2">
                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() =>
                      document.getElementById("file-upload")?.click()
                    }
                  >
                    <PaperclipIcon className="h-4 w-4 mr-2" />
                    Ajouter un fichier
                  </Button>
                  <input
                    id="file-upload"
                    type="file"
                    multiple
                    className="hidden"
                    onChange={handleFileAdd}
                  />
                </div>

                <div className="space-y-2">
                  {attachments.map((file, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-2 border rounded"
                    >
                      <span className="text-sm truncate">{file.name}</span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => handleFileRemove(index)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={onClose}>
                Annuler
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Envoi en cours...
                  </>
                ) : (
                  "Envoyer le devis"
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
