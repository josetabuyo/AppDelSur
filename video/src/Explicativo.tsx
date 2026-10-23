import React from 'react';
import {AbsoluteFill, Audio, Img, Sequence, spring, staticFile, useCurrentFrame, useVideoConfig, interpolate, Easing} from 'remotion';
import {loadFont} from '@remotion/google-fonts/Anton';
import {loadFont as loadBody} from '@remotion/google-fonts/Inter';

const {fontFamily: ANTON} = loadFont();
const {fontFamily: INTER} = loadBody('normal', {weights: ['600', '800']});

const C = {sky: '#2AA7DF', navy: '#0C3C6E', yellow: '#F2D94E', white: '#FFFFFF'};

// Scene lengths (frames @30fps)
const D = [150, 225, 180, 165, 300, 210, 220];
// Narración (voz es-AR Tomás, edge-tts): un clip por escena, 10 frames después de que arranca.
const VO_OFFSET = 10;
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

// ---------- Scenes ----------
const S1 = () => (
  <>
    <Bg a={C.sky} b={C.navy} />
    <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', gap: 50}}>
      <Crest size={520} />
      <Line text="Del Sur" size={260} delay={18} hi={['Sur']} />
      <div style={{fontFamily: ANTON, fontSize: 92, color: C.white, letterSpacing: 3, opacity: useSp(50)}}>VIVÍ EL CLUB</div>
      <div style={{fontSize: 90, opacity: useSp(60), transform: `scale(${useSp(60, 8)})`}}>💙🤍💛</div>
    </AbsoluteFill>
  </>
);

const S2 = () => {
  const f = useCurrentFrame();
  return (
    <>
      <Bg a={C.navy} b="#061f3b" seed={1} />
      <Photo n={1} w={450} h={400} x={70} y={90} delay={5} rot={-6} />
      <Photo n={2} w={450} h={400} x={560} y={150} delay={14} rot={5} tone={C.sky} />
      <Photo n={3} w={450} h={400} x={70} y={520} delay={23} rot={4} tone={C.sky} />
      <Photo n={4} w={450} h={400} x={560} y={580} delay={32} rot={-5} />
      <div style={{position: 'absolute', left: 60, right: 60, top: 1040, display: 'flex', flexDirection: 'column', gap: 12, alignItems: 'center'}}>
        <Line text="Rugby. Hockey." size={170} delay={40} hi={[]} />
        <Line text="Rugby inclusivo." size={140} delay={64} color={C.yellow} />
        <div style={{marginTop: 24}}><Pill delay={100} bg={C.white} size={44}>Invictos 2025 · Primera C</Pill></div>
      </div>
    </>
  );
};

const S3 = () => {
  const f = useCurrentFrame();
  const counter = Math.floor(interpolate(f, [20, 70], [0, 200], {extrapolateRight: 'clamp', easing: Easing.out(Easing.cubic)}));
  const q = ['¿Quiénes juegan?', '¿A qué colegio van?', '¿Quién dejó de venir?'];
  return (
    <>
      <Bg a="#10243f" b="#04101f" seed={2} />
      <AbsoluteFill style={{padding: '170px 70px', alignItems: 'center'}}>
        <Line text="Hoy no sabemos" size={160} delay={0} />
        <Line text="cuántos somos" size={160} delay={10} color={C.yellow} />
        <div style={{fontFamily: ANTON, fontSize: 330, color: C.sky, marginTop: 40, opacity: 0.9 - (f > 70 ? Math.min(0.5, (f - 70) / 30 * 0.5) : 0), transform: `scale(${1 + Math.sin(f / 6) * 0.01})`}}>
          {f > 70 ? '¿?' : `~${counter}`}
        </div>
        <div style={{display: 'flex', flexDirection: 'column', gap: 26, marginTop: 40, alignItems: 'flex-start'}}>
          {q.map((t, i) => {
            const p = useSp(75 + i * 22, 14);
            return <div key={i} style={{fontFamily: ANTON, fontSize: 84, color: C.white, textTransform: 'uppercase', transform: `translateX(${(1 - p) * -900}px)`, borderLeft: `14px solid ${C.yellow}`, paddingLeft: 30}}>{t}</div>;
          })}
        </div>
      </AbsoluteFill>
    </>
  );
};

const S4 = () => (
  <>
    <Bg a={C.yellow} b="#f7ec9a" seed={3} />
    <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', gap: 40, padding: 70}}>
      <Crest size={300} />
      <Line text="Por eso hicimos" size={120} color={C.navy} delay={10} />
      <Line text="la app del club" size={190} color={C.navy} delay={20} />
      <div style={{background: C.navy, padding: '30px 50px', borderRadius: 30, transform: `rotate(-2deg) scale(${useSp(60)})`}}>
        <Line text="Hecha por el club." size={80} delay={60} />
        <Line text="Para el club." size={80} delay={70} color={C.yellow} />
      </div>
      <div style={{fontFamily: INTER, fontWeight: 600, fontSize: 40, color: C.navy, opacity: useSp(95)}}>Sin otro interés que el club.</div>
    </AbsoluteFill>
  </>
);

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
      <div style={{fontFamily: INTER, fontWeight: 600, fontSize: 26, color: '#fff', textAlign: 'center'}}>Sumate a Del Sur</div>
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

