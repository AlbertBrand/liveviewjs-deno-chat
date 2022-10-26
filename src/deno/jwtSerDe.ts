import { create, SerDe, SessionData, verify } from "../deps.ts";

// Attempt to reuse the crypto key otherwise restarting server will
// result in session data passed from http to ws that will fail deserialization
const algo: HmacKeyGenParams = { name: "HMAC", hash: "SHA-512" };
const keyUsages: KeyUsage[] = ["sign", "verify"];
let jsonWebKey: JsonWebKey;
let key: CryptoKey;
try {
  // if key.json doesn't exist, generate a new key and save it to key.json
  key = await crypto.subtle.generateKey(algo, true, keyUsages);
  jsonWebKey = await crypto.subtle.exportKey("jwk", key);
} catch (e) {
  console.error(e);
  throw new Error("Unable to load or generate key", e);
}

/**
 * Deno specific JwtSerDe implementation that uses the crypto library to
 * sign and verify JWTs and stores the key on local disk.
 */
export class DenoJwtSerDe implements SerDe {
  async serialize<T extends SessionData>(payload: T): Promise<string> {
    const ser = await create({ alg: "HS512", type: "JWT" }, payload, key);
    return ser.toString();
  }

  async deserialize<T extends SessionData>(token: string): Promise<T> {
    const des = (await verify(token, key)) as T;
    return des;
  }
}
