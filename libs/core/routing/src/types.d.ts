/**
 * @section Routing Bunker - Ambient Type Bridge
 * @description Inyección de tipos para Next.js Server.
 */
declare module 'next/server' {
  export interface NextRequest extends Request {
    nextUrl: URL;
  }
  export class NextResponse extends Response {
    static next(): NextResponse;
    static redirect(url: string | URL): NextResponse;
    static json(body: any, init?: ResponseInit): NextResponse;
  }
}