const S5 = () => {
  const f = useCurrentFrame();
  const per = 48;
  const caps = ['Instalás la app', 'Entrás con Google', 'Contestás si jugás', 'Unas preguntas · o cargás a tu hijo/a', 'Listo. ¡Gracias!'];
  const idx = Math.min(4, Math.floor((f - 60) / per));
  const si = Math.max(0, idx);
  const local = f - 60 - si * per;
  const p = useSp(0, 12);
  const trans = interpolate(Math.max(0, local), [0, 10], [1, 0], {extrapolateRight: 'clamp'});
  return (
    <>
      <Bg a={C.sky} b={C.navy} seed={4} />
      <AbsoluteFill style={{alignItems: 'center', paddingTop: 110}}>
        <Line text="1 minuto." size={170} delay={0} hi={['minuto.']} />
        <div style={{fontFamily: INTER, fontWeight: 800, fontSize: 44, color: '#fff', marginTop: 14, opacity: useSp(12)}}>Android y iPhone · sin vueltas</div>
        <div style={{marginTop: 50, width: 540, height: 1060, borderRadius: 80, background: '#0a0f1a', padding: 18, boxShadow: '0 50px 120px rgba(0,0,0,.55)', transform: `translateY(${(1 - p) * 900}px) rotate(${(1 - p) * 10}deg)`}}>
          <div style={{position: 'relative', width: '100%', height: '100%', borderRadius: 64, overflow: 'hidden', background: '#fff'}}>
            <div style={{position: 'absolute', inset: 0, transform: `translateX(${trans * 60}px)`, opacity: 1 - trans * 0.6}}><Screen i={si} f={Math.max(0, local)} /></div>
            <div style={{position: 'absolute', top: 18, left: '50%', width: 150, height: 36, marginLeft: -75, background: '#0a0f1a', borderRadius: 20, zIndex: 3}} />
          </div>
        </div>
        <div style={{position: 'absolute', bottom: 70}}>
          {f > 55 && <Pill key={si} delay={0} bg={C.yellow} size={46}>{caps[si]}</Pill>}
        </div>
      </AbsoluteFill>
    </>
  );
};

const S6 = () => {
  const items = [['👨‍🏫', 'Profes'], ['🏫', 'Colegios'], ['📞', 'Volver a llamar a los que se fueron']];
  return (
    <>
      <Bg a={C.navy} b={C.sky} seed={5} />
      <AbsoluteFill style={{padding: '180px 70px', alignItems: 'center'}}>
        <Line text="Un club" size={190} delay={0} />
        <Line text="que te da más" size={150} delay={8} color={C.yellow} />
        <div style={{display: 'flex', flexDirection: 'column', gap: 30, marginTop: 70, width: '100%'}}>
          {items.map(([e, t], i) => {
            const p = useSp(35 + i * 18, 12);
            return (
              <div key={i} style={{display: 'flex', alignItems: 'center', gap: 30, background: 'rgba(255,255,255,.95)', borderRadius: 40, padding: '34px 44px', transform: `translateX(${(1 - p) * 1200}px)`}}>
                <div style={{fontSize: 90}}>{e}</div>
                <div style={{fontFamily: ANTON, fontSize: i === 2 ? 58 : 78, color: C.navy, textTransform: 'uppercase', lineHeight: 1.05}}>{t}</div>
              </div>
            );
          })}
        </div>
      </AbsoluteFill>
    </>
  );
};

const S7 = () => {
  const f = useCurrentFrame();
  const pulse = 1 + Math.max(0, Math.sin(f / 5)) * 0.04;
  return (
    <>
      <Bg a={C.sky} b={C.navy} seed={6} />
      <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', gap: 36, padding: 60}}>
        <Line text="Esto recién empieza" size={140} delay={0} />
        <Line text="Vamos por más" size={140} delay={30} color={C.yellow} />
        <div style={{height: 10}} />
        <Crest size={380} delay={70} />
        <div style={{transform: `scale(${pulse})`, marginTop: 20}}>
          <Pill delay={100} size={96}>Sumate a Del Sur</Pill>
        </div>
        <div style={{fontFamily: INTER, fontWeight: 600, fontSize: 36, color: '#fff', opacity: useSp(125)}}>La app del club · hecha por el club, para el club 💙🤍💛</div>
      </AbsoluteFill>
    </>
  );
};

const scenes = [S1, S2, S3, S4, S5, S6, S7];
export const Explicativo: React.FC = () => (
  <AbsoluteFill style={{background: C.navy}}>
    {/* Música procedural libre de derechos (make_music.py de relay-motion-video), ya baja sola bajo la voz. */}
    <Audio src={staticFile('musica.wav')} volume={0.55} />
    {D.map((_, i) => (
      <Sequence key={`vo${i}`} from={starts[i] + VO_OFFSET}>
        <Audio src={staticFile(`voz/s${i + 1}.mp3`)} />
      </Sequence>
    ))}
    {scenes.map((S, i) => (
      <Sequence key={i} from={starts[i]} durationInFrames={D[i]}>
        <Fade dur={D[i]}><S /></Fade>
      </Sequence>
    ))}
  </AbsoluteFill>
);
