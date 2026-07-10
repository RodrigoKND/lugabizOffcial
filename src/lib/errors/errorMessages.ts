import type { AppError } from './errorTypes';

export const ERROR_MESSAGES = {
  AUTH: {
    REQUIRED: 'Este campo es requerido',
    INVALID_EMAIL: 'Correo electrónico inválido',
    WEAK_PASSWORD: 'La contraseña debe tener al menos 6 caracteres',
    PASSWORDS_DONT_MATCH: 'Las contraseñas no coinciden',
    LOGIN_FAILED: 'Credenciales incorrectas',
    REGISTER_FAILED: 'Error al crear la cuenta',
    SESSION_EXPIRED: 'Sesión expirada, inicia sesión nuevamente',
  },
  PLACE: {
    NAME_REQUIRED: 'El nombre del lugar es requerido',
    ADDRESS_REQUIRED: 'La dirección es requerida',
    CATEGORY_REQUIRED: 'Selecciona una categoría',
    IMAGE_TOO_LARGE: 'La imagen excede el tamaño máximo permitido',
    CREATE_FAILED: 'Error al crear el lugar',
    UPDATE_FAILED: 'Error al actualizar el lugar',
    DELETE_FAILED: 'Error al eliminar el lugar',
    NOT_FOUND: 'Lugar no encontrado',
  },
  EVENT: {
    NAME_REQUIRED: 'El nombre del evento es requerido',
    DATE_REQUIRED: 'La fecha del evento es requerida',
    CREATE_FAILED: 'Error al crear el evento',
    UPDATE_FAILED: 'Error al actualizar el evento',
    DELETE_FAILED: 'Error al eliminar el evento',
    NOT_FOUND: 'Evento no encontrado',
    FULL_CAPACITY: 'El evento ha alcanzado su capacidad máxima',
  },
  REVIEW: {
    SUBMIT_FAILED: 'Error al enviar la reseña',
    DELETE_FAILED: 'Error al eliminar la reseña',
  },
  NETWORK: {
    OFFLINE: 'Sin conexión a internet',
    TIMEOUT: 'La solicitud tardó demasiado',
    SERVER_ERROR: 'Error del servidor, inténtalo más tarde',
  },
  GENERAL: {
    UNKNOWN: 'Ha ocurrido un error inesperado',
    PERMISSION_DENIED: 'No tienes permiso para realizar esta acción',
    NOT_FOUND: 'Recurso no encontrado',
    VALIDATION_ERROR: 'Por favor corrige los errores en el formulario',
  },
} as const;

export function createError(
  code: string,
  message: string,
  severity: AppError['severity'] = 'error',
  field?: string,
): AppError {
  return { code, message, severity, field };
}

export function createValidationError(code: string, message: string, field: string): AppError {
  return createError(code, message, 'warning', field);
}
