**SECCIÓN 1: DEFINICIÓN DEL PROBLEMA (20 min)**

**Template proyectado:**

**POC CHARTER - IA LAB GRUPO MACRO**

**Caso****:** One Pager

**Fecha:** 16 de Febrero, 2026

**DEFINICIÓN DEL PROBLEMA**

**PROBLEMA ESPECÍFICO QUE RESOLVEMOS:**

Buscamos incrementar la frecuencia de acceso a la información para la elaboración continua de informes internos para la toma de decisiones de inversión o de crédito, mitigando el error humano, reduciendo la carga operativa y demanda de horas/ hombre destinadas a estos entregables[^1][^2]

**PROCESO ACTUAL (AS-IS) - PASO A PASO:**[^3]

**TIEMPO TOTAL PROCESO ACTUAL**: 9 horas cada elaboración.** **[^4]

**FRECUENCIA**: 4 veces al mes, debería hacerse diario.[^5]

**COSTO ****MENSUAL**[^6] 

US$ 21,600 anualmente (US$ 50  horas/hombre, US$ 450 por cada elaboración, US$ 1,800 mensual)

No obstante cualquier error en alguna parte del proceso puede costarnos un cliente (potencialmente hasta US$ 100,000 de ingresos por año)[^7]

**¿POR QUÉ NO LO HAN RESUELTO ANTES?**

No se resolvió anteriormente principalmente por restricciones de capacidad operativa y priorización de recursos. El equipo ha estado enfocado en cumplir con entregables críticos y requerimientos recurrentes del negocio, lo que ha limitado el tiempo disponible para desarrollar iniciativas de mejora estructural.

La carga operativa diaria, junto con la aparición constante de nuevas solicitudes, ajustes y necesidades del negocio, obligó a priorizar la continuidad y oportunidad de los reportes existentes por sobre proyectos de optimización o rediseño del proceso. En este contexto, cualquier esfuerzo de mejora debía competir con entregables de alta prioridad y plazos exigentes.

Asimismo, hasta la fecha no se ha identificado una solución que permita automatizar integralmente el flujo de información. Las automatizaciones parciales (macros, plantillas, descargas puntuales) han permitido sostener la operación, pero no resuelven el problema de fondo, que está asociado a la integración de datos, la disponibilidad oportuna de la información y la dependencia de múltiples fuentes.

**SECCIÓN 2: SOLUCIÓN PROPUESTA (25 min)**

**SOLUCIÓN PROPUESTA - QUÉ CONSTRUIREMOS**

**PROCESO OBJETIVO (TO-BE) - CÓMO SERÁ CON IA:**[^8]

**SOLUCIÓN PROPUESTA – QUÉ CONSTRUIREMOS**

**Automatización integral del OnePager de Portafolios**, mediante un flujo centralizado de datos, validación automática y generación asistida del reporte, que permita aumentar la frecuencia de elaboración (de semanal a diario), reducir el riesgo operativo y fortalecer el control y la calidad de la información entregada a clientes y a la gestión interna.

El objetivo no es solo eficiencia operativa, sino mejorar **oportunidad, consistencia y confiabilidad**, con impacto directo en la gestión de inversiones y en la reputación frente a clientes.

**PROCESO OBJETIVO  – CÓMO SERÁ CON IA**

Implementar un flujo automatizado que integre fuentes de mercado, información interna y validaciones contra estados oficiales, permitiendo la generación automática del OnePager y sus anexos.[^9]

Esto permitirá:

Generación automática del **OnePager **

Actualización automática de tablas de rendimientos y métricas clave

Validaciones cruzadas contra estados oficiales del banco

Detección automática de inconsistencias

Distribución más frecuente (idealmente diaria)

Reducción significativa del tiempo operativo

**Paso 1: Inte****gración automática de fuentes de información**

El sistema extraerá y consolidará información desde:

**Fuentes de mercado**

Precios de activos (Bloomberg y web SBS)

Benchmarks

**Fuentes internas**

Operaciones del portafolio (compras y ventas)

Movimientos de caja

**Fuentes externas de control**

EECC mensuales del banco (PDF)

**Paso 2: Procesamiento y actualización automática**

Cálculo de los siguientes indicadores

Actualización automática de precios de mercado

Incorporación automática de operaciones

Valorización y rendimiento de cada portafolio

Generación de métricas clave (WTD, MTD, YTD, duración, exposición, etc.)

Generación de un Data Frame o libro de Excel donde actualice el valor del portafolio diariamente para tener data histórica del valor de cada portafolio

Se elimina la ejecución manual de múltiples macros y la manipulación directa de archivos.

**Paso 3: Validaciones automáticas **

Se implementarán controles automáticos para:

Validación de precios de compra vs precios de mercado (Input vs output)

Consistencia de cantidades y valorizaciones (Input vs output)

Comparación contra el EECC de los bancos (En caso del OP mensual)[^10]

Generación de alertas automáticas ante inconsistencias

**IA / Agente de control:**

Detecta anomalías o desviaciones inusuales

Prioriza diferencias relevantes para revisión

Reduce el riesgo de error operativo.

**Paso 4: ****Generación automática de entregables**[^11]

Con la información validada, el sistema generará automáticamente:

OnePager por portafolio (formato estándar)

Tabla resumen de rendimientos

Archivos de soporte para gestión interna

La intervención humana se limitará a una **revisión final de validación** antes del envío.

**Paso 5: Distribución y aumento de frecuencia**

El proceso permitirá pasar de:

**Frecuencia actual:** semanal (9 horas por ejecución)

**Escenario objetivo:** diario, con mínima carga operativa

