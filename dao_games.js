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

    getGames(idUsuario,callback){
        this.pool.getConnection((err, connection) => {
            if (err) { callback(err); return; }
            connection.query("SELECT partidas.id, partidas.nombre FROM juega_en JOIN partidas ON idPartida=id" +
                " WHERE idUsuario=?", [idUsuario],
                function (err, resultado) {
                    if (err) { callback(err); return; }
                    else {
                        callback(resultado);
                        connection.release();
                    }
                })
        })
    }
}

module.exports = {
    DAOGames: DAOGames
}