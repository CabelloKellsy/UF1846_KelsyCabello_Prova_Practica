const express = require('express')
const app = express();

//para gestionar las rutas de los ficheros
const path = require('node:path');

//obtener el numero de puerto
process.loadEnvFile();
const PORT = process.env.PORT
console.log(PORT);

//cargar los datos
const datos = require('../data/ebooks.json');

//para que pueda leer los ficheros estaticos que estan dentro de public
app.use(express.static(path.join(__dirname, '../public')));
console.log(datos);

app.get("/", (request, response) => {
    response.sendFile(__dirname + '/index.html');
})

//ruta API global
app.get("/api", (request, response) => {
    response.json(datos);
});
//*********************************************** 01  *********************************************************************************** */

// /api : Devuelve la lista completa de autores ordenados alfabéticamente por apellido
datos.sort((a, b) => a.autor_apellido.localeCompare(b.autor_apellido, "es-ES"));

//*********************************************** 02  *********************************************************************************** */

// /api/apellido/[apellido del autor] : Devuelve la lista de los autores con el apellido indicado. Por ejemplo : /api/apellido/Dumas
app.get("/api/apellido/:autor_apellido", (request, response) => {
    const apellido = request.params.autor_apellido.toLocaleLowerCase(); //params devuelce un array
    const filtroAutor = datos.filter(autor => autor.autor_apellido.toLocaleLowerCase() === apellido);
    // console.log(filtroautor);
    if (filtroAutor.length == 0) {
        return response.status(404).send("No hay autor con este apellido")
    }
    response.json(filtroAutor)
})

//*********************************************** 03  *********************************************************************************** */

// /api/nombre_apellido/[nombre del autor]/[apellido del autor] : Devuelve la lista de los autores con el nombre y apellido indicado.
//Por ejemplo : /api/nombre_apellido/Alexandre/Dumas

app.get("/api/nombre_apellido/:autor_nombre/:autor_apellido", (request, response) => {
    const apellido = request.params.autor_apellido.toLocaleLowerCase(); //params devuelce un array
    const nombre = request.params.autor_nombre.toLocaleLowerCase(); //params devuelve un array
    const filtroAutor = datos.filter(autor => autor.autor_apellido.toLocaleLowerCase() === apellido && autor.autor_nombre.toLocaleLowerCase() === nombre);
    // console.log(filtroAutor); //muestra en consola
    if (filtroAutor.length == 0) {
        return response.status(404).send("No hay autores con este nombre y apellido")
    }
    response.json(filtroAutor)
})

//*********************************************** 04  *********************************************************************************** */

// /api/nombre?apellido=[primeras letras del apellido del autor] : Devuelve la lista de los autores con el nombre y primeras letras del apellido indicado.
// Por ejemplo : /api/nombre/Alexandre?apellido=Du
// Si no se introduce la búsqueda del apellido se mostrar el siguiente mensaje: "Falta el parámetro apellido"

app.get("/api/nombre/:nombre", (request, response) => {
    const nombre = request.params.nombre.toLocaleLowerCase();
    const apellido = request.query.apellido
    // Si no se incluye el apellido valdrá undefined
    // mostraremos un filtro solo por el nombre
    if (apellido == undefined || apellido === "") {
        return response.status(400).send("Falta el parámetro apellido");
    }

    if (apellido == undefined) {
        // Si no tenemos el apellido filtrar solo por el nombre
        const filtroAutor = datos.filter(autor => autor.autor_nombre.toLocaleLowerCase() == nombre)

        // Nos aseguramos que el array con los autors no esté vacío
        if (filtroAutor.length == 0) {
            return express.response.status(404).send("Autor no encontrado")
        }
        // Devolver el filtro solo por el nombre del autor
        return response.json(filtroAutor)
    }

    // console.log(nombre, apellido);

    // para saber cuantas letras tiene el apellido escrito por el usuario
    const letras = apellido.length

    const filtroAutor = datos.filter(autor => autor.autor_apellido.slice(0, letras).toLocaleLowerCase() == apellido && autor.autor_nombre.toLocaleLowerCase() == nombre)

    // Si no se encuentran coincidencias, mostrar un mensaje
    if (filtroAutor.length == 0) {
        return response.status(404).send("Autor no encontrado")
    }
    // Devolver los datos filtrados
    response.json(filtroAutor)
});


//*********************************************** 05  *********************************************************************************** */
// /api/edicion=[año de edición] : Devuelve la lista de las obras editadas en el año indicado. Por ejemplo : /api/edicion/2022

app.get("/api/edicion/:year", (request, response) => {
    let year = parseInt(request.params.year, 10);
    console.log(year);
    const filtroAutor = datos.flatMap(autor=>autor.obras.filter(busca=>busca.edicion === year));
    if(filtroAutor.length == 0){
        return response.status(404).send(`No hay obras editadas en este año ${year}`);
    };
    response.json(filtroAutor);
})



app.use((request, response) => response.status(404).sendFile(path.join(__dirname, '../public/img/error-404.jpg')));
app.listen(PORT, () => (console.log(`Server running on port ${PORT}`)));