Impacto esperado:

Reducción ≥50% del tiempo de generación

Capacidad de escalar sin aumentar horas/hombre

Mayor oportunidad para decisiones de inversión y comunicación con clientes

**STACK TÉCNICO (para transparencia, no necesitan entender todo):**

**LO QUE EL ****POC ****HARÁ (****Alcance ****SÍ):**[^12][^13][^14]

**Responder preguntas sobre información financiera del ****portafolio**[^15]

Sobre variables predefinidas:

Rendimiento 

Activos

Valor Patrimonio

Ejemplos de consultas:

“¿Por qué cayó el portafolio este mes?”

“¿Cuál fue la variación del portafolio respecto al mes anterior?”

“¿Qué activo tuvo mayor incremento/disminución en el precio en el último semestre, trimestre, mes?”

**Consultar fuentes internas estructuradas**

El POC se alimentará exclusivamente de:

Bloomberg

Reportes(OP) cargados por el analista

**Citar fuentes siempre**

Toda respuesta incluirá:

Portafolio

Mes

Archivo fuente

Hoja o sección del Excel

Fecha de carga

**Guardar historial de consultas por usuario**

El sistema registrará:

Usuario

Fecha

Consulta realizada

Fuente utilizada

Respuesta generada

Esto permitirá:

Auditoría interna

Seguimiento de uso

Identificación de patrones de consulta

**LO QUE EL POC NO HARÁ (****Alcance ****NO - crítico definir límites):**[^16]

❌ 	No tomará decisiones de inversión ni ejecutará operaciones.

❌	No reemplazará el criterio del equipo (Inversiones).

❌	No trabajará en tiempo real; dependerá de la información cargada

**CRÍTICO**: Estos límites existen por timeline de POC (4 semanas). 

Si pasa a MVP, se pueden agregar.

**PLAN B SI ALGO FALLA:**

De haber algún riesgo se mantienen plantillas anteriores con las cuales se lleva el proceso actualmente (duración actual 9 horas)

**SECCIÓN 3: DATOS Y FUENTES (20 min)**

**DATOS Y FUENTES - LO MÁS CRÍTICO DEL POC**

**INVENTARIO DE DATOS NECESARIOS:**

**Tabla de Fuentes de ****Datos**[^17]

**DISPONIBILIDAD Y RESPONSABLES (completar ahora):**

**Miembros del proyecto**

Marcos Ruiz (Sponsor)

Luciano Rosillo (Líder y Usuario)

Carlos Quispe (Usuario)

**BLOOMBERG**:

Acceso disponible: ✅ SÍ / ❌ NO / ⏳ PENDIENTE

Tipo: Terminal / API / Ambos

Credenciales API: No cuento con esa información

Responsable accesos: Edwin Freitas

ETA acceso para SEIDOR: No cuento con esa información

Restricción de uso: Considerar la limitación de descarga de datos de Bloomberg

¿Podemos usar datos en IA?: No cuento con esta información

**SBS**:

Acceso: ✅ Público (web)

Descarga: ⏳ Web Scrapping 

Plan B si OCR falla: Descarga Manual

**iShares**:

Acceso: ✅ Público (web)

Descarga: ⏳ Web Scrapping 

Plan B si OCR falla: Descarga Manual

**PREPARACIÓN DE DATOS (timeline crítico):[^19]**

**SEMANA 1 (Feb 1****6****-****20****):**

**​​**Bloomberg API credentials provistos a SEIDOR (Owner: [Nombre], Due: Feb 17) 

Muestra de estructura de datos inputs

Muestra de tabla resumen y cálculo de retornos considerando aportes y retiros.

​​​​Muestra de estructura de One Pager(Producto final) (Owner: [Nombre], Due: Feb 18) 

**SEMANA 2 (Feb ****23****-2****7****):**

Primer libro de excel o data frame que contenga el valor diario del portafolio.

Análisis de OP (Variación WTD, MTD, YTD)

**CALIDAD DE DATOS - CRITERIOS DE ACEPTACIÓN:**

Para que el POC arranque, necesitamos MÍNIMO:

Descarga de precios de activos desde Bloomberg, Página SBS y iShares

Saldos de Caja y movimientos para el correcto cálculo de retornos

 Descarga de datos del Benchmark desde Bloomberg

Estructura del reporte

Para considerar el POC exitoso en calidad de datos: 

Bloomberg: 100% disponibilidad durante POC

Reporte bajo la estructura predefinida con cálculos de retornos correctos y variaciones WTD (Considerando compras y ventas), MTD, y YTD

 Tiempo de elaboración 

Validación de la concordancia entre stock de activos y lo que obtenemos en el reporte generado.

**SECCIÓN 4: CRITERIOS DE ÉXITO (30 min)[^20][^21]**

**CRITERIOS DE ÉXITO - CÓMO MEDIMOS SI FUNCIONA**

**KPIs ****PRIMARIOS (Must-have para Go):**

**KPI #1 – EFICIENCIA (El más importante)**

**Documento completado hasta este apartado**

**SECCIÓN 5: EQUIPO Y RESPONSABILIDADES (20 min)**

**EQUIPO Y RESPONSABILIDADES - QUIÉN HACE QUÉ**

**ROLES Y CONTACTOS:**

**Sponsor Ejecutivo del POC**

**Champion Operativo (Task Force)**

**Usuarios Piloto**

**Responsabilidades de usuarios piloto**

**Lo que NO se espera**

❌ Que aprendan a programar 

❌ Que resuelvan problemas técnicos 

❌ Que usen la herramienta fuera del horario laboral |

**Punto de Contacto TI / Seguridad**

