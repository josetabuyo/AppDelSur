# Video explicativo AppDelSur

Motion/kinetic typography en Remotion (React + TS), vertical 1080x1920, 30 fps, ~44 s, sin voz ni música
(hay un hook comentado para `<Audio>` en `src/Explicativo.tsx`).

## Uso
```
source ~/.nvm/nvm.sh && nvm use 22
npm install
npx remotion studio          # previsualizar
npm run render               # -> out/appdelsur-explicativo.mp4
npx remotion still Explicativo out/frame.png --frame=300   # un cuadro
```

## Estructura
- `src/Explicativo.tsx`: 7 escenas (duraciones en el array `D`) — escudo, deportes/fotos, problema, la app, flujo en celular, decisiones, cierre.
- `public/`: escudo y 4 recortes del Instagram del club (baja resolución, se usan con tratamiento de color).
