$(document).ready(function() {
    // Función para sanitizar el input (permitiendo solo caracteres válidos)
    function sanitizeInput(input) {
        return input.replace(/[^\w\s@.-]/gi, ''); // Permite letras, números, espacios, @, ., y -
    }

    // Validación en tiempo real para el campo de username (solo letras, números, guiones y guiones bajos)
    $('#login-username').on('input', function() {
        const value = $(this).val();
        const validValue = sanitizeInput(value); // Aplicar la sanitización en tiempo real
        $(this).val(validValue);
    });

    $('#login-form').submit(function(e) {
        e.preventDefault();

        // Sanitizar los inputs
        const username = sanitizeInput($('#login-username').val());
        const password = $('#login-password').val(); // No sanitizamos la contraseña

        // Validación simple: asegurarse de que los campos no estén vacíos
        if (!username || !password) {
            alert("Por favor, complete todos los campos.");
            return;
        }

        $.ajax({
            url: 'http://localhost:5000/api/login',
            method: 'POST',
            contentType: 'application/json',
            data: JSON.stringify({ username, password }),
            success: function(response) {
                alert(response.msg); // Mostrar el mensaje de éxito

                const { token, role } = response;
                // Guardar el token en localStorage
                localStorage.setItem('token', token);

                // Redirigir según el rol
                if (role === 'admin' || role === 'superadmin') {
                    window.location.href = 'dashboard.html'; // Redirigir al dashboard
                } else {
                    window.location.href = 'index.html'; // Redirigir a página de inicio para usuarios comunes
                }
            },
            error: function(xhr) {
                alert(xhr.responseJSON.msg); // Mostrar el mensaje de error
            }
        });
    });
});
