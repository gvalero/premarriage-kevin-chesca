const form = document.querySelector("#homeworkForm");
const output = document.querySelector("#output");
const saveStatus = document.querySelector("#saveStatus");
const storageKey = "kevin-chesca-session-03-homework";

const labels = {
  conflictResearch: "1. Investigación sobre conflicto después del matrimonio",
  conflictPattern: "2. Mi patrón cuando una conversación se vuelve difícil",
  sacrificeAndResentment: "3. Sacrificio genuino y resentimiento",
  repairNeeds: "4. Lo que necesito para una reparación real",
  practiceAndPartnerPerspective: "5. Decisión practicada y perspectiva de mi pareja",
  commonGoodAndSafeguards: "6. Bien común, sacrificios y salvaguardas",
  practiceReflection: "7. Evaluación de la práctica y pregunta pendiente",
};

function collectAnswers() {
  const data = new FormData(form);
  return Object.fromEntries([...data.entries(), ["exportedAt", new Date().toISOString()]]);
}

function formatAnswers() {
  const answers = collectAnswers();
  const lines = [
    "Kevin y Chesca — Tarea 3: Conflicto, reparación y decisiones compartidas",
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
