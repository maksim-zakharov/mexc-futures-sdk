import { DEFAULT_HEADERS } from "./constants";
import md5 from "md5";

export interface SDKOptions {
  authToken: string; // WEB authentication token from browser
  userAgent?: string;
  customHeaders?: Record<string, string>; // Additional custom headers
}

/**
 * Generate MEXC crypto signature using MD5 algorithm
 * Based on GitHub code: https://github.com/user/repo
 * @param key WEB authentication key
 * @param obj Request object to sign
 * @returns Object with timestamp and signature
 */
function mexcCrypto(key: string, obj: any): { time: string; sign: string } {
  const dateNow = String(Date.now());
  const g = md5(key + dateNow).substring(7);
  const s = JSON.stringify(obj);
  const sign = md5(dateNow + s + g);

  return { time: dateNow, sign: sign };
}

/**
 * Generate HTTP headers for API requests
 * @param options SDK configuration options
 * @param includeAuth Whether to include authentication headers
 * @param requestBody Request body for signature (optional)
 * @returns Record of HTTP headers
 */
export function generateHeaders(
  options: SDKOptions,
  includeAuth: boolean = true,
  requestBody?: any
): Record<string, string> {
  const headers: Record<string, string> = {
    ...DEFAULT_HEADERS,
  };

  // Override user agent if provided
  if (options.userAgent) {
    headers["user-agent"] = options.userAgent;
  }

  // Add custom headers if provided
  if (options.customHeaders) {
    Object.assign(headers, options.customHeaders);
  }

  // Add authentication headers for private endpoints
  if (includeAuth) {
    // Use WEB token for authentication
    headers["authorization"] = options.authToken;

    // Add MEXC signature for POST requests with body
    if (requestBody) {
      const signature = mexcCrypto(options.authToken, requestBody);

      headers["x-mxc-nonce"] = signature.time;
      headers["x-mxc-sign"] = signature.sign;

      console.log("🔐 MEXC signature debug:");
      console.log(`  Timestamp: ${signature.time}`);
      console.log(`  Signature: ${signature.sign}`);
      console.log(`  Request body: ${JSON.stringify(requestBody)}`);
    }
  }

  return headers;
}
