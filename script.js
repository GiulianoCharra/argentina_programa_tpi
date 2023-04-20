const $doc = document;

const regiones = {
  provincias: "provincias",
  departamentos: "departamentos",
  municipios: "municipios",
  localidades: "localidades",
  localidades_censales: "localidades_censales",
  asentamientos: "asentamientos",
  calles: "calles",
};

const enlaceRegiones = {
  provincias: "https://apis.datos.gob.ar/georef/api/provincias?",
  departamentos: "https://apis.datos.gob.ar/georef/api/departamentos?",
  municipios: "https://apis.datos.gob.ar/georef/api/municipios?",
  localidades: "https://apis.datos.gob.ar/georef/api/localidades?",
  localidades_censales: "https://apis.datos.gob.ar/georef/api/localidades-censales?",
  asentamientos: "https://apis.datos.gob.ar/georef/api/asentamientos?",
  calles: "https://apis.datos.gob.ar/georef/api/calles?",
};

$($doc).ready(() => {
  cargarEquipo();

  const form_contrato = $("#form-contrato");
  form_contrato.submit((event) => {
    if (form_contrato.valid()) {
      $("#modal-contrato").modal("hide");
      $("#modal-preview").modal("show");
      form_contrato.removeAttr("novalidate");
    }

    $("#btn-cancelar-envio-formulario-contrato").click(() => {
      $("#modal-contrato").modal("show");
    });

    $("#btn-confirmar-envio-formulario-contrato").click(() => {
      form_contrato.trigger("submit");
      form_contrato[0].reset();
      $("#modal-preview").modal("hide");
      $("#modal-contrato").modal("hide");
      $("#modal-envio-contrato-completado").modal("show");
    });

    form = $doc.getElementById("form-contrato");
    const datosFormulario = new FormData(form);
    cargarDatosPreview(datosFormulario);
    $("#btn-descargar-envio-formulario-contrato").click(async () => {
      let pdf = generarPDF(datosFormulario);
      await guardarArhivo(pdf);

      $("#modal-descarga-completa").modal("show");
    });

    event.preventDefault();
  });

  /** Carga las regiones */
  let id_provincia;
  let id_departamento;
  let id_municipio;
  let id_localidad;
  let id_localidad_censal;
  let id_asentamiento;

  // 1 -Carga las provincias
  let seccion = $("#contrato-provincia");
  cargarSeccionRegion(regiones.provincias, enlaceRegiones.provincias, seccion);

  // 2 - Carga los departamentos
  $("#contrato-provincia").change((e) => {
    seccion = $("#contrato-departamento");
    id_provincia = e.target.value;
    cargarSeccionRegion(
      regiones.departamentos,
      enlaceRegiones.departamentos + "&provincia=" + id_provincia + "&max=1000",
      seccion
    );
    $("#contrato-localidad").prop("disabled", true);
    $("#contrato-asentamiento").prop("disabled", true);
    // $("#contrato-calle").prop("disabled", true);
  });

  // 3 - Carga las localidades censales
  $("#contrato-departamento").change((e) => {
    seccion = $("#contrato-localidad");
    id_departamento = e.target.value;
    cargarSeccionRegion(
      regiones.localidades_censales,
      enlaceRegiones.localidades_censales +
        "&provincia=" +
        id_provincia +
        "&departamento=" +
        id_departamento +
        "&max=1000",
      seccion
    );
  });

  /* 3 - Carga las localidades
  $("#contrato-departamento").change((e) => {
    seccion = $("#contrato-localidad");
    id_departamento = e.target.value;
    cargarSeccionRegion(
      regiones.localidades,
      enlaceRegiones.localidades +
        "&provincia=" +
        id_provincia +
        "&departamento=" +
        id_departamento +
        "&max=1000",
      seccion
    );
  });
   */

  // 4 - Carga los barrios
  $("#contrato-localidad").change((e) => {
    seccion = $("#contrato-asentamiento");
    id_localidad_censal = e.target.value;
    cargarSeccionRegion(
      regiones.asentamientos,
      enlaceRegiones.asentamientos +
        "&provincia=" +
        id_provincia +
        "&departamento=" +
        id_departamento +
        "&localidad_censal=" +
        id_localidad_censal +
        "&max=1000",
      seccion
    );
  });

  //Carga las calles No se Usa por Ahora
  // $("#contrato-asentamiento").change((e) => {
  //   seccion = $("#contrato-calle");
  //   id_asentamiento = e.target.value;
  //   console.log(seccion);
  //   cargarSeccionRegion(
  //     regiones.calles,
  //     enlaceRegiones.calles +
  //       "&provincia=" +
  //       id_provincia +
  //       "&departamento=" +
  //       id_departamento +
  //       "&localidad_censal=" +
  //       id_localidad_censal +
  //       "&max=1000",
  //     seccion
  //   );
  // });

  const form_contacto = $("#form-contacto");
  form_contacto.submit((event) => {
    form_contacto.find("input:unchecked ");
    if (form_contacto.valid()) {
      $("#modal-contacto").modal("show");
      form_contacto.removeAttr("novalidate");
    }
    event.preventDefault();
  });

  $("#btn-confirmar-envio-formulario-contacto").click(() => {
    form_contacto.trigger("submit");
    form_contacto[0].reset();
    $("#modal-contacto").modal("hide");
  });

  $('a[href^="#"]').on("click", function (event) {
    var target = $(this.getAttribute("href"));
    if (target.length) {
      event.preventDefault();
      $("html, body")
        .stop()
        .animate(
          {
            scrollTop: target.offset().top - $("#menu-navegacion").outerHeight() - 40,
          },
          100
        );
    }
  });
});

