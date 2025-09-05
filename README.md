# Sistema de Control de Visitas

Un sistema completo de control de visitas con frontend web, backend API y aplicación móvil para gestión de accesos.

## Arquitectura del Sistema

- **Backend**: Node.js + TypeScript + PostgreSQL
- **Frontend**: React + TypeScript
- **Mobile**: React Native (Expo) + TypeScript
- **Base de Datos**: PostgreSQL

## Estructura del Proyecto

```
visit-control-system/
├── backend/          # API REST con Node.js + TypeScript
├── frontend/         # Aplicación web React + TypeScript
├── mobile/          # Aplicación móvil React Native + TypeScript
└── shared/          # Tipos y utilidades compartidas
```

## Configuración de la Base de Datos

### Credenciales
```
DB_HOST=XXX.XXX.XXX.XXX
DB_PORT=5432
DB_NAME=visitcontrol_db
DB_USER=**************
DB_PASSWORD=**********
```

## Funcionalidades

### Frontend Web (Registro de Visitas)
- Captura de foto del visitante
- Escaneo y captura de foto del ID
- Lectura automática de información del ID
- Registro de datos del visitante
- Selección de persona a visitar
- Selección de departamentos/áreas de acceso
- Generación e impresión de stickers

### Aplicación Móvil (Control de Accesos)
- Verificación de acceso por departamento
- Visualización de información del visitante
- Tiempo transcurrido de visita
- Registro de intentos de acceso
- Estado de visita (activa/completada)

### Backend API
- Gestión de visitantes
- Gestión de visitas
- Control de accesos
- Almacenamiento de fotos
- Generación de reportes
- Logs de acceso

## Instalación y Configuración

### Backend
```bash
cd backend
npm install
npm run dev
```

### Frontend
```bash
cd frontend
npm install
npm start
```

### Mobile
```bash
cd mobile
npm install
npm run web    # Para ejecutar en navegador
npm run ios    # Para ejecutar en iOS
npm run android # Para ejecutar en Android
```

## Variables de Entorno

### Backend (.env)
```
DB_HOST=XXX.XXX.XXX.XXX
DB_PORT=5432
DB_NAME=visitcontrol_db
DB_USER=**********
DB_PASSWORD=**********
PORT=3001
NODE_ENV=development
JWT_SECRET=your-super-secret-jwt-key
UPLOAD_PATH=./uploads
MAX_FILE_SIZE=10485760
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:19006
```

### Frontend (.env)
```
REACT_APP_API_URL=http://localhost:3001/api
```

## API Endpoints

### Visitantes
- `POST /api/visitors/register` - Registrar nueva visita
- `GET /api/visitors/:id` - Obtener visitante por ID
- `GET /api/visitors/id-number/:idNumber` - Obtener visitante por número de ID
- `GET /api/visitors` - Listar todos los visitantes
- `PUT /api/visitors/:id` - Actualizar visitante
- `GET /api/visitors/:id/photo/:type` - Obtener foto del visitante

### Visitas
- `GET /api/visits/:id` - Obtener visita por ID
- `GET /api/visits` - Listar todas las visitas
- `PUT /api/visits/:id/checkout` - Hacer checkout de visita
- `POST /api/visits/:visitId/check-access` - Verificar acceso
- `GET /api/visits/:visitId/access-logs` - Obtener logs de acceso
- `POST /api/visits/:id/print-sticker` - Generar datos para sticker

### Departamentos
- `GET /api/departments` - Listar departamentos

## Flujo de Trabajo

1. **Llegada del Visitante**: 
   - Se toma foto del visitante
   - Se escanea y fotografía el ID
   - Se registran datos básicos
   - Se selecciona persona a visitar y departamentos

2. **Generación de Sticker**:
   - Se imprime sticker con código QR
   - Se otorgan permisos de acceso

3. **Control de Acceso Móvil**:
   - Personal de seguridad escanea código o busca visita
   - Se verifica acceso al departamento solicitado
   - Se registra intento de acceso

4. **Checkout**:
   - Se marca visita como completada
   - Se registra hora de salida

## Base de Datos

### Tablas Principales
- `visitors`: Información de visitantes
- `visits`: Registro de visitas
- `departments`: Departamentos y áreas
- `access_logs`: Logs de intentos de acceso

## Tecnologías Utilizadas

- **Backend**: Express.js, TypeScript, PostgreSQL, Multer, Sharp
- **Frontend**: React, TypeScript, Material-UI
- **Mobile**: React Native, Expo, TypeScript
- **Base de Datos**: PostgreSQL
- **Autenticación**: JWT
- **Manejo de Imágenes**: Sharp, Multer
- **OCR**: Integración preparada para servicios OCR

## Desarrollo y Contribución

El sistema está diseñado para ser escalable y mantenible. Cada componente (backend, frontend, mobile) puede desarrollarse independientemente.

## Seguridad

- Autenticación JWT
- Validación de archivos subidos
- Sanitización de datos de entrada
- CORS configurado
- Conexión SSL a base de datos

## Soporte

Para soporte técnico o preguntas sobre el sistema, consultar la documentación de cada módulo en sus respectivos directorios.