**Equipo SEIDOR**

**Gerente de Proyecto**

**Consultor Técnico**

**Consultor Funcional**

**Director de Estrategia IA (Arvind)**

**Disponibilidad SEIDOR**

**CANALES DE COMUNICACIÓN:**

**WhatsApp Grupo: "POC [Nombre] - Grupo Macro"**

Miembros: Sponsor, Champion, Usuarios Piloto, Frank, Equipo SEIDOR

Propósito: Coordinación diaria, consultas rápidas, blockers

Reglas: Solo mensajes relevantes al POC, no spam

**Email: [email grupo creado específicamente]**

Propósito: Comunicación formal, entregables, reportes

Frecuencia: Reporte semanal viernes PM

**Calls**:

Semanal (Viernes 10-10:30 AM): Status + blockers + próxima semana

Ad-hoc: Según necesidad (agendados con 24h anticipación)

Demo final: [Fecha específica - ej "Viernes 20 Marzo 2-4 PM"]

**CREAR EL GRUPO WHATSAPP AHORA (en vivo):**

**Arvind:**

"Vamos a crear el grupo WhatsApp ahora mismo. Todos saquen sus teléfonos."

**[Gerente Proyecto crea grupo y agrega a todos uno por uno]**

**[Primer mensaje del grupo - Arvind lo dicta]:**

🎯 POC [NOMBRE] - IA LAB GRUPO MACRO

Kickoff: Lunes 16 Febrero

Demo Final: Viernes 20 Marzo

**REGLAS DEL GRUPO:**

✅ Consultas rápidas (<2 min de explicación)

✅ Blockers urgentes

✅ Coordinación de sesiones

✅ Feedback importante

❌ NO spam

❌ NO conversaciones largas (mejor call)

❌ NO temas fuera del POC

Primer call: Viernes 20 Feb 10 AM

Nos vemos el lunes para arrancar! 🚀

**SECCIÓN 6: ****TIMELINE ****Y HITOS (15 min)**[^22][^23]

**TIMELINE DETALLADO - SEMANA A SEMANA**

**CALENDARIO COMPLETO:**

**🎨**** CRONOGRAMA DE POC (Inicio: 16 Febrero) — Formato Consultoría Premium**

**Semana 0 — Onsite y Decisión (16–17 Feb 2026)**

**Objetivo: ****Workshop presencial, definición final del POC y firma de compromisos.****.**

**Semana 1 — ****Preparación Técnica y Datos (18–22 Feb 2026)**

**Objetivo: ****Accesos, validación de fuentes, setup de entorno y muestra de datos.**

**Hito Semana 1:**

🔹 Usuarios piloto realizan su **primera consulta real**.

**Semana 2 — ****Desarrollo Core + Onboarding (23–27 Feb 2026)**

**Objetivo: ****Funcionalidades base y primeros usuarios piloto activos.**

**Hito Semana 2:**

🔹 ≥50% usuarios piloto hacen **≥3 consultas reales** en la semana.

**Semana 3 — Uso intensivo + Medición (2–6 Mar)**

**Objetivo: capturar datos reales para evaluar KPIs**

**Hito Semana 3:**

🔹 Time-tracking completo de **≥[N] análisis reales**.

**Semana 4 — ****Uso intensivo + Medición (9–13 Mar 2026)**

**Objetivo: consolidar evidencia + preparar demo para Steering**

**Hito Semana 4:**

🔹 Decisión **Go / No–Go** basada en KPIs primarios.

**Semana 5 — ****Cierre POC y Demo Ejecutiva (16–20 Mar 2026)**

**En función de la decisión**

**Si GO → Escalamiento a MVP**

Kickoff MVP (16 Mar)

Plan de productivización (ambientes, seguridad, usuarios)

**Si NO****-GO → Aprendizaje**

Post-mortem: causa raíz

Decisión: pivotar o pausar IA Lab

**HITOS CRÍTICOS CON RESPONSABLES:**

**RIESGOS DE TIMELINE:**

**SECCIÓN 7: PR****ESUPUESTO Y RECURSOS (10 mi****n)**[^24]

**PRESUPUESTO Y RECURSOS**

**INVERSIÓN POC (4 semanas):**

**SEIDOR - Servicios Profesionales:**

Gerente de Proyecto: 80h × $[rate] = $[X]

Consultor Técnico: 160h × $[rate] = $[Y]

Consultor Funcional: 60h × $[rate] = $[Z]

Director Estrategia (Arvind): 20h × $[rate] = $[W]

TOTAL SEIDOR: $15,000 (fijo)

**Azure - Infraestructura Cloud (4 semanas):**

Azure OpenAI API: ~$800

Pinecone Vector DB: ~$300

Azure Container Apps: ~$200

Storage + Networking: ~$100

TOTAL AZURE: ~$1,400

**Bloomberg - API usage:**

Incluido en licencia actual: $0 adicional

────────────────────────────────────────────────────────────────

**INVERSIÓN TOTAL POC: ~$16,400**

**RETORNO ESPERADO AÑO 1: $162,000**

**ROI: 888%**

**PAYBACK: <2 meses**

**RECURSOS GRUPO MACRO (tiempo invertido):**

**Sponsor:**

Calls semanales: 4 × 0.5h = 2h

Demo final + decisión: 2h

TOTAL: 4h en 4 semanas

**Champion:**

Coordinación diaria: 5 días/sem × 0.5h × 4 sem = 10h

Calls semanales: 4 × 0.5h = 2h

TOTAL: 12h en 4 semanas

**Usuarios Piloto (cada uno):**

Onboarding: 3h

