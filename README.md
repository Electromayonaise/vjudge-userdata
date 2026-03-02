# Prueba de Viabilidad Técnica

## Integración VJudge + Enriquecimiento Multi-Plataforma (Versión Paginada)

------------------------------------------------------------------------

## Descripción

Este módulo corresponde a una **prueba de viabilidad técnica** para el
proyecto:

> Plataforma web gamificada para la sistematización del ingreso y
> entrenamiento de estudiantes del Club de Programación Competitiva.

Esta versión demuestra que es técnicamente posible:

-   Obtener datos reales desde **VJudge**
-   Implementar paginación controlada por el usuario
-   Unificar información multi-plataforma
-   Enriquecer datos con dificultad externa
-   Calcular métricas dinámicas por página
-   Exponer un modelo JSON estructurado listo para microservicio

------------------------------------------------------------------------

## Alcance de esta versión

### 1. Extracción de datos desde VJudge

Se utiliza el endpoint interno:

GET https://vjudge.net/status/data

Características: - Límite real de VJudge: 20 registros por request - El
sistema implementa agregación interna automática - Soporta `pageSize`
configurable (máximo 100) - Requests paralelos mediante Promise.all

------------------------------------------------------------------------

### 2. Paginación dinámica

El usuario puede seleccionar la cantidad de resultados por página
(1--100).

Backend: - Normaliza el valor - Limita a máximo 100 - Divide
internamente en bloques de 20 si es necesario

------------------------------------------------------------------------

### 3. Enriquecimiento de dificultad

Integraciones actuales:

  Plataforma   Fuente de dificultad
  ------------ -----------------------------------------------
  CodeForces   API oficial pública (`problemset.problems`)
  LeetCode     GraphQL pública
  HackerRank   Integración básica (pendiente rating oficial)
  CodeChef     Integración básica
  CSES         Integración pendiente

Notas: - Algunos problemas recientes pueden no tener rating asignado por
Codeforces. - En esos casos se retorna `"Unknown"`.

------------------------------------------------------------------------

### 4. Métricas calculadas (por página)

-   Total de submissions
-   Accepted
-   Unique solved
-   Acceptance rate (%)
-   Total de registros globales
-   Total de páginas disponibles

------------------------------------------------------------------------

## Nueva estructura del JSON

Ejemplo de respuesta:

``` json
{
  "page": 0,
  "pageSize": 40,
  "totalRecords": 9999999,
  "totalPages": 250000,
  "hasMore": true,
  "submissions": [
    {
      "oj": "HackerRank",
      "problem": "find-the-median",
      "problemId": 588570,
      "status": "Accepted",
      "difficulty": "Unknown"
    }
  ],
  "metrics": {
    "totalSubmissions": 5,
    "accepted": 3,
    "uniqueSolved": 2,
    "acceptanceRate": "60.00"
  },
  "raw": [
    {
      "memory": 0,
      "runtime": 1553,
      "language": "java",
      "oj": "HackerRank",
      "problemId": 588570,
      "probNum": "find-the-median",
      "status": "Accepted"
    }
  ]
}
```

------------------------------------------------------------------------

## Estructura del proyecto

    vjudge-demo/
    ├── server.js
    ├── vjudgeClient.js
    ├── difficultyProviders/
    │   ├── codeforces.js
    │   ├── leetcode.js
    │   ├── hackerrank.js
    │   ├── codechef.js
    │   └── index.js
    ├── package.json
    └── public/
        ├── index.html
        ├── style.css
        └── app.js

------------------------------------------------------------------------

## Requisitos

-   Node.js v18+
-   npm

------------------------------------------------------------------------

## Instalación

1.  Clonar o descargar el proyecto.

2.  Instalar dependencias:

npm install

3.  Iniciar el servidor:

npm start

4.  Abrir en navegador:

http://localhost:3000

------------------------------------------------------------------------

## Flujo de funcionamiento

1.  Usuario ingresa username.
2.  Backend consulta VJudge.
3.  Se agregan múltiples requests si pageSize \> 20.
4.  Se enriquecen dificultades externas.
5.  Se calculan métricas.
6.  Se devuelve JSON estructurado.
7.  Frontend muestra tabla y vista JSON.

------------------------------------------------------------------------

## Conclusión Técnica

Esta prueba valida que:

