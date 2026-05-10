import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
} from "@nestjs/common";
import crypto from "node:crypto";

const REGION = "auto";
const SERVICE = "s3";
const DEFAULT_MAX_IMAGE_BYTES = 5 * 1024 * 1024; // 5mb
const ALLOWED_IMAGE_TYPES = new Map([
  ["image/jpeg", "jpg"],
  ["image/png", "png"],
  ["image/webp", "webp"],
]);

type ParsedImage = {
  buffer: Buffer;
  contentType: string;
  extension: string;
};

@Injectable()
export class R2StorageService {
  private readonly accountId: string;
  private readonly accessKeyId: string;
  private readonly secretAccessKey: string;
  private readonly bucket: string;
  private readonly publicBaseUrl: string;

  // Reads required R2 env vars once when the service starts:
  constructor() {
    const accountId = process.env.R2_ACCOUNT_ID?.trim();
    const accessKeyId = process.env.R2_ACCESS_KEY_ID?.trim();
    const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY?.trim();
    const bucket = process.env.R2_BUCKET?.trim();
    const publicBaseUrl = process.env.R2_PUBLIC_BASE_URL?.trim();

    if (!accountId) {
      throw new Error("[R2StorageService] R2_ACCOUNT_ID is not configured");
    }
    if (!accessKeyId) {
      throw new Error("[R2StorageService] R2_ACCESS_KEY_ID is not configured");
    }
    if (!secretAccessKey) {
      throw new Error(
        "[R2StorageService] R2_SECRET_ACCESS_KEY is not configured",
      );
    }
    if (!bucket) {
      throw new Error("[R2StorageService] R2_BUCKET is not configured");
    }
    if (!publicBaseUrl) {
      throw new Error(
        "[R2StorageService] R2_PUBLIC_BASE_URL is not configured",
      );
    }

    this.accountId = accountId;
    this.accessKeyId = accessKeyId;
    this.secretAccessKey = secretAccessKey;
    this.bucket = bucket;
    this.publicBaseUrl = publicBaseUrl.replace(/\/+$/, "");
  }

  async uploadObject(args: {
    objectKey: string; // r2 path
    body: Buffer;
    contentType: string; // mime type
  }): Promise<{ url: string; objectKey: string }> {
    await this.requestR2({
      method: "PUT",
      objectKey: args.objectKey,
      body: args.body,
      contentType: args.contentType,
    });

    return {
      objectKey: args.objectKey,
      url: `${this.publicBaseUrl}/${args.objectKey}`,
    };
  }

  // Parses and validates the base64 image.
  // Normalizes the path.
  // Generates a UUID filename.
  // uploads image to r2
  async uploadBase64Image(args: {
    imageBase64: string;
    path: string;
    maxBytes?: number;
  }): Promise<{ url: string; objectKey: string }> {
    const image = parseBase64Image(args.imageBase64, {
      maxBytes: args.maxBytes ?? DEFAULT_MAX_IMAGE_BYTES,
    });
    const objectKey = `${normalizeObjectPath(args.path)}/${crypto.randomUUID()}.${
      image.extension
    }`;

    return this.uploadObject({
      objectKey,
      body: image.buffer,
      contentType: image.contentType,
    });
  }

  async deleteObject(objectKey: string | null | undefined): Promise<void> {
    if (!objectKey) return;

    try {
      await this.requestR2({
        method: "DELETE",
        objectKey,
      });
    } catch (err) {
      console.error("Failed to delete old R2 object:", err);
    }
  }

  // the private method that actually talks to Cloudflare R2.
  // The short version: headers starts the signing process.
  // We list the exact headers we intend to send, turn them
  // into a strict canonical format, hash that, sign it,
  // then R2 checks the same math on its end.
  private async requestR2(args: {
    method: "PUT" | "DELETE";
    objectKey: string;
    body?: Buffer;
    contentType?: string;
  }): Promise<void> {
    const encodedKey = args.objectKey
      .split("/")
      .map((segment) => encodeURIComponent(segment))
      .join("/");

    //build r2 url
    const url = new URL(
      `/${this.bucket}/${encodedKey}`,
      `https://${this.accountId}.r2.cloudflarestorage.com`,
    );

    // create AWS S3 Signature V4 headers
    const now = new Date();
    const amzDate = toAmzDate(now);
    const dateStamp = amzDate.slice(0, 8);

    //hash request body
    const payloadHash = sha256Hex(args.body ?? Buffer.alloc(0));
    const host = url.host;

    const headers: Record<string, string> = {
      host,
      // SHA-256 hash of the upload body
      "x-amz-content-sha256": payloadHash,
      // timestamp in AWS format
      "x-amz-date": amzDate,
    };

    //include file's MIME type
    if (args.contentType) {
      headers["content-type"] = args.contentType;
    }

    // AWS/R2 requires signed headers to be sorted alphabetically.
    // So this may become: ["content-type", "host", "x-amz-content-sha256", "x-amz-date"]
    const signedHeaderNames = Object.keys(headers).sort();

    // This turns the headers into one strict string
    const canonicalHeaders = signedHeaderNames
      .map((name) => `${name}:${headers[name]}\n`)
      .join("");

    // This creates the “official version” of the request being signed.
    const canonicalRequest = [
      args.method,
      url.pathname,
      "",
      canonicalHeaders,
      signedHeaderNames.join(";"),
      payloadHash,
    ].join("\n");

    // For an upload, it looks conceptually like:
    /* 
      PUT
      /bucket/users/123/avatar/file.png
      content-type:image/png
      host:<account>.r2.cloudflarestorage.com
      x-amz-content-sha256:<hash>
      x-amz-date:<timestamp>
      content-type;host;x-amz-content-sha256;x-amz-date
      <body-hash>
    */

    // R2 will independently build this same string on its side.
    // If our version and R2’s version match, the signature can be verified.

    // This says what the signature is valid for:
    const credentialScope = `${dateStamp}/${REGION}/${SERVICE}/aws4_request`;

    //This is not the full request anymore. It is a smaller signing payload:
    const stringToSign = [
      "AWS4-HMAC-SHA256",
      amzDate,
      credentialScope,
      sha256Hex(canonicalRequest),
    ].join("\n");

    // This creates the final signature using your R2 secret key.
    // That signature proves we own the key without sending the secret key itself.
    const signature = hmacHex(
      getSigningKey(this.secretAccessKey, dateStamp),
      stringToSign,
    );

    // Signature goes into the authorization header when we call fetch.
    const response = await fetch(url, {
      method: args.method,
      headers: {
        ...headers,
        authorization: `AWS4-HMAC-SHA256 Credential=${this.accessKeyId}/${credentialScope}, SignedHeaders=${signedHeaderNames.join(
          ";",
        )}, Signature=${signature}`,
      },
      body: args.body ? toArrayBuffer(args.body) : undefined,
    });

    if (!response.ok) {
      const body = await response.text().catch(() => "");
      console.error("R2 request failed:", response.status, body);
      throw new InternalServerErrorException("avatar_upload_failed");
    }
  }
}

