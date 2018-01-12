"use strict";

class DAOUsers {
    /**
     * Inicializa el DAO de usuarios.
     * 
     * @param {Pool} pool Pool de conexiones MySQL. Todas las operaciones
     *                    sobre la BD se realizarán sobre este pool.
     */
    constructor(pool) {
        this.pool = pool;
    }

    /**
     * Determina si un determinado usuario aparece en la BD con la contraseña
     * pasada como parámetro.
     * 
     * Es una operación asíncrona, de modo que se llamará a la función callback
     * pasando, por un lado, el objeto Error (si se produce, o null en caso contrario)
     * y, por otro lado, un booleano indicando el resultado de la operación
     * (true => el usuario existe, false => el usuario no existe o la contraseña es incorrecta)
     * En caso de error error, el segundo parámetro de la función callback será indefinido.
     * 
     * @param {string} name Identificador del usuario a buscar
     * @param {string} password Contraseña a comprobar
     * @param {function} callback Función que recibirá el objeto error y el resultado
     */
    isUserCorrect(name, password, callback) {

        /* Implementar */
        this.pool.getConnection((err, connection) => {
            if (err) { callback(err); return; }
            connection.query("SELECT id, login, password FROM usuarios WHERE login = ? AND password = ?", [name, password],
                (err, filas) => {
                    /* Conecction release se puede poner justo aqui, ya que tenemos la
                    información de la tabla en filas y no vamos a necesitarlo más */
                    connection.release();
                    if (err) { callback(err); return; }
                    if (filas.length === 0) {
                        callback(null, -1);
                    }
                    else {
                        callback(null, filas[0].id);
                    }
                })
        })

    }

    /**
     * Comprueba en la base de datos si existe un usuario con el mismo nombre
     * 
     * @param {*} name Nombre de usuario, SÓLO puede existir un nombre igual
     * @param {*} callback 
     */
    userExist(name, callback) {
        this.pool.getConnection((err, connection) => {
            if (err) { callback(err); return; }
            connection.query("SELECT login FROM usuarios WHERE login = ?", [name],
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

    insertUser(name, password, callback) {
        this.pool.getConnection((err, connection) => {
            if (err) { callback(err); return; }
            connection.query("INSERT INTO usuarios (login, password)" +
                " VALUES (?, ?, ?, ?, ?, ?)", [name, password],
                function (err, resultado) {
                    if (err) { callback(err); return; }
                    else {
                        callback(null, resultado.insertId);
                        connection.release();
                    }
                })
        })
    }
}

module.exports = {
    DAOUsers: DAOUsers
}