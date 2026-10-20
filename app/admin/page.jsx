import NavAdmin from "@/components/NavAdmin";
import TabelProduk from "@/components/TabelProduk";
import Tombol from "@/components/Tombol";
import { createSessionClient, createServerClient } from "@/lib/supabase";

export default async function HalamanAdmin() {
  let daftarProduk = [];
  let pesanError = null;

  try {
    let supabase;
    try {
      supabase = await createSessionClient();
    } catch {
      supabase = createServerClient();
    }

    let { data, error } = await supabase
      .from("produk")
      .select("*")
      .order("id", { ascending: true });

    if (error && process.env.SUPABASE_SECRET_KEY) {
      const adminClient = createServerClient();
      const res = await adminClient
        .from("produk")
        .select("*")
        .order("id", { ascending: true });
      if (!res.error) {
        data = res.data;
        error = null;
      }
    }

    if (error) {
      pesanError = error.message;
    } else {
      daftarProduk = data || [];
    }
  } catch (err) {
    pesanError = err.message || "Gagal memuat produk dari database.";
  }

  return (
    <div className="flex flex-col gap-6 py-8">
      <NavAdmin />
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-extrabold">Produk</h1>
        {/* US-08 (bonus): tambah produk */}
        <Tombol href="/admin/produk/baru">Tambah produk</Tombol>
      </div>

      {pesanError ? (
        <div className="rounded-xl border border-garis bg-permukaan p-6 text-center">
          <p className="font-semibold text-bahaya">Gagal memuat produk</p>
          <p className="mt-1 text-sm text-teks-lembut">{pesanError}</p>
        </div>
      ) : (
        <TabelProduk daftarProduk={daftarProduk} />
      )}
    </div>
  );
}
