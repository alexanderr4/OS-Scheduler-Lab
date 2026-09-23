# OS Scheduler Lab

**Visualiza cómo piensa un sistema operativo.**

OS Scheduler Lab es un laboratorio educativo construido con React y Vite para entender, ejecutar y comparar algoritmos de planificación de CPU. Una sola carga de procesos alimenta seis estrategias al mismo tiempo y hace visibles sus decisiones en timelines, eventos y métricas.

## Algoritmos

- **FCFS:** el primero en llegar, primero en ejecutarse.
- **SJF:** el trabajo más corto primero, sin interrupción.
- **SRTF:** variante expropiativa de SJF; considera el tiempo restante.
- **Round Robin:** cada proceso recibe un turno configurable mediante quantum.
- **Prioridad NP:** atiende la prioridad más alta sin interrumpir el trabajo actual.
- **Prioridad P:** puede cambiar de proceso cuando llega una prioridad mayor.

## Arquitectura

```text
src/
├── algorithms/
│   ├── common.js       # timeline, métricas, promedios y eventos
│   ├── fcfs.js
│   ├── sjf.js
│   ├── srtf.js
│   ├── roundRobin.js
│   ├── priority.js
│   ├── index.js
│   └── smokeTest.js
├── components/
│   ├── ProcessTable.jsx
│   ├── AlgorithmCard.jsx
│   └── GanttChart.jsx
├── data/scenarios.js
├── App.jsx
└── App.css
```

Los algoritmos son funciones puras independientes. Cada una devuelve `algorithm`, `timeline`, `metrics`, `averages` y `events`, por lo que agregar Multilevel Queue o Multilevel Feedback Queue no requiere modificar la matemática de los componentes.

## Métricas

Se calculan por proceso: Completion Time, Turnaround Time, Waiting Time y Response Time. También se muestran promedios, utilización de CPU, throughput y cambios de contexto. Los seis Gantt comparten la misma escala temporal.

## Experiencia de uso

1. Crea, edita o elimina procesos.
2. Carga un ejemplo o un escenario educativo.
3. Configura el quantum de Round Robin.
4. Ejecuta la simulación para alimentar los seis algoritmos con la misma entrada.
5. Reproduce, pausa, reinicia o avanza decisión por decisión.
6. Selecciona un algoritmo para leer la explicación generada por sus eventos reales.
7. Compara resultados y abre el diccionario de la CPU desde **Aprender**.

## Instalación y ejecución

```bash
npm install
npm run dev
```

Para validar el proyecto:

```bash
npm run build
npm run lint
node src/algorithms/smokeTest.js
```

## Pruebas académicas incluidas

El smoke test comprueba los seis algoritmos con llegadas distintas, prioridades distintas, expropiación y quantum 2. La arquitectura permite ampliar la cobertura con casos de llegadas simultáneas, empates, un solo proceso, burst de 1, muchos procesos y procesos que llegan exactamente al terminar otro.
