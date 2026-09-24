export function compareResults(beforeResults, afterResults) {
  return afterResults.map(({ algorithm, result: after }) => {
    const before = beforeResults.find((item) => item.algorithm.key === algorithm.key)?.result
    const metrics = ['waitingTime', 'turnaroundTime', 'responseTime', 'contextSwitches']
    return {
      algorithm,
      metrics: metrics.map((key) => ({ key, before: before?.averages[key] ?? 0, after: after.averages[key], delta: after.averages[key] - (before?.averages[key] ?? 0) })),
    }
  })
}

export function getProcessAtTime(result, time) {
  const segment = result.timeline.find((item) => item.start <= time && time < item.end)
  if (!segment || segment.processId === 'idle') return null
  return segment.processId
}

export function getAvailableProcesses(result, processes, time) {
  const selected = getProcessAtTime(result, time)
  return processes.filter((process) => process.arrival <= time).map((process) => {
    const metric = result.metrics.find((item) => item.id === process.id)
    const executed = result.timeline.filter((segment) => segment.processId === process.id && segment.end <= time).reduce((sum, segment) => sum + segment.duration, 0)
    return { ...process, remaining: Math.max(0, process.burst - executed), selected: process.id === selected, finished: metric?.completionTime <= time }
  }).filter((process) => !process.finished || process.selected)
}

export function getDecisionAt(result, processId, time) {
  const event = [...result.events].reverse().find((item) => item.processId === processId && item.time <= time)
  return event ?? result.events.find((item) => item.processId === processId)
}

export function detectBehaviors(processes, results, quantum) {
  const observations = []
  const fcfs = results.find(({ algorithm }) => algorithm.key === 'fcfs')?.result
  const rr = results.find(({ algorithm }) => algorithm.key === 'rr')?.result
  const sjf = results.find(({ algorithm }) => algorithm.key === 'sjf')?.result
  const longest = [...processes].sort((left, right) => right.burst - left.burst)[0]
  if (fcfs && longest && longest.arrival === Math.min(...processes.map((process) => process.arrival)) && processes.length > 1) {
    const waiting = fcfs.metrics.filter((metric) => metric.id !== longest.id).reduce((sum, metric) => sum + metric.waitingTime, 0) / (processes.length - 1)
    if (waiting > longest.burst * 0.5) observations.push({ icon: '💡', title: 'Efecto convoy detectado', text: `${longest.name} necesita ${longest.burst} unidades al inicio y los demás esperan ${waiting.toFixed(1)} unidades en promedio.` })
  }
  if (rr && quantum <= 2 && rr.averages.contextSwitches >= Math.max(2, processes.length - 1)) observations.push({ icon: '🔄', title: 'Alta frecuencia de cambios de contexto', text: `El quantum ${quantum} produjo ${rr.averages.contextSwitches} cambios de contexto en Round Robin.` })
  if (sjf && fcfs && fcfs.averages.waitingTime - sjf.averages.waitingTime >= 1) observations.push({ icon: '📊', title: 'Concentración de trabajos cortos', text: `SJF reduce la espera promedio de ${fcfs.averages.waitingTime.toFixed(1)} a ${sjf.averages.waitingTime.toFixed(1)} unidades frente a FCFS.` })
  const longestWait = results.flatMap(({ algorithm, result }) => result.metrics.map((metric) => ({ algorithm: algorithm.name, ...metric }))).sort((left, right) => right.waitingTime - left.waitingTime)[0]
  if (longestWait && longestWait.waitingTime >= 5) observations.push({ icon: '⏳', title: 'Proceso con espera elevada', text: `${longestWait.name} espera ${longestWait.waitingTime} unidades con ${longestWait.algorithm}.` })
  return observations
}

export function processSnapshot(result, processId, time) {
  const metric = result.metrics.find((item) => item.id === processId)
  if (!metric) return null
  const executed = result.timeline.filter((segment) => segment.processId === processId && segment.start < time).reduce((sum, segment) => sum + Math.min(segment.end, time) - segment.start, 0)
  return { ...metric, arrived: metric.arrival <= time, waiting: metric.arrival <= time && executed === 0 && time < metric.completionTime, running: getProcessAtTime(result, time) === processId, completed: time >= metric.completionTime, executed: Math.max(0, executed) }
}

export function toCsv(results) {
  const rows = [['Algoritmo', 'Proceso', 'Llegada', 'Ráfaga', 'Prioridad', 'Espera', 'Respuesta', 'Retorno', 'Finalización']]
  results.forEach(({ algorithm, result }) => result.metrics.forEach((metric) => rows.push([algorithm.name, metric.name, metric.arrival, metric.burst, metric.priority, metric.waitingTime, metric.responseTime, metric.turnaroundTime, metric.completionTime])))
  return rows.map((row) => row.join(',')).join('\n')
}

export function downloadCsv(filename, content) {
  const blob = new Blob([content], { type: 'text/csv;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = filename
  anchor.click()
  URL.revokeObjectURL(url)
}
