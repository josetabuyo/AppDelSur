import React from 'react';
import {AbsoluteFill, Audio, Img, Sequence, spring, staticFile, useCurrentFrame, useVideoConfig, interpolate, Easing} from 'remotion';
import {loadFont} from '@remotion/google-fonts/Anton';
import {loadFont as loadBody} from '@remotion/google-fonts/Inter';

const {fontFamily: ANTON} = loadFont();
const {fontFamily: INTER} = loadBody('normal', {weights: ['600', '800']});

const C = {sky: '#2AA7DF', navy: '#0C3C6E', yellow: '#F2D94E', white: '#FFFFFF'};

// Scene lengths (frames @30fps)
// Reel en 8 placas (propuesta Lucas + Maia): "Más conectados. Más organizados. Más Del Sur."
const D = [80, 120, 110, 140, 120, 110, 110, 160];
// Sin narración: la voz sintética resultó fría (Lucas). Cuando grabe alguien del club, va un <Audio> por placa.
const starts = D.reduce<number[]>((a, d, i) => [...a, (a[i - 1] ?? 0) + (i ? D[i - 1] : 0)], []);
export const TOTAL = D.reduce((a, b) => a + b, 0);

const useSp = (delay = 0, damping = 14) => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  return spring({frame: f - delay, fps, config: {damping, stiffness: 120, mass: 0.8}});
};

// Kinetic line: each word rises out of a mask
const Line: React.FC<{text: string; size?: number; color?: string; delay?: number; align?: 'center' | 'left'; stagger?: number; hi?: string[]}> =
  ({text, size = 150, color = C.white, delay = 0, align = 'center', stagger = 4, hi = []}) => {
    const words = text.split(' ');
    return (
      <div style={{display: 'flex', flexWrap: 'wrap', justifyContent: align === 'center' ? 'center' : 'flex-start', gap: `0 ${size * 0.25}px`, fontFamily: ANTON, fontSize: size, lineHeight: 1.0, textTransform: 'uppercase', color, textAlign: align}}>
        {words.map((w, i) => <Word key={i} delay={delay + i * stagger} color={hi.includes(w) ? C.yellow : color}>{w}</Word>)}
      </div>
    );
  };
const Word: React.FC<{delay: number; color: string; children: React.ReactNode}> = ({delay, color, children}) => {
  const p = useSp(delay, 13);
  return (
    <span style={{display: 'inline-block', overflow: 'hidden', paddingTop: '0.08em', paddingBottom: '0.04em'}}>
      <span style={{display: 'inline-block', color, transform: `translateY(${(1 - p) * 110}%) rotate(${(1 - p) * 6}deg)`, opacity: Math.min(1, p * 2)}}>{children}</span>
    </span>
  );
};

const Fade: React.FC<{dur: number; children: React.ReactNode}> = ({dur, children}) => {
  const f = useCurrentFrame();
  const o = interpolate(f, [0, 8, dur - 8, dur], [0, 1, 1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  return <AbsoluteFill style={{opacity: o}}>{children}</AbsoluteFill>;
};

const Crest: React.FC<{size: number; delay?: number}> = ({size, delay = 0}) => {
  const p = useSp(delay, 9);
  const f = useCurrentFrame();
  return (
    <div style={{width: size, height: size, borderRadius: '50%', overflow: 'hidden', background: '#fff', position: 'relative', transform: `scale(${p}) rotate(${(1 - p) * -90}deg) translateY(${Math.sin(f / 18) * 6}px)`, boxShadow: `0 0 0 10px ${C.yellow}, 0 30px 80px rgba(0,0,0,.4)`}}>
      <CrestImg size={size} />
    </div>
  );
};
const CrestImg: React.FC<{size: number}> = ({size}) => {
  const k = (size / 290);
  return <Img src={staticFile('escudo.png')} style={{position: 'absolute', width: 320 * k, height: 320 * k, left: size / 2 - 167 * k, top: size / 2 - 147 * k}} />;
};

// Animated background: gradient + drifting circles
const Bg: React.FC<{a: string; b: string; seed?: number}> = ({a, b, seed = 0}) => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill style={{background: `linear-gradient(${160 + Math.sin(f / 60) * 15}deg, ${a}, ${b})`, overflow: 'hidden'}}>
      {[0, 1, 2].map((i) => (
        <div key={i} style={{position: 'absolute', width: 700 + i * 250, height: 700 + i * 250, borderRadius: '50%', border: `${14 + i * 6}px solid rgba(242,217,78,${0.12 - i * 0.03})`, left: -200 + i * 380 + Math.sin((f + seed * 40) / 50 + i) * 60, top: 200 + i * 520 + Math.cos((f + seed * 40) / 60 + i) * 60}} />
      ))}
    </AbsoluteFill>
  );
};

