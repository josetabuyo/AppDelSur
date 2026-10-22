import { buildLoginUrl, getUrlParam, parseTokenFromRedirect } from '../src/services/auth';

describe('login vía backend', () => {
  it('arma la URL de /mobile/login con redirect encodeado', () => {
    expect(buildLoginUrl('http://localhost:9014/', 'appdelsur://auth')).toBe('http://localhost:9014/mobile/login?redirect=appdelsur%3A%2F%2Fauth');
    expect(buildLoginUrl('https://appdelsur.vercel.app', 'exp://192.168.0.5:8081/--/auth')).toBe(
      'https://appdelsur.vercel.app/mobile/login?redirect=exp%3A%2F%2F192.168.0.5%3A8081%2F--%2Fauth',
    );
  });
  it('saca el token del redirect (esquema custom, Expo Go y web)', () => {
    expect(parseTokenFromRedirect('appdelsur://auth?token=abc.def.ghi')).toBe('abc.def.ghi');
    expect(parseTokenFromRedirect('exp://192.168.0.5:8081/--/auth?token=abc.def-ghi_j')).toBe('abc.def-ghi_j');
    expect(parseTokenFromRedirect('http://localhost:8081/auth?foo=1&token=xyz#')).toBe('xyz');
    expect(parseTokenFromRedirect('http://localhost:8081/auth#token=frag')).toBe('frag');
  });
  it('sin token o vacío → null; lee errores', () => {
    expect(parseTokenFromRedirect('appdelsur://auth')).toBeNull();
    expect(parseTokenFromRedirect('appdelsur://auth?token=')).toBeNull();
    expect(parseTokenFromRedirect('appdelsur://auth?mytoken=zzz')).toBeNull();
    expect(getUrlParam('appdelsur://auth?error=Acceso%20denegado', 'error')).toBe('Acceso denegado');
  });
});
