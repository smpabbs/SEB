import { initializeApp } from "firebase/app";
import { getFirestore, doc, getDoc } from "firebase/firestore";

// Konfigurasi Firebase Anda
const firebaseConfig = {
    apiKey: "AIzaSyA1GTZ1dEmv4jI7XcAErhjpDOv6S4XE7jk",
    authDomain: "exam-847db.firebaseapp.com",
    projectId: "exam-847db",
    storageBucket: "exam-847db.firebasestorage.app",
    messagingSenderId: "1075957101160",
    appId: "1:1075957101160:web:db222bb5e018244dbf41dd",
    measurementId: "G-SMZQQPELQL"
};

// Inisialisasi Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export default async function handler(req, res) {
    // ====================================================================
    // 1. PENGATURAN CORS (SANGAT PENTING UNTUK ELECTRON)
    // Mengizinkan aplikasi lokal (Electron) untuk mengakses API ini
    // ====================================================================
    res.setHeader('Access-Control-Allow-Origin', '*'); 
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    // Menangani "Preflight Request" yang biasanya dikirim otomatis oleh fetch API
    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    // ====================================================================
    // 2. LOGIKA PENGECEKAN TOKEN
    // ====================================================================
    const { token } = req.query;

    if (!token) {
        return res.status(400).json({ 
            success: false, 
            message: "Token tidak dikirim. Pastikan Anda mengetik token." 
        });
    }

    // Cache Control (opsional, agar Vercel merespon lebih cepat dan hemat kuota)
    res.setHeader('Cache-Control', 's-maxage=10, stale-while-revalidate');

    try {
        // Mencari dokumen token di Firebase (pastikan huruf besar semua)
        const docRef = doc(db, "tokens", token.toUpperCase());
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            const data = docSnap.data();
            // Jika token ketemu, kirimkan URL targetnya
            return res.status(200).json({ 
                success: true, 
                url: data.url_target,
                sekolah: data.pemilik
            });
        } else {
            // Jika token tidak ada di database
            return res.status(404).json({ 
                success: false, 
                message: "Token Ujian Tidak Ditemukan atau Tidak Valid!" 
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