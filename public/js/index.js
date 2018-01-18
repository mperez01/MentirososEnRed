"use strict";

//OJO al recargar la página
$(() => {
    hideAll();
    $('#loginAceptar').on("click", userLogin);
    $('#loginNuevo').on("click", newUser);
    $('#botonLogout').on("click", userLogout);
    $('#misPartidas').on("click", userPartidas);
    $('#createPartida').on("click", createPartida);
    $('#unirsePartida').on("click", unirsePartida);
    $("#seleccionPartidas").on("click", "a.partidasBoton", (event) => {
        //Obtenemos el "a" sobre el que se ha hecho click de las partidas
        let selected = $(event.target);
        let partidaId = selected.data("id");
        alert("Hemos pinchado en la partida con ID: " + partidaId);
    });
})

let cadenaBase64 = null;

function hideAll() {
    $('#usuario').hide();
    $('#loginOk').hide()
    $('#partidas').hide();
}

function userLogin(event) {

    var name = $("#name").val();
    var pass = $("#pass").val();
    cadenaBase64 = btoa(name + ":" + pass);

    var text = "";
    if (name === '' || name.trim() === '') {
        text += "\nNombre de usuario no puede estar vacío";
    }
    if (pass === '' || pass.trim() === '') {
        text += "\nContraseña no puede estar vacío";
    }

    event.preventDefault();

    $.ajax({
        type: "POST",
        url: "/login",
        contentType: 'application/json',
        data: JSON.stringify({ name: name, pass: pass }),
        success: (data, textStatus, jqXHR) => {
            $("#name").val("");
            $("#pass").val("");
            $('#login').hide();
            $("#usuario > label").html(primeraMayuscula(name));
            $('#usuario').show();
            //Como empezamos en "mis partidas", cambiamos su color a negro
            $("#seleccionPartidas a:first").css({ "color": "black" });
            //Mostrar partidas del usuario en el html
            $('#partidas').show();
            //CARGA LAS PARTIDAS DEL USUARIO
            toolBarPartidas();
        },

        error: (jqXHR, textStatus, errorThrown) => {
            if (jqXHR.status === 404) {
                alert("Nombre de usuario o contraseña incorrecto ");
            }
            else if (jqXHR.status === 400) {
                alert("Datos introducidos de forma incorrecta" + text);
            }
            else if (jqXHR.status === 500) {
                alert("Error en acceso a la base de datos");
            }
            else {
                alert( "Se ha producido un error: " + jqXHR.responseText);
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
    event.preventDefault();
    if (name === '' || name.trim() === '') {
        text += "\nNombre de usuario no puede estar vacío";
    }
    if (pass === ''|| pass.trim() === '') {
        text += "\nContraseña no puede estar vacío";
    }
    nombreUsuario = name;
    cadenaBase64 = btoa(nombreUsuario + ":" + pass);

    $.ajax({
        type: "POST",
        url: "/new_user",
        contentType: 'application/json',
        data: JSON.stringify({ name: name, pass: pass }),
        success: (data, textStatus, jqXHR) => {
            $("#name").val("");
            $("#pass").val("");
            $('#login').hide();
            //Nombre de usuario en el HTML !!!OJO; lo toma de var name, no de data!!
            $("#usuario > label").html(primeraMayuscula(name));
            $('#usuario').show();
            //Como empezamos en "mis partidas", cambiamos su color a negro
            $("#partidas a:first").css({ "color": "black" });
            //Mostrar partidas del usuario en el html
            $('#partidas').show();
        },

        error: (jqXHR, textStatus, errorThrown) => {
            if (jqXHR.status === 400) {
                if (text === "") {
                    text += "\nNombre de usuario en uso";
                }
                alert("Datos introducidos de forma incorrecta" + text);
            }
            else if (jqXHR.status === 500) {
                alert("Error en acceso a la base de datos");
            }
            else {
                alert( "Se ha producido un error: " + jqXHR.responseText);
            }
        }
    });
}

//Authorization
function userPartidas(event) {
    event.preventDefault();
    $('#partidas').show();
    $("#misPartidas").css({ "color": "black" });
    //¿Comprobamos de nuevo si hay nuevas partidas en las que esta el usuario?
    toolBarPartidas();
}

//Authorization
function createPartida(event) {
    event.preventDefault();
    var partidaName = $('#crearPartidaName').val();
    var text = "";
    $('#crearPartidaName').val("");
    if (partidaName === '' || partidaName.trim() === '') {
        text = "\nNombre de partida no puede estar vacío";
    }
    //VALIDAR! Que  no sea vacia, etc

    // Insertar info en la base de datos, nombre y estado (añadir al jugador que ha creado la partida)

    $.ajax({
        type: "POST",
        url: "/new_partida/",
        contentType: 'application/json',
        //PONER BIEN LOS DATOS QUE ENVIA!!
        data: JSON.stringify({ name: partidaName}),
        beforeSend: function (req) {
            // Añadimos la cabecera 'Authorization' con los datos // de autenticación. 
            req.setRequestHeader("Authorization", "Basic " + cadenaBase64);
        },
        success: (data, textStatus, jqXHR) => {
            //Mostrar la pantalla de espera de la partida?
            toolBarPartidas();
            //alert("Partida insertada!");
        },

        error: (jqXHR, textStatus, errorThrown) => {
            if (jqXHR.status === 400) {
                alert("Datos introducidos de forma incorrecta" + text);
            }
            else if (jqXHR.status === 500) {
                alert("Error en acceso a la base de datos");
            }else {
                alert( "Se ha producido un error: " + jqXHR.responseText);
            }
        }
    });
}

//Authorization
function unirsePartida(event) {
    /*
     Incorporación a una partida.
     El servidor recibirá un identificador de la partida e 
     insertará al usuario identificado dentro de la lista de 
     jugadores de la misma. Si la partida no existe, se devolverá
     un código 404. Si la partida ya está completa, se devolverá el código 400.
    */
    event.preventDefault();
    var unirseId = $('#unirsePartidaName').val();
    var text = "";
    $('#unirsePartidaName').val("");
    if (unirseId === '') {
        alert("Nombre de partida no puede estar vacío")
    } else {
        $.ajax({
            type: "POST",
            url: "/joinGame",
            contentType: 'application/json',
            //PONER BIEN LOS DATOS QUE ENVIA!!
            data: JSON.stringify({ id: unirseId}),
            beforeSend: function (req) {
                // Añadimos la cabecera 'Authorization' con los datos // de autenticación. 
                req.setRequestHeader("Authorization", "Basic " + cadenaBase64);
            },
            success: (data, textStatus, jqXHR) => {
                //Mostrar la pantalla de la partida
            },
    
            error: (jqXHR, textStatus, errorThrown) => {
                if (jqXHR.status === 400) {
                    alert("Partida completa");
                } else if (jqXHR.status === 404) {
                    alert("La partida no existe");
                } else if (jqXHR.status === 500) {
                    alert("Error en acceso a la base de datos");
                } else {
                    alert( "Se ha producido un error: " + jqXHR.responseText);
                }
            }
        });
    }
}

function toolBarPartidas() {

    $.ajax({
        type: "GET",
        url: "/get_partidas",
        contentType: 'application/json',
        //PONER BIEN LOS DATOS QUE ENVIA!!
        beforeSend: function (req) {
            // Añadimos la cabecera 'Authorization' con los datos // de autenticación. 
            req.setRequestHeader("Authorization", "Basic " + cadenaBase64);
        },
        success: (data, textStatus, jqXHR) => {
            //Borra partidas si las hubiera
            $(".partidasBoton").remove();
            //Mostrar la pantalla de espera de la partida?
            Object.keys(data).forEach(x => {
                var parti = $("<a>");
                parti.addClass("partidasBoton")
                parti.text(data[x].nombre);
                parti.data("id", data[x].id);
                $("#seleccionPartidas").append(parti);
            })
        },

        error: (jqXHR, textStatus, errorThrown) => {
            if (jqXHR.textStatus === 500) {
                alert("Error en acceso a la base de datos");
            } else {
                alert( "Se ha producido un error: " + jqXHR.responseText);
            }
        }
    });

}

function userLogout(event) {
    event.preventDefault();
    hideAll();
    $('#login').show();
    $(".partidasBoton").remove();
    cadenaBase64 = null;
}