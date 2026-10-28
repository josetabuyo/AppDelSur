export const metadata = { title: "Borrar mi cuenta · Del Sur" };

export default function BorrarCuenta() {
  return (
    <main className="hero" style={{ justifyContent: "flex-start", textAlign: "left" }}>
      <img src="/escudo-delsur-ig.png" alt="Escudo Del Sur" />
      <h1>Borrar mi cuenta</h1>
      <div className="card" style={{ maxWidth: 560, lineHeight: 1.5 }}>
        <p>Podés borrar tu cuenta de <b>AppDelSur</b> (la app de Del Sur Rugby Club) y todos los datos que cargaste cuando quieras.</p>
        <p><b>Desde la app o desde la web.</b> Entrá con tu cuenta de Google en la app o en{" "}
          <a href="/">appdelsur.vercel.app</a>, en la pantalla <i>¿Sos jugador/a?</i> tocá <b>Borrar mi cuenta</b> y confirmá.</p>
        <p><b>Por mail.</b> Si no podés entrar, escribí a{" "}
          <a href="mailto:delsurclubadm@gmail.com?subject=Borrar%20mi%20cuenta%20de%20AppDelSur">delsurclubadm@gmail.com</a>{" "}
          desde el mail con el que entraste. Lo borramos dentro de los 30 días.</p>
        <p><b>Qué se borra.</b> Tu cuenta (nombre, mail y foto de Google) y todos los registros que cargaste, incluidos los de tus hijos/as.
          Se borra en el momento y no se puede deshacer. No guardamos copias para otros usos.</p>
      </div>
    </main>
  );
}