/**
 * Se hace una consulta a una API para devolver los datos
 * @param {string} url direccion de la API a consultar
 * @returns retorna los datos obtenidos de la API
 */
function obtenerDatosAPI(url) {
  return fetch(url).then((response) => {
    return response.ok ? response.json() : Promise(reject);
  });
}

/**
 * Realiza la carga de los integrantes del equipo
 */
function cargarEquipo() {
  let url_api_equipo = "https://reqres.in/api/users?page=1";
  let Integrantes = obtenerDatosAPI(url_api_equipo);
  //Cargando los mimbros del equipo
  let equipo = $doc.createDocumentFragment();
  Integrantes.then((json) => {
    json.data.forEach((element) => {
      card = crearCardEquipo(element);
      $(equipo).append(card);
    });
    $("#listado-equipo").append(equipo);
  });
}

/**
 * Crea un elemento card de un miembro del equipo
 * @param {*} persona
 * @returns una card
 */
function crearCardEquipo(persona) {
  let e_avatar = persona.avatar;
  let e_nombre = persona.first_name;
  let e_apellido = persona.last_name;
  let e_mail = persona.email;

  let card = $doc.createElement("div");
  let card_body = $doc.createElement("div");
  let img = $doc.createElement("img");
  let nombre = $doc.createElement("p");
  let apellido = $doc.createElement("p");
  let mail = $doc.createElement("p");

  $(card).addClass("card pt-3 flex-column justify-content-center align-items-center");
  $(card_body).addClass(
    "card-body d-flex flex-column justify-content-between align-content-center text-center"
  );
  $(img).attr("src", e_avatar).addClass("card-img-top avatar");
  $(nombre).text(e_nombre).addClass("card-text fs-5");
  $(apellido).text(e_apellido).addClass("card-text fs-5");
  $(mail).text(e_mail).addClass("card-text fs-6");

  $(card).append(img, card_body);
  $(card_body).append(nombre, apellido, mail);

  return card;
}

/**
 * Esta es la funcion que busca y carga las regiones
 * @param {*} region
 * @param {*} enlaceRegion
 * @param {*} seccion
 */
function cargarSeccionRegion(region, enlaceRegion, seccion) {
  let opcion = $doc.createElement("option");
  $(opcion).attr({ disabled: true, selected: true, value: "" });
  $(opcion).text($(seccion).attr("region"));
  $(seccion).empty().prop("disabled", false).append(opcion);

  let subregiones = obtenerDatosAPI(enlaceRegion);
  subregiones.then((data) => {
    data[region].sort((a, b) => (a.nombre > b.nombre ? 1 : b.nombre > a.nombre ? -1 : 0));
    data[region].forEach((e) => {
      opcion = $doc.createElement("option");
      $(opcion).attr("value", e.nombre);
      $(opcion).text(e.nombre);
      $(seccion).append(opcion);
    });
  });
}

