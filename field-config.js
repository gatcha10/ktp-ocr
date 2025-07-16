// KTP Field Configuration
// This file contains all field definitions for easy customization and API mapping

const KTP_FIELD_CONFIG = {
    nik: {
        label: 'NIK',
        type: 'text',
        placeholder: 'Nomor Induk Kependudukan',
        required: true,
        apiKey: 'nik', // Key used in API response/request
        validation: /^\d{16}$/, // 16 digits
        errorMessage: 'NIK harus 16 digit angka'
    },
    nama: {
        label: 'Nama',
        type: 'text',
        placeholder: 'Nama Lengkap',
        required: true,
        apiKey: 'full_name',
        validation: /^[a-zA-Z\s]+$/,
        errorMessage: 'Nama hanya boleh berisi huruf dan spasi'
    },
    tempatTanggalLahir: {
        label: 'Tempat, Tanggal Lahir',
        type: 'text',
        placeholder: 'Jakarta, 10 Oktober 1990',
        required: true,
        apiKey: 'birth_place_date'
    },
    jenisKelamin: {
        label: 'Jenis Kelamin',
        type: 'select',
        required: true,
        apiKey: 'gender',
        options: [
            { value: '', text: 'Pilih Jenis Kelamin' },
            { value: 'LAKI-LAKI', text: 'Laki-laki' },
            { value: 'PEREMPUAN', text: 'Perempuan' }
        ]
    },
    golDarah: {
        label: 'Golongan Darah',
        type: 'select',
        apiKey: 'blood_type',
        options: [
            { value: '', text: 'Pilih Golongan Darah' },
            { value: 'A', text: 'A' },
            { value: 'B', text: 'B' },
            { value: 'AB', text: 'AB' },
            { value: 'O', text: 'O' },
            { value: '-', text: 'Tidak Diketahui' }
        ]
    },
    alamat: {
        label: 'Alamat',
        type: 'textarea',
        placeholder: 'Alamat Lengkap',
        required: true,
        apiKey: 'address',
        fullWidth: true,
        rows: 3
    },
    rtRw: {
        label: 'RT/RW',
        type: 'text',
        placeholder: '001/004',
        apiKey: 'rt_rw',
        validation: /^\d{3}\/\d{3}$/,
        errorMessage: 'Format RT/RW harus 001/004'
    },
    kelDesa: {
        label: 'Kel/Desa',
        type: 'text',
        placeholder: 'Margahayu',
        apiKey: 'village'
    },
    kecamatan: {
        label: 'Kecamatan',
        type: 'text',
        placeholder: 'Bekasi Timur',
        apiKey: 'district'
    },
    agama: {
        label: 'Agama',
        type: 'select',
        apiKey: 'religion',
        options: [
            { value: '', text: 'Pilih Agama' },
            { value: 'ISLAM', text: 'Islam' },
            { value: 'KRISTEN', text: 'Kristen' },
            { value: 'KATOLIK', text: 'Katolik' },
            { value: 'HINDU', text: 'Hindu' },
            { value: 'BUDDHA', text: 'Buddha' },
            { value: 'KHONGHUCU', text: 'Khonghucu' }
        ]
    },
    statusPerkawinan: {
        label: 'Status Perkawinan',
        type: 'select',
        apiKey: 'marital_status',
        options: [
            { value: '', text: 'Pilih Status' },
            { value: 'BELUM KAWIN', text: 'Belum Kawin' },
            { value: 'KAWIN', text: 'Kawin' },
            { value: 'CERAI HIDUP', text: 'Cerai Hidup' },
            { value: 'CERAI MATI', text: 'Cerai Mati' }
        ]
    },
    pekerjaan: {
        label: 'Pekerjaan',
        type: 'text',
        placeholder: 'Karyawan Swasta',
        apiKey: 'occupation'
    },
    kewarganegaraan: {
        label: 'Kewarganegaraan',
        type: 'select',
        apiKey: 'nationality',
        options: [
            { value: '', text: 'Pilih Kewarganegaraan' },
            { value: 'WNI', text: 'WNI' },
            { value: 'WNA', text: 'WNA' }
        ]
    },
    berlakuHingga: {
        label: 'Berlaku Hingga',
        type: 'text',
        placeholder: 'Seumur Hidup',
        apiKey: 'valid_until'
    }
};

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = KTP_FIELD_CONFIG;
}
