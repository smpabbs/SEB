import { initializeApp } from "firebase/app";
import { getFirestore, doc, getDoc } from "firebase/firestore";

// Konfigurasi Firebase Anda yang sudah lengkap
const firebaseConfig = {
    apiKey: "AIzaSyA1GTZ1dEmv4jI7XcAErhjpDOv6S4XE7jk",
    authDomain: "exam-847db.firebaseapp.com",
    projectId: "exam-847db",
    storageBucket: "exam-847db.firebasestorage.app",
    messagingSenderId: "1075957101160",
    appId: "1:1075957101160:web:db222bb5e018244dbf41dd",
    measurementId: "G-SMZQQPELQL"
};

// Inisialisasi Firebase di Backend Vercel
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export default async function handler(req, res) {
    // 1. TAMBAHKAN KODE CORS INI AGAR ELECTRON BISA MASUK
    res.setHeader('Access-Control-Allow-Origin', '*'); // Mengizinkan akses dari mana saja (termasuk aplikasi lokal)
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    // Menangani preflight request dari browser/Electron
    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }
    // Membaca parameter token dari URL (contoh: /api/check-token?token=PAS-MTK)
    const { token } = req.query;

    if (!token) {
        return res.status(400).json({ 
            success: false, 
            message: "Token tidak dikirim. Pastikan format URL benar." 
        });
    }

    // Trik Caching agar kuota Vercel Anda tetap gratis & server tidak jebol
    // s-maxage=3600 artinya Vercel menyimpan jawaban ini selama 1 jam
    res.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate');

    try {
        // Mencari dokumen di koleksi "tokens" dengan nama = token (diubah ke huruf besar semua agar aman)
        const docRef = doc(db, "tokens", token.toUpperCase());
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            const data = docSnap.data();
            // Jika token ketemu, kembalikan data URL dan Pemiliknya
            return res.status(200).json({ 
                success: true, 
                url: data.url_target,
                sekolah: data.pemilik
            });
        } else {
            // Jika token tidak ada di database
            return res.status(404).json({ 
                success: false, 
                message: "Token Ujian Tidak Ditemukan atau Tidak Valid" 
            });
        }
    } catch (error) {
        console.error("Error mengambil data dari Firebase:", error);
        return res.status(500).json({ 
            success: false, 
            message: "Terjadi kesalahan pada server database." 
        });
    }
}