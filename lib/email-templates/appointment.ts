// lib/email-templates/appointment.ts
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

// Types
export interface AppointmentEmailData {
  firstName: string;
  lastName: string;
  fullname: string;
  email: string;
  date: string;
  time: string;
  brand: string;
  model: string;
  year: string;
  trim?: string;
  serviceType: string;
  description?: string;
  appointmentId?: string;
}

// Utilitaires
const formatDate = (dateStr: string): string => {
  try {
    const [day, month, year] = dateStr.split("-").map(Number);
    const date = new Date(year, month - 1, day);
    return format(date, 'EEEE d MMMM yyyy', { locale: fr });
  } catch (error) {
    console.error("Erreur de formatage de date:", error);
    return dateStr;
  }
};

// Styles globaux
const styles = {
  container: `
    font-family: 'Arial', sans-serif;
    max-width: 600px;
    margin: 0 auto;
    background: #000000;
    border-radius: 8px;
    overflow: hidden;
  `,
  header: `
    background: #000000;
    color: #ffffff;
    text-align: center;
    padding: 20px;
    border-bottom: 3px solid #e11d48;
  `,
  logo: `
    max-width: 200px;
    height: auto;
    margin-bottom: 20px;
  `,
  title: `
    color: #e11d48;
    margin: 0;
    font-size: 24px;
    font-weight: bold;
    text-transform: uppercase;
    letter-spacing: 1px;
  `,
  content: `
    background: #111111;
    color: #ffffff;
    padding: 30px;
  `,
  section: `
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 6px;
    padding: 20px;
    margin-bottom: 20px;
    position: relative;
  `,
  infoLabel: `
    color: #888888;
    font-size: 14px;
    margin-bottom: 4px;
  `,
  infoValue: `
    color: #ffffff;
    margin-bottom: 16px;
    font-size: 16px;
    background: rgba(255, 255, 255, 0.05);
    padding: 8px 12px;
    border-radius: 4px;
  `,
  button: `
    display: inline-block;
    background: #e11d48;
    color: #ffffff !important;
    padding: 12px 24px;
    border-radius: 50px;
    text-decoration: none;
    margin: 20px 0;
    font-weight: bold;
    border: 2px solid transparent;
  `,
  urgent: `
    background: rgba(225, 29, 72, 0.1);
    border: 1px solid rgba(225, 29, 72, 0.2);
    color: #e11d48;
    padding: 12px;
    border-radius: 6px;
    margin: 20px 0;
    text-align: center;
    font-weight: bold;
  `,
  contact: `
    margin-top: 30px;
    padding-top: 20px;
    border-top: 1px solid rgba(255, 255, 255, 0.1);
  `,
  footer: `
    background: #000000;
    color: #666666;
    text-align: center;
    padding: 20px;
    font-size: 12px;
    border-top: 1px solid rgba(255, 255, 255, 0.1);
  `,
  manageSection: `
    background: rgba(225, 29, 72, 0.1);
    border-radius: 8px;
    padding: 24px;
    margin: 30px 0;
    text-align: center;
    border: 1px solid rgba(225, 29, 72, 0.2);
  `
};

// Composants réutilisables
const EmailLayout = (title: string, content: string) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
</head>
<body style="${styles.container}">
  <div style="${styles.header}">
    <img src="${process.env.NEXT_PUBLIC_SITE_URL}/logo.png" 
         alt="Bouëxière Méca Perf" 
         style="${styles.logo}">
    <h1 style="${styles.title}">${title}</h1>
  </div>
  <div style="${styles.content}">
    ${content}
  </div>
  <div style="${styles.footer}">
    <p>Bouëxière Méca Perf<br>1 rue de la Mécanique<br>35340 La Bouëxière</p>
    <p>© ${new Date().getFullYear()} Bouëxière Méca Perf. Tous droits réservés.</p>
  </div>
</body>
</html>
`;

const VehicleSection = (data: AppointmentEmailData) => `
<div style="${styles.section}">
  <h2 style="color: #e11d48;">🚗 Véhicule</h2>
  <p style="${styles.infoLabel}">Marque et modèle</p>
  <p style="${styles.infoValue}">${data.brand} ${data.model} (${data.year})</p>
  ${data.trim ? `
    <p style="${styles.infoLabel}">Motorisation</p>
    <p style="${styles.infoValue}">${data.trim}</p>
  ` : ''}
