import { simulateFCFS } from './fcfs.js'
import { simulateSJF } from './sjf.js'
import { simulateSRTF } from './srtf.js'
import { simulateRoundRobin } from './roundRobin.js'
import { simulatePriorityNonPreemptive, simulatePriorityPreemptive } from './priority.js'

export const algorithms = [
  { key: 'fcfs', index: '01', name: 'FCFS', detail: 'El primero en llegar', accent: 'mint', run: simulateFCFS },
  { key: 'sjf', index: '02', name: 'SJF', detail: 'El trabajo más corto primero', accent: 'orange', run: simulateSJF },
  { key: 'srtf', index: '03', name: 'SRTF', detail: 'El menor tiempo restante', accent: 'pink', run: simulateSRTF },
  { key: 'rr', index: '04', name: 'Round Robin', detail: 'Todos reciben un turno', accent: 'blue', run: simulateRoundRobin },
  { key: 'priority-np', index: '05', name: 'Prioridad NP', detail: 'Prioridad, sin interrupción', accent: 'yellow', run: simulatePriorityNonPreemptive },
  { key: 'priority-p', index: '06', name: 'Prioridad P', detail: 'Prioridad, con interrupción', accent: 'violet', run: simulatePriorityPreemptive },
]

export { simulateFCFS, simulateSJF, simulateSRTF, simulateRoundRobin, simulatePriorityNonPreemptive, simulatePriorityPreemptive }
