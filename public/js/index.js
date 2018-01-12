"use strict";

$(() => {
    hideAll();
    $('#loginAceptar').on("click", userLogin);
    $('#loginNuevo').on("click", newUser);
    $('#botonLogout').on("click", userLogout);
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
    event.preventDefault();
    $('#formLogin').attr("action", "/newUser");
    $('#login').hide();
    $('#usuario').show();
    $('#partidas').show();
}

function userLogout() {
    //Desconexion del usuario
}