"use strict";
/* 
 * GRUPO 606 - Marcelino Pérez y Mario Rodríguez
 */

var express = require('express');
var path = require('path');
const mysql = require("mysql");
const config = require("./config");
const expressValidator = require("express-validator");
const bodyParser = require('body-parser');
var passport = require("passport");
var passportHTTP = require("passport-http");

const daoUsers = require("./dao_users");
const daoGames = require("./dao_games");

var app = express();

let pool = mysql.createPool({
  database: config.mysqlConfig.database,
  host: config.mysqlConfig.host,
  user: config.mysqlConfig.user,
  password: config.mysqlConfig.password
});

app.use(expressValidator({
  customValidators: {
    //comprobamos que param no es solo espacios en blanco
    whiteSpace: function (param) {
      return param.trim().length > 0;
    }
  }
}));

let daoU = new daoUsers.DAOUsers(pool);
let daoG = new daoGames.DAOGames(pool);

let cartas = ["A_C.png", "A_D.png", "A_H.png", "A_S.png", "2_C.png", "2_D.png", "2_H.png",
  "2_S.png", "3_C.png", "3_D.png", "3_H.png", "3_S.png", "4_C.png", "4_D.png", "4_H.png", "4_S.png", "5_C.png",
  "5_D.png", "5_H.png", "5_S.png", "6_C.png", "6_D.png", "6_H.png", "6_S.png", "7_C.png", "7_D.png",
  "7_H.png", "7_S.png", "8_C.png", "8_D.png", "8_H.png", "8_S.png", "9_C.png", "9_D.png", "9_H.png",
  "9_S.png", "10_C.png", "10_D.png", "10_H.png", "10_S.png", "J_C.png", "J_D.png", "J_H.png", "J_S.png",
  "Q_C.png", "Q_D.png", "Q_H.png", "Q_S.png", "K_C.png", "K_C.png", "K_H.png", "K_S.png"];

//Autenticación
app.use(passport.initialize());

passport.use(new passportHTTP.BasicStrategy(
  {
    realm: 'Autenticacion requerida'
  },
  function (user, pass, callback) {
    daoU.isUserCorrect(user, pass, function (err, id) {
      if (err) {
        callback(err);
      } else {
        if (id > 0) {
          callback(null, id);
        }
        else {
          callback(null, false);
        }
      }
    });
  }
));

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));


app.use(express.static(path.join(__dirname, "public")));
app.use(bodyParser.json());

/**
 * Comienzo de la implmentación de la aplicación
 */

app.get("/", (request, response) => {
  response.status(300);
  response.redirect("/main.html");
  response.end();
});

app.get("/get_partidas", passport.authenticate('basic', { session: false }), (request, response) => {
  var userId = String(request.user);
  daoG.getUserGames(userId, (err, games) => {
    if (err) {
      response.status(500);
      response.end();
    } else {
      response.json(games);
    }
  })
})

app.post("/login", (request, response) => {
  request.checkBody("name").notEmpty();
  request.checkBody("pass").notEmpty();
  request.checkBody("name").whiteSpace();
  request.checkBody("pass").whiteSpace();
  request.getValidationResult().then((result) => {
    if (result.isEmpty()) {
      daoU.isUserCorrect(request.body.name, request.body.pass, (err, id) => {
        if (err) {
          //Error en base de datos
          response.status(500);
          response.end();
        }
        else {
          if (id > 0) {
            //Usuario logeado
            //QUITAR y devolver true
            response.json(true);
          }
          else {
            //Error, usuario o contraseña no válido/encontrado
            response.status(404);
            response.end();
          }
        }
      })
    } else {
      //ERROR! Los datos introducidos no son válidos
      response.status(400);
      response.end();
    }
  });
});

app.post("/new_user", (request, response) => {
  //request.checkBody("name", "Nombre de usuario no válido").matches(/^[A-Z0-9]*$/i);
  request.checkBody("name").notEmpty();
  request.checkBody("pass").notEmpty();
  request.checkBody("name").whiteSpace();
  request.checkBody("pass").whiteSpace();
  request.getValidationResult().then((result) => {
    if (result.isEmpty()) {
      daoU.userExist(request.body.name, (err, name) => {
        if (err) {
          response.status(500);
          response.end();
        }
        else {
          if (String(name).toLowerCase() !== String(request.body.name).toLowerCase()) {
            //toLowerCase() convierte en minuscula toda la cadena de caracteres
            daoU.insertUser(request.body.name, request.body.pass, (err, id) => {
              if (err) {
                response.status(500);
                response.end();
              } else {
                //Usuario creado correctamente
                response.status(201);
                response.end();
              }
            })
          }
          else {
            response.status(400);
            response.end();
          }
        }
      })
    } else {
      //Usuario/contraseña vacio
      response.status(400);
      response.end();
    }
  });
})

