// Helper function to convert string to Uint8Array
function str2ab(str: string): Uint8Array {
  const encoder = new TextEncoder();
  return encoder.encode(str);
}

// Helper function to convert Uint8Array to hex string
function ab2hex(buffer: ArrayBuffer): string {
  return Array.from(new Uint8Array(buffer))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

// Helper function to convert hex string to Uint8Array
function hex2ab(hex: string): Uint8Array {
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < hex.length; i += 2) {
    bytes[i / 2] = parseInt(hex.slice(i, i + 2), 16);
  }
  return bytes;
}

async function getKey(keyString: string): Promise<CryptoKey> {
  const keyData = hex2ab(keyString);
  return await crypto.subtle.importKey(
    "raw",
    keyData,
    { name: "AES-GCM" },
    false,
    ["encrypt", "decrypt"]
  );
}

export async function encryptData(text: string): Promise<{
  encryptedData: string;
  iv: string;
}> {
  const keyString = import.meta.env.VITE_ENCRYPTION_KEY;
  if (!keyString) {
    throw new Error("Encryption key not found in environment variables");
  }

  const key = await getKey(keyString);
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const encodedText = str2ab(text);

  const encryptedBuffer = await crypto.subtle.encrypt(
    {
      name: "AES-GCM",
      iv,
    },
    key,
    encodedText
  );

  return {
    encryptedData: ab2hex(encryptedBuffer),
    iv: ab2hex(iv),
  };
}

export async function decryptData(
  encryptedData: string,
  iv: string
): Promise<string> {
  const keyString = import.meta.env.VITE_ENCRYPTION_KEY;
  if (!keyString) {
    throw new Error("Encryption key not found in environment variables");
  }

  const key = await getKey(keyString);
  const decoder = new TextDecoder();

  const decryptedBuffer = await crypto.subtle.decrypt(
    {
      name: "AES-GCM",
      iv: hex2ab(iv),
    },
    key,
    hex2ab(encryptedData)
  );

  return decoder.decode(decryptedBuffer);
}
