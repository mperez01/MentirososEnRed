"use strict";

$(() => {
    hideAll();
    $('#loginAceptar').on("click", userLogin);
    $('#loginNuevo').on("click", newUser);
    $('#botonLogout').on("click", userLogout);
    $('#misPartidas').on("click", userPartidas);
    $('#createPartida').on("click", createPartida);
})

function hideAll() {
    $('#usuario').hide();
    $('#partidas').hide();
}

function userLogin(event) {
    var name = $("#name").val();
    var pass = $("#pass").val();
    var text = "";
    if (name ===''){
        text += "\nNombre de usuario no puede estar vacío";
    }
    if (pass === '') {
        text += "\nContraseña no puede estar vacío";
    }

    event.preventDefault();

    $.ajax({
        type: "POST",
        url: "/login",
        contentType: 'application/json',
        data: JSON.stringify({name: name, pass:pass}),
        success: (data, textStatus, jqXHR) => {
            $('#login').hide();
            //Nombre de usuario en el HTML !!!OJO; lo toma de var name, no de data!!
            $("#usuario > label").html(primeraMayuscula(name));
            $('#usuario').show();

            //Como empezamos en "mis partidas", cambiamos su color a negro
            $("#partidas a:first").css({"color":"black"});
            //Mostrar partidas del usuario en el html
            $('#partidas').show();
        },

        error: (jqXHR, textStatus, errorThrown) => {
            if (jqXHR.status === 404) {
                alert("Nombre de usuario o contraseña incorrecto");
            }
            else if (jqXHR.status === 400) {
                alert("Datos introducidos de forma incorrecta" + text);
            }
            else if (jqXHR.status === 500) {
                alert("Error en acceso a la base de datos");
            }
        }
    });
}

//Devuelve un string con la primera letra en mayuscula
function primeraMayuscula(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

function newUser(event) {
    /**
     * Tratar el formulario con AJAX
     * Peticion POST
     */
    var name = $("#name").val();
    var pass = $("#pass").val();
    var text = "";
    if (name ===''){
        text += "\nNombre de usuario no puede estar vacío";
    }
    if (pass === '') {
        text += "\nContraseña no puede estar vacío";
    }

    event.preventDefault();

    $.ajax({
        type: "POST",
        url: "/new_user",
        contentType: 'application/json',
        data: JSON.stringify({name: name, pass:pass}),
        success: (data, textStatus, jqXHR) => {
            $('#login').hide();
            //Nombre de usuario en el HTML !!!OJO; lo toma de var name, no de data!!
            $("#usuario > label").html(primeraMayuscula(name));
            $('#usuario').show();

            //Como empezamos en "mis partidas", cambiamos su color a negro
            $("#partidas a:first").css({"color":"black"});
            //Mostrar partidas del usuario en el html
            $('#partidas').show();
        },

        error: (jqXHR, textStatus, errorThrown) => {
            if (jqXHR.status === 400) {
                if(text==="") {
                    text += "\nNombre de usuario en uso";
                }
                alert("Datos introducidos de forma incorrecta" + text);
            }
            else if (jqXHR.status === 500) {
                alert("Error en acceso a la base de datos");
            }
        }
    });
}

function userPartidas(event) {
    event.preventDefault();
    $('#partidas').show();
    $("#misPartidas").css({"color":"black"});
    //¿Comprobamos de nuevo si hay nuevas partidas en las que esta el usuario?
}

function createPartida(event) {
    event.preventDefault();
    var partidaName = $('#crearPartidaName').val();

    //VALIDAR! Que  no sea vacia, etc

    // Comprobar que no existe partida con el mismo nombre ¿?
    // Insertar info en la base de datos, nombre y estado (añadir al jugador que ha creado la partida)
    $.ajax({
        type: "POST",
        url: "/createPartida",
        contentType: 'application/json',
        data: JSON.stringify({name: partidaName}),
        success: (data, textStatus, jqXHR) => {

        },

        error: (jqXHR, textStatus, errorThrown) => {
            if (jqXHR.status === 500) {
                alert("Error en acceso a la base de datos");
            }
        }
    });
}

function userLogout() {
    //Desconexion del usuario
    //Borrar posible información del usuario
}