const Photo: React.FC<{n: number; w: number; h: number; delay: number; rot?: number; tone?: string; x?: number; y?: number}> = ({n, w, h, delay, rot = 0, tone = C.navy, x = 0, y = 0}) => {
  const f = useCurrentFrame();
  const p = useSp(delay, 12);
  const zoom = 1.15 + f * 0.0016;
  return (
    <div style={{position: 'absolute', left: x, top: y, width: w, height: h, borderRadius: 28, overflow: 'hidden', border: `8px solid ${C.white}`, boxShadow: '0 30px 60px rgba(0,0,0,.45)', transform: `translateY(${(1 - p) * 700}px) rotate(${rot * p}deg) scale(${0.6 + 0.4 * p})`}}>
      <Img src={staticFile(`tile${n}.jpg`)} style={{width: '100%', height: '100%', objectFit: 'cover', transform: `scale(${zoom}) translate(${Math.sin(f / 40) * 8}px, 0)`, filter: 'contrast(1.1) saturate(1.1)'}} />
      <div style={{position: 'absolute', inset: 0, background: `linear-gradient(180deg, ${tone}33, ${tone}aa)`, mixBlendMode: 'multiply'}} />
    </div>
  );
};

const Pill: React.FC<{children: React.ReactNode; delay: number; bg?: string; color?: string; size?: number}> = ({children, delay, bg = C.yellow, color = C.navy, size = 52}) => {
  const p = useSp(delay, 12);
  return <div style={{display: 'inline-block', background: bg, color, fontFamily: ANTON, fontSize: size, textTransform: 'uppercase', padding: '14px 40px', borderRadius: 999, transform: `scale(${p})`, opacity: p, letterSpacing: 2}}>{children}</div>;
};

// ----- Phone -----
const Btn: React.FC<{children: React.ReactNode; bg?: string; color?: string; hl?: boolean; f: number}> = ({children, bg = C.sky, color = C.white, hl, f}) => (
  <div style={{background: bg, color, fontFamily: INTER, fontWeight: 800, fontSize: 30, padding: '24px 0', borderRadius: 20, textAlign: 'center', border: '3px solid rgba(12,60,110,.15)', transform: hl ? `scale(${1 + Math.max(0, Math.sin(f / 4)) * 0.04})` : undefined, boxShadow: hl ? `0 0 0 ${6 + Math.sin(f / 4) * 4}px rgba(242,217,78,.7)` : undefined}}>{children}</div>
);
const Field: React.FC<{label: string; value: string; f: number; at: number}> = ({label, value, f, at}) => {
  const n = Math.max(0, Math.floor((f - at) * 0.9));
  return (
    <div style={{marginBottom: 20}}>
      <div style={{fontFamily: INTER, fontWeight: 600, fontSize: 24, color: '#5a7a99'}}>{label}</div>
      <div style={{fontFamily: INTER, fontWeight: 800, fontSize: 32, color: C.navy, borderBottom: `4px solid ${C.sky}`, padding: '8px 0', minHeight: 50}}>{value.slice(0, n)}</div>
    </div>
  );
};
const Screen: React.FC<{i: number; f: number}> = ({i, f}) => {
  const base: React.CSSProperties = {position: 'absolute', inset: 0, padding: '90px 36px 36px', background: '#fff', display: 'flex', flexDirection: 'column', gap: 24};
  if (i === 0) return (
    <div style={{...base, background: `linear-gradient(180deg,${C.sky},${C.navy})`, alignItems: 'center', justifyContent: 'center'}}>
      <div style={{width: 200, height: 200, borderRadius: '50%', overflow: 'hidden', background: '#fff', position: 'relative'}}><CrestImg size={200} /></div>
      <div style={{fontFamily: ANTON, fontSize: 84, color: '#fff', textAlign: 'center', lineHeight: 1}}>VIVÍ EL <span style={{color: C.yellow}}>CLUB</span></div>
      <div style={{fontFamily: INTER, fontWeight: 600, fontSize: 26, color: '#fff', textAlign: 'center'}}>Llegó la nueva app del club</div>
      <div style={{width: '80%'}}><Btn f={f} bg={C.yellow} color={C.navy} hl>SUMATE</Btn></div>
    </div>
  );
  if (i === 1) return (
    <div style={{...base, justifyContent: 'center'}}>
      <div style={{fontFamily: ANTON, fontSize: 64, color: C.navy, textAlign: 'center'}}>SUMATE EN 1 MINUTO</div>
      <Btn f={f} bg="#fff" color="#333" hl><span style={{color: '#4285F4'}}>G</span>  Entrar con Google</Btn>
    </div>
  );
  if (i === 2) return (
    <div style={{...base, justifyContent: 'center'}}>
      <div style={{fontFamily: ANTON, fontSize: 70, color: C.navy, textAlign: 'center'}}>¿SOS JUGADOR/A?</div>
      <Btn f={f} hl>Sí, juego</Btn>
      <Btn f={f} bg={C.yellow} color={C.navy}>No, soy del club</Btn>
      <div style={{fontFamily: INTER, fontWeight: 600, fontSize: 24, color: '#5a7a99', textAlign: 'center'}}>También podés cargar a tu hijo/a</div>
    </div>
  );
  if (i === 3) return (
    <div style={base}>
      <div style={{fontFamily: ANTON, fontSize: 58, color: C.navy}}>UNAS PREGUNTAS</div>
      <Field f={f} at={0} label="Nombre" value="Valentina" />
      <Field f={f} at={14} label="Colegio" value="Colegio San Martín" />
      <Field f={f} at={34} label="División" value="M14 Rugby" />
      <div style={{fontFamily: INTER, fontWeight: 600, fontSize: 24, color: '#5a7a99'}}>¿Estás contento en el club?</div>
      <div style={{fontSize: 56}}>😀 🙂 😐</div>
      <div style={{marginTop: 'auto'}}><Btn f={f} hl>Enviar</Btn></div>
    </div>
  );
  return (
    <div style={{...base, background: `linear-gradient(180deg,${C.yellow},#fff)`, alignItems: 'center', justifyContent: 'center'}}>
      <div style={{fontSize: 140}}>💙</div>
      <div style={{fontFamily: ANTON, fontSize: 110, color: C.navy}}>¡GRACIAS!</div>
      <div style={{fontFamily: INTER, fontWeight: 600, fontSize: 28, color: C.navy, textAlign: 'center'}}>Ya sos parte de la base del Sur</div>
    </div>
  );
};

