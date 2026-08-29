const form = document.querySelector("#homeworkForm");
const output = document.querySelector("#output");
const saveStatus = document.querySelector("#saveStatus");
const storageKey = "kevin-chesca-session-02-homework";

const labels = {
  bookHelpful: "Una idea útil o verdadera del capítulo",
  bookQuestion: "Una afirmación que cuestiono o no entiendo",
  bookConversation: "Una expectativa del capítulo y las responsabilidades de Efesios 5",
  marriageChanges: "Tres cosas que creo que cambiarán al casarnos",
  unspokenExpectations: "Expectativas que podríamos estar dando por sentadas",
  familyModel: "Modelo de roles en mi familia",
  familyLessons: "Una práctica familiar para repetir y una para evitar",
  roleSources: "Fuentes de mi idea de esposo/a",
  ownershipMap: "Mapa de responsabilidades visibles e invisibles",
  invisibleLoad: "Responsabilidad invisible que temo cargar solo/a",
  decisionOneCares: "Decisión cuando a uno le importa más",
  decisionDisagree: "Decisión cuando ambos discrepan",
  decisionNeither: "Decisión cuando ninguno quiere encargarse",
  decisionPressure: "Decisión bajo presión",
  easygoingReflection: "Reflexión sobre ser easygoing",
  jesusService: "Cómo Jesús usa su posición",
  serviceAndGrace: "Servicio sin control y gracia sin llevar cuentas",
  faithQuestion: "Pregunta o desacuerdo espiritual",
  sharedAlignment: "Nuestra mayor coincidencia",
  sharedDifference: "Nuestra mayor sorpresa o diferencia",
  twoWeekExperiment: "Nuestro experimento de dos semanas",
};

function collectAnswers() {
  const data = new FormData(form);
  return Object.fromEntries([...data.entries(), ["exportedAt", new Date().toISOString()]]);
}

function formatAnswers() {
  const answers = collectAnswers();
  const lines = [
    "Kevin y Chesca — Tarea 2: Roles, responsabilidades y decisiones",
    `Nombre: ${answers.name || "(sin seleccionar)"}`,
    `Exportado: ${new Date(answers.exportedAt).toLocaleString("es")}`,
    "",
  ];

  for (const [key, label] of Object.entries(labels)) {
    lines.push(`${label}:`);
    lines.push(answers[key] || "(sin respuesta)");
    lines.push("");
  }

  return lines.join("\n");
}

function refreshOutput() {
  output.textContent = formatAnswers();
}

function persistAnswers(showConfirmation = false) {
  try {
    localStorage.setItem(storageKey, JSON.stringify(collectAnswers()));
    saveStatus.textContent = `Guardado en este dispositivo · ${new Date().toLocaleTimeString("es", {
      hour: "2-digit",
      minute: "2-digit",
    })}`;
    if (showConfirmation) alert("Las respuestas quedaron guardadas en este dispositivo.");
  } catch (error) {
    console.error("No se pudieron guardar las respuestas.", error);
    saveStatus.textContent = "No se pudo guardar";
    alert("No se pudieron guardar las respuestas. Descárgalas para no perderlas.");
  }
}

function restoreAnswers() {
  try {
    const saved = localStorage.getItem(storageKey);
    if (!saved) return;
    const answers = JSON.parse(saved);
    for (const [key, value] of Object.entries(answers)) {
      if (form.elements[key]) form.elements[key].value = value;
    }
    saveStatus.textContent = "Respuestas anteriores recuperadas";
  } catch (error) {
    console.error("No se pudieron recuperar las respuestas.", error);
    saveStatus.textContent = "No se pudo recuperar el guardado anterior";
  }
}

function checkRequiredFields() {
  if (form.reportValidity()) return true;
  alert("Completa los campos obligatorios antes de copiar o descargar.");
  return false;
}

async function copyAnswers() {
  if (!checkRequiredFields()) return;
  try {
    await navigator.clipboard.writeText(formatAnswers());
    persistAnswers();
    refreshOutput();
    alert("Respuestas copiadas. Ya puedes pegarlas en WhatsApp, correo o Teams.");
  } catch (error) {
    console.error("No se pudieron copiar las respuestas.", error);
    alert("El navegador no permitió copiar. Usa Descargar o copia desde la vista previa.");
  }
}

function downloadAnswers() {
  if (!checkRequiredFields()) return;
  const name = (form.elements.name.value || "respuesta")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-");
  const blob = new Blob([formatAnswers()], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `${name}-tarea-02-prematrimonio.txt`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
  persistAnswers();
  refreshOutput();
}

let saveTimer;
form.addEventListener("input", () => {
  refreshOutput();
  saveStatus.textContent = "Guardando…";
  clearTimeout(saveTimer);
  saveTimer = setTimeout(() => persistAnswers(), 450);
});

form.addEventListener("submit", (event) => event.preventDefault());
form.addEventListener("reset", () => {
  clearTimeout(saveTimer);
  try {
    localStorage.removeItem(storageKey);
  } catch (error) {
    console.error("No se pudo borrar el guardado local.", error);
    alert("No se pudo borrar el guardado local de este navegador.");
  }
  setTimeout(() => {
    refreshOutput();
    saveStatus.textContent = "Formulario borrado";
  }, 0);
});

document.querySelector("#saveBtn").addEventListener("click", () => persistAnswers(true));
document.querySelector("#copyBtn").addEventListener("click", copyAnswers);
document.querySelector("#downloadBtn").addEventListener("click", downloadAnswers);

restoreAnswers();
refreshOutput();
