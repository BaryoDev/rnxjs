/**
 * Spanish translations for rnxJS
 */
export default {
    common: {
        buttons: {
            save: 'Guardar',
            cancel: 'Cancelar',
            delete: 'Eliminar',
            confirm: 'Confirmar',
            edit: 'Editar',
            add: 'Agregar',
            remove: 'Quitar',
            close: 'Cerrar',
            back: 'Atrás',
            next: 'Siguiente',
            previous: 'Anterior',
            submit: 'Enviar',
            reset: 'Restablecer'
        },
        validation: {
            required: 'Este campo es obligatorio',
            email: 'Por favor ingrese un correo electrónico válido',
            minLength: 'Debe tener al menos {min} caracteres',
            maxLength: 'No debe tener más de {max} caracteres',
            min: 'Debe ser al menos {min}',
            max: 'No debe ser más de {max}',
            pattern: 'Formato inválido',
            url: 'Por favor ingrese una URL válida',
            number: 'Debe ser un número',
            integer: 'Debe ser un número entero'
        },
        messages: {
            loading: 'Cargando...',
            success: '¡Éxito!',
            error: 'Ocurrió un error',
            noData: 'No hay datos disponibles',
            confirmDelete: '¿Está seguro que desea eliminar esto?',
            unsavedChanges: 'Tiene cambios sin guardar. ¿Desea continuar?'
        }
    },
    items: {
        count: {
            zero: 'Sin elementos',
            one: '{count} elemento',
            other: '{count} elementos'
        }
    },
    users: {
        count: {
            zero: 'Sin usuarios',
            one: '{count} usuario',
            other: '{count} usuarios'
        }
    },
    pages: {
        home: {
            title: 'Inicio',
            welcome: '¡Bienvenido, {name}!'
        },
        about: {
            title: 'Acerca de',
            description: 'Acerca de esta aplicación'
        },
        contact: {
            title: 'Contacto',
            description: 'Póngase en contacto con nosotros'
        }
    },
    order: {
        total: 'Total: {amount}',
        subtotal: 'Subtotal: {amount}',
        tax: 'Impuesto: {amount}',
        shipping: 'Envío: {amount}'
    },
    dates: {
        today: 'Hoy',
        yesterday: 'Ayer',
        tomorrow: 'Mañana',
        lastWeek: 'La semana pasada',
        nextWeek: 'La próxima semana',
        created: 'Creado el {date}',
        updated: 'Actualizado el {date}'
    }
};
