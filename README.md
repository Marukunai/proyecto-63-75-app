# 🚀 Mi espacio | Bienestar y crecimiento personal

Aplicación multiplataforma (PWA responsive) para hábitos, bienestar y crecimiento personal. Cada persona inicia sesión con su cuenta y puede elegir sus módulos, tema, perfil y registros.

---

## 🌐 Estado del Proyecto & Despliegue

- **URL de Producción (Netlify):** [https://proyecto-63-75-app.netlify.app/](https://proyecto-63-75-app.netlify.app/)
- **Repositorio GitHub:** [https://github.com/Marukunai/proyecto-63-75-app](https://github.com/Marukunai/proyecto-63-75-app)
- **Formato App:** Progressive Web App (PWA) instalable en Windows, Android e iOS.

---

## 🎯 Principios y Filosofía del Proyecto

1. **Constancia > Perfección:** Diseñado para mantener el ritmo a largo plazo sin abandonar tras días difíciles.
2. **Modo Mínimo ("Día Malo"):** Permite reducir exigencias a tareas básicas de mantenimiento en días de baja energía sin penalizaciones ni pérdida de acumulados.
3. **Personalizable:** Cada cuenta puede elegir tema, módulos, proyectos, nombre para Viajes y datos de perfil.
4. **Offline-First & sincronización cloud:** Datos guardados en una base local separada por cuenta y sincronizados con Supabase Auth y RLS.

---

## 🛠️ Stack Tecnológico & Arquitectura

- **Frontend:** React 18 + TypeScript + Vite
- **Estilos & UI:** Tailwind CSS + Lucide Icons (temas oscuro, cálido y claro)
- **Persistencia Local:** Dexie.js (IndexedDB local offline-first)
- **Sincronización y backups:** Supabase Auth + tabla protegida por RLS; exportación e importación local a JSON
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
│       ├── JapanModeView.tsx # Diario configurable de Viajes
│       └── SettingsView.tsx  # Conexión Supabase, Copia de seguridad JSON
├── package.json
├── vite.config.ts
├── tailwind.config.js
├── tsconfig.json
└── README.md
```

---

## 🗂️ Modelo de Datos Principal

- **UserProfile:** Perfil y métricas físicas opcionales, privados por cuenta.
- **DailyLog:** Registro diario con modo mínimo y lista de hábitos completados.
- **Habit:** Definición de hábitos, categoría (Cuerpo, Mente, Trabajo, Vida, Personal) y si aplica en Modo Mínimo.
- **Exercise & WorkoutLog:** Ejercicios corporales/mochila, series, repeticiones y peso adicional.
- **PersonalRecord:** Récords de fuerza personales (PRs).
- **NutritionLog & SleepLog:** Registro flexible de comidas, proteína/calorías aprox., horas de descanso y calidad.
- **BodyMeasurements:** Perímetros corporales (bíceps, pecho, cintura).
- **ProjectTask:** Tareas de proyectos creados por cada persona.
- **JournalEntry & WeeklyReview:** Diario privado y reflexiones de cada domingo.
- **JapanDayLog:** Registros de viaje (nombre histórico interno conservado por compatibilidad).

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

### 🔹 Fase 3 — Proyectos y Crecimiento Personal
- [x] Tablero configurable de proyectos personales.
- [x] Diario personal y formularios de Revisión Semanal.
- [x] Diario genérico de Viajes, activable por cuenta.

### 🔹 Fase 4 — Sincronización, Backup y Ajustes Avanzados
- [x] Sincronización cloud multi-dispositivo con Supabase Auth y RLS.
- [x] Exportación e Importación manual de datos en JSON para copias de seguridad locales.
- [x] PWA manifest y configuración de despliegue en Netlify con regla de redirecciones _redirects.

---

## 📲 Instalación como PWA (Móvil y PC)

- **En PC (Chrome/Edge):** Abre [https://proyecto-63-75-app.netlify.app/](https://proyecto-63-75-app.netlify.app/) y haz clic en el icono de **Instalar aplicación** en la barra de direcciones.
- **En Móvil (Android/iOS):** Abre el enlace desde Chrome o Safari, pulsa en las opciones del navegador y selecciona **"Añadir a la pantalla de inicio"**.

## 🔐 Configurar la sincronización con Supabase

1. En Supabase, abre **SQL Editor** y ejecuta el contenido de [`supabase/schema.sql`](supabase/schema.sql). Este crea la tabla de sincronización y activa la política que limita las filas a su propietario.
2. En Netlify, abre el sitio y entra en **Project configuration → Environment variables**. Añade `VITE_SUPABASE_URL` con la Project URL y `VITE_SUPABASE_PUBLISHABLE_KEY` con la clave publishable de **Supabase → Project Settings → API Keys**. Si el proyecto solo tiene la clave antigua, usa `VITE_SUPABASE_ANON_KEY` en lugar de la variable publishable. Estas variables se incorporan al frontend durante el build, así que no pongas una `service_role` ni una `sb_secret_`.
3. En **Authentication → URL Configuration**, establece la URL publicada de Netlify como **Site URL**. Revisa también las opciones de confirmación de correo según cómo quieras gestionar nuevas cuentas.
4. En Netlify, lanza un nuevo deploy para que Vite compile con las variables. Los usuarios ya podrán crear una cuenta o iniciar sesión desde la app; no necesitan introducir claves, acceder al repo ni configurar Supabase.
5. Supabase Auth verifica y almacena de forma segura las credenciales: la app no guarda contraseñas en sus tablas ni las hashea por su cuenta.
6. Para pasar los datos personales que ya estaban en este dispositivo, inicia sesión con tu cuenta y usa **Transferir los datos antiguos de este dispositivo a esta cuenta**. Es una transferencia única de la antigua base local compartida. No la pulses en otro usuario que no deba recibir esos datos.
7. En tus otros dispositivos, entra con la misma cuenta. La app sincroniza al abrirse y periódicamente mientras está abierta; también puedes forzarla con **Sincronizar ahora**.

Las bases locales se separan por usuario en cada dispositivo. La primera sincronización une los registros locales de esa cuenta con los de la nube; si dos dispositivos cambian el mismo registro sin sincronizar, se conserva la versión más reciente.
