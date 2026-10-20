import { notFound } from "next/navigation";
import NavAdmin from "@/components/NavAdmin";
import FormUbahProduk from "./FormUbahProduk";
import { createSessionClient, createServerClient } from "@/lib/supabase";

export default async function HalamanUbahProduk({ params }) {
  const { id } = await params;
  let produk = null;

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
      .eq("id", id)
      .maybeSingle();

    if (error && process.env.SUPABASE_SECRET_KEY) {
      const adminClient = createServerClient();
      const res = await adminClient
        .from("produk")
        .select("*")
        .eq("id", id)
        .maybeSingle();
      if (!res.error) {
        data = res.data;
      }
    }

    if (data) {
      produk = data;
    }
  } catch {
    //
  }

  if (!produk) {
    notFound();
  }

  return (
    <div className="flex flex-col gap-6 py-8">
      <NavAdmin />
      <h1 className="text-2xl font-extrabold">Ubah produk</h1>
      <FormUbahProduk produk={produk} />
    </div>
  );
}