function cargarDatosPreview(datosFormulario) {
  $("#value-apellido").text(`${datosFormulario.get("contrato-apellido")}`);
  $("#value-nombre").text(`${datosFormulario.get("contrato-nombre")}`);
  $("#value-tipo-documento").text(`${datosFormulario.get("contrato-tipo-documento")}`);
  $("#value-documento").text(`${datosFormulario.get("contrato-documento")}`);
  $("#value-email").text(`${datosFormulario.get("contrato-email")}`);
  $("#value-telefono").text(`${datosFormulario.get("contrato-telefono")}`);
  $("#value-provincia").text(`${datosFormulario.get("contrato-provincia")}`);
  $("#value-departamento").text(`${datosFormulario.get("contrato-departamento")}`);
  $("#value-localidad").text(`${datosFormulario.get("contrato-localidad")}`);
  $("#value-asentamiento").text(`${datosFormulario.get("contrato-asentamiento")}`);
  $("#value-calle").text(`${datosFormulario.get("contrato-calle")}`);
  $("#value-numero").text(`${datosFormulario.get("contrato-numero")}`);
  $("#value-piso").text(`${datosFormulario.get("contrato-piso")}`);
  $("#value-depto").text(`${datosFormulario.get("contrato-depto")}`);
}

// Crea el PDF con su contenido
function generarPDF(datosFormulario) {
  // Crear el objeto jsPDF
  const pdf = new jsPDF();
  // Establecer los estilos de fuente y tamaño
  pdf.setFontSize(18);
  pdf.setFontStyle("bold");

  // Añadir el título del formulario
  pdf.text("Formulario de Contratación", 50, 20);

  // Añadir los campos de datos personales
  pdf.setFontSize(14);
  pdf.setFontStyle("bold");
  pdf.text("Datos Personales:", 20, 40);

  pdf.setFontSize(12);
  pdf.setFontStyle("normal");
  pdf.text(`Apellido: ${datosFormulario.get("contrato-apellido")}`, 25, 50);
  pdf.text(`Nombre: ${datosFormulario.get("contrato-nombre")}`, 25, 60);
  pdf.text(`Tipo Documento: ${datosFormulario.get("contrato-tipo-documento")}`, 25, 70);
  pdf.text(`Documento: ${datosFormulario.get("contrato-documento")}`, 25, 80);
  pdf.text(`Email: ${datosFormulario.get("contrato-email")}`, 25, 90);
  pdf.text(`Teléfono: ${datosFormulario.get("contrato-telefono")}`, 25, 100);

  // Añadir los campos de dirección
  pdf.setFontSize(14);
  pdf.setFontStyle("bold");
  pdf.text("Dirección:", 20, 130);

  pdf.setFontSize(12);
  pdf.setFontStyle("normal");
  pdf.text(`Provincia: ${datosFormulario.get("contrato-provincia")}`, 25, 140);
  pdf.text(`Departamento: ${datosFormulario.get("contrato-departamento")}`, 25, 150);
  pdf.text(`Localidad: ${datosFormulario.get("contrato-localidad")}`, 25, 160);
  pdf.text(`Barrio: ${datosFormulario.get("contrato-asentamiento")}`, 25, 170);
  pdf.text(`Calle: ${datosFormulario.get("contrato-calle")}`, 25, 180);
  pdf.text(`Numero: ${datosFormulario.get("contrato-numero")}`, 25, 190);
  pdf.text(`Piso: ${datosFormulario.get("contrato-piso")}`, 25, 200);
  pdf.text(`Departamento: ${datosFormulario.get("contrato-depto")}`, 25, 210);

  // Añadir líneas horizontales para separar los campos
  pdf.setLineWidth(0.5);
  pdf.line(20, 110, 190, 110);
  pdf.line(20, 220, 190, 220);

  //previewPDF();
  return pdf;
}

// Muesta un preview del PDF
async function previewPDF() {
  const contents = await pdf.output("arraybuffer");
  const blob = new Blob([contents], { type: "application/pdf" });
  const url = URL.createObjectURL(blob);
  $doc.write(`<iframe src="${url}" width="100%" height="100%"></iframe>`);
}

// Guarda el archivo PDF
async function guardarArhivo(pdf) {
  let fecha = new Date().toLocaleDateString().replaceAll("/", "-");

  let blob = pdf.output("blob");

  if (typeof window.FileSystemDirectoryHandle !== "undefined") {
    async function downloadFile(blob) {
      const nombre_archivo = {
        suggestedName: `contrato ${fecha}.pdf`,
      };
      const folder = await window.showSaveFilePicker(nombre_archivo, { startIn: "downloads" });
      const writable = await folder.createWritable();
      const contents = await blob.arrayBuffer();
      await writable.write(contents);
      await writable.close();

      // const folder = await window.showDirectoryPicker({ startIn: "downloads" });
      // let name = `${folder.name}/contrato ${fecha}.pdf`;
      // console.log(name);
      // pdf.save(name);
    }
    await downloadFile(blob);
  } else {
    let name = `contrato ${fecha}.pdf`;
    pdf.save(name);
  }
}
