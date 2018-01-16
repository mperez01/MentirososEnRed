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

app.post("/login", (request, response) => {
  request.checkBody("name").notEmpty();
  request.checkBody("pass").notEmpty();
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
          daoG.getGames(id,(err,games)=>{
              if (err) {
                //Error en base de datos
                response.status(500);
                response.end();
              }else{
                  response.json(games);
              }
            })
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
            console.log("Name = " + name + "Request body = " + request.body.name)
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
            //response.setFlash("Dirección de correo electrónico en uso");
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

app.post("/new_partida", (request, response) => {
  request.checkBody("name").notEmpty();
  request.getValidationResult().then((result) => {
    if (result.isEmpty()) {
      daoG.partidaExist(request.body.name, (err, name) => {
        if (err) {
          response.status(500);
          response.end();
        }
        else {
          console.log("Partida no existe")
          if (String(name).toLowerCase() !== String(request.body.name).toLowerCase()) {
            //toLowerCase() convierte en minuscula toda la cadena de caracteres
            console.log("Name = " + name + "Request body = " + request.body.name)
            daoG.addPartida(request.body.name, request.body.estado, request.body.userId, (err, id) => {
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
            //response.setFlash("Nombre de partida en uso");
            response.status(400);
            response.end();
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
