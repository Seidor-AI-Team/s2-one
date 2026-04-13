# S2-ONE — Generador de One Pagers de Portafolio

**POC SEIDOR IA Lab · MWM (Macro Wealth Management)**

Genera reportes profesionales de portafolios de inversión automáticamente.
Reduce el tiempo de generación de 9 horas a minutos.

## Setup rápido

### Backend
```bash
cd backend
cp .env.example .env
pip install -r requirements.txt
python main.py  # API en http://localhost:8002
```

### Frontend
```bash
cd frontend
npm install
npm run dev  # App en http://localhost:5176
```

## Cómo funciona
1. Dashboard con los 3 portafolios (Alpha, Beta, Gamma)
2. Haz clic en "Ver One Pager" de cualquier portafolio
3. Opcionalmente haz clic en "Generar Análisis IA" para la narrativa
4. Imprime con el botón o Ctrl+P

## Stack
- Backend: Python + FastAPI + OpenAI GPT-4o
- Frontend: React + TypeScript + Vite + TailwindCSS v4
- Datos mock en `data/portfolios.json` (Bloomberg simulado)