// Celular con una pantalla real de la app
const Phone: React.FC<{i: number; delay?: number}> = ({i, delay = 0}) => {
  const f = useCurrentFrame();
  const p = useSp(delay, 12);
  return (
    <div style={{width: 500, height: 980, borderRadius: 76, background: '#0a0f1a', padding: 16, boxShadow: '0 50px 120px rgba(0,0,0,.55)', transform: `translateY(${(1 - p) * 900}px) rotate(${(1 - p) * 10}deg)`}}>
      <div style={{position: 'relative', width: '100%', height: '100%', borderRadius: 60, overflow: 'hidden', background: '#fff'}}>
        <Screen i={i} f={Math.max(0, f - delay)} />
        <div style={{position: 'absolute', top: 18, left: '50%', width: 140, height: 34, marginLeft: -70, background: '#0a0f1a', borderRadius: 20, zIndex: 3}} />
      </div>
    </div>
  );
};

// ---------- Placas ----------
const R1 = () => (
  <>
    <Bg a={C.sky} b={C.navy} />
    <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', gap: 60}}>
      <Crest size={460} />
      <Line text="Del Sur" size={200} delay={10} hi={['Sur']} />
      <Line text="sigue creciendo" size={120} delay={22} />
    </AbsoluteFill>
  </>
);

const R2 = () => (
  <>
    <Bg a={C.navy} b="#061f3b" seed={1} />
    <Photo n={1} w={450} h={400} x={70} y={90} delay={2} rot={-6} />
    <Photo n={2} w={450} h={400} x={560} y={150} delay={8} rot={5} tone={C.sky} />
    <Photo n={3} w={450} h={400} x={70} y={520} delay={14} rot={4} tone={C.sky} />
    <Photo n={4} w={450} h={400} x={560} y={580} delay={20} rot={-5} />
    <div style={{position: 'absolute', left: 60, right: 60, top: 1090, display: 'flex', flexDirection: 'column', gap: 16, alignItems: 'center'}}>
      <Line text="Una nueva etapa." size={140} delay={26} />
      <Line text="Un club cada vez más conectado." size={96} delay={46} color={C.yellow} />
    </div>
  </>
);

const R3 = () => (
  <>
    <Bg a={C.sky} b={C.navy} seed={2} />
    <AbsoluteFill style={{alignItems: 'center', paddingTop: 110, gap: 50}}>
      <div style={{display: 'flex', flexDirection: 'column', gap: 10, alignItems: 'center'}}>
        <Line text="Llegó la nueva app del club." size={100} delay={0} />
        <Line text="Y vos sos parte." size={120} delay={20} color={C.yellow} />
      </div>
      <Phone i={0} delay={10} />
    </AbsoluteFill>
  </>
);