// check that image is a base 64 image & is in accepted MIME types
function parseBase64Image(
  value: string,
  options: { maxBytes: number },
): ParsedImage {
  const match =
    /^data:(image\/(?:jpeg|png|webp));base64,([A-Za-z0-9+/=]+)$/i.exec(
      value.trim(),
    );

  if (!match) {
    throw new BadRequestException("invalid_image");
  }

  const [, rawContentType, rawBase64] = match;
  if (!rawContentType || !rawBase64) {
    throw new BadRequestException("invalid_image");
  }

  const contentType = rawContentType.toLowerCase();
  const extension = ALLOWED_IMAGE_TYPES.get(contentType);

  if (!extension) {
    throw new BadRequestException("unsupported_image_type");
  }

  //turn uploaded string to into actual bytes
  const buffer = Buffer.from(rawBase64, "base64");

  // reject oversized files
  if (!buffer.length || buffer.byteLength > options.maxBytes) {
    throw new BadRequestException("image_too_large");
  }

  // verify that actual bytes look like a JPEG, PNG or WEBP
  // prevent issues when someone labels a malicious file an img
  assertImageSignature(buffer, contentType);

  return { buffer, contentType, extension };
}

function normalizeObjectPath(path: string): string {
  const normalized = path
    .split("/")
    .map((segment) => segment.trim())
    .filter(Boolean)
    .join("/");

  if (
    !normalized ||
    normalized.split("/").some((segment) => segment === "." || segment === "..")
  ) {
    throw new BadRequestException("invalid_upload_path");
  }

  return normalized;
}

// check that bytes match actual image type
function assertImageSignature(buffer: Buffer, contentType: string): void {
  const valid =
    (contentType === "image/jpeg" &&
      buffer[0] === 0xff &&
      buffer[1] === 0xd8 &&
      buffer[2] === 0xff) ||
    (contentType === "image/png" &&
      buffer
        .subarray(0, 8)
        .equals(
          Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
        )) ||
    (contentType === "image/webp" &&
      buffer.subarray(0, 4).toString("ascii") === "RIFF" &&
      buffer.subarray(8, 12).toString("ascii") === "WEBP");

  if (!valid) {
    throw new BadRequestException("invalid_image");
  }
}

// AWS SigV4 expects timestamps as YYYYMMDDTHHMMSSZ, without separators.
function toAmzDate(date: Date): string {
  return date.toISOString().replace(/[:-]|\.\d{3}/g, "");
}

// Hashes request bodies and canonical requests for the SigV4 signing flow.
function sha256Hex(value: string | Buffer): string {
  return crypto.createHash("sha256").update(value).digest("hex");
}

// Node fetch expects ArrayBuffer-like bodies; keep only this Buffer's slice.
function toArrayBuffer(buffer: Buffer): ArrayBuffer {
  return buffer.buffer.slice(
    buffer.byteOffset,
    buffer.byteOffset + buffer.byteLength,
  ) as ArrayBuffer;
}

// Returns raw HMAC bytes for the chained SigV4 signing key derivation.
function hmac(key: Buffer | string, value: string): Buffer {
  return crypto.createHmac("sha256", key).update(value).digest();
}

// Returns the final request signature as lowercase hex for Authorization.
function hmacHex(key: Buffer, value: string): string {
  return crypto.createHmac("sha256", key).update(value).digest("hex");
}

// Derives the scoped SigV4 signing key: date -> region -> service -> request.
function getSigningKey(secretAccessKey: string, dateStamp: string): Buffer {
  const dateKey = hmac(`AWS4${secretAccessKey}`, dateStamp);
  const regionKey = hmac(dateKey, REGION);
  const serviceKey = hmac(regionKey, SERVICE);
  return hmac(serviceKey, "aws4_request");
}
