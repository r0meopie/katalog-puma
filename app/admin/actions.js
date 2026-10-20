"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createSessionClient } from "@/lib/supabase/server";

export async function masuk(prevState, formData) {
  const data = formData instanceof FormData ? formData : prevState;
  const email = data?.get?.("email")?.toString()?.trim();
  const password = data?.get?.("password")?.toString();

  if (!email || !password) {
    return { error: "Email dan password wajib diisi." };
  }

  let authError = null;

  try {
    const supabase = await createSessionClient();
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) {
      authError = error;
    }
  } catch (err) {
    return {
      error: err.message || "Terjadi kesalahan saat memproses login.",
    };
  }

  if (authError) {
    return {
      error:
        authError.message === "Invalid login credentials"
          ? "Email atau password salah."
          : authError.message || "Gagal masuk. Silakan periksa kembali email dan password.",
    };
  }

  redirect("/admin");
}

export async function keluar() {
  try {
    const supabase = await createSessionClient();
    await supabase.auth.signOut();
  } catch {
    // Abaikan jika sesi sudah berakhir
  }

  redirect("/admin/login");
}

export async function gantiPassword(prevState, formData) {
  const data = formData instanceof FormData ? formData : prevState;
  const passwordBaru = data?.get?.("password_baru")?.toString();
  const konfirmasiPassword = data?.get?.("konfirmasi_password")?.toString();

  if (!passwordBaru || passwordBaru.length < 8) {
    return { error: "Password baru minimal 8 karakter." };
  }

  if (passwordBaru !== konfirmasiPassword) {
    return { error: "Konfirmasi password harus sama dengan password baru." };
  }

  try {
    const supabase = await createSessionClient();
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return { error: "Sesi telah berakhir atau belum login. Silakan login kembali." };
    }

    const { error } = await supabase.auth.updateUser({
      password: passwordBaru,
    });

    if (error) {
      return { error: error.message || "Gagal mengganti password." };
    }

    return { success: "Password berhasil diganti." };
  } catch (err) {
    return { error: err.message || "Terjadi kesalahan saat memproses ganti password." };
  }
}

export async function tambahProduk(prevState, formData) {
  const data = formData instanceof FormData ? formData : prevState;

  const nama = data?.get?.("nama")?.toString()?.trim();
  const hargaRaw = data?.get?.("harga")?.toString()?.trim();
  const kategori = data?.get?.("kategori")?.toString()?.trim() || null;
  const foto_url = data?.get?.("foto_url")?.toString()?.trim() || null;
  const deskripsi = data?.get?.("deskripsi")?.toString()?.trim() || null;

  if (!nama) {
    return { error: "Nama produk wajib diisi." };
  }

  const harga = parseInt(hargaRaw, 10);
  if (isNaN(harga) || harga < 0) {
    return { error: "Harga harus berupa angka dan tidak boleh kurang dari 0." };
  }

  let dbError = null;

  try {
    const supabase = await createSessionClient();
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return { error: "Sesi telah berakhir atau belum login. Silakan login kembali." };
    }

    const { error } = await supabase.from("produk").insert([
      {
        nama,
        harga,
        kategori,
        foto_url,
        deskripsi,
      },
    ]);

    if (error) {
      dbError = error;
    }
  } catch (err) {
    return { error: err.message || "Terjadi kesalahan saat menyimpan produk." };
  }

  if (dbError) {
    return { error: dbError.message || "Gagal menyimpan produk ke database." };
  }

  revalidatePath("/admin");
  revalidatePath("/");
  redirect("/admin");
}
