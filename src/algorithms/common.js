export const byArrival = (left, right) => left.arrival - right.arrival || left.id - right.id

export function addSegment(timeline, processId, start, end) {
  if (start >= end) return
  const previous = timeline[timeline.length - 1]
  if (previous?.processId === processId && previous.end === start) {
    previous.end = end
    previous.duration = end - previous.start
  }
  else timeline.push({ processId, start, end, duration: end - start })
}

export function finalize(processes, timeline, algorithm, decisionEvents = []) {
  const completion = new Map()
  const firstStart = new Map()
  timeline.forEach((segment) => {
    if (segment.processId === 'idle') return
    completion.set(segment.processId, segment.end)
    if (!firstStart.has(segment.processId)) firstStart.set(segment.processId, segment.start)
  })

  const metrics = processes.map((process) => {
    const completionTime = completion.get(process.id) ?? process.arrival
    const responseTime = (firstStart.get(process.id) ?? process.arrival) - process.arrival
    const turnaroundTime = completionTime - process.arrival
    return {
      ...process,
      completionTime,
      turnaroundTime,
      waitingTime: turnaroundTime - process.burst,
      responseTime,
    }
  })
  const finish = Math.max(...timeline.map((segment) => segment.end), 0)
  const busyTime = timeline.filter((segment) => segment.processId !== 'idle').reduce((sum, segment) => sum + segment.duration, 0)
  const activeSegments = timeline.filter((segment) => segment.processId !== 'idle')
  const contextSwitches = Math.max(0, activeSegments.slice(1).filter((segment, index) => activeSegments[index].processId !== segment.processId).length)
  const average = (key) => metrics.length ? metrics.reduce((sum, process) => sum + process[key], 0) / metrics.length : 0

  const events = decisionEvents.length ? decisionEvents : timeline.filter((segment) => segment.processId !== 'idle').map((segment) => ({
    time: segment.start,
    type: 'PROCESS_SELECTED',
    processId: segment.processId,
    explanation: `${segment.processId} recibe la CPU según la regla de ${algorithm}.`,
  }))

  return {
    algorithm,
    timeline,
    metrics,
    averages: {
      waitingTime: average('waitingTime'),
      turnaroundTime: average('turnaroundTime'),
      responseTime: average('responseTime'),
      cpuUtilization: finish ? (busyTime / finish) * 100 : 0,
      throughput: finish ? processes.length / finish : 0,
      contextSwitches,
    },
    events,
  }
}

export function selectionEvent(time, processId, explanation) {
  return { time, type: 'PROCESS_SELECTED', processId, explanation }
}
