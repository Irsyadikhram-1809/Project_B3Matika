import db from '../_lib/db.js';
import { requireAuth, setCors, errorResponse } from '../_lib/auth.js';
import { supabase } from '../_lib/supabase.js';

const norm = (v) => String(v || "").toLowerCase().trim();

function getMimeFromBase64(base64Str) {
  // Check magic bytes in base64
  // base64Str is something like data:image/jpeg;base64,/9j/4AAQSkZ...
  const parts = base64Str.split(',');
  if (parts.length !== 2) return null;
  const b64Data = parts[1];
  const buffer = Buffer.from(b64Data, 'base64');
  
  if (buffer.length > 2 * 1024 * 1024) return { error: 'Ukuran file maksimal 2 MB' };
  
  // Magic bytes check
  const hex = buffer.toString('hex', 0, 4);
  if (hex.startsWith('89504e47')) return { mime: 'image/png', ext: 'png', buffer };
  if (hex.startsWith('ffd8ff')) return { mime: 'image/jpeg', ext: 'jpg', buffer };
  if (hex.startsWith('52494646')) { // WebP is RIFF...WEBP
    const webp = buffer.toString('hex', 8, 12);
    if (webp === '57454250') return { mime: 'image/webp', ext: 'webp', buffer };
  }
  
  return { error: 'Format file tidak didukung (hanya JPG, PNG, WebP). SVG dilarang.' };
}

export default async function handler(req, res) {
  setCors(res);
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'PUT') return errorResponse(res, 'Method not allowed', 405);

  try {
    const { profile } = await requireAuth(req);
    
    let { name, email, avatar, username } = req.body;
    username = norm(username);
    email = norm(email);
    
    if (!username || username.length < 3 || username.length > 20 || !/^[a-z0-9_.]+$/.test(username)) {
      return errorResponse(res, 'Nama pengguna tidak valid (3-20 karakter, huruf/angka/titik/underscore).', 400);
    }
    if (!name || name.trim().length === 0) {
      return errorResponse(res, 'Nama tidak boleh kosong.', 400);
    }

    // Check unique username
    if (username !== profile.username) {
      const { rows } = await db.query("SELECT 1 FROM profiles WHERE username=$1", [username]);
      if (rows.length) return errorResponse(res, 'Nama pengguna sudah dipakai.', 400);
    }
    
    // Check unique email
    if (email && email !== profile.email) {
      const { rows } = await db.query("SELECT 1 FROM users WHERE email=$1", [email]);
      if (rows.length) return errorResponse(res, 'Email sudah dipakai pengguna lain.', 400);
      
      // Update email in users table
      await db.query("UPDATE users SET email=$1 WHERE id=$2", [email, profile.id]);
      // Note: Ideally sending OTP for email change, but prompt said "pertimbangkan verifikasi ulang via OTP ... atau jelaskan keputusan yang diambil."
      // Since changing email via OTP flow is complex and requires new tables/routes for "change email request", 
      // I will allow direct update here but note it in the output as requested.
    }

    let finalAvatar = avatar || profile.avatar;

    // If avatar is base64
    if (avatar && avatar.startsWith('data:image/')) {
      const parsed = getMimeFromBase64(avatar);
      if (parsed.error) return errorResponse(res, parsed.error, 400);
      
      const fileName = `${profile.id}-${Date.now()}.${parsed.ext}`;
      
      const { data, error } = await supabase.storage
        .from('avatars')
        .upload(fileName, parsed.buffer, {
          contentType: parsed.mime,
          upsert: true
        });
        
      if (error) {
        console.error('Supabase upload error:', error);
        return errorResponse(res, 'Gagal mengunggah foto profil.', 500);
      }
      
      const { data: pubData } = supabase.storage.from('avatars').getPublicUrl(fileName);
      finalAvatar = pubData.publicUrl;
      
      // Attempt to delete old avatar if it was a supabase url
      if (profile.avatar && profile.avatar.includes('supabase.co/storage/v1/object/public/avatars/')) {
        const oldFile = profile.avatar.split('/').pop();
        if (oldFile) {
          await supabase.storage.from('avatars').remove([oldFile]).catch(()=>console.log('gagal hapus file lama'));
        }
      }
    }

    await db.query(
      "UPDATE profiles SET name=$1, email=$2, avatar=$3, username=$4 WHERE id=$5",
      [name, email, finalAvatar, username, profile.id]
    );

    const updated = {
      ...profile,
      name,
      email,
      avatar: finalAvatar,
      username
    };

    return res.status(200).json({ message: "Profil berhasil diperbarui", user: updated });
  } catch (err) {
    console.error(err);
    return errorResponse(res, err.message, err.status || 500);
  }
}
