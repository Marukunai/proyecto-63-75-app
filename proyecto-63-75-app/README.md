# 🚀 PROYECTO "63 → 75+" | Centro de Control & Transformación Personal (2026–2027)

Aplicación multiplataforma (PWA Responsive) diseñada como centro de control personal holístico: salud física, masa muscular, hábitos, sueño, estabilidad mental, organización de proyectos personales y crecimiento personal a largo plazo.

---

## 🌐 Estado del Proyecto & Despliegue

- **URL de Producción (Netlify):** [https://proyecto-63-75-app.netlify.app/](https://proyecto-63-75-app.netlify.app/)
- **Repositorio GitHub:** [https://github.com/Marukunai/proyecto-63-75-app](https://github.com/Marukunai/proyecto-63-75-app)
- **Formato App:** Progressive Web App (PWA) instalable en Windows, Android e iOS.

---

## 🎯 Principios y Filosofía del Proyecto

1. **Constancia > Perfección:** Diseñado para mantener el ritmo a largo plazo sin abandonar tras días difíciles.
2. **Modo Mínimo ("Día Malo"):** Permite reducir exigencias a tareas básicas de mantenimiento en días de baja energía sin penalizaciones ni pérdida de acumulados.
3. **Modo Japón (Hong Kong & Japón Oct 15–31, 2026):** Adaptación del registro para viajes intensos enfocados en turismo, caminata y descanso activo sin culpas.
4. **Offline-First & Sincronización Cloud:** Datos guardados localmente de forma inmediata con Dexie.js (IndexedDB) y cliente opcional para sincronización con Supabase entre PC y Móvil.
5. **Evolución Sostenible:** Progresión del peso de ~63.2 kg a ~75 kg sin fechas límites obsesivas ni métricas punitivas.

---

## 🛠️ Stack Tecnológico & Arquitectura

- **Frontend:** React 18 + TypeScript + Vite
- **Estilos & UI:** Tailwind CSS + Lucide Icons (Dark Mode nativo)
- **Persistencia Local:** Dexie.js (IndexedDB local offline-first)
- **Sincronización Cloud & Backups:** Supabase Client + Exportador/Importador local a JSON
- **Despliegue:** Netlify CI/CD con redirección SPA (`public/_redirects`)

---

## 📂 Estructura del Proyecto

```text
/
├── public/                  # Assets públicos, manifest.json PWA y _redirects
├── src/
│   ├── assets/              # Recursos estáticos e imágenes
│   ├── components/          # Componentes reutilizables
│   │   └── layout/          # Navbar, Sidebar, Layout base responsive
│   ├── db/                  # Esquema e inicialización de IndexedDB (Dexie)
│   ├── services/            # Cliente Supabase y exportación/importación JSON
│   ├── types/               # Interfaces TypeScript completas
│   └── views/               # Pantallas principales de la aplicación
│       ├── DashboardView.tsx # Centro de control "HOY", peso y Modo Mínimo
│       ├── HabitsView.tsx    # Gestión y seguimiento de hábitos
│       ├── ProjectsView.tsx  # Kanban de proyectos y tracker "Intento primero"
│       ├── JournalView.tsx   # Diario personal y Revisiones Semanales
│       ├── WorkoutView.tsx   # Rutinas de autocarga/mochila y registro de series
│       ├── NutritionView.tsx # Comidas e ideas de densidad calórica
│       ├── SleepView.tsx     # Calidad de sueño y hábito nocturno
│       ├── ProgressView.tsx  # Medidas corporales (cm) e historial
│       ├── WeightView.tsx    # Registro de pesaje diario
│       ├── JapanModeView.tsx # Módulo de viaje Hong Kong / Japón
│       └── SettingsView.tsx  # Conexión Supabase, Copia de seguridad JSON
├── package.json
├── vite.config.ts
├── tailwind.config.js
├── tsconfig.json
└── README.md
```

---

## 🗂️ Modelo de Datos Principal

- **UserProfile:** Datos físicos iniciales, objetivo de peso (~75 kg), altura y fase del bloque actual.
- **DailyLog:** Registro diario con toggle de Modo Mínimo, Modo Japón, peso y lista de hábitos completados.
- **Habit:** Definición de hábitos, categoría (Cuerpo, Mente, Trabajo, Vida, Personal) y si aplica en Modo Mínimo.
- **Exercise & WorkoutLog:** Ejercicios corporales/mochila, series, repeticiones y peso adicional.
- **PersonalRecord:** Récords de fuerza personales (PRs).
- **NutritionLog & SleepLog:** Registro flexible de comidas, proteína/calorías aprox., horas de descanso y calidad.
- **BodyMeasurements:** Perímetros corporales (bíceps, pecho, cintura).
- **ProjectTask:** Tareas para Poker Online y KaizoBankKunai con contador del hábito "Intento primero" para medir autonomía lógica.
- **JournalEntry & WeeklyReview:** Diario privado y reflexiones de cada domingo.
- **JapanDayLog:** Registro especial de caminatas, pasos y turismo para el viaje de octubre 2026.

---

## 🗺️ Estado del Plan de Desarrollo por Fases

### 🔹 Fase 0 — Configuración Base e Infraestructura
- [x] Repositorio en GitHub (proyecto-63-75-app).
- [x] Generación de arquitectura de archivos y configuración TypeScript/Vite/Tailwind.
- [x] Documentación completa inicial (README.md).

### 🔹 Fase 1 — MVP (Núcleo de Control Diario)
- [x] Configuración del esquema IndexedDB (Dexie.js) y tipos base TypeScript.
- [x] Layout responsive oscuro (Sidebar para PC / Bottom Navigation para móvil).
- [x] Dashboard "HOY": Visión diaria, peso actual, barra de progreso flexible y toggle de Modo Mínimo.
- [x] Calendario: Vista básica diaria y semanal.
- [x] Sistema de Hábitos: Módulo de cumplimiento diario sin castigos.
- [x] Entrenamiento Inicial: Rutinas de autocarga y mochila con registro de series/reps.

### 🔹 Fase 2 — Nutrición, Sueño y Evolución Física
- [x] Módulo de nutrición flexible con ideas para aumentar ingesta calórica fácilmente.
- [x] Registro de calidad de sueño, descanso y hábito de melatonina.
- [x] Módulo de progreso: Registro de medidas corporales (cm) e historial.
- [x] Módulo de Récords Personales (PRs) de fuerza.

### 🔹 Fase 3 — Proyectos, Crecimiento Personal y Modo Japón
- [x] Tablero de Proyectos (Poker Online, KaizoBankKunai) + Tracker del hábito "Intento primero".
- [x] Diario personal privado y formularios de Revisión Semanal (Domingos).
- [x] Modo Japón / Hong Kong (15–31 Oct 2026): Pantalla especial con priorización de caminata, pasos y turismo.

### 🔹 Fase 4 — Sincronización, Backup y Ajustes Avanzados
- [x] Configuración del cliente Supabase para sincronización cloud multi-dispositivo.
- [x] Exportación e Importación manual de datos en JSON para copias de seguridad locales.
- [x] PWA manifest y configuración de despliegue en Netlify con regla de redirecciones _redirects.

---

## 📲 Instalación como PWA (Móvil y PC)

- **En PC (Chrome/Edge):** Abre [https://proyecto-63-75-app.netlify.app/](https://proyecto-63-75-app.netlify.app/) y haz clic en el icono de **Instalar aplicación** en la barra de direcciones.
- **En Móvil (Android/iOS):** Abre el enlace desde Chrome o Safari, pulsa en las opciones del navegador y selecciona **"Añadir a la pantalla de inicio"**.