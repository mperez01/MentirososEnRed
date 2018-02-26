![](https://i.imgur.com/oAmUqSt.png)
# Mentirosos en red

Mentirosos en red. Juego de navegador web para la asignatura de Aplicaciones Web de la Universidad Complutense de Madrid

Curso 2017-2018

### Descripción

Juego de cartas "Mentiroso": Se reparten todas los naipes de una baraja de cartas francesa entre cuatro jugadores. Gana el jugador que se quede sin cartas en primer lugar. Para quedarse sin cartas deben ponerse 'x' cartas sobre la mesa diciendo que valor de carta esta poniendo (A,2,3,4,5,6,7,8,9,10,J,Q,K) el jugador siguiente puede poner cartas sobre el tablero (supuestamente las mismas) o decir que el otro jugador está mintiendo y descubrir las cartas. Si el jugador anterior mentia, se queda con todas las cartas de la mesa, en caso de no estar mintiendo, el jugador que pensó que mentia, se queda con todas las cartas.

### Características

WEB SPA (Single-page application), con el uso de JavaScript del lado del cliente se generá toda la aplicación.

### Creacción de partidas

Cualquier usuario logeado puede crear una partida nueva. Escribiendo el nombre de la partida que desea crear y pinchando en "crear" la partida será creada. Aparecerá dicha partida en el toolbar del usuario con el nombre que haya introducido; pinchando en el nombre aparecerá la información de la partida, incluyendo su **identificador**.

![](https://i.imgur.com/THovIOv.png)

### Unirse a una partida

En la pantalla principal de la aplicación, introduciendo el identificador de una partida existente podremos unirnos a ella (siempre y cuando la partida exista y no este completa). Una vez unidos en la partida, si somos el último usuario en entrar, la partida comenzará, en caso de estar aun incompleta, la partida no comenzará.

#### _Botón actualizar_

Dentro de la partida (empezada o no) aparecer un botón "Actualizar", pinchando en él el cliente pedirá información al servidor sobre el estado de la partida:
  - Si la partida está completa o aún no
  - Turno del jugador
  - Cartas del jugador

### Comienza la partida

Una vez la partida este completa (cuatro jugadores) comenzará la partida, se reparten las cartas entre los jugadores y se da el turno a uno de ellos de forma aleatoria.
EL primer jugador puede eleguir que cartas se jugaran en la mesa. Los próximos turnos el jugador podrá elegir si jugar cartas o decir que el jugador anterior esta mintiendo. La partida acaba cuando un jugador se queda sin cartas.

![](https://i.imgur.com/3UZFMWY.png)
La pantalla del usuario una vez empiece la partida tendrá información como la de la imagen anterior, apareciendo los botones "jugar cartas seleccionadas" y "mentiroso" si fuese su turno.

### Diseño de la base de datos

![](https://i.imgur.com/tFLsw2Q.png)

Dos entidades principales: usuarios y partidas, con una relación muchos-a-muchos entre ambas, representada mediante la tabla juega_en. Para cada usuario se almacena su nombre de usuario (login) y contraseña. Para cada partida se almacena su nombre y su estado actual. El estado es un texto en formato JSON que contiene la situación actual de la partida: cartas de cada jugador, cartas en el centro de la mesa, jugador que tiene el turno, etc. La tabla historial, que almacenará los eventos que se van produciendo en cada partida, existe, pero **no esta implementado** su uso en la versión actual

## Recursos utilizados

 - [Node.js](https://nodejs.org/es/)
   - [Express](http://expressjs.com/es/)
   - [body-parser](https://github.com/expressjs/body-parser)
   - [Passport](http://passportjs.org/)
   - [Passport-http](https://github.com/jaredhanson/passport-http)
   - [Mysql](https://github.com/mysqljs/mysql)
 - [JQuery](https://jquery.com/)
    - [Ajax](http://api.jquery.com/jquery.ajax/)
 - [XAMPP](https://www.apachefriends.org/es/index.html)
 
 ### Licencia
 
MIT License

Copyright (c) 2017 Marcelino Pérez and Mario Rodríguez
