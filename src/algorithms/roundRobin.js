import { addSegment, byArrival, finalize, selectionEvent } from './common.js'

export function simulateRoundRobin(processes, quantum) {
  const ordered = [...processes].sort(byArrival)
  const remaining = new Map(processes.map((process) => [process.id, process.burst]))
  const queue = []
  const timeline = []
  const events = []
  let clock = 0
  let cursor = 0
  while (cursor < ordered.length || queue.length) {
    while (cursor < ordered.length && ordered[cursor].arrival <= clock) queue.push(ordered[cursor++])
    if (!queue.length) {
      const next = ordered[cursor]
      addSegment(timeline, 'idle', clock, next.arrival)
      clock = next.arrival
      continue
    }
    const process = queue.shift()
    const slice = Math.min(quantum, remaining.get(process.id))
    events.push(selectionEvent(clock, process.id, `${process.name} recibe un turno de ${slice} unidades porque Round Robin reparte la CPU en quantums de ${quantum}.`))
    addSegment(timeline, process.id, clock, clock + slice)
    clock += slice
    remaining.set(process.id, remaining.get(process.id) - slice)
    while (cursor < ordered.length && ordered[cursor].arrival <= clock) queue.push(ordered[cursor++])
    if (remaining.get(process.id) > 0) queue.push(process)
  }
  return finalize(processes, timeline, 'Round Robin', events)
}
