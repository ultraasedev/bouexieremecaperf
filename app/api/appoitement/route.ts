// app/api/appointments/route.ts
import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';
import twilio from 'twilio';

// Types pour les données du rendez-vous
interface AppointmentData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  brand: string;
  model: string;
  year: string;
  trim: string;
  serviceType: string;
  description: string;
  date: string;
  time: string;
}

// Configuration du transporteur email
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT),
  secure: true,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

// Configuration Twilio
const twilioClient = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

export async function POST(request: Request) {
  try {
    const data: AppointmentData = await request.json();

    // 1. Envoyer l'email au garage
    await transporter.sendMail({
      from: process.env.SMTP_USER,
      to: 'contact@bouexiere-meca-perf.fr',
      subject: 'Nouvelle demande de rendez-vous',
      html: `
        <h2>Nouvelle demande de rendez-vous</h2>
        <h3>Informations client :</h3>
        <p>Nom : ${data.lastName}</p>
        <p>Prénom : ${data.firstName}</p>
        <p>Email : ${data.email}</p>
        <p>Téléphone : ${data.phone}</p>
        
        <h3>Véhicule :</h3>
        <p>Marque : ${data.brand}</p>
        <p>Modèle : ${data.model}</p>
        <p>Année : ${data.year}</p>
        <p>Motorisation : ${data.trim}</p>
        
        <h3>Service demandé :</h3>
        <p>Type : ${data.serviceType}</p>
        <p>Description : ${data.description}</p>
        
        <h3>Date et heure souhaitées :</h3>
        <p>Date : ${new Date(data.date).toLocaleDateString('fr-FR')}</p>
        <p>Heure : ${data.time}</p>
      `,
    });

    // 2. Envoyer un SMS au garage
    await twilioClient.messages.create({
      body: `Nouvelle demande RDV : ${data.firstName} ${data.lastName} - ${new Date(data.date).toLocaleDateString('fr-FR')} à ${data.time}`,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: process.env.GARAGE_PHONE_NUMBER as string,
    });

    // 3. Envoyer un email de confirmation au client
    await transporter.sendMail({
      from: process.env.SMTP_USER,
      to: data.email,
      subject: 'Confirmation de votre demande de rendez-vous',
      html: `
        <h2>Nous avons bien reçu votre demande de rendez-vous</h2>
        
        <p>Bonjour ${data.firstName},</p>
        
        <p>Nous avons bien reçu votre demande de rendez-vous pour le ${new Date(data.date).toLocaleDateString('fr-FR')} à ${data.time}.</p>
        
        <h3>Récapitulatif :</h3>
        <p><strong>Véhicule :</strong> ${data.brand} ${data.model} (${data.year})</p>
        <p><strong>Service :</strong> ${data.serviceType}</p>
        
        <p>Nous vous confirmerons ce rendez-vous sous 48h après étude de votre demande.</p>
        
        <p>En cas d'urgence, vous pouvez nous contacter au 06 61 86 55 43.</p>
        
        <p>À bientôt,</p>
        <p>L'équipe Bouëxière Méca Perf</p>
      `,
    });

    return NextResponse.json(
      { message: 'Rendez-vous enregistré avec succès' },
      { status: 201 }
    );
  } catch (error) {
    console.error('Erreur lors de l\'enregistrement du rendez-vous:', error);
    return NextResponse.json(
      { error: 'Erreur lors de l\'enregistrement du rendez-vous' },
      { status: 500 }
    );
  }
}
