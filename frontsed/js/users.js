$(document).ready(function() {
    const token = localStorage.getItem('token');
    if (!token) {
        window.location.href = 'index.html'; // Redirigir al login si no hay token
        return;
    }

    // Verificar el rol del usuario

    // Cargar usuarios
    function loadUsers() {
        $.ajax({
            url: 'http://localhost:5000/api/users',
            method: 'GET',
            headers: { 'Authorization': `Bearer ${token}` },
            success: function(response) {
                const userList = $('#user-list');
                userList.empty(); // Limpiar la lista de usuarios

                // Verificar que la respuesta contiene usuarios
                if (Array.isArray(response.data) && response.data.length > 0) {
                    response.data.forEach(user => {
                        userList.append(`
                            <div class="list-group-item">
                                <h5>${user.username}</h5>
                                <button class="btn btn-danger" onclick="deleteUser('${user.username}')">
                                    Eliminar
                                </button>
                            </div>
                        `);
                    });
                } else {
                    userList.append('<p>No hay usuarios disponibles.</p>');
                }
            },
            error: function(xhr) {
                alert('Error al cargar los usuarios');
            }
        });
    }

    // Eliminar usuario
    window.deleteUser = function(username) {
        if (confirm('¿Estás seguro de que deseas eliminar este usuario?')) {
            $.ajax({
                url: `http://localhost:5000/api/users/${username}`,
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` },
                success: function(response) {
                    alert(response.message); // Mostrar mensaje de éxito
                    loadUsers(); // Recargar la lista de usuarios
                },
                error: function(xhr) {
                    alert(xhr.responseJSON.message || 'Error al eliminar usuario');
                }
            });
        }
    };

    // Cargar usuarios al cargar la página
    loadUsers();
});
