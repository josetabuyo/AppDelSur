export const metadata = { title: "Privacidad · Del Sur" };

export default function Privacidad() {
  return (
    <main className="hero" style={{ justifyContent: "flex-start", textAlign: "left" }}>
      <img src="/escudo-delsur-ig.png" alt="Escudo Del Sur" />
      <h1>Privacidad</h1>
      <div className="card" style={{ maxWidth: 560, lineHeight: 1.5 }}>
        <p><b>AppDelSur</b> es la app de Del Sur Rugby Club, hecha por el club y para el club, sin fines comerciales.</p>
        <p><b>Qué datos guardamos.</b> De tu cuenta de Google: nombre, mail y foto. De lo que cargás: los datos del cuestionario
          (nombre, apellido, DNI, fecha de nacimiento, colegio, localidad, domicilio, teléfono, mail, división, familia en el club
          y tus respuestas). Si cargás los datos de un hijo/a, lo hacés como su adulto responsable; si cargás a un compañero/a, con su permiso.</p>
        <p><b>Si ya sos socio/a.</b> Cuando tu mail figura en el padrón de socios del club, la app te muestra lo que el club ya
          tiene (nombre, DNI, fecha de nacimiento, división) para que lo confirmes. Solo lo ve quien entra con ese mail.</p>
        <p><b>Para qué.</b> Solo para la organización del club: saber cuántos somos, comunicarnos y tomar decisiones
          (profes, colegios, actividades). No vendemos ni cedemos datos a terceros ni los usamos para publicidad.</p>
        <p><b>Dónde.</b> En una base de datos en la nube (Neon / Vercel) con acceso restringido a quienes administran la app del club.</p>
        <p><b>Tus derechos.</b> Podés pedir ver, corregir o borrar tus datos escribiendo a{" "}
          <a href="mailto:delsurclubadm@gmail.com">delsurclubadm@gmail.com</a> (Ley 25.326 de Protección de Datos Personales). Para borrar tu cuenta y tus datos: <a href="/borrar-cuenta">borrar mi cuenta</a>.</p>
      </div>
    </main>
  );
}
