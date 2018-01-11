"use strict";

$(() => {

    hideAll();
    //paginaPrincipal();
    paginaPartidas();

})

/**
 * Oculta todo el codigo html de la página (excepto cabecera)
 */
function hideAll() {
    $('#usuario').hide();
    $('#login').hide();
    $('#partidas').hide();
}

function paginaPrincipal() {
    $('#login').show();
}

function paginaPartidas() {
    $('#usuario').show();
    $('#partidas').show();
 }
