import crypto from "node:crypto";
import { parseArgs } from "util";

const encryptText = async (text: string) => {
  return crypto.publicEncrypt(
    {
      key: await Bun.file("public_key.pem").text(),
      padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
      oaepHash: "sha256",
    },
    Buffer.from(text),
  );
};

const decryptText = async (text: Buffer) => {
  return crypto.privateDecrypt(
    {
      key: await Bun.file("private_key.pem").text(),
      padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
      oaepHash: "sha256",
    },
    text,
  );
};

const main = async () => {
  const { values } = parseArgs({
    args: Bun.argv,
    options: {
      mode: {
        type: "string",
      },
      input: {
        type: "string",
      },
      output: {
        type: "string",
      },
    },
    strict: true,
    allowPositionals: true,
  });

  if (!values.mode) {
    console.log("mode is required");
    process.exit(1);
  }
  if (!values.input) {
    console.log("input path is required");
    process.exit(1);
  }
  if (!values.output) {
    console.log("output path is required");
    process.exit(1);
  }

  const file = Bun.file(values.input);
  const text = await file.text();

  console.log(text.length);

  if (values.mode === "e") {
    const encrypted = await encryptText(text);
    Bun.write(values.output, encrypted.toString("base64"));
    return;
  }
  if (values.mode === "d") {
    const decrypted = await decryptText(Buffer.from(text, "base64"));
    Bun.write(values.output, decrypted);
    return;
  }
};

main();
