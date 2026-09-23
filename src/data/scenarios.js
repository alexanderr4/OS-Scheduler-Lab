export const exampleProcesses = [
  { id: 1, name: 'P1', arrival: 0, burst: 7, priority: 2, color: '#67e8c4' },
  { id: 2, name: 'P2', arrival: 1, burst: 4, priority: 1, color: '#ffae64' },
  { id: 3, name: 'P3', arrival: 2, burst: 2, priority: 3, color: '#f48caa' },
  { id: 4, name: 'P4', arrival: 3, burst: 5, priority: 2, color: '#8ab4ff' },
  { id: 5, name: 'P5', arrival: 5, burst: 3, priority: 4, color: '#e7d66b' },
]

export const scenarios = [
  { id: 'queue', icon: '01', title: 'La fila del supermercado', description: 'Una persona llega antes que otra y espera su turno. Ideal para entender FCFS.', processes: exampleProcesses.slice(0, 3) },
  { id: 'short', icon: '02', title: 'Trabajos cortos vs largos', description: 'Compara cómo cambia la espera cuando se atienden primero las tareas pequeñas.', processes: exampleProcesses.slice(0, 4) },
  { id: 'surprise', icon: '03', title: 'Llegadas inesperadas', description: 'Nuevos procesos aparecen mientras la CPU ya está trabajando.', processes: exampleProcesses },
]
