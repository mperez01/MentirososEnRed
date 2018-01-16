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
})

function hideAll() {
    $('#usuario').hide();
    $('#loginOk').hide()
    $('#partidas').hide();
}

function userLogin(event) {
    var name = $("#name").val();
    var pass = $("#pass").val();
    var text = "";
    if (name === '') {
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

            /**
             * Conseguir TODAS las partidas en curso del usuario
             * y mostrarlas, para ello:
             * Dado el objeto PARTIDAS, recorrerlo(forEach) 
             * let partidas = [];
             * 
             * partidasObtenidas.forEach(x => {
             *  let info = ($("<a href=''>"+ 'Nombre partida' +"</a>"));
             * info.data("id", id partida)
                partidas.push(info)
              })
              $("#seleccionPartidas").append(result);
             */
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
    if (name === '') {
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
        }
    });
}

//Authorization
function userPartidas(event) {
    event.preventDefault();
    $('#partidas').show();
    $("#misPartidas").css({ "color": "black" });
    //¿Comprobamos de nuevo si hay nuevas partidas en las que esta el usuario?
}

//Authorization
function createPartida(event) {
    event.preventDefault();
    var partidaName = $('#crearPartidaName').val();
    var text = "";
    if (partidaName === '') {
        text = "\nNombre de partida no puede estar vacío";
    } 
    //VALIDAR! Que  no sea vacia, etc

    // Comprobar que no existe partida con el mismo nombre ¿?
    // Insertar info en la base de datos, nombre y estado (añadir al jugador que ha creado la partida)
    
    $.ajax({
        type: "POST",
        url: "/new_partida",
        contentType: 'application/json',
        //PONER BIEN LOS DATOS QUE ENVIA!!
        data: JSON.stringify({name: partidaName, estado: "jugador", userId: int(1)}),
        success: (data, textStatus, jqXHR) => {
            //Mostrar la pantalla de espera de la partida?
            alert("Partida insertada!");
        },

        error: (jqXHR, textStatus, errorThrown) => {
            if (jqXHR.status === 400) {
                if (text === "") {
                    text += "\nNombre de partida en uso";
                }
                alert("Datos introducidos de forma incorrecta" + text);
            }
            else if (jqXHR.status === 500) {
                alert("Error en acceso a la base de datos");
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
    var unirseName = $('#unirsePartidaName').val();
    var text = "";
    if (unirseName === '') {
        alert("Nombre de partida no puede estar vacío")
    } else {
        $('#unirsePartidaName').val("");
        alert("Vas a unirte a la partida " + unirseName);
    }
}

function userLogout() {
    //Desconexion del usuario
    //Borrar posible información del usuario
}