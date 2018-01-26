"use strict";

class DAOGames {
    /**
     * Inicializa el DAO de partidas.
     * 
     * @param {Pool} pool Pool de conexiones MySQL. Todas las operaciones
     *                    sobre la BD se realizarán sobre este pool.
     */
    constructor(pool) {
        this.pool = pool;
    }

    getUserGames(idUsuario,callback){
        this.pool.getConnection((err, connection) => {
            if (err) { callback(err); return; }
            connection.query("SELECT partidas.id, partidas.nombre FROM juega_en JOIN partidas ON idPartida=id" +
                " WHERE idUsuario=?", [idUsuario],
                function (err, resultado) {
                    connection.release();
                    if (err) { callback(err); return; }
                    else {
                        callback(null, resultado);
                    }
                })
        })
    }


    addPartida(name, estado, userId, callback) {
        this.pool.getConnection((err, connection) => {
            //connection.release();
            if (err) { callback(err); return; }
            //¿como introducimos las opciones?
            connection.query("INSERT INTO partidas (nombre, estado)" +
                " VALUES (?, ?)", [name, estado],
                function (err, resultado) {
                    if (err) { callback(err); return; }
                    connection.query("INSERT INTO juega_en (idPartida, idUsuario)" +
                        " VALUES (?, ?)", [resultado.insertId, userId],
                        function (err) {
                            if (err) { callback(err); return; }
                            callback();
                        })
                        connection.release(); //Preguntar al profe mañana
                })
        })
    }

    /**
     * Dado un ID de partida, devuelve un objeto con todas los jugadores que estan
     * jugando en dicha partida
     * 
     * @param {*} idPartida Identificador de la partida
     * @param {*} callback 
     */
    comprobarPartida(idPartida, callback) {
        this.pool.getConnection((err, connection) => {
            if (err) { callback(err); return; }
            connection.query("SELECT DISTINCT juega_en.idUsuario FROM partidas JOIN juega_en ON juega_en.idPartida = ?", 
            [idPartida], function (err, resultado) {
                    connection.release();
                    if (err) {callback(err); return; }
                    callback(null, resultado)
                })
        })
    }


    insertUserInGame(idPartida,idUsuario, callback){
        this.pool.getConnection((err, connection) => {
            if (err) { callback(err); return; }
            connection.query("INSERT INTO `juega_en`(`idUsuario`, `idPartida`) VALUES (?,?)", 
            [idUsuario,idPartida], 
            function (err, resultado) {
                    connection.release();
                    if (err) {callback(err); return; }
                    callback();
            })
        })
    }

    getPartidaInfo(idPartida, callback) {
        this.pool.getConnection((err, connection) => {
            //connection.release();
            if (err) { callback(err); return; }
            //¿como introducimos las opciones?
            connection.query("SELECT DISTINCT j.idUsuario, (SELECT login FROM usuarios where usuarios.id = j.idUsuario) as usuario, p.estado, p.nombre " + 
            "FROM partidas p JOIN juega_en j ON j.idPartida = ? where p.id=?", 
            [idPartida, idPartida], function (err, resultado) {
                    connection.release();
                    if (err) {callback(err); return; }
                    callback(null, resultado)
                })
        })
    }
    getPlayersInGame(idPartida,callback){
        this.pool.getConnection((err, connection) => {
            if (err) { callback(err); return; }
            connection.query("SELECT idUsuario FROM juega_en WHERE idPartida=? ", 
            [idPartida], function (err, resultado) {
                    connection.release();
                    if (err) {callback(err); return; }
                    callback(null, resultado)
                })
        })
    }
    updateEstadoPartida(idPartida, estado, callback) {
        this.pool.getConnection((err, connection) => {
            //connection.release();
            if (err) { callback(err); return; }
            //¿como introducimos las opciones?
            connection.query("UPDATE partidas set estado=? where partidas.id =? ", 
            [estado, idPartida], function (err, resultado) {
                console.log(resultado);
                    connection.release();
                    if (err) {callback(err); return; }
                    callback();
                })
        })
    }

    getPlayersInGame(idPartida,callback){
        this.pool.getConnection((err, connection) => {
            if (err) { callback(err); return; }
            connection.query("SELECT idUsuario FROM juega_en WHERE idPartida=? ", 
            [idPartida], function (err, resultado) {
                    connection.release();
                    if (err) {callback(err); return; }
                    callback(null, resultado)
                })
        })
    }

}

module.exports = {
    DAOGames: DAOGames
}