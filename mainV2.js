//Variables y constantes para los fetch
const apiUrl = "https://api.bustracker.mx/engine/get_reports.php";
const BTuser = "Klopez";
const uni_neg = "set_tij";
const ver = "1.1.0";

//constantes fetch ubicaciones
const bttkn_ubi = "9ke/9EGIWqg0CWeVL1KG27qi63xUPC2/hXTEqnE7Gxqi6abRF60NnOaS81Y4btYXIzCTZEnPOLvVQWAIttC56Q==";
const type_ubi = "get_trips_units_data"
const boundary_ubi = "------WebKitFormBoundaryAaDAbABKDNpSo2rG\r\nContent-Disposition: form-data; name=";

//constantes fetch viajes
const bttkn_viajes = "U2cEA4I6aFiVDGgUU95Z3+SQMVq4TNnyT0KrWIphCl3d+UPSsE1iKmCWTTQHaYxkiBNRkj6eY0B9e4xft76oGw==";
const type_viajes = "get_route_tracking"
const boundary_viajes = "------WebKitFormBoundarybkSO4te1Wl5GRuqh\r\nContent-Disposition: form-data; name=";
const tiempo_antes = "60";
const tiempo_despues = "10";


var viajes = {};
var ubicaciones = {};
var velocidades = {};
var perfilActivo;
var objetosFiltrados;
var array_perfiles;
var perfiles_filtrados;

var unidades_ubi = "";


var datos = [];



//La opción 4 en el tercer parámetro se utiliza para agregar sangría y facilitar la lectura del JSON generado. Puede ajustar el número de espacios según sus preferencias.
function replacer(key, value) {
  if (value === "") {
    return "";
  }
  return value;
}



//Funcion para obtener las ubicaciones
function rq_ubicaciones() {
  unidades_ubi = "";
  viajes.forEach((item) => {
    //const carro = ubicaciones.find(obj => obj.trip === item.trip);
    unidades_ubi = unidades_ubi + "," + item.trip;
  });
  unidades_ubi = unidades_ubi.substring(1);;
  //console.log(unidades_ubi);
  const body = boundary_ubi + "\"data[iuser]\"\r\n\r\n" + BTuser + "\r\n"+ 
  boundary_ubi + "\"data[bttkn]\"\r\n\r\n" + bttkn_ubi + "\r\n"+ 
  boundary_ubi + "\"data[ver]\"\r\n\r\n" + ver + "\r\n"+ 
  boundary_ubi + "\"data[trips_ids]\"\r\n\r\n" + unidades_ubi + "\r\n"+ 
  boundary_ubi + "\"type\"\r\n\r\n"+ type_ubi + "\r\n------WebKitFormBoundaryAaDAbABKDNpSo2rG--\r\n";

  fetch("https://api.bustracker.mx/engine/get_json.php", {
  "headers": {
    "accept": "application/json",
    "accept-language": "es-ES,es;q=0.9,en;q=0.8",
    "content-type": "multipart/form-data; boundary=----WebKitFormBoundaryAaDAbABKDNpSo2rG",
    "sec-ch-ua": "\"Google Chrome\";v=\"111\", \"Not(A:Brand\";v=\"8\", \"Chromium\";v=\"111\"",
    "sec-ch-ua-mobile": "?0",
    "sec-ch-ua-platform": "\"Windows\"",
    "sec-fetch-dest": "empty",
    "sec-fetch-mode": "cors",
    "sec-fetch-site": "same-site"
  },
  "referrer": "https://tracking.bustracker.mx/",
  "referrerPolicy": "strict-origin-when-cross-origin",
  "body": body,
  "method": "POST",
  "mode": "cors",
  "credentials": "omit"
  }).then(response => response.json())
  .then(data => {
    ubicaciones = data.trips;
    velocidades = data.units;
    //console.log(ubicaciones);
    //console.log(velocidades);
    actualizarMapa();
    if (document.getElementById("centrar_mapa").value === "0"){
      centrarMapa(markers, polygons);
    }
  }).catch(error => console.error(error));
}


