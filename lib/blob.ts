import { put } from "@vercel/blob";

export async function uploadProductImage(file: File): Promise<string> {
  const token = process.env.BLOB_READ_WRITE_TOKEN;
  if (!token) {
    throw new Error(
      "BLOB_READ_WRITE_TOKEN is not set. Create a Blob store on Vercel and add the token.",
    );
  }

  const blob = await put(`products/${Date.now()}-${file.name}`, file, {
    access: "public",
    token,
  });

  return blob.url;
}
