export const arccot = (x: number) => Math.PI / 2 - Math.atan(x);
export const degreesToRadians = (degrees: number) => degrees * (Math.PI / 180);
export const radiansToDegrees = (radians: number) => radians * (180 / Math.PI);
export const sinFromDegrees = (degrees: number) => Math.sin(degreesToRadians(degrees));
export const cosFromDegrees = (degrees: number) => Math.cos(degreesToRadians(degrees));
export const tanFromDegrees = (degrees: number) => Math.tan(degreesToRadians(degrees));
export const normalize = (angle: number): number => ((angle % 360) + 360) % 360;
export const DEG = Math.PI / 180;
export const RAD = 180 / Math.PI;
export const atanDeg = (x: number): number => Math.atan(x) * RAD;
export const sinDeg = (x: number): number => Math.sin(x * DEG);
export const cosDeg = (x: number): number => Math.cos(x * DEG);
export const tanDeg = (x: number): number => Math.tan(x * DEG);
export const acosDeg = (x: number): number => Math.acos(x) * RAD;
export const atan2Deg = (y: any, x: any) => Math.atan2(y, x) * RAD;

export const shouldMod180 = (prevCusp : number, currentCusp : number) => {
  // ** NOTE ** the calculated houses may require a 180 degree correction
  // used in Monk house systems (Placidus, Regiomontanus, etc)
  // all values are mod360ed
  if (currentCusp < prevCusp) {
    // For instances when prev = 350 and current = 20
    // But not when prev = 250 and current = 100 (280)
    if (Math.abs(currentCusp - prevCusp) >= 180) return false;
    return true;
  } if (prevCusp < currentCusp) {
    if (currentCusp - prevCusp < 180) return false;
    return true;
  }
};

export const modulo = (n: number, m: number): number => {
  return ((n % m) + m) % m;
}

export function toJulianDate(dateUTC: Date): number {
  const year = dateUTC.getUTCFullYear();
  const month = dateUTC.getUTCMonth() + 1;
  const day = dateUTC.getUTCDate();
  const hour = dateUTC.getUTCHours();
  const minute = dateUTC.getUTCMinutes();
  const second = dateUTC.getUTCSeconds();

  let Y = year;
  let M = month;
  if (M <= 2) {
    Y -= 1;
    M += 12;
  }

  const D = day + (hour + minute / 60 + second / 3600) / 24;
  const A = Math.floor(Y / 100);
  const B = 2 - A + Math.floor(A / 4);

  const JD = Math.floor(365.25 * (Y + 4716)) +
             Math.floor(30.6001 * (M + 1)) +
             D + B - 1524.5;

  return JD;
}

export function julianToUnixTimestamp(jd: number): number {
  const JD_UNIX_EPOCH = 2440587.5;
  return (jd - JD_UNIX_EPOCH) * 86400 * 1000;
}