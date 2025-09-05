import QRCode from 'qrcode';
import sharp from 'sharp';
import { Visit } from '../types';

export interface StickerData {
  visitId: string;
  visitorName: string;
  company?: string;
  hostName: string;
  department: string;
  checkInTime: Date;
  accessAreas: string[];
  qrCodeData: string;
  visitorPhotoPath?: string;
}

export class StickerService {
  // Generar código QR para el sticker
  static async generateQRCode(data: string): Promise<Buffer> {
    try {
      const qrBuffer = await QRCode.toBuffer(data, {
        type: 'png',
        width: 200,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        }
      });
      return qrBuffer;
    } catch (error) {
      console.error('Error generating QR code:', error);
      throw new Error('Failed to generate QR code');
    }
  }

  // Crear imagen del sticker completo (formato vertical tipo badge)
  static async createStickerImage(stickerData: StickerData, visitorPhotoBuffer?: Buffer): Promise<Buffer> {
    try {
      // Generar QR code
      const qrCode = await this.generateQRCode(stickerData.qrCodeData);
      
      // Formatear fecha y hora
      const checkInDate = new Date(stickerData.checkInTime);
      const dateStr = checkInDate.toLocaleDateString('es-ES');
      const timeStr = checkInDate.toLocaleTimeString('es-ES', {
        hour: '2-digit',
        minute: '2-digit'
      });

      // Crear el SVG del sticker vertical tipo badge profesional
      const stickerSVG = `
        <svg width="320" height="480" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <style>
              .title { font-family: Arial, sans-serif; font-size: 14px; font-weight: bold; fill: white; text-anchor: middle; }
              .name { font-family: Arial, sans-serif; font-size: 16px; font-weight: bold; fill: #2c3e50; text-anchor: middle; }
              .company { font-family: Arial, sans-serif; font-size: 12px; fill: #34495e; text-anchor: middle; }
              .label { font-family: Arial, sans-serif; font-size: 10px; font-weight: bold; fill: #7f8c8d; }
              .value { font-family: Arial, sans-serif; font-size: 11px; fill: #2c3e50; }
              .areas { font-family: Arial, sans-serif; font-size: 9px; fill: #7f8c8d; text-anchor: middle; }
              .id { font-family: Arial, sans-serif; font-size: 8px; fill: #95a5a6; text-anchor: middle; }
            </style>
          </defs>
          
          <!-- Background principal -->
          <rect width="320" height="480" fill="white" stroke="#bdc3c7" stroke-width="1" rx="15"/>
          
          <!-- Header azul -->
          <rect width="320" height="50" fill="#3498db" rx="15" ry="15"/>
          <rect width="320" height="35" fill="#3498db"/>
          <text x="160" y="32" class="title">VISITOR PASS</text>
          
          <!-- Espacio para foto circular (placeholder) -->
          <circle cx="160" cy="120" r="45" fill="#ecf0f1" stroke="#bdc3c7" stroke-width="2"/>
          <text x="160" y="125" text-anchor="middle" font-family="Arial" font-size="12" fill="#95a5a6">FOTO</text>
          
          <!-- Nombre del visitante -->
          <text x="160" y="195" class="name">${stickerData.visitorName}</text>
          
          <!-- Empresa (si existe) -->
          ${stickerData.company ? `
          <text x="160" y="215" class="company">${stickerData.company}</text>
          ` : ''}
          
          <!-- Información de la visita -->
          <g transform="translate(30, ${stickerData.company ? 240 : 225})">
            <text x="0" y="0" class="label">ANFITRIÓN:</text>
            <text x="0" y="15" class="value">${stickerData.hostName}</text>
            
            <text x="0" y="35" class="label">DEPARTAMENTO:</text>
            <text x="0" y="50" class="value">${stickerData.department}</text>
            
            <text x="0" y="70" class="label">FECHA DE INGRESO:</text>
            <text x="0" y="85" class="value">${dateStr} - ${timeStr}</text>
          </g>
          
          <!-- Áreas de acceso -->
          <text x="160" y="${stickerData.company ? 365 : 350}" class="areas">Áreas autorizadas:</text>
          <text x="160" y="${stickerData.company ? 380 : 365}" class="areas">${stickerData.accessAreas.join(', ')}</text>
          
          <!-- Footer con ID -->
          <rect x="0" y="450" width="320" height="30" fill="#34495e" rx="0" ry="15"/>
          <rect x="0" y="450" width="320" height="15" fill="#34495e"/>
          <text x="160" y="468" class="id" fill="white">ID: ${stickerData.visitId.substring(0, 8)}...</text>
        </svg>
      `;

      // Convertir SVG a buffer de imagen
      const svgBuffer = Buffer.from(stickerSVG);
      let baseImage = await sharp(svgBuffer).png().toBuffer();

      // Lista de composiciones para aplicar
      const compositions: any[] = [];

      // Agregar foto del visitante si está disponible
      if (visitorPhotoBuffer) {
        try {
          const circularPhoto = await sharp(visitorPhotoBuffer)
            .resize(90, 90)
            .composite([{
              input: Buffer.from(`
                <svg width="90" height="90">
                  <defs>
                    <mask id="circle">
                      <circle cx="45" cy="45" r="43" fill="white"/>
                    </mask>
                  </defs>
                  <rect width="90" height="90" fill="black" mask="url(#circle)"/>
                </svg>
              `),
              blend: 'dest-in'
            }])
            .png()
            .toBuffer();

          compositions.push({
            input: circularPhoto,
            top: 75,
            left: 115,
            blend: 'over'
          });
        } catch (photoError) {
          console.warn('Could not process visitor photo:', photoError);
        }
      }

      // Agregar QR code redimensionado
      const resizedQR = await sharp(qrCode)
        .resize(60, 60)
        .png()
        .toBuffer();

      compositions.push({
        input: resizedQR,
        top: stickerData.company ? 395 : 380,
        left: 130,
        blend: 'over'
      });

      // Componer imagen final si hay elementos que agregar
      if (compositions.length > 0) {
        baseImage = await sharp(baseImage)
          .composite(compositions)
          .png()
          .toBuffer();
      }

      return baseImage;

    } catch (error) {
      console.error('Error creating sticker image:', error);
      throw new Error('Failed to create sticker image');
    }
  }

  // Preparar datos del sticker desde información de visita
  static prepareStickerData(visitData: any): StickerData {
    return {
      visitId: visitData.id,
      visitorName: `${visitData.visitorFirstName} ${visitData.visitorLastName}`,
      company: visitData.visitorCompany,
      hostName: visitData.hostName,
      department: visitData.department,
      checkInTime: visitData.checkInTime,
      accessAreas: visitData.accessAreas || [],
      visitorPhotoPath: visitData.visitorPhotoPath,
      qrCodeData: JSON.stringify({
        visitId: visitData.id,
        type: 'visit_access',
        timestamp: new Date().toISOString()
      })
    };
  }

  // Generar datos para impresión (sin crear imagen física)
  static generatePrintData(stickerData: StickerData) {
    return {
      type: 'visitor_sticker',
      data: {
        visitId: stickerData.visitId,
        visitorName: stickerData.visitorName,
        company: stickerData.company,
        hostName: stickerData.hostName,
        department: stickerData.department,
        checkInTime: stickerData.checkInTime,
        accessAreas: stickerData.accessAreas,
        qrCode: stickerData.qrCodeData,
        printTime: new Date().toISOString()
      },
      layout: {
        width: 320,
        height: 480,
        format: 'png',
        dpi: 300
      }
    };
  }
}