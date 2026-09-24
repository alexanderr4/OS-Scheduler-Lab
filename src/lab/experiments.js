const colors = ['#67e8c4', '#ffae64', '#f48caa', '#8ab4ff', '#e7d66b', '#c5a6ed']

export const academicExperiments = [
  { id: 'convoy', icon: '01', title: 'Efecto convoy', objective: 'Observar cómo un trabajo largo al principio retrasa a los cortos.', processes: [{ id: 1, name: 'P1', arrival: 0, burst: 12, priority: 2 }, { id: 2, name: 'P2', arrival: 1, burst: 2, priority: 1 }, { id: 3, name: 'P3', arrival: 2, burst: 3, priority: 3 }] },
  { id: 'small-quantum', icon: '02', title: 'Quantum muy pequeño', objective: 'Observar más turnos y cambios de contexto.', quantum: 1, processes: [{ id: 1, name: 'P1', arrival: 0, burst: 6, priority: 2 }, { id: 2, name: 'P2', arrival: 0, burst: 5, priority: 1 }, { id: 3, name: 'P3', arrival: 0, burst: 4, priority: 3 }] },
  { id: 'large-quantum', icon: '03', title: 'Quantum muy grande', objective: 'Comparar Round Robin con turnos que casi no interrumpen.', quantum: 10, processes: [{ id: 1, name: 'P1', arrival: 0, burst: 6, priority: 2 }, { id: 2, name: 'P2', arrival: 0, burst: 5, priority: 1 }, { id: 3, name: 'P3', arrival: 0, burst: 4, priority: 3 }] },
  { id: 'simultaneous', icon: '04', title: 'Llegadas simultáneas', objective: 'Ver cómo las reglas rompen los empates.', processes: [{ id: 1, name: 'P1', arrival: 0, burst: 7, priority: 2 }, { id: 2, name: 'P2', arrival: 0, burst: 2, priority: 1 }, { id: 3, name: 'P3', arrival: 0, burst: 4, priority: 3 }] },
  { id: 'progressive', icon: '05', title: 'Llegadas progresivas', objective: 'Seguir decisiones con procesos que aparecen durante la ejecución.', processes: [{ id: 1, name: 'P1', arrival: 0, burst: 7, priority: 2 }, { id: 2, name: 'P2', arrival: 2, burst: 2, priority: 1 }, { id: 3, name: 'P3', arrival: 5, burst: 4, priority: 3 }] },
  { id: 'long', icon: '06', title: 'Un proceso extremadamente largo', objective: 'Comparar la espera producida por una ráfaga dominante.', processes: [{ id: 1, name: 'P1', arrival: 0, burst: 18, priority: 3 }, { id: 2, name: 'P2', arrival: 1, burst: 2, priority: 1 }, { id: 3, name: 'P3', arrival: 3, burst: 2, priority: 2 }] },
  { id: 'priority', icon: '07', title: 'Prioridades que cambian', objective: 'Preparar una prioridad alta que llega mientras la CPU trabaja.', processes: [{ id: 1, name: 'P1', arrival: 0, burst: 9, priority: 4 }, { id: 2, name: 'P2', arrival: 3, burst: 3, priority: 1 }, { id: 3, name: 'P3', arrival: 4, burst: 2, priority: 3 }] },
  { id: 'late-short', icon: '08', title: 'El corto llega tarde', objective: 'Comprobar cuándo una llegada tardía todavía puede cambiar la decisión.', processes: [{ id: 1, name: 'P1', arrival: 0, burst: 9, priority: 2 }, { id: 2, name: 'P2', arrival: 4, burst: 1, priority: 1 }, { id: 3, name: 'P3', arrival: 1, burst: 5, priority: 3 }] },
  { id: 'many-short', icon: '09', title: 'Muchos procesos cortos', objective: 'Comparar el trato de una carga con muchas ráfagas pequeñas.', processes: Array.from({ length: 5 }, (_, index) => ({ id: index + 1, name: `P${index + 1}`, arrival: index, burst: 1 + (index % 3), priority: 1 + (index % 4) })) },
  { id: 'preemption', icon: '10', title: 'Expropiación vs no expropiación', objective: 'Contrastar prioridad NP con prioridad expropiativa.', processes: [{ id: 1, name: 'P1', arrival: 0, burst: 10, priority: 4 }, { id: 2, name: 'P2', arrival: 2, burst: 3, priority: 1 }, { id: 3, name: 'P3', arrival: 3, burst: 2, priority: 2 }] },
].map((experiment) => ({ ...experiment, processes: experiment.processes.map((process, index) => ({ ...process, color: colors[index % colors.length] })) }))

export function normalizeProcesses(processes) {
  return processes.map((process, index) => ({ ...process, color: process.color || colors[index % colors.length] }))
}

export function generateScenario({ count, arrivalMax, burstMax, priorityMax }) {
  return normalizeProcesses(Array.from({ length: count }, (_, index) => ({ id: index + 1, name: `P${index + 1}`, arrival: Math.floor(Math.random() * (arrivalMax + 1)), burst: Math.floor(Math.random() * burstMax) + 1, priority: Math.floor(Math.random() * priorityMax) + 1 })))
}
