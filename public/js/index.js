"use strict";

//OJO al recargar la página
let selectedCards = [];
$(() => {
    hideAll();
    $('#loginAceptar').on("click", userLogin);
    $('#loginNuevo').on("click", newUser);
    $('#botonLogout').on("click", userLogout);
    $('#misPartidas').on("click", userPartidas);
    $('#createPartida').on("click", createPartida);
    $('#unirsePartida').on("click", unirsePartida);
    $("#seleccionPartidas").on("click", "a.partidasBoton", viewPartida);
    $('#botonActualizar').on("click", viewPartida);
    $('#cartasJugador').on("click", "div.cartasUsuario img", (event) => {
        let selected = $(event.target);
        selected.toggleClass("cartaSeleccionada");
        let exist = '';
        let cont = Number(0);
        if (selectedCards.length === 0) {
            selectedCards.push(selected.attr('src'));
        } else {
            selectedCards.forEach(card => {
                if (card === selected.attr('src')) {
                    exist = cont;
                }
                cont++;
            })
            if (exist === '') {
                selectedCards.push(selected.attr('src'));
            } else {
                selectedCards.splice(exist, 1);
            }
        }
        console.log("Cartas seleccionadas " + selectedCards);
    });
    $('#botonJugarCartas').on("click", jugarCartas);
    $('#botonMentiroso').on("click", mentiroso);
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
    $("#pantallaPartida").hide();
    //Mostramos el html de crear y unirse a partida
    $("#constructorPartidas").show();
    $("#seleccionPartidas a").css({ "color": "rgb(36, 142, 255)" });
    $("#misPartidas").css({ "color": "black" });
    //¿Comprobamos de nuevo si hay nuevas partidas en las que esta el usuario?
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
    selectedCards = [];
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
                $("#cartasMesa").hide();
                $("#cartasJugador").hide();
                //Para quitar, en caso de que hubiera, clase cartaSeleccionada
                $(".cartaSeleccionada").removeClass();

                $(".infoUser").remove();
                $("#inGameId").text("");
                $(".mensajeInfo").remove();
                $(".infoCartasJugador input[type='text']").hide();

                //Ponemos todos los "botones" en el color por defecto
                // y al seleccionado lo ponemos de color negro si no incluye texto
                //NO tener texto implica que se esta pulsando al boton actualizar
                if (selected.text() !== '') {
                    $("#seleccionPartidas a").css({ "color": "rgb(36, 142, 255)" });
                    selected.css({ "color": "black" });
                }

                //Ocultamos el creador de partidas
                $("#constructorPartidas").hide();
                //Mostramos el HTML de la partida (Hay que enviar datos)
                //Le dotamos al boton del ID de la partida
                $("#botonActualizar").data("id", partidaId);
                //Cogemos el NOMBRE de la partida del resultado
                $(".partidaTitulo").text(data[0].nombre);
                let turno;
                //Si es menor de cuatro, aparece esto, sino no ya que esta completa
                if (data.length <= 4) {
                    $("#inGameId").text("El identificador de esta partida es " + partidaId);
                    $("#infoPartida").append("<p class='mensajeInfo'>La partida aun no tiene cuatro jugadores</p>");
                } else {
                    //ID DEL USUSARIO que esta en el cliente
                    let userID = data[4].userID;
                    var estado = JSON.parse(data[0].estado);
                    turno = estado[4].turno;
                    let cartasMesa = estado[4].cartasMesa;


                    console.log("CARTAS EN LA MESA " + cartasMesa)
                    $(".cartasAbajo span").remove();
                    if (cartasMesa.length === 0) {
                        console.log("Sin cartas jugadas")
                        $(".cartasAbajo p").remove();
                        $(".cartasAbajo").append("<p>Sin cartas jugadas la mesa</p>");
                    } else {
                        console.log("Con cartas jugadas")
                        $(".cartasAbajo p").remove();

                        let cartaAbajo = "<span>" + estado[4].valorJuego + "</span>";
                        let cont = 0;
                        $(".cartasAbajo span").remove();
                        while (cont !== cartasMesa.length) {
                            $(".cartasAbajo").append(cartaAbajo);
                            cont++;
                        }
                        //Ultimo turno info (jugaodor x dice que ha colocado x cartas)
                        $(".infoCartasMesa span").remove();
                        //$(".infoCartasMesa").append("<span>Manuel dice que ha colocado un J</span>");
                    }

                    if (userID === estado[turno].jugadorID) {
                        $("#botonMentiroso").data("id", partidaId);
                        $("#botonMentiroso").show();
                        $("#botonJugarCartas").data("id", partidaId);
                        $("#botonJugarCartas").show();
                        if (cartasMesa.length === 0) {
                            //poner aqui lo de añadir el valor
                            $("#botonMentiroso").hide();
                            $(".infoCartasJugador").append("<input type='text' id='valor' name='valor' placeholder='¿Valor a jugar? (A...K)'>");
                        }
                        $("#noTurno").hide();
                    }
                    else {
                        $(".infoCartasJugador input[type='text']").hide();
                        $("#botonMentiroso").hide();
                        $("#botonJugarCartas").hide();
                        $("#noTurno").show();
                    }

                    $("#inGameId").text("");
                    $(".mensajeInfo").remove();

                    //REPARTIR CARTAS se hace desde el servidor, en joingame
                    //OJO, es necesario ahora comprobar si es el turno del usuario, las cartas, etc
                    //IndexUser guardara el indice del usuario del cliente
                    let indexUser;
                    estado.forEach((x, index, array) => {
                        if (x.jugadorID === userID) {
                            indexUser = index;
                        }
                    })
                    let cartasUsuario = '';
                    $(".cartasUsuario img").remove();
                    estado[indexUser].cartasJugador.forEach(x => {
                        cartasUsuario += '<img src=/img/' + String(x) + '>';
                    })
                    $(".cartasUsuario").append(cartasUsuario);
                    /**
                     * turno del index 0. miramos el idJugador del index 0, y si coincide con el que entrega la respuesta, es su turno,
                     * en cc. no es su turno
                     */
                    $("#cartasMesa").show();
                    $("#cartasJugador").show();
                }
                /** data contiene data[x].usuario y data[x].estado */
                Object.keys(data).forEach((x, index, array) => {
                    /*var user = $("<td>");
                    user.text(data[x].usuario);*/
                    /*data[0].estado.forEach(y => {
                        $("#jugadores").append("<tr class='infoUser' id='" + y.jugadorID + "'> <td>" + data[x].usuario + "</td> <td> " + y.numCartas  + " </td> </tr>");
                        y.jugadorID
                    })*/
                    let estado = JSON.parse(data[0].estado);
                    if (data[x].usuario !== undefined)
                        $("#jugadores").append("<tr class='infoUser' id='" + data[x].idUsuario + "'> <td>" + data[x].usuario + "</td> <td>"+estado[x].numCartas+ "</td> </tr>");
                    if (data.length > 4) {
                        let cssChange = "#" + estado[Number(turno)].jugadorID;
                        $(cssChange).css({ "background": "green" });
                    }
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

function jugarCartas(event) {
    /*
    estado[4].numerodecartasjugadas + nnumero de cartas jugadas por el del turno
    turno = actual+1 si turno = 3 pasar al 0 de nuevo
    estado.cartasMesa contiene las distintas cartas (nombres)
    estado.cartasJugadas es un int  
    */

    let selected = $(event.target);
    let partidaId = selected.data("id");
    let valorJugado = $("#valor").val();
    if (selectedCards.length === 0) {
        alert("Tienes que seleccionar al menos una carta")
    }
    else {
        $.ajax({
            type: "POST",
            url: "/juegaCartas",
            contentType: 'application/json',
            data: JSON.stringify({ selectedCards: selectedCards, partidaId: partidaId, valorJugado: valorJugado }),
            beforeSend: function (req) {
                req.setRequestHeader("Authorization", "Basic " + cadenaBase64);
            },
            success: (data, textStatus, jqXHR) => {

                //Esto debe ir al final para eliminar las cartas seleccionadas
                $(".cartaSeleccionada").remove();
                selectedCards = [];
                $('#botonActualizar').click();
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

}

function mentiroso(event) {
    let selected = $(event.target);
    let partidaId = selected.data("id");
    $.ajax({
        type: "POST",
        url: "/mentiroso",
        contentType: 'application/json',
        data: JSON.stringify({ partidaId: partidaId }),
        beforeSend: function (req) {
            req.setRequestHeader("Authorization", "Basic " + cadenaBase64);
        },
        success: (data, textStatus, jqXHR) => {
            $('#botonActualizar').click();
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

function userLogout(event) {
    event.preventDefault();
    hideAll();
    $('#login').show();
    $(".partidasBoton").remove();
    cadenaBase64 = null;
}