app.post("/new_partida", passport.authenticate('basic', { session: false }), (request, response) => {
  request.checkBody("name").notEmpty();
  request.checkBody("name").whiteSpace();
  request.getValidationResult().then((result) => {
    if (result.isEmpty()) {
      var jugadorJson = { jugadoresID: request.user };
      daoG.addPartida(request.body.name, JSON.stringify(jugadorJson), request.user, (err, id) => {
        if (err) {
          response.status(500);
          response.end();
        } else {
          //Partida creada correctamente
          response.status(201);
          response.end();
        }
      })
    } else {
      //Nombre vacio
      response.status(400);
      response.end();
    }
  })
})

app.post("/joinGame", passport.authenticate('basic', { session: false }), (request, response) => {
  request.checkBody("idPartida").notEmpty();
  request.checkBody("idPartida").whiteSpace();
  request.getValidationResult().then((result) => {
    if (result.isEmpty()) {
      daoG.comprobarPartida(request.body.idPartida, (err, resultado) => {
        if (err) {
          response.status(500);
          response.end();
        } else {
          var existe = false;
          resultado.forEach(x => {
            if (request.user === x.idUsuario) {
              existe = true;
            }
          })
          if (resultado.length === 0) {
            //No existe dicha partida
            response.status(404);
            response.end();
          } else if (existe) {
            //Usuario existe en la partida
            response.status(200);
            response.end();
          } else if (resultado.length >= 4) {
            //Partida llena ERROR 400 ????
            response.status(400);
            response.end();
          }
          else {
            /**
             * PARA QUE NO SE INSERTE SI YA EXISTE;
             * de existir accedemos al html de la partida con dicho ID, de 
             * no existir se añade a ella (insert) y se muestra su HTML
             */
            if (!existe) {
              daoG.insertUserInGame(request.body.idPartida, request.user, (err, res) => {
                if (err) {
                  response.status(500);
                  response.end();
                } else {
                  //si la partida tenia 3 usuarios al intentar unirse, repartimos cartas
                  if (resultado.length === 3) {
                    //Repartir aleatoriamente las 52 cartas de la baraja entre los cuatro jugadores
                    repartirCartas();

                    //Determinar el orden de los jugadores
                    //Implementar...

                    //Seleccionar al jugador que comenzará la partida
                    //Implementar....
                  }
                  //Aquí, añadir al jugador al ESTADO y los demás datos?
                  // Implementar....
                  response.status(200);
                  response.end();
                }
              })
            }
          }
        }
      })
    } else {
      //Nombre vacio
      response.status(400);
      response.end();
    }
  })
})

/**
 * Devuelve un objeto divido en 4 jugadores con las 52 cargas de juego 
 * repartidas aleatoriamente
 */
function repartirCartas() {
  let jugador1 = [];
  let jugador2 = [];
  let jugador3 = [];
  let jugador4 = [];
  //Barajamos las cartas
  var random = cartas;
  random = shuffle(random);
  console.log("AQUI EMPIEZA")

  random.forEach((x, index, array) => {
    //console.log(x.split("_"));
    if (index + 1 <= 13) {
      jugador1.push(x);
    } else if (index + 1 > 13 && index + 1 <= 26) {
      jugador2.push(x);
    } else if (index + 1 > 26 && index + 1 <= 39) {
      jugador3.push(x);
    } else if (index + 1 > 39) {
      jugador4.push(x);
    }
  })
  //AHORA, añadir las cartas al estado del jugador en la partida
  var cartasJugadores = { jugador1, jugador2, jugador3, jugador4 };
  console.log(cartasJugadores);
  // cartasJugadores.jugador1.length da la cantidad de cartas que tiene jugador 1
  console.log(cartasJugadores.jugador1.length);
  /**
   * cartasJugadores se muestra de la forma: 
   * { jugador1:
   * [ '7_C.png',
   * '2_C.png',
   * '8_S.png', .......
   * jugador2:
   * [ 'J_C.png', .....
   * 
   * }
   */
  return cartasJugadores;
}

/**
 * Fisher-Yates algorithm
 * https://github.com/Daplie/knuth-shuffle
 * 
 * @param {*} array array to randomize
 */
function shuffle(array) {
  var currentIndex = array.length, temporaryValue, randomIndex;

  while (0 !== currentIndex) {

    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex -= 1;

    temporaryValue = array[currentIndex];
    array[currentIndex] = array[randomIndex];
    array[randomIndex] = temporaryValue;
  }

  return array;
}

app.get("/getPartida/:id", passport.authenticate('basic', { session: false }), (request, response) => {
  if (request.params.id === '' || String(request.params.id).trim().length <= 0) {
    response.status(404);
    response.end();
  } else {
    //getPartidaInfo muy similar a comprobarPartida!!
    daoG.getPartidaInfo(request.params.id, (err, resultado) => {
      if (err) {
        response.status(500);
        response.end();
      } else {
        if (resultado.length === 0) {
          //No existe dicha partida
          response.status(404);
          response.end();
        }
        else {
          response.json(resultado);
          response.end();
        }
      }
    })
  }
})

//Listen in port gived in config.js
app.listen(config.port, (err) => {
  if (err) {
    console.error("No se pudo inicializar el servidor: " + err.message);
  } else {
    console.log("Servidor arrancado en el puerto " + config.port);
  }
});

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});