-   Es viable construir un microservicio independiente basado en VJudge.
-   Es posible enriquecer datos multi-OJ.
-   Se puede escalar hasta 100 resultados por página.
-   La arquitectura es modular y extensible.

------------------------------------------------------------------------

## Proyección Arquitectónica para Escalamiento

Dado que el objetivo del proyecto es almacenar y gestionar información
de múltiples usuarios de forma persistente, es importante considerar una
arquitectura que minimice el riesgo de *rate limiting* por parte de
VJudge y que permita sincronización incremental de datos.

A continuación se describen dos posibles enfoques arquitectónicos
viables.

------------------------------------------------------------------------

### Opción 1: Backend completo en Node.js (Monolito con Worker Interno)

**Descripción:**\
Construir tanto el backend principal como el servicio de sincronización
en Node.js.

**Arquitectura propuesta:**

Frontend\
→ Backend Node.js\
→ Base de datos\
→ (Worker interno Node.js para sincronización)\
→ VJudge y OJs externos

**Implementación recomendada:**

-   Un solo repositorio.
-   Dos entrypoints:
    -   `server.js` (API principal)
    -   `syncWorker.js` (proceso de sincronización)
-   Uso de Redis para:
    -   Cola de sincronización
    -   Rate limiting
    -   Cache temporal
-   Dockerización con dos contenedores:
    -   `backend`
    -   `worker`
-   Orquestación simple con Docker Compose.

**Justificación técnica:**

-   Node.js es altamente eficiente para cargas IO-bound (múltiples
    requests HTTP).
-   Ecosistema maduro para colas y rate limiting (BullMQ, ioredis,
    p-limit).
-   Implementación sencilla de concurrencia controlada.
-   Menor complejidad operativa al usar una sola tecnología.

**Cuándo conviene esta opción:**

-   Equipo pequeño.
-   Proyecto en etapa inicial o MVP.
-   Necesidad de iterar rápido.
-   Carga centrada en integración externa y no en lógica empresarial
    compleja.

------------------------------------------------------------------------

### Opción 2: Backend en Spring + Sync Worker en Node.js

**Descripción:**\
Separar responsabilidades tecnológicas según el tipo de carga.

**Arquitectura propuesta:**

Frontend\
→ Backend Spring Boot\
→ Base de datos\
→ Redis (cola)\
→ Sync Worker Node.js\
→ VJudge y OJs externos

**Despliegue recomendado:**

-   Backend Spring dockerizado.
-   Worker Node dockerizado.
-   Redis como contenedor independiente.
-   Comunicación mediante:
    -   Base de datos compartida o
    -   Cola Redis (recomendado).
-   Orquestación con Docker Compose o Kubernetes.

**Justificación técnica:**

-   Spring es robusto para:
    -   Seguridad
    -   Autenticación
    -   Lógica de negocio compleja
    -   Estructuras empresariales
-   Node.js es más eficiente para:
    -   IO intensivo
    -   Scraping controlado
    -   Manejo fino de concurrencia
    -   Rate limiting dinámico
-   Separación clara entre:
    -   Dominio de negocio
    -   Integración externa agresiva

**Ventajas estratégicas:**

-   Aislamiento de fallos: si VJudge falla, no afecta directamente al
    backend principal.
-   Escalabilidad independiente del worker.
-   Mejor control de rate limiting global.
-   Arquitectura preparada para múltiples plataformas futuras.

**Cuándo conviene esta opción:**

-   Proyecto con visión de producto a mediano/largo plazo.
-   Necesidad de escalabilidad real.
-   Backend con lógica empresarial compleja.
-   Posible crecimiento del equipo técnico.

------------------------------------------------------------------------

## Recomendación Estratégica

Para una prueba de viabilidad o MVP avanzado, la opción 1 (todo en
Node.js) es más simple y rápida de implementar.

Para un producto con proyección de crecimiento y múltiples usuarios, la
opción 2 (Spring + Sync Worker Node) ofrece mejor separación de
responsabilidades, mayor robustez estructural y mejor manejo del riesgo
de rate limiting.

En ambos escenarios, la clave para escalar correctamente no es consultar
VJudge en tiempo real, sino implementar:

-   Sincronización inicial completa.
-   Actualización incremental basada en `run_id` o fecha.
-   Persistencia en base de datos.
-   Control estricto de concurrencia y frecuencia de actualización.