//Funcion para obtener los viajes
function rq_viajes(){
  const body = "" + boundary_viajes + "\"data[iuser]\"\r\n\r\n" + BTuser + "\r\n" + 
  boundary_viajes + "\"data[bttkn]\"\r\n\r\n" + bttkn_viajes + "\r\n" + 
  boundary_viajes + "\"data[ver]\"\r\n\r\n" + ver + "\r\n" + 
  boundary_viajes + "\"data[bunit]\"\r\n\r\n" + uni_neg + "\r\n" + 
  boundary_viajes + "\"data[anticipation_minutes]\"\r\n\r\n" + tiempo_antes + "\r\n" + 
  boundary_viajes + "\"data[after_trip_minutes]\"\r\n\r\n" + tiempo_despues + "\r\n" + 
  boundary_viajes + "\"type\"\r\n\r\n" + type_viajes + "\r\n------WebKitFormBoundarybkSO4te1Wl5GRuqh--\r\n";


  fetch("https://api.bustracker.mx/engine/get_json.php", {
  "headers": {
    "accept": "application/json",
    "accept-language": "es-ES,es;q=0.9,en;q=0.8",
    "content-type": "multipart/form-data; boundary=----WebKitFormBoundarybkSO4te1Wl5GRuqh",
    "sec-ch-ua": "\"Google Chrome\";v=\"111\", \"Not(A:Brand\";v=\"8\", \"Chromium\";v=\"111\"",
    "sec-ch-ua-mobile": "?0",
    "sec-ch-ua-platform": "\"Windows\"",
    "sec-fetch-dest": "empty",
    "sec-fetch-mode": "cors",
    "sec-fetch-site": "same-site"
  },
  "referrer": "https://tracking.bustracker.mx/",
  "referrerPolicy": "strict-origin-when-cross-origin",
  "body": body,
  "method": "POST",
  "mode": "cors",
  "credentials": "omit"
  }).then(response => response.json())
  .then(data => {
    viajes = data;
    //console.log(viajes);
    rq_ubicaciones();
        //esperamos 11 segundos para que se vuelva a solicitar la flota
    setTimeout(() => {
      rq_ubicaciones();
      setTimeout(() => {
        //esperamos 11 segundos para que se vuelva a solicitar VL, haciendo un total de 22 segundos
        rq_viajes();
      }, 10000);
    }, 10000);
  })
  .catch(error => console.error(error));
}

rq_viajes();