Uso semanal: 4 sem × [X]h/sem = [Y]h

Feedback diario: 4 sem × 5 días × 5 min = 1.5h

Survey + sesiones: 2h

**TOTAL POR USUARIO: ~[Y+6.5]h en 4 semanas**

5 Usuarios × [Y+6.5]h = [Total]h

**Frank (TI):**

Setup accesos: 2h

Soporte ad-hoc: ~2h

TOTAL: 4h en 4 semanas

**INVERSIÓN TOTAL TIEMPO GRUPO MACRO: ~[Total]h**

A $[rate promedio]/h = $[Z] en costo de oportunidad

**INVERSIÓN COMBINADA: $16,400 (SEIDOR) + $[Z] (tiempo interno)**

**                    = $[Total] total**

**RETORNO AÑO 1: $162,000**

**ROI REAL: [Calcular]%**

**SI PASA A MVP (Semanas 6-15 post-POC):**

**Inversión adicional estimada:**

SEIDOR desarrollo MVP: $35,000

Azure producción (10 meses): ~$5,000

Expansión a más usuarios: $10,000

TOTAL MVP: ~$50,000

**Timeline MVP: 8-10 semanas**

**Usuarios finales: 15-20 (vs. 5 en POC)**

**ROI MVP año 1: ~600%**

**SECCIÓN 8: FIRMAS Y COMPROMISOS (15 min)**

**FIRMAS Y COMPROMISOS - EL CONTRATO**

Este POC Charter es un acuerdo vinculante entre las partes firmantes.

Al firmar, cada parte se compromete a:

SPONSOR EJECUTIVO SE COMPROMETE A:

✅ Asistir a calls semanales (salvo emergencia justificada)

✅ Desbloquear recursos en <24h cuando sea crítico

✅ Proteger tiempo de usuarios piloto (no sobrecargarlos)

✅ Tomar decisión Go/No-Go basada en datos, no intuición

✅ Comunicar honestamente si algo no está funcionando

Firma: _____________________ Fecha: ___________ 

Nombre: [Nombre completo]     

CHAMPION OPERATIVO SE COMPROMETE A:

✅ Dedicar 1-2h/día a coordinación del POC             

✅ Escalar blockers en <24h si no se resuelven            

✅ Capturar feedback de usuarios diariamente               

✅ Asistir a todas las calls 

Firma: _____________________ Fecha: ___________ 

Nombre: [Nombre completo]     

USUARIOS PILOTO SE COMPROMETEN A: 

✅ Asistir a onboarding obligatorio (Lun 10 Feb, 2-5 PM) 

✅ Usar la herramienta genuinamente [X]h/semana 

✅ Dar feedback honesto (aunque sea negativo)

✅ Participar en time-tracking cuando se solicite

✅ Completar survey final de NPS 

Usuario 1: _________________ Fecha: ___________ 

Usuario 2: _________________ Fecha: ___________ 

Usuario 3: _________________ Fecha: ___________ 

Usuario 4: _________________ Fecha: ___________ 

Usuario 5: _________________ Fecha: ___________ 

FRANK (TI) SE COMPROMETE A: 

✅ Provisión de accesos Azure antes del Vie 20 Feb 

✅ Permisos SharePoint antes del Jue 16Feb 

✅ Bloomberg API credentials antes del Vie 20 Feb 

✅ Respuesta a solicitudes críticas en <24h 

Firma: _____________________ Fecha: ___________ 

Nombre: Frank [Apellido completo] 

SEIDOR SE COMPROMETE A: 

✅ Entregar POC funcional en 4 semanas o explicar por qué no 

✅ Reportar progreso semanalmente con transparencia total 

✅ Escalar riesgos proactivamente (no ocultar problemas) 

✅ Transferir conocimiento genuino (documentación completa) 

✅ Recomendar Go/No-Go basado en datos objetivos 

Firma: _____________________ Fecha: ___________ 

Nombre: [Gerente Proyecto SEIDOR] 

Firma: _____________________ Fecha: ___________ 

Nombre: Arvind Ludhiarich - Director Estrategia IA 


| Paso | Descripción | Tiempo (min/horas) | Quién (Rol) | Herramienta | Dolor / Fricción |
| --- | --- | --- | --- | --- | --- |
| Paso 1 | Revisión de compras, ventas y cupones para alimentar saldos de caja | 20 minutos | C Quispe | Correo | Dependencia de internos y terceros. |
| Paso 2 | Elaboración de información de saldos de Caja | 4 horas | L Rosillo | Web Bancos, Excel | Alto volumen de información que induce al error humano |
| Paso 3 | Revisión de Saldos de Caja contra ingreso por cupones | 25 minutos | C Quispe | Excel | Bajo |
| Paso 4 | Extracción de información para el vector de precios y retornos (Activos y BM) | 15 minutos | C Quispe | Bloomberg, Internet, Excel | Limitada disponibilidad de datos |
| Paso 5 | Incluir Compras y ventas de activos en el generador del OP | 50 minutos | C Quispe | Correo | Alto volumen de información |
| Paso 6 | Correr Macros para elaborar OP Naturales con información disponible a las 10 am | 30 minutos | C Quispe | Correo |  |
| Paso 7 | Extracción de precios faltantes 1PM | 10 minutos | Cquispe | Excel, Bloomberg |  |
| Paso 8 | Correr Macros para elaborar OP Naturales con información disponible a la 1PM | 10 minutos | C Quispe | Excel |  |
| Paso 9 | Revisión de OP generado Naturales | 1 hora y 20 minutos | C Quispe | Excel |  |
| Paso 10 | Correr Macros OP Institucional | 25 min | C Quispe | Excel |  |
| Paso 11 | Revisión OP generado Institucional | 15 min | C Quispe | Excel |  |
| Paso 12 | Envío de Correo a PM de port. Inst. detallando duración del portafolio y el Benchmark, adjuntando información diversa de la información histórica del portafolio | 10 min | C Quispe | Excel |  |
| Paso 13 | Envío de correo con resumen de retornos de portafolios y Benchmark (WTD, MTD, YTD) | 20 min | C quispe | Excel y correo |  |


