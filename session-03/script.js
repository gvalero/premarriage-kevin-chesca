const form = document.querySelector("#homeworkForm");
const output = document.querySelector("#output");
const saveStatus = document.querySelector("#saveStatus");
const storageKey = "kevin-chesca-session-03-book-homework";

const labels = {
  conflictResearch: "1. Investigación sobre conflicto después del matrimonio",
  sacrificeAndResentment: "2. Sacrificio genuino y resentimiento",
  pauseRepairPlan: "3. Plan para pausa, regreso y reparación",
  jesusServiceReflection: "4. Jesús, autoridad y servicio",
  reconciliationReflection: "5. Dios, iniciativa y reconciliación",
  practiceReflection: "6. Reflexión sobre la práctica de decisión",
};

function collectAnswers() {
  const data = new FormData(form);
  return Object.fromEntries([...data.entries(), ["exportedAt", new Date().toISOString()]]);
}

function formatAnswers() {
  const answers = collectAnswers();
  const lines = [
    "Kevin y Chesca — Tarea 3: Comunicación, diferencias y reparación",
    `Nombre: ${answers.name || "(sin seleccionar)"}`,
    `Exportado: ${new Date(answers.exportedAt).toLocaleString("es")}`,
    "Fecha límite: viernes 25 de septiembre de 2026",
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
  link.download = `${name}-tarea-03-prematrimonio.txt`;
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