</div>
`;

const DateSection = (data: AppointmentEmailData) => `
<div style="${styles.section}">
  <h2 style="color: #e11d48;">📅 Rendez-vous</h2>
  <p style="${styles.infoLabel}">Date</p>
  <p style="${styles.infoValue}">${formatDate(data.date)}</p>
  <p style="${styles.infoLabel}">Heure</p>
  <p style="${styles.infoValue}">${data.time}</p>
</div>
`;

const ContactInfo = () => `
<div style="${styles.contact}">
  <p>Pour toute question :</p>
  <p>📞 06 61 86 55 43<br>
     ✉️ contact@bouexiere-meca-perf.fr</p>
</div>
`;

// Template 1: Email initial client
export const getClientEmailTemplate = (data: AppointmentEmailData) => {
  const content = `
    <p>Bonjour ${data.firstName},</p>
    <p>Nous avons bien reçu votre demande de rendez-vous. Voici le récapitulatif :</p>
    ${DateSection(data)}
    ${VehicleSection(data)}
    <div style="${styles.section}">
      <h2 style="color: #e11d48;">🔧 Service demandé</h2>
      <p style="${styles.infoValue}">${data.serviceType}</p>
      ${data.description ? `
        <p style="${styles.infoLabel}">Description</p>
        <p style="${styles.infoValue}">${data.description}</p>
      ` : ''}
    </div>
    <p>Nous confirmerons votre rendez-vous sous 48h.</p>
    ${data.appointmentId ? `
      <div style="${styles.manageSection}">
        <p style="color: #ffffff;">🔧 Gérez votre rendez-vous en ligne</p>
        <p style="font-size: 14px; margin-bottom: 20px;">
          Vous pouvez modifier ou annuler votre rendez-vous à tout moment.
        </p>
        <a href="${process.env.NEXT_PUBLIC_SITE_URL}/rdv/${data.appointmentId}" 
           style="${styles.button}">
          Gérer mon rendez-vous →
        </a>
      </div>
    ` : ''}
    ${ContactInfo()}
  `;
  
  return EmailLayout("Confirmation de demande de rendez-vous", content);
};

// Template 2: Email notification garage
export const getGarageEmailTemplate = (data: AppointmentEmailData) => {
  const content = `
    <div style="${styles.section}">
      <h2 style="color: #e11d48;">👤 Client</h2>
      <p style="${styles.infoValue}">${data.lastName.toUpperCase()} ${data.firstName}</p>
    </div>
    ${DateSection(data)}
    ${VehicleSection(data)}
    <div style="${styles.section}">
      <h2 style="color: #e11d48;">🔧 Intervention</h2>
      <p style="${styles.infoValue}">${data.serviceType}</p>
      ${data.description ? `
        <p style="${styles.infoLabel}">Description</p>
        <p style="${styles.infoValue}">${data.description}</p>
      ` : ''}
    </div>
    <div style="${styles.urgent}">
      ⚠️ Action requise sous 48h
    </div>
    <div style="text-align: center;">
      <a href="${process.env.NEXT_PUBLIC_SITE_URL}/dashboard/appointments" 
         style="${styles.button}">
        Gérer ce rendez-vous →
      </a>
    </div>
  `;

  return EmailLayout("🔔 Nouveau Rendez-vous", content);
};

// Template 3: Email modification client
export const getModificationEmailTemplate = (data: AppointmentEmailData) => {
  const content = `
    <p>Bonjour ${data.firstName},</p>
    <p>Votre rendez-vous a été modifié avec succès. Voici les nouvelles informations :</p>
    ${DateSection(data)}
    ${VehicleSection(data)}
    <div style="${styles.section}">
      <h2 style="color: #e11d48;">🔧 Service prévu</h2>
      <p style="${styles.infoValue}">${data.serviceType}</p>
    </div>
    ${data.appointmentId ? `
      <div style="${styles.manageSection}">
        <p style="color: #ffffff;">🔧 Gérez votre rendez-vous en ligne</p>
        <p style="font-size: 14px; margin-bottom: 20px;">
          Vous pouvez toujours gérer votre rendez-vous si besoin.
        </p>
        <a href="${process.env.NEXT_PUBLIC_SITE_URL}/rdv/${data.appointmentId}" 
           style="${styles.button}">
          Gérer mon rendez-vous →
        </a>
      </div>
    ` : ''}
    ${ContactInfo()}
  `;

  return EmailLayout("🔄 Modification de rendez-vous", content);
};

// Template 4: Email annulation client
export const getCancellationEmailTemplate = (data: AppointmentEmailData) => {
  const content = `
    <p>Bonjour ${data.firstName},</p>
    <p>Nous confirmons l'annulation de votre rendez-vous initialement prévu :</p>
    ${DateSection(data)}
    ${VehicleSection(data)}
    <div style="${styles.section}">
      <h2 style="color: #e11d48;">🔧 Service annulé</h2>
      <p style="${styles.infoValue}">${data.serviceType}</p>
    </div>
    <p>Si vous souhaitez reprendre un rendez-vous ultérieurement :</p>
    <div style="text-align: center;">
      <a href="${process.env.NEXT_PUBLIC_SITE_URL}/rdv" 
         style="${styles.button}">
        Prendre un nouveau rendez-vous →
      </a>
    </div>
    ${ContactInfo()}
  `;

  return EmailLayout("❌ Annulation de rendez-vous", content);
};

// Template 5: Email notification modification garage
export const getGarageModificationEmailTemplate = (data: AppointmentEmailData) => {
  const content = `
    <div style="${styles.section}">
      <h2 style="color: #e11d48;">👤 Client</h2>
      <p style="${styles.infoValue}">${data.lastName.toUpperCase()} ${data.firstName}</p>
    </div>
    ${DateSection(data)}
    ${VehicleSection(data)}
    <div style="${styles.section}">
      <h2 style="color: #e11d48;">🔧 Intervention</h2>
      <p style="${styles.infoValue}">${data.serviceType}</p>
    </div>
    <div style="${styles.urgent}">
      ⚠️ Pensez à mettre à jour le planning !
    </div>
    <div style="text-align: center;">
      <a href="${process.env.NEXT_PUBLIC_SITE_URL}/dashboard/appointments" 
         style="${styles.button}">
        Voir dans le dashboard →
      </a>
    </div>
  `;

  return EmailLayout("🔄 Rendez-vous modifié", content);
};

// Template 6: Email notification annulation garage
export const getGarageCancellationEmailTemplate = (data: AppointmentEmailData) => {
  const content = `
    <div style="${styles.section}">
      <h2 style="color: #e11d48;">👤 Client</h2>
      <p style="${styles.infoValue}">${data.lastName.toUpperCase()} ${data.firstName}</p>
    </div>
    ${DateSection(data)}
    ${VehicleSection(data)}
    <div style="${styles.section}">
      <h2 style="color: #e11d48;">🔧 Intervention annulée</h2>
      <p style="${styles.infoValue}">${data.serviceType}</p>
    </div>
    <div style="${styles.urgent}">
      ⚠️ Ce créneau est maintenant disponible
    </div>
    <div style="text-align: center;">
      <a href="${process.env.NEXT_PUBLIC_SITE_URL}/dashboard/appointments" 
         style="${styles.button}">
        Voir dans le dashboard →
      </a>
    </div>
  `;

  return EmailLayout("❌ Rendez-vous annulé", content);
};

// Template 7: Email confirmation de rendez-vous
export const getAppointmentConfirmationTemplate = (data: AppointmentEmailData) => {
  const content = `
    <p>Bonjour ${data.firstName},</p>
    <p>Nous avons le plaisir de vous confirmer votre rendez-vous !</p>
    ${DateSection(data)}
    ${VehicleSection(data)}
    <div style="${styles.section}">
      <h2 style="color: #e11d48;">🔧 Service confirmé</h2>
      <p style="${styles.infoValue}">${data.serviceType}</p>
      ${data.description ? `
        <p style="${styles.infoLabel}">Description</p>
        <p style="${styles.infoValue}">${data.description}</p>
      ` : ''}
    </div>
    <div style="${styles.section}">
      <h2 style="color: #e11d48;">📍 Lieu d'intervention</h2>
      <p style="${styles.infoValue}">
        Bouëxière Méca Perf<br>
        1 rue de la Mécanique<br>
        35340 La Bouëxière
      </p>
    </div>
    <div style="${styles.section}">
      <h2 style="color: #e11d48;">⚠️ Informations importantes</h2>
      <p style="${styles.infoValue}">
        • Merci d'arriver 5 minutes avant l'heure du rendez-vous<br>
        • En cas de retard, veuillez nous prévenir au 06 61 86 55 43<br>
        • Pensez à apporter la carte grise du véhicule
      </p>
    </div>
    ${data.appointmentId ? `
      <div style="${styles.manageSection}">
        <p style="color: #ffffff;">🔧 Gérez votre rendez-vous</p>
        <p style="font-size: 14px; margin-bottom: 20px;">
          En cas d'empêchement, vous pouvez modifier ou annuler votre rendez-vous jusqu'à 24h avant.
        </p>
        <a href="${process.env.NEXT_PUBLIC_SITE_URL}/rdv/${data.appointmentId}" 
           style="${styles.button}">
          Gérer mon rendez-vous →
        </a>
      </div>
    ` : ''}
    ${ContactInfo()}
  `;

  return EmailLayout("✅ Rendez-vous confirmé", content);
};

// Template 8: Email rappel de rendez-vous (J-1)
export const getAppointmentReminderTemplate = (data: AppointmentEmailData) => {
  const content = `
    <p>Bonjour ${data.firstName},</p>
    <p>Nous vous rappelons votre rendez-vous de demain :</p>
    ${DateSection(data)}
    ${VehicleSection(data)}
    <div style="${styles.section}">
      <h2 style="color: #e11d48;">🔧 Intervention prévue</h2>
      <p style="${styles.infoValue}">${data.serviceType}</p>
    </div>
    <div style="${styles.section}">
      <h2 style="color: #e11d48;">📝 Rappels importants</h2>
      <p style="${styles.infoValue}">
        • Rendez-vous au 1 rue de la Mécanique, 35340 La Bouëxière<br>
        • Merci d'arriver 5 minutes avant<br>
        • Apportez la carte grise du véhicule<br>
        • En cas d'empêchement, contactez-nous rapidement
      </p>
    </div>
    ${data.appointmentId ? `
      <div style="${styles.manageSection}">
        <a href="${process.env.NEXT_PUBLIC_SITE_URL}/rdv/${data.appointmentId}" 
           style="${styles.button}">
          Voir les détails du rendez-vous →
        </a>
      </div>
    ` : ''}
    ${ContactInfo()}
  `;

  return EmailLayout("🔔 Rappel de rendez-vous pour demain", content);
};

// Template 9: Email refus de rendez-vous
export const getAppointmentRefusalTemplate = (data: AppointmentEmailData) => {
  const content = `
    <p>Bonjour ${data.firstName},</p>
    <p>Nous sommes désolés de vous informer que nous ne pourrons pas honorer votre demande de rendez-vous pour :</p>
    ${DateSection(data)}
    ${VehicleSection(data)}
    <div style="${styles.section}">
      <h2 style="color: #e11d48;">❌ Motif du refus</h2>
      <p style="${styles.infoValue}">
        Malheureusement, nous ne sommes pas disponibles sur ce créneau. 
        Nous vous invitons à sélectionner une autre date.
      </p>
    </div>
    <div style="text-align: center; margin: 30px 0;">
      <p>Vous pouvez facilement reprendre un nouveau rendez-vous :</p>
      <a href="${process.env.NEXT_PUBLIC_SITE_URL}/rdv" 
         style="${styles.button}">
        Choisir une nouvelle date →
      </a>
    </div>
    <p>Nous nous excusons pour la gêne occasionnée et espérons vous voir prochainement.</p>
    ${ContactInfo()}
  `;

  return EmailLayout("Indisponibilité pour votre demande de rendez-vous", content);
};

// Template 10: Email suivi après intervention
export const getFollowUpTemplate = (data: AppointmentEmailData) => {
  const content = `
    <p>Bonjour ${data.firstName},</p>
    <p>Suite à notre intervention sur votre véhicule :</p>
    ${VehicleSection(data)}
    <div style="${styles.section}">
      <h2 style="color: #e11d48;">🔧 Intervention réalisée</h2>
      <p style="${styles.infoValue}">${data.serviceType}</p>
      ${data.description ? `
        <p style="${styles.infoLabel}">Détails</p>
        <p style="${styles.infoValue}">${data.description}</p>
      ` : ''}
    </div>
    <div style="${styles.section}">
      <h2 style="color: #e11d48;">⭐ Votre avis compte</h2>
      <p style="${styles.infoValue}">
        Nous attachons beaucoup d'importance à la qualité de nos services.
        N'hésitez pas à nous faire part de votre retour d'expérience.
      </p>
    </div>
    <div style="text-align: center;">
      <a href="${process.env.NEXT_PUBLIC_SITE_URL}/avis" 
         style="${styles.button}">
        Laisser un avis →
      </a>
    </div>
    <div style="${styles.section}">
      <h2 style="color: #e11d48;">📅 Prochain entretien</h2>
      <p style="${styles.infoValue}">
        Pour maintenir votre véhicule en parfait état, nous vous recommandons 
        un prochain contrôle dans 6 mois ou 10 000 km.
      </p>
    </div>
    ${ContactInfo()}
  `;

  return EmailLayout("🔧 Suivi après intervention", content);
};

export {
  styles,
  EmailLayout,
  VehicleSection,
  DateSection,
  ContactInfo,
  formatDate
};