# 🚀 PROYECTO "63 → 75+" | Centro de Control & Transformación Personal (2026–2027)

Aplicación multiplataforma (PWA Responsive) diseñada como centro de control personal holístico: salud física, masa muscular, hábitos, sueño, estabilidad mental, organización de proyectos personales y crecimiento personal a largo plazo.

---

## 🎯 Principios y Filosofía del Proyecto

1. **Constancia > Perfección:** Diseñado para evitar el abandono tras días difíciles.
2. **Modo Mínimo ("Día Malo"):** Permite reducir exigencias a tareas básicas de mantenimiento sin penalizaciones ni pérdida de rachas.
3. **Modo Japón (Hong Kong & Japón Oct 15–31, 2026):** Adaptación del tracker para viajes intensos enfocados en turismo, caminata y descanso activo.
4. **Offline-First & Sincronización Multi-dispositivo:** Datos guardados localmente de forma inmediata con sincronización transparente en la nube para usar desde PC y Móvil.
5. **Evolución Sostenible:** Progresión del peso de ~63.2 kg a ~75 kg sin fechas límites obsesivas ni métricas punitivas.

---

## 🛠️ Stack Tecnológico & Arquitectura

- **Frontend:** React 18 + TypeScript + Vite
- **Estilos:** Tailwind CSS + Lucide Icons (Dark Mode prioritario)
- **Visualización de Datos:** Recharts (Tendencias de peso con media móvil, cumplimiento de hábitos)
- **Persistencia & Sync:** Dexie.js (IndexedDB local) + Supabase / Firebase (Sincronización PC/Móvil)
- **Formato App:** Progressive Web App (PWA - Instalable en Windows, Android, iOS)

---

## 📂 Estructura del Proyecto

```text
/
├── public/                 # Assets públicos y manifest PWA
├── src/
│   ├── assets/             # Imágenes e iconos estáticos
│   ├── components/         # Componentes React
│   │   ├── layout/         # Navbar, Sidebar, Layout base
│   │   ├── dashboard/      # Tarjetas HOY, Barra de peso, Toggle Modo Mínimo
│   │   ├── calendar/       # Vistas de calendario (Mes/Semana/Día)
│   │   ├── workout/        # Selector de ejercicios, Series/Reps, PRs
│   │   ├── nutrition/      # Comidas frecuentes, Calorías/Proteínas aproximadas
│   │   ├── habits/         # Tracker de hábitos diario/semanal
│   │   ├── projects/       # Kanban Poker Online, KaizoBankKunai, "Intento primero"
│   │   ├── journal/        # Diario privado y Revisiones Semanales/Mensuales
│   │   ├── japan/          # Vista especial viaje Hong Kong / Japón
│   │   └── shared/         # Banners, Modales, Gráficos compartidos
│   ├── context/            # Contextos globales de estado
│   ├── db/                 # Esquemas e inicialización de IndexedDB
│   ├── hooks/              # Custom Hooks (useWeight, useHabits, usePosture)
│   ├── services/           # Sincronización de datos y exportación JSON/CSV
│   ├── types/              # Interfaces TypeScript
│   ├── utils/              # Cálculos de media móvil, XP, fechas
│   └── views/              # Pantallas principales
├── package.json
├── vite.config.ts
└── README.md
```

## 🗂️ Modelo de Datos Principal

- **UserProfile:** Datos físicos iniciales, objetivo, bloque actual y prioridades musculares.
- **DailyLog:** Registro diario con toggle de Modo Mínimo, Modo Japón, peso, horas de sueño y hábitos completados.
- **Habit:** Definición de hábitos, categoría, frecuencia y recompensa en XP.
- **Exercise & WorkoutSession:** Ejercicios corporales/mochila, registro de series, repeticiones, peso y récords personales (PRs).
- **ProjectTask:** Gestión de tareas para proyectos de desarrollo con contador "Intento primero" para medir autonomía frente a IA.

---

## 🗺️ Plan de Desarrollo por Fases

### 🔹 Fase 0 — Configuración Base e Infraestructura (ACTUAL)
- [x] Repositorio vacío en GitHub (`proyecto-63-75-app`).
- [x] Generación de arquitectura de archivos mediante script `.bat`.
- [x] Documentación completa del proyecto (`README.md`).

### 🔹 Fase 1 — MVP (Núcleo de Control Diario)
- [ ] Configuración del esquema IndexedDB y tipos base TypeScript.
- [ ] Layout responsive oscuro (Sidebar para PC / Bottom Navigation para móvil).
- [ ] Dashboard "HOY": Visión diaria, peso actual, barra de progreso flexible y toggle de Modo Mínimo.
- [ ] Calendario: Vista básica diaria y semanal.
- [ ] Sistema de Hábitos: Módulo de cumplimiento diario sin castigos.
- [ ] Entrenamiento Inicial: Rutinas de autocarga y mochila con registro de series/reps.

### 🔹 Fase 2 — Nutrición, Sueño y Evolución Física
- [ ] Módulo de nutrición flexible y recetas de volumen muscular.
- [ ] Registro de calidad de sueño, rutina nocturna y desintoxicación digital.
- [ ] Módulo de progreso: Registro de medidas, comparador de fotos privadas y gráfico de media móvil de peso.
- [ ] Módulo de Récords Personales (PRs) de fuerza.

### 🔹 Fase 3 — Proyectos, Crecimiento Personal y Modo Japón
- [ ] Tablero de Proyectos (Poker Online, KaizoBankKunai) + Tracker del hábito "Intento primero".
- [ ] Diario personal privado y formularios de Revisión Semanal (Domingos) y Mensual.
- [ ] Gamificación adulta (Sistema de XP y Niveles por hábitos).
- [ ] Modo Japón / Hong Kong (Oct 15–31, 2026): Pantalla especial con priorización de caminata y turismo.
- [ ] Recordatorio de postura/movilidad para sesiones de programación en PC.

### 🔹 Fase 4 — Sincronización, Backup y Ajustes Avanzados
- [ ] Sincronización multi-dispositivo (PC <-> Móvil) en la nube.
- [ ] Exportación e Importación manual de datos en JSON y CSV.
- [ ] Service Worker para soporte PWA completo e instalación nativa.
