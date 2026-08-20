const form = document.querySelector("#homeworkForm");
const output = document.querySelector("#output");
const saveStatus = document.querySelector("#saveStatus");
const storageKey = "kevin-chesca-session-01-homework";

const labels = {
  marriageHope: "Una cosa que espero que el matrimonio me dé",
  hopeWhy: "Por qué esa esperanza es importante",
  marriageFear: "Una cosa que me pone nervioso/a acerca del matrimonio",
  fearNeed: "Lo que necesito de mi pareja cuando aparece ese temor",
  familyInfluence: "Influencia de mi familia o relaciones anteriores",
  receiveLove: "Mis formas principales de recibir amor",
  feltLovedExample: "Una ocasión reciente en la que me sentí amado/a",
  partnerLove: "Las formas de amor que reconozco en mi pareja",
  loveAction: "Una acción de amor para esta semana",
  gospelSummary: "Mi resumen de la historia cristiana",
  gospelQuestion: "Lo que necesita más explicación",
  gospelDifficulty: "Lo que me parece más difícil de creer o aceptar",
  gospelImplication: "Lo que cambiaría si esta historia fuera verdadera",
  faithPosition: "Dónde diría que estoy hoy",
  learnedPartner: "Lo nuevo que comprendí acerca de mi pareja",
  coupleAction: "La acción que acordamos practicar",
  privateNote: "Tema privado para conversar",
};

function collectAnswers() {
  const data = new FormData(form);
  const answers = { exportedAt: new Date().toISOString() };

  for (const [key, value] of data.entries()) {
    if (Object.hasOwn(answers, key)) {
      answers[key] = Array.isArray(answers[key])
        ? [...answers[key], value]
        : [answers[key], value];
    } else {
      answers[key] = value;
    }
  }

  return answers;
}

function formatValue(value) {
  if (Array.isArray(value)) return value.join(", ");
  return value || "(sin respuesta)";
}

function formatAnswers() {
  const answers = collectAnswers();
  const lines = [
    "Kevin y Chesca — Tarea 1: Amor, expectativas y una historia mayor",
    `Nombre: ${answers.name || "(sin seleccionar)"}`,
    `Exportado: ${new Date(answers.exportedAt).toLocaleString("es")}`,
    "",
  ];

  for (const [key, label] of Object.entries(labels)) {
    lines.push(`${label}:`);
    lines.push(formatValue(answers[key]));
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
    alert("No se pudieron guardar las respuestas en este navegador. Descárgalas para no perderlas.");
  }
}

function restoreAnswers() {
  let saved;
  try {
    saved = localStorage.getItem(storageKey);
  } catch (error) {
    console.error("No se pudo acceder a las respuestas guardadas.", error);
    saveStatus.textContent = "El guardado local no está disponible";
    return;
  }

  if (!saved) return;

  try {
    const answers = JSON.parse(saved);
    for (const [key, value] of Object.entries(answers)) {
      const fields = form.elements[key];
      if (!fields) continue;

      if (fields instanceof RadioNodeList) {
        const selectedValues = Array.isArray(value) ? value : [value];
        for (const field of fields) {
          field.checked = selectedValues.includes(field.value);
        }
      } else {
        fields.value = value;
      }
    }
    saveStatus.textContent = "Respuestas anteriores recuperadas";
  } catch (error) {
    console.error("Las respuestas guardadas no se pudieron recuperar.", error);
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
  const text = formatAnswers();

  try {
    await navigator.clipboard.writeText(text);
    persistAnswers();
    refreshOutput();
    alert("Respuestas copiadas. Ya puedes pegarlas en WhatsApp, correo o Teams.");
  } catch (error) {
    console.error("No se pudieron copiar las respuestas.", error);
    alert("El navegador no permitió copiar. Usa el botón Descargar o copia desde la vista previa.");
  }
}

function downloadAnswers() {
  if (!checkRequiredFields()) return;
  const text = formatAnswers();
  const name = (form.elements.name.value || "respuesta")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-");
  const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;
  link.download = `${name}-tarea-01-prematrimonio.txt`;
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