| Fuente | Datos específicos | Período | Formato |
| --- | --- | --- | --- |
| Bloomberg API | Precios de activos | Información del día de ejecución |  |
| Bloomberg API | Retorno y duración de los activos | Información del día de ejecución |  |
| Bloomberg API | Retorno del BM | Información del día de ejecución |  |
| Web Ishares | Duración de los activos | Información del día de ejecución |  |
| SBS | Vector de precios | Información del día de ejecución |  |
| Precio y retorno de activos no disponibles en bloomberg | Precio y retorno de activos no disponibles en bloomberg | Información del día de ejecución |  |
| Estados de cuenta | Precios, cantidades de activos y saldos de caja | Información del día de ejecución |  |
|  |  |  |  |
|  |  |  |  |


| Elemento | Detalle |
| --- | --- |
| Métrica | Tiempo promedio por elaboración de One Pager |
| Baseline actual | 9 horas (medido ayer en diagnóstico) |
| Target POC | ≤ 90 minutos — ([78]% reducción) |
| Medición | Elaboración diaria de One Pagers |
| Responsable de medición | Carlos Quispe y Luciano Rosillo |
| Criterio Go / No-Go | • GO: ≥[Z-10]% reducción 
• Revisión: si <[Z-10]%, analizar causa raíz + decidir |


| Campo | Detalle |
| --- | --- |
| Nombre | Marcos Ruiz |
| Cargo | GG MWM |
| Email | mruiz@grupomacro.pe |
| Celular | 989268468 |
| Responsabilidades | ✓ Revisar progreso semanal (30 min call ) 
✓ Desbloquear recursos/accesos en <24h 
✓ Asistir a demo final y tomar decisión Go/No-Go 
✓ Comunicar status a Steering Committee mensual 
✓ Proteger tiempo de usuarios piloto |
| Disponibilidad comprometida | • Por definir: Call semanal 
• WhatsApp/email: Respuesta <4h días hábiles 
• Escalaciones críticas: Llamada inmediata OK |


| Campo | Detalle |
| --- | --- |
| Nombre | Carlos Quispe |
| Cargo | [Rol en Task Force] |
| Email / Celular | cquispe@grupomacro.pe |
| Responsabilidades | ✓ Coordinación día a día con SEIDOR (WhatsApp) 
✓ Capturar feedback diario de usuarios piloto 
✓ Escalar blockers a Sponsor si no se resuelven en 24h 
✓ Organizar sesiones de prueba con usuarios 
✓ Validar que KPIs se midan correctamente |
| Tiempo comprometido | • 1–2 h/día durante 4 semanas 
• Disponible para llamadas con 2h de anticipación |


| # | Nombre | Cargo | Email | Celular | Compromiso | Disponibilidad | Rol especial |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | Carlos Quispe | Analista | cquispe@grupomacro.pe | 930309360 | Por definir(horas destinadas) | ✅ Confirmada |  |
| 2 | Luciano Rosillo | Analista | lrosillo@grupomacro.pe | 947930247 | Por definir(horas destinadas) | ✅ Confirmada | — |
| 3 | [Nombre] | [Cargo] | [Email] | [Celular] | [X] h/semana | ✅ Confirmada | — |
| 4 | [Nombre] | [Cargo] | [Email] | [Celular] | [X] h/semana | ⏳ Pendiente | — |
| 5 | [Nombre] | [Cargo] | [Email] | [Celular] | [X] h/semana | ✅ Confirmada | — |


| Responsabilidades |
| --- |
| ✓ Asistir a onboarding (3h – semana 1) |
| ✓ Usar la herramienta genuinamente |
| ✓ Dar feedback honesto diario (5 min) |
| ✓ Participar en time-tracking cuando se solicite |
| ✓ Completar survey de satisfacción |
| ✓ Asistir a demo final |


| Campo | Detalle |
| --- | --- |
| Nombre | Frank [Apellido] |
| Cargo | [CTO / Head of IT / etc] |
| Email / Celular | [email] / [número] |
| Responsabilidades | ✓ Provisión accesos Azure (Feb 17) 
✓ Permisos SharePoint (Feb 17) 
✓ Bloomberg API credentials (Feb 17) 
✓ Validación de política de seguridad 
✓ Soporte técnico de infraestructura 
✓ Revisión semanal de logs |
| SLA comprometido | • Respuesta a accesos: <24h 
• Blocker crítico: <4h 
• Participación en call semanal: opcional |


| Campo | Detalle |
| --- | --- |
| Nombre | [Nombre] |
| Email / Celular / WhatsApp | [email] / [número] / [número] |
| Responsabilidades | - Coordinación general del POC 
- Reporting semanal al Sponsor 
- Gestión de timeline y entregables 
- Punto de contacto con Champion |


| Campo | Detalle |
| --- | --- |
| Nombre | [Nombre] |
| Email / Celular | [email] / [número] |
| Responsabilidades | - Desarrollo backend & frontend 
- Integraciones Bloomberg/BCRP/SharePoint 
- Resolución de issues técnicos 
- Optimización de performance |


