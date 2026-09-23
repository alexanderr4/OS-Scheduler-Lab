import { addSegment, byArrival, finalize, selectionEvent } from './common.js'

export function simulateFCFS(processes) {
  const timeline = []
  const events = []
  let clock = 0
  for (const process of [...processes].sort(byArrival)) {
    if (clock < process.arrival) addSegment(timeline, 'idle', clock, process.arrival)
    clock = Math.max(clock, process.arrival)
    addSegment(timeline, process.id, clock, clock + process.burst)
    events.push(selectionEvent(clock, process.id, `${process.name} llegó primero entre los procesos disponibles, por eso FCFS le entrega la CPU.`))
    clock += process.burst
  }
  return finalize(processes, timeline, 'FCFS', events)
}
