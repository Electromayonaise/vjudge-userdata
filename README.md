# Prueba de Viabilidad Técnica  
## Integración VJudge + Enriquecimiento Multi-Plataforma

---

## Descripción

Este módulo corresponde a una **prueba de viabilidad técnica** para el proyecto:

> Plataforma web gamificada para la sistematización del ingreso y entrenamiento de estudiantes del Club de Programación Competitiva.

El objetivo de esta implementación es demostrar que es técnicamente posible:

- Obtener datos reales de actividad desde **VJudge**
- Enriquecer dichos datos con información externa (dificultad)
- Calcular métricas relevantes para analítica y gamificación
- Unificar información de múltiples jueces en un solo modelo estructurado

---

## Alcance de esta versión

Esta versión implementa:

### 1. Extracción de datos desde VJudge
Se utiliza el endpoint interno:
```
GET https://vjudge.net/status/data
```

Permite obtener:

- Plataforma (`oj`)
- Problema (`probNum`)
- Lenguaje
- Runtime
- Fecha de envío
- Estado (Accepted, Wrong Answer, etc.)

---

### 2. Normalización de datos

- Filtrado únicamente de envíos **Accepted**
- Eliminación de duplicados (último AC por problema)
- Conversión de timestamps a fechas legibles

---

### 3. Enriquecimiento de dificultad

Integraciones actuales:

| Plataforma     | Fuente de dificultad |
|--------------|---------------------|
| Codeforces   | API oficial pública |
| LeetCode     | GraphQL pública |
| Otros        | "Integration pending" |

---

### 4.Métricas calculadas

Se genera automáticamente:

- Total de problemas únicos resueltos
- Distribución por plataforma
- Primer problema resuelto
- Último problema resuelto
- Lenguajes utilizados

---

## Estructura del proyecto

```
vjudge-demo/
├── server.js
├── vjudgeClient.js
├── package.json
└── public/
    ├── index.html
    ├── style.css
    └── app.js
```

---

##  Requisitos

- Node.js v18+
- npm

---

## Instalación

1. Clonar o descargar el proyecto.

2.Instalar dependencias:

```bash
npm install
```
3. Iniciar el servidor:

```bash
npm start
```
4. Abrir `http://localhost:3000` en el navegador. 

---

## Uso 

1. Ingresar el nombre de usuario de VJudge en el campo correspondiente.

2. El sistema:
- Consulta VJudge
- Filtra Accepted
- Elimina duplicados
- Consulta dificultad externa
- Calcula métricas

3. Se muestra el JSON completo formateado.

Ejemplo de salida:

```json
{
  "rawSubmissions": {
    "username": "youssef579",
    "totalAccepted": 6,
    "submissions": [
      {
        "platform": "CodeForces",
        "problem": "1742D",
        "language": "GNU G++20 13.2 (64 bit, winlibs)",
        "runtime": 343,
        "date": "2/25/2026, 6:55:25 PM"
      },
      {
        "platform": "CodeForces",
        "problem": "1627D",
        "language": "GNU G++20 13.2 (64 bit, winlibs)",
        "runtime": 250,
        "date": "2/25/2026, 6:47:48 PM"
      },
      {
        "platform": "CodeForces",
        "problem": "490C",
        "language": "GNU G++20 13.2 (64 bit, winlibs)",
        "runtime": 109,
        "date": "2/25/2026, 5:25:57 PM"
      },
      {
        "platform": "CodeForces",
        "problem": "1850F",
        "language": "GNU G++20 13.2 (64 bit, winlibs)",
        "runtime": 62,
        "date": "2/25/2026, 4:51:36 PM"
      },
      {
        "platform": "CodeForces",
        "problem": "913A",
        "language": "GNU G++20 13.2 (64 bit, winlibs)",
        "runtime": 46,
        "date": "2/25/2026, 4:40:28 PM"
      },
      {
        "platform": "CSES",
        "problem": "1079",
        "language": "C++17",
        "runtime": 70,
        "date": "2/24/2026, 11:46:06 PM"
      }
    ]
  },
  "difficultyData": [
    {
      "platform": "CodeForces",
      "problem": "1742D",
      "difficulty": 1100
    },
    {
      "platform": "CodeForces",
      "problem": "1627D",
      "difficulty": 1900
    },
    {
      "platform": "CodeForces",
      "problem": "490C",
      "difficulty": 1700
    },
    {
      "platform": "CodeForces",
      "problem": "1850F",
      "difficulty": 1300
    },
    {
      "platform": "CodeForces",
      "problem": "913A",
      "difficulty": 900
    },
    {
      "platform": "CSES",
      "problem": "1079",
      "difficulty": "Integration pending"
    }
  ],
  "calculatedMetrics": {
    "totalUniqueSolved": 6,
    "problemsByPlatform": {
      "CodeForces": 5,
      "CSES": 1
    },
    "firstSolve": "2/24/2026, 11:46:06 PM",
    "lastSolve": "2/25/2026, 6:55:25 PM",
    "languagesUsed": {
      "GNU G++20 13.2 (64 bit, winlibs)": 5,
      "C++17": 1
    }
  },
  "cached": false
}
```