| Campo | Detalle |
| --- | --- |
| Nombre | [Nombre] |
| Email / Celular | [email] / [número] |
| Responsabilidades | - Onboarding usuarios piloto 
- Diseño UX/UI 
- Captura y análisis de feedback 
- Documentación |


| Campo | Detalle |
| --- | --- |
| Nombre | Arvind Ludhiarich |
| Email / Celular | [email] / [número] |
| Responsabilidades | - Revisión estratégica semanal 
- Escalación de riesgos críticos 
- Presentación final a Steering 
- Decisión de pivotes si es necesario |


| Disponibilidad |
| --- |
| • L–V 9 AM – 6 PM (hora Lima) |
| • WhatsApp grupo: respuesta <2h |
| • Emergencias: llamada (<30 min) |
| • Calls semanales: Viernes 10–10:30 AM |


| Fecha | Actividad |
| --- | --- |
| Lun 16 | ✓ Kickoff Día 1 completado |
| Mar 17 | ✓ Kickoff Día 2 completado |
| Mié 18 | SEIDOR: Setup Azure + repositorios |
| Jue 19 | TI: Permisos SharePoint activos |
| Vie 20 | TI: Credenciales Bloomberg API
Responsable: Entrega sample 50 PDFs BCRP |
| Sáb–Dom | SEIDOR: Validación técnica inicial |


| Fecha | Actividad |
| --- | --- |
| Lun 18 |  |
| Mar 17 |  |
| Mié 18 |  |
| Jue 19 |  |
| Vie 20 |  |
|  |  |


| Fecha | Actividad |
| --- | --- |
| Lun 23 |  |
| Mar 24 |  |
| Mié 25 |  |
| Jue 26 |  |
| Vie 27 |  |


| Fecha | Actividad |
| --- | --- |
| Lun 2 |  |
| Mar 3 |  |
| Mié 4 |  |
| Jue 5 |  |
| Vie 6 |  |


| Fecha | Actividad |
| --- | --- |
| Lun 9 | Última semana de uso continuo
Compilación de KPIs |
| Mar 10 | Survey NPS
Análisis final de KPIs |
| Mié 11 | Preparación presentación final |
| Jue 12 | Ensayo de demo interna |
| Vie 13 | ⭐ DEMO FINAL (2–4 PM)
• Demo en vivo
• KPIs vs Targets
• Testimonios
• Decisión Go/No-Go |


| HITO | FECHA (Nueva) | RESPONSABLE | CRITERIO DE ÉXITO |
| --- | --- | --- | --- |
| Accesos listos | Lun 16 Feb | Frank | SEIDOR confirma |
| Onboarding OK | Mar 17 Feb | SEIDOR | 100% asistencia |
| Primera consulta | Mié 18 Feb | Usuarios | ≥1 query exitoso |
| Decisión BCRP | Vie 21 Feb | Sponsor | Go/No-Go claro |
| Adopción inicio | Vie 28 Feb | Champion | ≥50% usan 3×/sem |
| Time-tracking | Vie 07 Mar | Usuarios | N análisis OK |
| Survey completo | Mar 10 Mar | Todos | 100% responden |
| Demo Final | Vie 13 Mar | SEIDOR | Presentación OK |
| Decisión final | Vie 13 Mar | Sponsor | Go/No-Go tomado |


| Nivel | Riesgo | Impacto | Mitigación |
| --- | --- | --- | --- |
| 🔴 Crítico | Accesos no listos a tiempo | Retraso de 1 semana en todo el POC | Frank compromete fechas hoy + seguimiento diario |
| 🟡 Medio | Usuarios piloto no asisten al onboarding | Curva de aprendizaje más lenta, menor uso en semana 2 | Sponsor comunica importancia y bloquea agendas ya |
| 🟡 Medio | OCR BCRP falla y se requiere pivotar | Pérdida de 2–3 días en semana 1 | Aplicar Plan B: solo Bloomberg + SharePoint |
| 🟢 Bajo | Usuario piloto enfermo o ausente | No crítico (5 usuarios → 4 suficientes) | Continuar validación con ≥4 usuarios |

---

## Comentarios

[^1]: **Autor:** Arvinder Ludhiarich | **Fecha:** 2026-03-03  
  **Contexto:** "PROBLEMA ESPECÍFICO QUE RESOLVEMOS..."  
  > El problema está bien explicado desde el punto de vista operativo (carga manual, riesgo de error y dependencia de múltiples fuentes). Sin embargo, para fortalecer el caso del POC sería recomendable cuantificar mejor el impacto del problema en el negocio.  
  >  
  > Sugerencias: Agregar datos como: Número de portafolios que se reportan actualmente, Número de clientes impactados, Tiempo total mensual consumido por el proceso, Número de errores históricos o correcciones realizadas, Impacto reputacional si el error llega al cliente.  
  > Esto ayudará a reforzar por qué este problema justifica inversión en automatización e IA.

[^2]: **Autor:** Arvinder Ludhiarich | **Fecha:** 2026-03-03  
  **Contexto:** "PROBLEMA ESPECÍFICO QUE RESOLVEMOS..."  
  > Se menciona que el proceso induce al error humano, pero no se cuantifica el nivel de error actual.  
  >  
  > Sería recomendable agregar: Número promedio de correcciones posteriores al envío, Número de revisiones internas antes del envío final, Tiempo promedio de corrección cuando hay errores.  
  > Esto permitirá luego medir si la solución realmente reduce el error operativo.

