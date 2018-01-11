"use strict";

$(() => {

    paginaPrincipal();

})

function paginaPrincipal() {
    var pagina = $("<div class='welcome'>" +
        "<label>¡Bienvenido!</label>" +
        "<img src='img/ImagenPortada.jpg' alt='Cartas' id='logo'> </div> " +
        "<div class='recueadro'>" +
        "<form action=''>" +
        "<div>" +
        "<p class='formCabecera'>Identificarse</p>" +
        "</div>" +
        "<div>" +
        "<label for=''>Nombre de usuario</label>" +
        "<input class='rellenar' type='text' placeholder='Introduce nombre'>" +
        "</div>" +
        "<div>" +
        "<label for=''>Contraseña</label>" +
        "<input class='rellenar' type='password' placeholder='Introduce contraseña'>" +
        "</div>" +
        "<div>" +
        "<input class='botonAceptar' type='submit' value='Aceptar'> " +
        "<input class='botonNuevo' type='submit' value='Nuevo Usuario'> " +
        "</div>" +
        "</form>" +
        "</div>");
    $("#response-container").html(pagina);
}