const R4 = () => (
  <>
    <Bg a={C.navy} b={C.sky} seed={3} />
    <AbsoluteFill style={{alignItems: 'center', paddingTop: 100, gap: 46}}>
      <div style={{display: 'flex', flexDirection: 'column', gap: 10, alignItems: 'center'}}>
        <Pill delay={0} size={50}>Primer paso: descargala</Pill>
        <div style={{height: 14}} />
        <Line text="Cargá y actualizá los datos de tu familia." size={86} delay={14} />
      </div>
      <Phone i={3} delay={20} />
    </AbsoluteFill>
  </>
);

const R5 = () => {
  const items = [['🪪', 'Datos de tu familia', 'HOY'], ['🎟️', 'Ingreso al club', 'PRÓXIMAMENTE'], ['📅', 'Eventos', 'PRÓXIMAMENTE'], ['📣', 'Información del club', 'PRÓXIMAMENTE']];
  return (
    <>
      <Bg a="#10243f" b="#04101f" seed={4} />
      <AbsoluteFill style={{padding: '200px 70px', alignItems: 'center'}}>
        <Line text="Una app." size={170} delay={0} />
        <Line text="Distintas instancias." size={120} delay={12} color={C.yellow} />
        <div style={{display: 'flex', flexDirection: 'column', gap: 28, marginTop: 80, width: '100%'}}>
          {items.map(([e, t, tag], i) => {
            const p = useSp(30 + i * 14, 12);
            const hoy = i === 0;
            return (
              <div key={i} style={{display: 'flex', alignItems: 'center', gap: 28, background: hoy ? C.yellow : 'rgba(255,255,255,.95)', borderRadius: 36, padding: '30px 40px', transform: `translateX(${(1 - p) * 1200}px)`}}>
                <div style={{fontSize: 76}}>{e}</div>
                <div style={{fontFamily: ANTON, fontSize: 60, color: C.navy, textTransform: 'uppercase', flex: 1}}>{t}</div>
                <div style={{fontFamily: INTER, fontWeight: 800, fontSize: 24, color: hoy ? C.navy : '#5a7a99', letterSpacing: 2}}>{tag}</div>
              </div>
            );
          })}
        </div>
      </AbsoluteFill>
    </>
  );
};

const R6 = () => (
  <>
    <Bg a={C.yellow} b="#f7ec9a" seed={5} />
    <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', gap: 30}}>
      <Line text="Más organización." size={150} delay={0} color={C.navy} />
      <Line text="Más conexión." size={150} delay={18} color={C.navy} />
      <Line text="Más Del Sur." size={190} delay={36} color={C.sky} />
    </AbsoluteFill>
  </>
);

const R7 = () => (
  <>
    <Bg a={C.navy} b={C.sky} seed={6} />
    <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', gap: 50, padding: 70}}>
      <div style={{display: 'flex', gap: 40, fontSize: 150, transform: `scale(${useSp(0, 10)})`}}>🤖🍏</div>
      <Line text="Android o iPhone." size={150} delay={8} />
      <Line text="Descargala y completá tus datos." size={96} delay={26} color={C.yellow} />
      <div style={{marginTop: 30}}><Pill delay={50} bg={C.white} size={58}>appdelsur.vercel.app</Pill></div>
    </AbsoluteFill>
  </>
);

const R8 = () => {
  const f = useCurrentFrame();
  const pulse = 1 + Math.max(0, Math.sin(f / 5)) * 0.04;
  return (
    <>
      <Bg a={C.sky} b={C.navy} seed={7} />
      <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', gap: 26, padding: 60}}>
        <Crest size={340} delay={0} />
        <div style={{height: 20}} />
        <Line text="Más conectados." size={130} delay={14} />
        <Line text="Más organizados." size={130} delay={26} />
        <Line text="Más Del Sur." size={160} delay={38} color={C.yellow} />
        <div style={{transform: `scale(${pulse})`, marginTop: 40, display: 'flex', flexDirection: 'column', gap: 18, alignItems: 'center'}}>
          <Pill delay={70} size={64}>Descargá la app</Pill>
          <Pill delay={80} bg={C.white} size={64}>Actualizá tus datos</Pill>
        </div>
      </AbsoluteFill>
    </>
  );
};

const scenes = [R1, R2, R3, R4, R5, R6, R7, R8];
export const Explicativo: React.FC = () => (
  <AbsoluteFill style={{background: C.navy}}>
    {/* Música procedural libre de derechos (make_music.py de relay-motion-video). */}
    <Audio src={staticFile('musica.wav')} volume={0.55} />
    {scenes.map((S, i) => (
      <Sequence key={i} from={starts[i]} durationInFrames={D[i]}>
        <Fade dur={D[i]}><S /></Fade>
      </Sequence>
    ))}
  </AbsoluteFill>
);
