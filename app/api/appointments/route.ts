// app/api/appointments/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { AppointmentStatus } from '@prisma/client';
import { randomBytes } from 'crypto';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { sendEmail } from '@/lib/email';
import { getClientEmailTemplate, getGarageEmailTemplate } from '@/lib/email-templates/appointment';

interface AppointmentRequest {
  fullName: string;
  email: string;
  phone: string;
  address: string;
  brand: string;
  model: string;
  year: string;
  trim?: string;
  serviceType: 'diagnostic' | 'mecanique' | 'pieces-premium' | 'reprog';
  description?: string;
  date: string;
  time: string;
}

export async function POST(request: Request) {
  try {
    const data: AppointmentRequest = await request.json();

    // Validation des champs requis
    const requiredFields = ['fullName', 'email', 'phone', 'address', 'brand', 'model', 'year', 'date', 'time', 'serviceType'];
    const missingFields = requiredFields.filter(field => !data[field as keyof AppointmentRequest]);

    if (missingFields.length > 0) {
      return NextResponse.json({
        error: `Les champs suivants sont requis : ${missingFields.join(', ')}`
      }, { status: 400 });
    }

    // Validation du format de l'email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(data.email)) {
      return NextResponse.json({
        error: 'Format d\'email invalide'
      }, { status: 400 });
    }

    // Validation du format du téléphone
    const phoneRegex = /^(?:(?:\+|00)33|0)\s*[1-9](?:[\s.-]*\d{2}){4}$/;
    if (!phoneRegex.test(data.phone.replace(/\s/g, ''))) {
      return NextResponse.json({
        error: 'Format de numéro de téléphone invalide'
      }, { status: 400 });
    }

    // Extraction du prénom et du nom
    const [firstName, ...lastNameParts] = data.fullName.trim().split(' ');
    const lastName = lastNameParts.join(' ');

    if (!firstName || !lastName) {
      return NextResponse.json({
        error: 'Le nom complet doit contenir un prénom et un nom'
      }, { status: 400 });
    }

    // Création ou mise à jour du client
    const client = await prisma.client.upsert({
      where: { email: data.email },
      update: {
        firstName,
        lastName,
        phone: data.phone,
        address: data.address
      },
      create: {
        type: 'individual',
        firstName,
        lastName,
        email: data.email,
        phone: data.phone,
        address: data.address
      }
    });

    // Formatage de la date et vérification
    const [day, month, year] = data.date.split('-').map(Number);
    const requestedDate = new Date(`${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}T${data.time}`);

    if (isNaN(requestedDate.getTime())) {
      return NextResponse.json({
        error: 'Format de date invalide'
      }, { status: 400 });
    }

    // Vérification que la date n'est pas dans le passé
    if (requestedDate < new Date()) {
      return NextResponse.json({
        error: 'La date de rendez-vous ne peut pas être dans le passé'
      }, { status: 400 });
    }

    // Génération du token unique
    const token = randomBytes(32).toString('hex');

    // Création du rendez-vous
    const appointment = await prisma.appointment.create({
      data: {
        clientId: client.id,
        service: data.serviceType,
        vehicle: {
          brand: data.brand,
          model: data.model,
          year: parseInt(data.year),
          trim: data.trim
        },
        description: data.description,
        requestedDate,
        status: AppointmentStatus.PENDING,
        token
      }
    });

    // Préparation des données pour les emails
    const emailData = {
      firstName,
      lastName,
      fullname: data.fullName,
      email: data.email,
      date: format(requestedDate, 'dd-MM-yyyy'),
      time: data.time,
      brand: data.brand,
      model: data.model,
      year: data.year,
      trim: data.trim,
      serviceType: data.serviceType,
      description: data.description,
      appointmentId: appointment.id
    };

    // Envoi des emails
    try {
      await Promise.all([
        sendEmail({
          to: data.email,
          subject: 'Confirmation de votre demande de rendez-vous',
          html: getClientEmailTemplate(emailData)
        }),
        sendEmail({
          to: process.env.GARAGE_EMAIL || 'contact@bouexiere-meca-perf.fr',
          subject: 'Nouvelle demande de rendez-vous',
          html: getGarageEmailTemplate(emailData)
        })
      ]);
    } catch (emailError) {
      console.error('Erreur lors de l\'envoi des emails:', emailError);
      // On continue malgré l'erreur d'email, mais on la log
    }

    return NextResponse.json({
      success: true,
      message: 'Rendez-vous créé avec succès',
      data: {
        appointmentId: appointment.id,
        token
      }
    }, { status: 201 });

  } catch (error) {
    console.error('Erreur lors de la création du rendez-vous:', error);
    return NextResponse.json({
      error: 'Une erreur est survenue lors de la création du rendez-vous'
    }, { status: 500 });
  }
}