function filtrarObjetos(){
  // != "" 
  // === ""
  //10010 - L
  if(perfilActivo.planta != "" & perfilActivo.h_ini1 === "" & perfilActivo.h_ini2 === "" & perfilActivo.h_fin1 != "" & perfilActivo.h_fin2 === ""){
  //objetosFiltrados = datos.filter(objeto => ((objeto['group'].includes(perfilActivo.planta))&(objeto['end_time'].includes(perfilActivo.h_fin1))));
  objetosFiltrados = viajes.filter(objeto => ((objeto['shift'].includes(perfilActivo.in_out))&
  (objeto['group'].includes(perfilActivo.planta))&
  (objeto['end_time'].includes(perfilActivo.h_fin1))));
  }//10011 - L
  else if(perfilActivo.planta != "" & perfilActivo.h_ini1 === "" & perfilActivo.h_ini2 === "" & perfilActivo.h_fin1 != "" & perfilActivo.h_fin2 != ""){
  objetosFiltrados = viajes.filter(objeto => ((objeto['shift'].includes(perfilActivo.in_out))&
  (objeto['group'].includes(perfilActivo.planta))&
  (objeto['end_time'].includes(perfilActivo.h_fin1)||objeto['end_time'].includes(perfilActivo.h_fin2))));
  }//11011 - L
  else if(perfilActivo.planta != "" & perfilActivo.h_ini1 != "" & perfilActivo.h_ini2 === "" & perfilActivo.h_fin1 != "" & perfilActivo.h_fin2 != ""){
  objetosFiltrados = viajes.filter(objeto => ((objeto['shift'].includes(perfilActivo.in_out))&
  (objeto['group'].includes(perfilActivo.planta))&
  (objeto['start_time'].includes(perfilActivo.h_ini1))&
  (objeto['end_time'].includes(perfilActivo.h_fin1)||objeto['end_time'].includes(perfilActivo.h_fin2))));
  }//11111
  else if(perfilActivo.planta != "" & perfilActivo.h_ini1 != "" & perfilActivo.h_ini2 != "" & perfilActivo.h_fin1 != "" & perfilActivo.h_fin2 != ""){
  objetosFiltrados = viajes.filter(objeto => ((objeto['shift'].includes(perfilActivo.in_out))&
  (objeto['group'].includes(perfilActivo.planta))&
  (objeto['start_time'].includes(perfilActivo.h_ini1)||objeto['start_time'].includes(perfilActivo.h_ini2))&
  (objeto['end_time'].includes(perfilActivo.h_fin1)||objeto['end_time'].includes(perfilActivo.h_fin2))));
  }//11000
  else if(perfilActivo.planta != "" & perfilActivo.h_ini1 != "" & perfilActivo.h_ini2 === "" & perfilActivo.h_fin1 === "" & perfilActivo.h_fin2 === ""){
  objetosFiltrados = viajes.filter(objeto => ((objeto['shift'].includes(perfilActivo.in_out))&
  (objeto['group'].includes(perfilActivo.planta))&
  (objeto['start_time'].includes(perfilActivo.h_ini1))));
  }//11100
  else if(perfilActivo.planta != "" & perfilActivo.h_ini1 != "" & perfilActivo.h_ini2 != "" & perfilActivo.h_fin1 === "" & perfilActivo.h_fin2 === ""){
  objetosFiltrados = viajes.filter(objeto => ((objeto['shift'].includes(perfilActivo.in_out))&
  (objeto['group'].includes(perfilActivo.planta))&
  (objeto['start_time'].includes(perfilActivo.h_ini1)||objeto['start_time'].includes(perfilActivo.h_ini2))));
  }

  //console.log(objetosFiltrados);
}



function cargar_perfiles(){
  const tabla_datos = document.querySelector('#tb_datos');
  const tableBody = tabla_datos.querySelector('tbody');

  while (tableBody.rows.length > 0) {
    tableBody.deleteRow(0);
  }

  

  // Recorre cada objeto en el arreglo
  array_perfiles.forEach((obj, index) => {
  // Crea una nueva fila para el objeto
  const row = document.createElement('tr');

  // Agregar un evento "click" a cada fila de la tabla, excepto la última
  if (index < array_perfiles.length) {
  row.addEventListener('click', () => {
    //eliminarMarcadores();
    // Obtener el texto de la fila que se hizo clic
    const selectedRow = row.textContent.trim();
    //console.log(`La fila seleccionada es: ${selectedRow}`);
    perfilActivo = array_perfiles.find(obj => obj.perfil === selectedRow);
    document.querySelector('#perfil').value = perfilActivo.perfil;
    document.querySelector('#planta').value = perfilActivo.planta;
    document.querySelector('#in_out').value = perfilActivo.in_out;
    document.querySelector('#h_ini1').value = perfilActivo.h_ini1;
    document.querySelector('#h_ini2').value = perfilActivo.h_ini2;
    document.querySelector('#h_fin1').value = perfilActivo.h_fin1;
    document.querySelector('#h_fin2').value = perfilActivo.h_fin2;


    actualizarMapa();
    if (document.getElementById("centrar_mapa").value === "0" || document.getElementById("centrar_mapa").value === "1"){
      centrarMapa(markers, polygons);
    }
  });
  }

  // Agrega cada propiedad del objeto como una celda en la fila
  row.innerHTML = `
  <td>${obj['perfil']}</td>
  `;

  // Agrega la fila a la tabla
  tableBody.appendChild(row);
  });
}