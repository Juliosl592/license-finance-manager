import sgMail from '@sendgrid/mail';

// Inicializar SendGrid con la API key
if (!process.env.SENDGRID_API_KEY) {
  console.warn('SENDGRID_API_KEY no está configurada. Los correos no se enviarán.');
} else {
  try {
    sgMail.setApiKey(process.env.SENDGRID_API_KEY);
    console.log('SendGrid API key configurada correctamente');
  } catch (error) {
    console.error('Error al configurar SendGrid API key:', error);
  }
}

// Email de origen para enviar correos (debe ser verificado en SendGrid)
const FROM_EMAIL = 'notificaciones@sistema-cotizacion.com'; // Cambiar por un email verificado en SendGrid

export interface EmailOptions {
  to: string;
  subject: string;
  text?: string;
  html: string;
}

/**
 * Envía un correo electrónico usando SendGrid
 */
export async function sendEmail(options: EmailOptions): Promise<boolean> {
  if (!process.env.SENDGRID_API_KEY) {
    console.warn('No se envió el correo porque SENDGRID_API_KEY no está configurada');
    return false;
  }

  try {
    const msg = {
      to: options.to,
      from: FROM_EMAIL,
      subject: options.subject,
      text: options.text || '',
      html: options.html,
    };

    await sgMail.send(msg);
    console.log(`Correo enviado a: ${options.to}`);
    return true;
  } catch (error) {
    console.error('Error al enviar correo:', error);
    return false;
  }
}

/**
 * Envía un correo de bienvenida a un nuevo usuario
 */
export function sendWelcomeEmail(name: string, email: string): Promise<boolean> {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 5px;">
      <div style="text-align: center; padding-bottom: 20px; border-bottom: 2px solid #2563eb;">
        <h1 style="color: #2563eb; margin-bottom: 5px;">¡Bienvenido a Sistema de Cotización!</h1>
      </div>
      
      <div style="padding: 20px 0;">
        <p>Hola ${name},</p>
        <p>Gracias por registrarte en nuestro Sistema de Cotización. Tu cuenta ha sido creada exitosamente y ya puedes comenzar a utilizar todas nuestras funcionalidades.</p>
        <p>Con nuestra plataforma podrás:</p>
        <ul>
          <li>Calcular precios para licencias de software</li>
          <li>Explorar opciones de financiamiento</li>
          <li>Gestionar bolsas de horas de servicio</li>
          <li>Exportar cotizaciones en formato PDF</li>
        </ul>
        <p>Si tienes alguna pregunta o necesitas ayuda, no dudes en contactarnos.</p>
      </div>
      
      <div style="padding-top: 20px; border-top: 1px solid #eee; text-align: center; font-size: 12px; color: #666;">
        <p>Este es un correo automático, por favor no responder a esta dirección.</p>
      </div>
    </div>
  `;

  return sendEmail({
    to: email,
    subject: 'Bienvenido al Sistema de Cotización',
    html,
  });
}

/**
 * Envía una notificación cuando se crea una nueva cotización
 */
export function sendNewQuoteNotification(
  name: string, 
  email: string, 
  quoteRef: string, 
  total: number
): Promise<boolean> {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 5px;">
      <div style="text-align: center; padding-bottom: 20px; border-bottom: 2px solid #2563eb;">
        <h1 style="color: #2563eb; margin-bottom: 5px;">Nueva Cotización Generada</h1>
      </div>
      
      <div style="padding: 20px 0;">
        <p>Hola ${name},</p>
        <p>Has generado exitosamente una nueva cotización en nuestro sistema.</p>
        <div style="background-color: #f8fafc; padding: 15px; border-radius: 5px; margin: 15px 0;">
          <p><strong>Referencia:</strong> ${quoteRef}</p>
          <p><strong>Monto Total:</strong> $${total.toLocaleString('es-CO', { minimumFractionDigits: 2 })}</p>
          <p><strong>Fecha:</strong> ${new Date().toLocaleDateString()}</p>
        </div>
        <p>Puedes acceder a tu cotización desde tu cuenta en cualquier momento.</p>
      </div>
      
      <div style="padding-top: 20px; border-top: 1px solid #eee; text-align: center; font-size: 12px; color: #666;">
        <p>Este es un correo automático, por favor no responder a esta dirección.</p>
      </div>
    </div>
  `;

  return sendEmail({
    to: email,
    subject: `Cotización ${quoteRef} generada exitosamente`,
    html,
  });
}

/**
 * Envía una notificación al administrador cuando hay un nuevo usuario
 */
export function sendNewUserAdminNotification(
  adminEmail: string,
  userName: string,
  userEmail: string,
  company: string
): Promise<boolean> {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 5px;">
      <div style="text-align: center; padding-bottom: 20px; border-bottom: 2px solid #2563eb;">
        <h1 style="color: #2563eb; margin-bottom: 5px;">Nuevo Usuario Registrado</h1>
      </div>
      
      <div style="padding: 20px 0;">
        <p>Se ha registrado un nuevo usuario en el sistema:</p>
        <div style="background-color: #f8fafc; padding: 15px; border-radius: 5px; margin: 15px 0;">
          <p><strong>Nombre:</strong> ${userName}</p>
          <p><strong>Email:</strong> ${userEmail}</p>
          <p><strong>Empresa:</strong> ${company}</p>
          <p><strong>Fecha:</strong> ${new Date().toLocaleDateString()}</p>
        </div>
      </div>
      
      <div style="padding-top: 20px; border-top: 1px solid #eee; text-align: center; font-size: 12px; color: #666;">
        <p>Este es un correo automático, por favor no responder a esta dirección.</p>
      </div>
    </div>
  `;

  return sendEmail({
    to: adminEmail,
    subject: 'Nuevo usuario registrado en el sistema',
    html,
  });
}