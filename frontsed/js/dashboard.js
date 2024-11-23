$(document).ready(function() {
    // Obtener el token de localStorage
    const token = localStorage.getItem('token');
    if (!token) {
        window.location.href = 'index.html'; // Redirigir al login si no hay token
        return;
    }

    // Obtener el rol del usuario desde el token
    const role = JSON.parse(atob(token.split('.')[1])).role;

    // Si es superadmin, mostrar el botón para ver usuarios
    if (role === 'superadmin') {
        $('#view-users-button').show(); // Mostrar el botón solo para superadmin
    }

    // Función para sanitizar entradas (para evitar XSS)
    function sanitizeInput(input) {
        return $('<div>').text(input).html();
    }

    // Función para validar que el nombre solo contenga letras y números
    function isValidName(name) {
        const regex = /^[a-zA-Z0-9-_]+$/; // Permite solo letras, números, guiones y guiones bajos
        return regex.test(name); // Devuelve true si el nombre es válido
    }

    // Validación durante la escritura (solo letras, números, guiones y guiones bajos)
    $('#product-name').on('input', function() {
        const value = $(this).val();
        const validValue = value.replace(/[^a-zA-Z0-9-_]/g, ''); // Reemplaza caracteres no permitidos
        $(this).val(validValue); // Actualiza el campo con caracteres válidos
    });

    // Cargar productos
    window.loadProducts = function() {
        $.ajax({
            url: 'http://localhost:5000/api/products',
            method: 'GET',
            success: function(response) {
                const productList = $('#product-list');
                productList.empty(); // Limpiar los productos actuales

                // Mostrar los productos como tarjetas
                response.forEach(product => {
                    productList.append(`
                        <div class="col-md-4 mb-4">
                            <div class="card">
                                <img src="${sanitizeInput(product.image)}" class="card-img-top" alt="${sanitizeInput(product.name)}">
                                <div class="card-body">
                                    <h5 class="card-title">${sanitizeInput(product.name)}</h5>
                                    <p class="card-text">Precio: $${sanitizeInput(product.price)}</p>
                                    <button class="btn btn-primary" onclick="editProduct('${sanitizeInput(product.name)}')">
                                        <i class="fas fa-edit"></i> Editar
                                    </button>
                                    <button class="btn btn-danger" onclick="deleteProduct('${sanitizeInput(product.name)}')">
                                        <i class="fas fa-trash-alt"></i> Eliminar
                                    </button>
                                </div>
                            </div>
                        </div>
                    `);
                });
            },
            error: function(xhr) {
                alert(xhr.responseJSON.message); // Mostrar mensaje de error
            }
        });
    };

    // Cargar los productos cuando la página se carga
    loadProducts();

    // Función para ver todos los usuarios (solo superadmin)
    $('#view-users-button').click(function() {
        window.location.href = 'users.html'; // Redirigir a la página de gestión de usuarios
    });

    // Crear nuevo producto
    $('#create-product-form').submit(function(e) {
        e.preventDefault();

        // Obtener los valores del formulario
        const name = $('#product-name').val();
        const price = $('#product-price').val();
        const image = $('#product-image').val();

        // Validar el nombre
        if (!isValidName(name)) {
            alert('El nombre del producto solo puede contener letras, números, guiones y guiones bajos.');
            return; // Detiene el envío del formulario si el nombre no es válido
        }

        // Sanitizar entradas
        const sanitizedName = sanitizeInput(name);
        const sanitizedPrice = sanitizeInput(price);
        const sanitizedImage = sanitizeInput(image);

        $.ajax({
            url: 'http://localhost:5000/api/products',
            method: 'POST',
            contentType: 'application/json',
            headers: { 'Authorization': `Bearer ${token}` },
            data: JSON.stringify({ name: sanitizedName, price: sanitizedPrice, image: sanitizedImage }),
            success: function(response) {
                alert(response.message); // Mostrar el mensaje de éxito
                $('#create-product-form')[0].reset(); // Limpiar el formulario
                $('#load-products').click(); // Recargar la lista de productos
            },
            error: function(xhr) {
                alert(xhr.responseJSON.message); // Mostrar el mensaje de error
            }
        });
    });

    // Eliminar producto
    window.deleteProduct = function(productName) {
        $.ajax({
            url: `http://localhost:5000/api/products/${sanitizeInput(productName)}`,
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` },
            success: function(response) {
                alert(response.message);
                $('#load-products').click(); // Recargar la lista de productos
            },
            error: function(xhr) {
                alert(xhr.responseJSON.message); // Mostrar mensaje de error
            }
        });
    };

    // Función para editar un producto
    window.editProduct = function(productName) {
        const newPrice = prompt("Ingrese el nuevo precio:");
        const newImage = prompt("Ingrese la nueva URL de la imagen:");

        if (newPrice && newImage) {
            $.ajax({
                url: `http://localhost:5000/api/products/${sanitizeInput(productName)}`,
                method: 'PUT',
                contentType: 'application/json',
                headers: { 'Authorization': `Bearer ${token}` },
                data: JSON.stringify({
                    price: sanitizeInput(newPrice),
                    image: sanitizeInput(newImage)
                }),
                success: function(response) {
                    alert(response.message);
                    $('#load-products').click();
                },
                error: function(xhr) {
                    alert(xhr.responseJSON.message); // Mostrar mensaje de error
                }
            });
        }
    };

    // Cerrar sesión
    $('#logout').click(function() {
        localStorage.removeItem('token');
        window.location.href = 'index.html';
    });
});
