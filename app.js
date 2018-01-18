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
      daoG.addPartida(request.body.name, "estado aqui", request.user, (err, id) => {
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
        console.log()
        if (err) {
          response.status(500);
          response.end();
        } else {
          if (resultado.length === 0) {
            //No existe dicha partida
            response.status(404);
            response.end();
          } else if (resultado.length >= 4) {
            //Partida llena ERROR 400 ????
            response.status(400);
            response.end();
          }
          else {
            //Añadir insert usuario
            var existe = false;
            resultado.forEach(x => {
              if (request.user === x.idUsuario) {
                existe = true;
                console.log("Usuario ya esta en la partida")
              }
            })
            /**
             * PARA QUE NO SE INSERTE SI YA EXISTE;
             * de existir accedemos al html de la partida con dicho ID, de 
             * no existir se añade a ella (insert) y se muestra su HTML
             */
            if (existe) {
              //console.log(resultado[0].idUsuario);
              response.status(200);
              response.end();
            } else {
              daoG.insertUserInGame(request.body.idPartida, request.user, (err, res) => {
                if (err) {
                  response.status(500);
                  response.end();
                } else {
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
        //console.log("resultado " + resultado[0].usuario)
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
