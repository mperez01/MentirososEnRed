"use strict";

$(() => {

    hideAll();
    paginaPrincipal();

})

/**
 * Oculta todo el codigo html de la página (excepto cabecera)
 */
function hideAll() {
    $('#usuario').hide();
    $('#login').hide();
}

function paginaPrincipal() {
    $('#login').show();
}

