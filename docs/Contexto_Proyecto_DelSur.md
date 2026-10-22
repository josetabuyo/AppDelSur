# Contexto del proyecto: Del Sur Rugby & Hockey — Reclutamiento y App de Infantiles

> Cómo usar este archivo: subilo a un Proyecto de Claude (como archivo del proyecto) o pegalo en las instrucciones del proyecto. Así Claude arranca con todo el contexto acumulado hasta el 21/10/2026.

## 1. Objetivo
- Hacer crecer la cantidad de socios de Del Sur Rugby & Hockey (rugby y hockey), con foco en **infantiles**, que es el déficit principal y la base del crecimiento deportivo y económico.
- Método: reclutamiento sistemático **por colegios**, más otros canales (redes, WhatsApp de padres, clubes de barrio, parroquias, escuelas de educación especial, referidos, eventos).
- Meta semestral (Jul–Dic 2026): +50 prospectos, +20 socios nuevos, 18 colegios contactados, 3+ acuerdos activos, 4 eventos, 20+ referidos, 1 escuelita firmada para marzo 2027.

## 2. El club
- Sede: Camino de Cintura 9399, 9 de Abril, Esteban Echeverría. Anexo infantiles: Parque Indoamericano, Villa Lugano.
- Transporte propio desde Parque Chacabuco con paradas intermedias.
- Torneos: URBA (rugby, Primera C) y AHBA (hockey).
- Casa de los **Pumpas XV** (rugby inclusivo): 8 jugadores campeones del International Mixed Ability Rugby 2017 (Vitoria-Gasteiz, España). Es el diferencial clave.
- Referencia de competencia: Almafuerte (~600 deportistas).
- Contacto: +54 9 11 6726-6302 · delsurclubadm@gmail.com · delsurclub.com

## 3. Zonas objetivo
- CABA sur: Villa Lugano, Villa Soldati, Parque Chacabuco, Flores, Mataderos.
- Provincia: Ciudad Evita; La Matanza norte (Villa Celina, Tapiales, Villa Madero).

## 4. Restricciones de trabajo
- Equipo de captación con dedicación parcial (tardes y fines de semana): máximo 2 acciones de campo por mes.
- Receso invernal 20–31/7 (colegios cerrados); ciclo lectivo termina a mediados de diciembre.

## 5. Archivos del proyecto
- `Mapa_Reclutamiento_DelSur_v3.xlsx`: planilla maestra. Pestañas: Colegios (39 colegios relevados, con Estado y Prospectos), Resumen y Pipeline (fórmulas de conteo), Plan Jul-Dic 2026.
- `Canales_Reclutamiento_DelSur_v3.docx`: canales de reclutamiento + plan de acción Jul–Dic 2026 mes a mes.
- `Guion_Visitas_DelSur.docx`: guion para visitar colegios (apertura, 5 puntos clave, propuestas A/B/C, objeciones, seguimiento).
- `Presentacion_Directivos_DelSur.pptx`: presentación para la comisión directiva.
- Regla: cualquier cambio de un dato, fecha o frase tiene que replicarse en todos los archivos.

## 6. App "Del Sur Infantiles" (prototipo, 21/10/2026)
- App web para gestionar jugadores de infantiles, asistencia y **colegio de origen**, cruzada con el Mapa de Reclutamiento. Inspirada en la app que usa la camada 2016 de rugby infantil del CASI.
- Módulos: Inicio, Jugadores, Asistencia, Colegios (cruce con el Mapa, colegios fuera del Mapa, ranking), Alertas; importar Mapa y jugadores desde Excel; exportar a Excel.
- Cada jugador guarda: nombre, apellido, categoría (M6–M14), nivel, colegio, barrio, canal de llegada, padrino, UAR, DNI, teléfono del responsable y deporte.
- La app es un artifact de Claude: para usarla hace falta cuenta de Claude y que el dueño la comparta (Colaborador para cargar datos).
- **Ficha para familias:** formulario de Tally sin login → https://tally.so/r/o9b7lO
  - Pide: Apellido, Nombre, Fecha de nacimiento, Colegio, Barrio, Deporte, Teléfono del adulto responsable.
  - Flujo: descargar respuestas de Tally (CSV/Excel) → en la app, Jugadores → Importar jugadores. La categoría se calcula sola con la fecha de nacimiento; reimportar no pisa datos ya cargados.
- Pendiente:
  1. Importar el Mapa real (v3) en la app.
  2. Cargar jugadores (familias vía Tally).
  3. Compartir la app con entrenadores como Colaboradores.
  4. Módulos futuros: Equipos (armado y PDF por partido) y Planificación de entrenamientos.

## 7. Forma de trabajo
- Español rioplatense (vos), respuestas directas y concisas, recomendaciones concretas antes que opciones abiertas.
- Precisión de datos no negociable: todo dato debe ser verificable o marcarse como estimado.
- Entregas incrementales; salidas limpias (sin filas de totales innecesarias ni marcas de "aproximado" cuando ya hay dato real).
