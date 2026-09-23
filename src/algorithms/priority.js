import { addSegment, byArrival, finalize, selectionEvent } from './common.js'

function pickPriority(processes, remaining, clock) {
  return processes.filter((process) => process.arrival <= clock && remaining.get(process.id) > 0).sort((left, right) => left.priority - right.priority || byArrival(left, right))[0]
}

export function simulatePriorityNonPreemptive(processes) {
  const remaining = new Map(processes.map((process) => [process.id, process.burst]))
  const timeline = []
  const events = []
  let clock = 0
  let completed = 0
  while (completed < processes.length) {
    const process = pickPriority(processes, remaining, clock)
    if (!process) {
      const nextArrival = Math.min(...processes.filter((item) => remaining.get(item.id) > 0).map((item) => item.arrival))
      addSegment(timeline, 'idle', clock, nextArrival)
      clock = nextArrival
      continue
    }
    events.push(selectionEvent(clock, process.id, `${process.name} tiene la prioridad ${process.priority}; en este modelo no expropiativo conserva la CPU hasta terminar.`))
    addSegment(timeline, process.id, clock, clock + process.burst)
    clock += process.burst
    remaining.set(process.id, 0)
    completed += 1
  }
  return finalize(processes, timeline, 'Prioridad NP', events)
}

export function simulatePriorityPreemptive(processes) {
  const remaining = new Map(processes.map((process) => [process.id, process.burst]))
  const timeline = []
  const events = []
  let clock = 0
  let completed = 0
  while (completed < processes.length) {
    const process = pickPriority(processes, remaining, clock)
    if (!process) {
      const nextArrival = Math.min(...processes.filter((item) => remaining.get(item.id) > 0).map((item) => item.arrival))
      addSegment(timeline, 'idle', clock, nextArrival)
      clock = nextArrival
      continue
    }
    if (timeline.at(-1)?.processId !== process.id) events.push(selectionEvent(clock, process.id, `${process.name} toma la CPU por tener la prioridad ${process.priority}; si llega una prioridad mayor, puede ser interrumpido.`))
    addSegment(timeline, process.id, clock, clock + 1)
    remaining.set(process.id, remaining.get(process.id) - 1)
    clock += 1
    if (remaining.get(process.id) === 0) completed += 1
  }
  return finalize(processes, timeline, 'Prioridad P', events)
}
