// lib/emailTemplate.ts
export const getEmailTemplate = ({
    quoteNumber,
    message,
    baseUrl = process.env.NEXT_PUBLIC_APP_URL
  }: {
    quoteNumber: string;
    message?: string;
    baseUrl?: string;
  }) => `
  <!DOCTYPE html>
  <html>
  <head>
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>
      /* Style général */
      body {
        margin: 0;
        padding: 0;
        font-family: Arial, sans-serif;
        background-color: #f9f9f9;
      }
  
      /* Container principal */
      .container {
        max-width: 600px;
        margin: 0 auto;
        background-color: white;
      }
  
      /* En-tête */
      .header {
        background-color: #000000;
        padding: 20px;
        text-align: center;
      }
  
      .header img {
        max-width: 200px;
        height: auto;
      }
  
      /* Contenu */
      .content {
        padding: 30px;
        background-color: white;
        color: #333333;
      }
  
      /* Informations de contact */
      .contact-info {
        margin-top: 40px;
        padding-top: 20px;
        border-top: 1px solid #eeeeee;
      }
  
      .company-name {
        color: #000000;
        font-weight: bold;
        margin: 0;
      }
  
      .address {
        color: #666666;
        margin: 5px 0;
      }
  
      /* Footer */
      .footer {
        background-color: #f8f8f8;
        padding: 20px;
        text-align: center;
        font-size: 12px;
        color: #666666;
      }
  
      /* Accents rouges */
      .quote-number {
        color: #FF0000;
        font-weight: bold;
      }
  
      .cta-button {
        display: inline-block;
        padding: 12px 24px;
        background-color: #FF0000;
        color: white !important;
        text-decoration: none;
        border-radius: 4px;
        margin: 20px 0;
      }
  
      /* Responsive design */
      @media only screen and (max-width: 600px) {
        .container {
          width: 100%;
        }
        
        .content {
          padding: 20px;
        }
      }
    </style>
  </head>
  <body>
    <div class="container">
      <div class="header">
        <img src="${baseUrl}/logo.png" alt="Bouexiere Meca Performance" />
      </div>
      
      <div class="content">
        <p>Bonjour,</p>
        
        ${message || `
          <p>Veuillez trouver ci-joint le devis <span class="quote-number">n°${quoteNumber}</span> correspondant à nos prestations.</p>
          <p>N'hésitez pas à nous contacter pour toute question ou précision.</p>
        `}
        
        <p>Bien cordialement,</p>
        
        <div class="contact-info">
          <p class="company-name">Bouexiere Meca Performance</p>
          <p class="address">1 rue de la Mécanique</p>
          <p class="address">35340 La Bouexière</p>
          <p class="address">Tél : 02.99.XX.XX.XX</p>
          <p class="address">Email : contact@bmp.resend.dev</p>
        </div>
      </div>
      
      <div class="footer">
        <p>TVA non applicable, art. 293 B du CGI</p>
        <p>Auto-entrepreneur - Dispensé d'immatriculation au RCS et au RM</p>
        <p style="margin-top: 10px; font-style: italic;">Ce message et les éventuels fichiers joints sont confidentiels.</p>
      </div>
    </div>
  </body>
  </html>
  `;