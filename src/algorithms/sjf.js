import { addSegment, byArrival, finalize, selectionEvent } from './common.js'

export function simulateSJF(processes) {
  const remaining = [...processes]
  const timeline = []
  const events = []
  let clock = 0
  while (remaining.length) {
    const available = remaining.filter((process) => process.arrival <= clock)
    if (!available.length) {
      const nextArrival = [...remaining].sort(byArrival)[0].arrival
      addSegment(timeline, 'idle', clock, nextArrival)
      clock = nextArrival
      continue
    }
    const process = available.sort((left, right) => left.burst - right.burst || byArrival(left, right))[0]
    events.push(selectionEvent(clock, process.id, `${process.name} tiene el trabajo más corto (${process.burst} unidades) entre los que esperan.`))
    addSegment(timeline, process.id, clock, clock + process.burst)
    clock += process.burst
    remaining.splice(remaining.indexOf(process), 1)
  }
  return finalize(processes, timeline, 'SJF', events)
}
