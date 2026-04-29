module.exports = async function(req, res) {
    // ====================================================================
    // 1. PENGATURAN CORS (WAJIB UNTUK ELECTRON)
    // ====================================================================
    res.setHeader('Access-Control-Allow-Origin', '*'); 
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    // ====================================================================
    // 2. PENGECEKAN TOKEN
    // ====================================================================
    const token = req.query.token;

    if (!token) {
        return res.status(400).json({ 
            success: false, 
            message: "Token tidak dikirim. Pastikan Anda mengetik token." 
        });
    }

    res.setHeader('Cache-Control', 's-maxage=10, stale-while-revalidate');

    try {
        // MENGGUNAKAN FIREBASE REST API (TIDAK PERLU INSTALL LIBRARY FIREBASE)
        const projectId = "exam-847db";
        const firestoreUrl = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/tokens/${token.toUpperCase()}`;
        
        // Meminta data langsung ke server Google
        const response = await fetch(firestoreUrl);
        const data = await response.json();

        // Jika dokumen ditemukan, Firebase REST akan mengembalikan objek "fields"
        if (response.ok && data.fields) {
            return res.status(200).json({ 
                success: true, 
                url: data.fields.url_target.stringValue,
                sekolah: data.fields.pemilik.stringValue
            });
        } else {
            // Jika token tidak ada di database
            return res.status(404).json({ 
                success: false, 
                message: "Token Ujian Tidak Ditemukan atau Tidak Valid!" 
            });
        }
    } catch (error) {
        console.error("Error Vercel:", error);
        return res.status(500).json({ 
            success: false, 
            message: "Terjadi kesalahan pada server database." 
        });
    }
};