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

  // Crear imagen del sticker completo
  static async createStickerImage(stickerData: StickerData): Promise<Buffer> {
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

      // Crear texto SVG para el sticker
      const stickerSVG = `
        <svg width="400" height="300" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <style>
              .title { font-family: Arial, sans-serif; font-size: 18px; font-weight: bold; fill: #333; }
              .label { font-family: Arial, sans-serif; font-size: 12px; font-weight: bold; fill: #666; }
              .value { font-family: Arial, sans-serif; font-size: 12px; fill: #333; }
              .small { font-family: Arial, sans-serif; font-size: 10px; fill: #666; }
            </style>
          </defs>
          
          <!-- Background -->
          <rect width="400" height="300" fill="#f8f9fa" stroke="#e9ecef" stroke-width="2" rx="10"/>
          
          <!-- Header -->
          <rect width="400" height="40" fill="#007bff" rx="10" ry="0"/>
          <text x="200" y="25" text-anchor="middle" class="title" fill="white">PASE DE VISITANTE</text>
          
          <!-- Visitor Info -->
          <text x="20" y="70" class="label">VISITANTE:</text>
          <text x="20" y="85" class="value">${stickerData.visitorName}</text>
          
          ${stickerData.company ? `
          <text x="20" y="105" class="label">EMPRESA:</text>
          <text x="20" y="120" class="value">${stickerData.company}</text>
          ` : ''}
          
          <!-- Visit Info -->
          <text x="20" y="${stickerData.company ? 140 : 120}" class="label">ANFITRIÓN:</text>
          <text x="20" y="${stickerData.company ? 155 : 135}" class="value">${stickerData.hostName}</text>
          
          <text x="20" y="${stickerData.company ? 175 : 155}" class="label">DEPARTAMENTO:</text>
          <text x="20" y="${stickerData.company ? 190 : 170}" class="value">${stickerData.department}</text>
          
          <!-- Date and Time -->
          <text x="20" y="${stickerData.company ? 210 : 190}" class="label">FECHA:</text>
          <text x="20" y="${stickerData.company ? 225 : 205}" class="value">${dateStr}</text>
          
          <text x="20" y="${stickerData.company ? 245 : 225}" class="label">HORA INGRESO:</text>
          <text x="20" y="${stickerData.company ? 260 : 240}" class="value">${timeStr}</text>
          
          <!-- Access Areas -->
          <text x="20" y="280" class="small">Áreas autorizadas: ${stickerData.accessAreas.join(', ')}</text>
          
          <!-- Visit ID -->
          <text x="380" y="295" text-anchor="end" class="small">ID: ${stickerData.visitId}</text>
        </svg>
      `;

      // Convertir SVG a buffer de imagen
      const svgBuffer = Buffer.from(stickerSVG);
      const baseImage = await sharp(svgBuffer).png().toBuffer();

      // Redimensionar QR code y combinarlo con el sticker
      const resizedQR = await sharp(qrCode)
        .resize(80, 80)
        .png()
        .toBuffer();

      // Componer imagen final
      const finalSticker = await sharp(baseImage)
        .composite([
          {
            input: resizedQR,
            top: 60,
            left: 300,
            blend: 'over'
          }
        ])
        .png()
        .toBuffer();

      return finalSticker;

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
        width: 400,
        height: 300,
        format: 'png',
        dpi: 300
      }
    };
  }
}