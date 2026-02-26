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
-   El sistema está listo para convertirse en módulo npm o microservicio
    productivo.
