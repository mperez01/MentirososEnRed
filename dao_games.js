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

    getGames(name, callback) {
        this.pool.getConnection((err, connection) => {
            if (err) { callback(err); return; }
            connection.query("SELECT DISTINCT partidas.id, partidas.nombre, juega_en.idUsuario FROM juega_en JOIN partidas WHERE " + 
            " idUsuario=(SELECT usuarios.id FROM usuarios WHERE usuarios.login=?)", [name],
                function (err, resultado) {
                    if (err) { callback(err); return; }
                    else {
                        callback(null, resultado);
                        connection.release();
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
                        connection.release();
                })
        })
    }

    partidaExist(name, callback) {
        this.pool.getConnection((err, connection) => {
            if (err) { callback(err); return; }
            connection.query("SELECT nombre FROM partidas WHERE nombre = ?", [name],
                (err, filas) => {
                    /* Conecction release se puede poner justo aqui, ya que tenemos la
                    información de la tabla en filas y no vamos a necesitarlo más */
                    connection.release();
                    if (err) { callback(err); return; }
                    if (filas.length === 0) {
                        callback(null, -1);
                    }
                    else {
                        callback(null, filas[0].login);
                    }
                })
        })
    }


}

module.exports = {
    DAOGames: DAOGames
}