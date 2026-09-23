import { simulateFCFS } from './fcfs.js'
import { simulateSJF } from './sjf.js'
import { simulateSRTF } from './srtf.js'
import { simulateRoundRobin } from './roundRobin.js'
import { simulatePriorityNonPreemptive, simulatePriorityPreemptive } from './priority.js'

const processes = [
  { id: 1, name: 'P1', arrival: 0, burst: 5, priority: 2 },
  { id: 2, name: 'P2', arrival: 1, burst: 3, priority: 1 },
  { id: 3, name: 'P3', arrival: 2, burst: 2, priority: 3 },
]
const results = [simulateFCFS(processes), simulateSJF(processes), simulateSRTF(processes), simulateRoundRobin(processes, 2), simulatePriorityNonPreemptive(processes), simulatePriorityPreemptive(processes)]

for (const result of results) {
  if (result.metrics.length !== processes.length) throw new Error(`${result.algorithm}: missing metrics`)
  if (result.metrics.some((metric) => metric.waitingTime < 0 || metric.turnaroundTime < 0 || metric.responseTime < 0)) throw new Error(`${result.algorithm}: invalid metric`)
  if (result.timeline.reduce((sum, segment) => sum + segment.duration, 0) <= 0) throw new Error(`${result.algorithm}: empty timeline`)
  console.log(`${result.algorithm}: OK`)
}
