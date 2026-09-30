@echo off
echo ===================================================
echo CREANDO ESTRUCTURA DE PROYECTO 63 -^> 75+ (FASE 0)
echo ===================================================

:: Carpetas Principales
mkdir public
mkdir src\assets
mkdir src\components\layout
mkdir src\components\dashboard
mkdir src\components\calendar
mkdir src\components\workout
mkdir src\components\nutrition
mkdir src\components\habits
mkdir src\components\projects
mkdir src\components\journal
mkdir src\components\japan
mkdir src\components\shared
mkdir src\context
mkdir src\db
mkdir src\hooks
mkdir src\services
mkdir src\types
mkdir src\utils
mkdir src\views

:: Archivos de Raiz
type nul > README.md
type nul > .gitignore
type nul > package.json
type nul > vite.config.ts
type nul > index.html
type nul > tsconfig.json
type nul > tailwind.config.js
type nul > postcss.config.js

:: Archivos Nucleo
type nul > src\main.tsx
type nul > src\App.tsx
type nul > src\index.css

:: Tipos, Base de Datos y Servicios
type nul > src\types\index.ts
type nul > src\db\index.ts
type nul > src\services\syncService.ts
type nul > src\services\dataExport.ts

:: Vistas / Pantallas
type nul > src\views\DashboardView.tsx
type nul > src\views\CalendarView.tsx
type nul > src\views\WorkoutView.tsx
type nul > src\views\NutritionView.tsx
type nul > src\views\ProgressView.tsx
type nul > src\views\HabitsView.tsx
type nul > src\views\ProjectsView.tsx
type nul > src\views\JournalView.tsx
type nul > src\views\SleepView.tsx
type nul > src\views\JapanModeView.tsx
type nul > src\views\SettingsView.tsx

:: Componentes Base
type nul > src\components\layout\Layout.tsx
type nul > src\components\layout\Navbar.tsx
type nul > src\components\layout\Sidebar.tsx
type nul > src\components\shared\MinimumModeBanner.tsx
type nul > src\components\shared\GamificationBanner.tsx

echo.
echo Estructura generada correctamente en el directorio actual.
pause