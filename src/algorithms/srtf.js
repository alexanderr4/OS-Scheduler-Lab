import { addSegment, byArrival, finalize, selectionEvent } from './common.js'

export function simulateSRTF(processes) {
  const remaining = new Map(processes.map((process) => [process.id, process.burst]))
  const timeline = []
  const events = []
  let clock = 0
  let completed = 0
  while (completed < processes.length) {
    const available = processes.filter((process) => process.arrival <= clock && remaining.get(process.id) > 0).sort((left, right) => remaining.get(left.id) - remaining.get(right.id) || byArrival(left, right))
    if (!available.length) {
      const nextArrival = Math.min(...processes.filter((process) => remaining.get(process.id) > 0).map((process) => process.arrival))
      addSegment(timeline, 'idle', clock, nextArrival)
      clock = nextArrival
      continue
    }
    const process = available[0]
    if (timeline.at(-1)?.processId !== process.id) events.push(selectionEvent(clock, process.id, `${process.name} toma la CPU porque tiene el menor tiempo restante (${remaining.get(process.id)} unidades).`))
    addSegment(timeline, process.id, clock, clock + 1)
    remaining.set(process.id, remaining.get(process.id) - 1)
    clock += 1
    if (remaining.get(process.id) === 0) completed += 1
  }
  return finalize(processes, timeline, 'SRTF', events)
}