[^3]: **Autor:** Arvinder Ludhiarich | **Fecha:** 2026-03-03  
  **Contexto:** "PROCESO ACTUAL (AS-IS) - PASO A PASO..."  
  > AS-IS: falta especificar el "scope" exacto del OnePager.  
  >  
  > Para que el equipo técnico no construya "cualquier cosa", falta definir el alcance del entregable: ¿Qué secciones mínimas tiene el OnePager?, ¿Qué anexos incluye?, ¿Qué métricas debe contener sí o sí?  
  > Sugiero agregar una mini-lista "Contenido mínimo del OnePager".

[^4]: **Autor:** Arvinder Ludhiarich | **Fecha:** 2026-03-03  
  **Contexto:** Tabla de proceso AS-IS con 13 pasos  
  > El proceso AS-IS tiene buen nivel de detalle (13 pasos), lo cual es positivo para el diagnóstico. Sin embargo, para hacerlo más claro para ejecutivos se recomienda agrupar los pasos en 4 grandes bloques:  
  > 1. Recolección de información  
  > 2. Preparación y cálculo de datos  
  > 3. Generación del One Pager  
  > 4. Revisión y distribución  
  > Esto permitirá entender más rápido dónde está el mayor consumo de tiempo.

[^5]: **Autor:** Arvinder Ludhiarich | **Fecha:** 2026-03-03  
  **Contexto:** "FRECUENCIA: 4 veces al mes..."  
  > "De semanal a diario" es ambicioso; pero el POC necesita una frecuencia objetivo concreta (p.ej., "diario para X portafolios" o "diario solo días hábiles" o "daily snapshot").  
  > Sugiero definir: frecuencia objetivo del POC vs frecuencia objetivo en producción.

[^6]: **Autor:** Arvinder Ludhiarich | **Fecha:** 2026-03-03  
  **Contexto:** "COSTO MENSUAL..."  
  > El baseline está cuantificado (9 horas / 4 veces al mes / US$50 HH / US$1,800 mensual / US$21,600 anual). Para gobernanza, sugiero agregar una línea: "Fuente del baseline" (quién lo valida, fecha, muestra: cuántos onepagers medidos).  
  > Esto evita cuestionamientos en comité.

[^7]: **Autor:** Arvinder Ludhiarich | **Fecha:** 2026-03-03  
  **Contexto:** "US$ 100,000 de ingresos por año..."  
  > Excelente incluir Riesgo reputacional: está bien mencionado, falta convertirlo en criterio de diseño.  
  >  
  > Recomiendo convertir esto en un principio de diseño del POC: "human-in-the-loop obligatorio", "salidas con trazabilidad", "validación contra fuentes oficiales". Esto ancla el proyecto a control y confianza.

[^8]: **Autor:** Arvinder Ludhiarich | **Fecha:** 2026-03-03  
  **Contexto:** "PROCESO OBJETIVO (TO-BE)..."  
  > TO-BE: se describen capacidades, falta "qué decisiones mejora".  
  >  
  > Está bien planteado el valor (oportunidad, consistencia, confiabilidad). Para directorio, faltaría 1 línea: qué decisiones se vuelven mejores (p.ej., inversión, rebalanceos, riesgo, comunicación a cliente).  
  > Esto eleva el caso desde "automatización" a "mejor toma de decisiones".

[^9]: **Autor:** Arvinder Ludhiarich | **Fecha:** 2026-03-03  
  **Contexto:** "Integración automática de fuentes de información..."  
  > Las fuentes están, pero falta definir el diccionario mínimo: qué campos se requieren de cada fuente (precio, fecha, ISIN/ticker, cantidad, FX, benchmark, etc.). Sin eso, el POC queda débil en ejecución (riesgo de "conectamos fuentes pero no cuadran").

[^10]: **Autor:** Arvinder Ludhiarich | **Fecha:** 2026-03-03  
  **Contexto:** "Comparación contra el EECC de los bancos..."  
  > Muy buen punto. Sugiero agregar: "Fuente de verdad" (single source of truth) y regla de precedencia cuando hay conflicto (p.ej., Bloomberg vs estado bancario vs planilla interna). Esto es clave para evitar discusiones posteriores.

[^11]: **Autor:** Arvinder Ludhiarich | **Fecha:** 2026-03-03  
  **Contexto:** "paso 4: Generación automática de entregables..."  
  > Se describen outputs a nivel conceptual, pero falta listar outputs concretos del POC: OnePager generado (formato: PDF/PowerPoint/Word), Log/bitácora de validaciones, Reporte de inconsistencias detectadas, "Checklist de revisión humana". Esto ayuda a cerrar expectativas.

[^12]: **Autor:** Arvinder Ludhiarich | **Fecha:** 2026-03-03  
  **Contexto:** "LO QUE EL POC HARÁ (Alcance SÍ)..."  
  > Falta describir claramente el entregable final del POC: La sección describe el proceso futuro pero no deja completamente claro qué se entregará al final del POC.  
  >  
  > Se recomienda especificar: El POC entregará un flujo automatizado que genere el OnePager desde fuentes de datos, un prototipo funcional que permita ejecutar el proceso, un ejemplo de reporte generado automáticamente, evidencia de reducción de tiempo del proceso.  
  > Esto ayuda a evitar expectativas poco claras.

[^13]: **Autor:** Arvinder Ludhiarich | **Fecha:** 2026-03-03  
  **Contexto:** "LO QUE EL POC HARÁ (Alcance SÍ)..."  
  > Falta declarar explícitamente la hipótesis del POC (formato "Si... entonces... medido por..."). Hoy hay objetivos, pero no hipótesis testables. Sin esto, el Gate 1 queda interpretativo.

