import { supabase } from "@/integrations/supabase/client";

export async function uploadImage(file: File, userId: string) {
  try {
    const fileExt = file.name.split(".").pop();
    const fileName = `${userId}-${Math.random()
      .toString(36)
      .substring(2)}.${fileExt}`;
    const filePath = `reference-images/${fileName}`;

    const { error: uploadError, data } = await supabase.storage
      .from("content-ai")
      .upload(filePath, file);

    if (uploadError) {
      throw uploadError;
    }

    const {
      data: { publicUrl },
    } = supabase.storage.from("content-ai").getPublicUrl(filePath);

    return { publicUrl, filePath };
  } catch (error: any) {
    console.error("Error uploading image:", error.message);
    throw error;
  }
}
