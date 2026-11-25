// Imagens com versão AVIF (geradas por tools/avif.py, só quando o AVIF tem fidelidade igual ou
// maior que o WebP e arquivo menor). O build injeta a lista (__AVIF__) a partir de assets/*.avif.
// Navegador sem AVIF, ou antes da detecção (alguns milissegundos), recebe o WebP de sempre.
/* global __AVIF__ */
const HAS = new Set(typeof __AVIF__ !== 'undefined' ? __AVIF__ : []);
let ok = false;
const probe = new Image();
export const avifReady = new Promise((res) => {
  probe.onload = () => { ok = probe.naturalWidth > 0; res(ok); };
  probe.onerror = () => res(false);
});
probe.src = 'data:image/avif;base64,AAAAIGZ0eXBhdmlmAAAAAGF2aWZtaWYxbWlhZk1BMUIAAADrbWV0YQAAAAAAAAAhaGRscgAAAAAAAAAAcGljdAAAAAAAAAAAAAAAAAAAAAAOcGl0bQAAAAAAAQAAAB5pbG9jAAAAAEQAAAEAAQAAAAEAAAETAAAAKAAAAChpaW5mAAAAAAABAAAAGmluZmUCAAAAAAEAAGF2MDFDb2xvcgAAAABqaXBycAAAAEtpcGNvAAAAFGlzcGUAAAAAAAAAAQAAAAEAAAAQcGl4aQAAAAADCAgIAAAADGF2MUOBAAwAAAAAE2NvbHJuY2x4AAEADQAGgAAAABdpcG1hAAAAAAAAAAEAAQQBAoMEAAAAMG1kYXQSAAoIGAAGiAhoNCAyGhlHh4Yhh5555oAAAJBAyRxhSytNj1FFTqSg';
const key = (u) => u.split('/').pop().split('?')[0].replace(/\.webp$/, '');
/** melhor versão de uma URL .webp (AVIF quando existe e o navegador suporta) */
export const best = (u) => (ok && /\.webp$/.test(u) && HAS.has(key(u)) ? u.replace(/\.webp$/, '.avif') : u);
/** o mesmo para um srcset inteiro */
export const bestSet = (s) => s.replace(/[^\s,]+\.webp/g, best);
