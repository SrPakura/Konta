// Variable temporal para guardar el usuario seleccionado
let currentUser = null;

function selectUser(name) {
    console.log("Usuario seleccionado:", name);
    currentUser = name;
    
    // Aquí más tarde pondremos la lógica para cambiar de pantalla
    alert("Has seleccionado a: " + name + ". Vamos a la siguiente pantalla...");
}