[^14]: **Autor:** Arvinder Ludhiarich | **Fecha:** 2026-03-03  
  **Contexto:** "LO QUE EL POC HARÁ (Alcance SÍ)..."  
  > Actualmente la sección mezcla dos objetivos diferentes: 1️⃣ Automatización del proceso de generación del OnePager, 2️⃣ Un asistente que responde preguntas sobre el portafolio. Esto puede generar confusión porque son dos productos distintos.  
  >  
  > Se recomienda separar claramente: Componente 1 — Automatización del proceso operativo (Integración de datos, Cálculo automático, Generación del reporte), Componente 2 — Consulta inteligente sobre portafolios (Motor de preguntas, Historial de consultas, Auditoría).  
  > Esto ayudará a clarificar qué parte es el verdadero POC.

[^15]: **Autor:** Arvinder Ludhiarich | **Fecha:** 2026-03-03  
  **Contexto:** "Responder preguntas sobre información financiera del portafolio..."  
  > Actualmente la sección mezcla dos objetivos diferentes: 1️⃣ Automatización del proceso de generación del OnePager, 2️⃣ Un asistente que responde preguntas sobre el portafolio. Esto puede generar confusión porque son dos productos distintos.  
  >  
  > Se recomienda separar claramente: Componente 1 — Automatización del proceso operativo, Componente 2 — Consulta inteligente sobre portafolios.

[^16]: **Autor:** Arvinder Ludhiarich | **Fecha:** 2026-03-03  
  **Contexto:** "LO QUE EL POC NO HARÁ (Alcance NO)..."  
  > El alcance está descrito, pero recomiendo agregar explícitamente un bloque "Out of Scope". Ej.: "no incluye automatizar el envío a clientes", "no incluye integración completa con X", "no incluye cobertura de todos los portafolios". Esto baja riesgo de scope creep.

[^17]: **Autor:** Arvinder Ludhiarich | **Fecha:** 2026-03-03  
  **Contexto:** "Tabla de Fuentes de Datos..."  
  > La tabla de datos identifica fuentes importantes, pero faltan varios elementos críticos para un POC de IA: Agregar columnas adicionales: Frecuencia de actualización del dato, Nivel de confiabilidad, Formato exacto del dato (CSV, API, Excel, PDF), Responsable de validación.  
  > Esto permitirá evaluar mejor la viabilidad técnica del POC.

[^18]: **Autor:** Frank Alexander van Ede / Arvinder Ludhiarich | **Fecha:** 2026-03-03  
  **Contexto:** "BLOOMBERG: Acceso disponible..."  
  > Frank Alexander van Ede: En gestion con Bloomberg  
  >  
  > Arvinder Ludhiarich: Confirmar si las licencias de Bloomberg permiten: Uso en sistemas automatizados, Almacenamiento de datos, Uso en modelos de IA. Este punto puede bloquear el POC si no se resuelve.

[^19]: **Autor:** Arvinder Ludhiarich | **Fecha:** 2026-03-03  
  **Contexto:** "PREPARACIÓN DE DATOS (timeline crítico)..."  
  > Corregir Fechas...esto es un proyecto de 8 semanas

[^20]: **Autor:** Arvinder Ludhiarich | **Fecha:** 2026-03-03  
  **Contexto:** "KPI #1 – EFICIENCIA..."  
  > El documento actualmente define solo un KPI (reducción de tiempo). Para evaluar correctamente el POC deberían incluirse al menos 3 KPIs adicionales.  
  >  
  > Sugerencias: KPI 1 — Tiempo de elaboración (actualmente definido), KPI 2 — Error operativo (Número de inconsistencias detectadas), KPI 3 — Adopción (Número de usuarios que usan el sistema durante el POC), KPI 4 — Calidad del reporte (Validación por parte de los analistas).  
  > Esto permitirá una evaluación más robusta del POC.

[^21]: **Autor:** Arvinder Ludhiarich | **Fecha:** 2026-03-03  
  **Contexto:** "KPI #1 – EFICIENCIA..."  
  > El documento menciona que el proceso toma 9 horas, pero no indica: ¿Cuántas mediciones se hicieron?, ¿Sí es un promedio?, ¿Sí, depende del portafolio?  
  >  
  > Sería recomendable documentar: Número de ejecuciones medidas, Rango de variación. Esto fortalece la credibilidad del KPI.

[^22]: **Autor:** Arvinder Ludhiarich | **Fecha:** 2026-03-03  
  **Contexto:** "SECCIÓN 6: TIMELINE Y HITOS..."  
  > El timeline mezcla actividades de otro POC. En la sección aparecen referencias a: BCRP, OCR de PDFs, consultas de usuarios. Estos elementos no parecen relacionados directamente con el OnePager.  
  >  
  > Se recomienda revisar esta sección y eliminar actividades que provengan de otros POCs.

[^23]: **Autor:** Arvinder Ludhiarich | **Fecha:** 2026-03-03  
  **Contexto:** "SECCIÓN 6: TIMELINE Y HITOS..."  
  > Hay inconsistencias en las fechas del cronograma: Ejemplo: Semana 0 indica 16-17 Feb, pero luego aparecen actividades con fechas que no corresponden a esa secuencia.  
  > Se recomienda limpiar el calendario para que el timeline sea más claro.

[^24]: **Autor:** Arvinder Ludhiarich | **Fecha:** 2026-03-03  
  **Contexto:** "SECCIÓN 7: PRESUPUESTO Y RECURSOS..."  
  > RECALCULAR YA QUE NO ES DE ESTE PROYECTO  
  >  
  > Arvinder Ludhiarich: o lo hacemos conjuntamente si hay dudas
