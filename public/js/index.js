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
    $("#seleccionPartidas").on("click", "a.partidasBoton", viewPartida);
})

let cadenaBase64 = null;

function hideAll() {
    $('#usuario').hide();
    $('#loginOk').hide()
    $('#partidas').hide();
    $("#pantallaPartida").hide();
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
            //PODEMOS dejarlo así. o que se muestra tal y como lo introdujo el usuario
            var nombreUsuario = String(name).toLowerCase();
            $("#usuario > label").html(primeraMayuscula(nombreUsuario));
            $('#usuario').show();
            //Como empezamos en "mis partidas", cambiamos su color a negro
            $("#seleccionPartidas a:first").css({ "color": "black" });
            //Mostrar partidas del usuario en el html
            $('#partidas').show();
            $('#constructorPartidas').show();
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
                alert("Se ha producido un error: " + jqXHR.responseText);
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
    if (pass === '' || pass.trim() === '') {
        text += "\nContraseña no puede estar vacío";
    }
    cadenaBase64 = btoa(name + ":" + pass);

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
            var nombreUsuario = String(name).toLowerCase();
            $("#usuario > label").html(primeraMayuscula(nombreUsuario))
            $('#usuario').show();
            //Como empezamos en "mis partidas", cambiamos su color a negro
            $("#partidas a:first").css({ "color": "black" });
            $('#constructorPartidas').show();
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
                alert("Se ha producido un error: " + jqXHR.responseText);
            }
        }
    });
}

//Authorization
function userPartidas(event) {
    //$('#partidas').show();
    //Ocultamos (si estuviese mostrado) la partida
    $("#pantallaPartida").hide();
    //Mostramos el html de crear y unirse a partida
    $("#constructorPartidas").show();
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
        data: JSON.stringify({ name: partidaName }),
        beforeSend: function (req) {
            // Añadimos la cabecera 'Authorization' con los datos // de autenticación. 
            req.setRequestHeader("Authorization", "Basic " + cadenaBase64);
        },
        success: (data, textStatus, jqXHR) => {
            //Mostrar la pantalla de espera de la partida?
            //Por ahora volvemos a misPartidas
            $("#misPartidas").css({ "color": "black" });
            toolBarPartidas();
            alert("Partida creada!");
            //alert("Partida insertada!");
        },

        error: (jqXHR, textStatus, errorThrown) => {
            if (jqXHR.status === 400) {
                alert("Datos introducidos de forma incorrecta" + text);
            }
            else if (jqXHR.status === 500) {
                alert("Error en acceso a la base de datos");
            } else {
                alert("Se ha producido un error: " + jqXHR.responseText);
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
        text += "Nombre de partida no puede estar vacío";
        alert("Nombre de partida no puede estar vacío")
    } else {
        $.ajax({
            type: "POST",
            url: "/joinGame",
            contentType: 'application/json',
            //PONER BIEN LOS DATOS QUE ENVIA!!
            data: JSON.stringify({ idPartida: unirseId }),
            beforeSend: function (req) {
                // Añadimos la cabecera 'Authorization' con los datos // de autenticación. 
                req.setRequestHeader("Authorization", "Basic " + cadenaBase64);
            },
            success: (data, textStatus, jqXHR) => {
                //Mostrar la pantalla de la partida ?¿
                toolBarPartidas();
                alert("Unido a la partida!");
                //alert("Unido!")
            },

            error: (jqXHR, textStatus, errorThrown) => {
                if (jqXHR.status === 400) {
                    alert("Partida completa " + text);
                } else if (jqXHR.status === 404) {
                    alert("La partida no existe");
                } else if (jqXHR.status === 500) {
                    alert("Error en acceso a la base de datos");
                } else {
                    alert("Se ha producido un error: " + jqXHR.responseText);
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
                alert("Se ha producido un error: " + jqXHR.responseText);
            }
        }
    });

}

/* Buscar los datos de la base de datos de la partida y cargar el HTML
    de la partida. 

    PETICION: GET
    URL: /getPartida/:id ¿?
    param entrada: id de la partida que quiere conseguirse información
    Codigos respuesta: 200 si tuvo éxito (con response.json), 404 en caso de no existir la partia,
    500 en otro caso de error (BD).
    
    TIPO resultado: JSON

    resultado: NOMBRE de los jugadores inscritos en la partida (POSTERIORMENTE la información 
    de ESTADO)
*/
function viewPartida(event) {
    
    let selected = $(event.target);
    let partidaId = selected.data("id");
    //Eliminamos
    $("#pantallaPartida > p").remove();
    $.ajax({
        type: "GET",
        url: "/getPartida/" + partidaId,
        contentType: 'application/json',
        //PONER BIEN LOS DATOS QUE ENVIA!!
        beforeSend: function (req) {
            // Añadimos la cabecera 'Authorization' con los datos // de autenticación. 
            req.setRequestHeader("Authorization", "Basic " + cadenaBase64);
        },
        success: (data, textStatus, jqXHR) => {
            if (data.length > 0) {
                //Ponemos todos los "botones" en el color por defecto
                $("#seleccionPartidas a").css({ "color": "rgb(36, 142, 255)" });
                //al seleccionado lo ponemos de color azul
                selected.css({ "color": "black" });
                //Ocultamos el creador de partidas
                $("#constructorPartidas").hide();
                //Mostramos el HTML de la partida (Hay que enviar datos)
                $("#pantallaPartida h1").text("Nombre: " + selected.text());
                $("#pantallaPartida h2").text("ID: " + partidaId);
                /** data contiene data[x].usuario y data[x].estado */
                Object.keys(data).forEach(x => {
                    var user = $("<p>");
                    user.text(data[x].usuario);
                    $("#pantallaPartida").append(user);
                })
                $("#pantallaPartida").show();
            } else {
                alert("SIN USUARIOS")
            }
        },

        error: (jqXHR, textStatus, errorThrown) => {
            if (jqXHR.textStatus === 500) {
                alert("Error en acceso a la base de datos");
            } else {
                alert("Se ha producido un error: " + jqXHR.responseText);
            }
        }
    })
}

function userLogout(event) {
    event.preventDefault();
    hideAll();
    $('#login').show();
    $(".partidasBoton").remove();
    cadenaBase64 = null;
}