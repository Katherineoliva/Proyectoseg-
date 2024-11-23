$(document).ready(function() {
    // Función para sanitizar entradas permitiendo solo caracteres válidos
    function sanitizeInput(input) {
        return input.replace(/[^\w\s@.-]/gi, ''); // Permite letras, números, espacios, @, ., y -
    }

    // Validación en tiempo real para el campo de username (solo letras, números, guiones y guiones bajos)
    $('#reg-username').on('input', function() {
        const value = $(this).val();
        const validValue = sanitizeInput(value); // Aplicar la sanitización en tiempo real
        $(this).val(validValue);
    });

    $('#register-form').submit(function(e) {
        e.preventDefault();

        // Obtener y sanitizar valores de los campos
        const username = sanitizeInput($('#reg-username').val());
        const password = $('#reg-password').val(); // No sanitizamos la contraseña
        const role = $('#reg-role').val(); // Obtener el rol seleccionado

        // Validación simple: asegurarse de que los campos no estén vacíos
        if (!username || !password || !role) {
            alert("Por favor, complete todos los campos.");
            return;
        }

        $.ajax({
            url: 'http://localhost:5000/api/register',
            method: 'POST',
            contentType: 'application/json',
            data: JSON.stringify({ username, password, role }),
            success: function(response) {
                alert(response.msg); // Mostrar el mensaje de éxito
                if (response.msg === 'Usuario registrado exitosamente') {
                    window.location.href = 'index.html'; // Redirigir al login después de registrar
                }
            },
            error: function(xhr) {
                alert(xhr.responseJSON.msg); // Mostrar el mensaje de error
            }
        });
    });
});
