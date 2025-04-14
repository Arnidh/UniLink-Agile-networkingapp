
import { supabase } from "@/integrations/supabase/client";

export async function uploadPostAttachment(file: File, postId: string) {
  const fileExt = file.name.split('.').pop();
  const fileName = `${Math.random()}.${fileExt}`;
  const filePath = `${postId}/${fileName}`;
  const fileType = file.type.startsWith('image/') ? 'image' : 'video';

  const { error: uploadError } = await supabase.storage
    .from('post-attachments')
    .upload(filePath, file);

  if (uploadError) throw uploadError;

  const { data: attachment, error: attachmentError } = await supabase
    .from('post_attachments')
    .insert({
      post_id: postId,
      file_path: filePath,
      file_type: fileType
    })
    .select()
    .single();

  if (attachmentError) throw attachmentError;

  return attachment;
}
