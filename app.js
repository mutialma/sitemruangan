(function () {
  'use strict';

  /* ---------- DATA AWAL (DEFAULT SEED) ---------- */
  const DEFAULT_ROOMS = [
    {
      kode: 'R001',
      nama: 'RUANG RAPAT',
      lokasi: 'KANTOR SATUAN POLISI PAMONG PRAJA KOTA MOJOKERTO',
      kapasitas: null,
      fasilitas: '',
      status: 'AKTIF'
    }
  ];

  const DEFAULT_SCHEDULES = [
    { id: 'JD-20261021-083346', tanggal: '2026-05-13', kode_ruangan: 'R001', kegiatan: "Pertemuan Rutin serta Do'a Bersama", mulai: '08:30', selesai: '', pj: 'Dharma Wanita Persatuan', status: 'SELESAI', keterangan: '' },
    { id: 'JD-20261021-084135', tanggal: '2026-08-28', kode_ruangan: 'R001', kegiatan: 'Lomba 17 Agustus', mulai: '08:00', selesai: '', pj: 'Dharma Wanita Persatuan', status: 'SELESAI', keterangan: 'Pertemuan Rutin DWP Satpol PP' },
    { id: 'JD-20261021-084309', tanggal: '2026-07-16', kode_ruangan: 'R001', kegiatan: 'Pertemuan Rutin', mulai: '10:00', selesai: '', pj: 'Dharma Wanita Persatuan Satpol PP', status: 'SELESAI', keterangan: '' },
    { id: 'JD-20261021-084609', tanggal: '2026-03-11', kode_ruangan: 'R001', kegiatan: 'Pertemuan Rutin dilanjutkan Pembagian Tabungan dan Buka Bersama', mulai: '16:30', selesai: '', pj: 'Dharma Wanita Persatuan Satpol PP', status: 'SELESAI', keterangan: 'Halal Bihalal' },
    { id: 'JD-20261021-094955', tanggal: '2026-08-31', kode_ruangan: 'R001', kegiatan: 'Koordinasi Manajemen Kinerja untuk PPPK Paruh Waktu', mulai: '', selesai: '', pj: 'Satpol PP Kota Mojokerto', status: 'SELESAI', keterangan: '' },
    { id: 'JD-20261021-095614', tanggal: '2026-10-15', kode_ruangan: 'R001', kegiatan: 'Rakor ASLINMAS Kelurahan', mulai: '09:00', selesai: '', pj: 'Satpol PP Kota Mojokerto', status: 'SELESAI', keterangan: '' },
    { id: 'JD-20261021-100129', tanggal: '2026-10-16', kode_ruangan: 'R001', kegiatan: 'Pertemuan Rutin DWP Satpol PP', mulai: '08:00', selesai: '', pj: 'DWP Satpol PP Kota Mojokerto', status: 'SELESAI', keterangan: '' }
  ];

  /* ---------- PENYIMPANAN LOCALSTORAGE ---------- */
  const STORAGE_ROOMS = 'penjadwalan_rooms_v1';
  const STORAGE_SCHEDULES = 'penjadwalan_schedules_v1';
  const STORAGE_AUTH = 'penjadwalan_auth_v1';

  function initStorage() {
    if (!localStorage.getItem(STORAGE_ROOMS)) {
      localStorage.setItem(STORAGE_ROOMS, JSON.stringify(DEFAULT_ROOMS));
    }
    if (!localStorage.getItem(STORAGE_SCHEDULES)) {
      localStorage.setItem(STORAGE_SCHEDULES, JSON.stringify(DEFAULT_SCHEDULES));
    }
  }

  function getRooms() {
    initStorage();
    try {
      return JSON.parse(localStorage.getItem(STORAGE_ROOMS) || '[]');
    } catch (e) {
      return [];
    }
  }

  function saveRooms(arr) {
    localStorage.setItem(STORAGE_ROOMS, JSON.stringify(arr));
  }

  function getSchedules() {
    initStorage();
    try {
      return JSON.parse(localStorage.getItem(STORAGE_SCHEDULES) || '[]');
    } catch (e) {
      return [];
    }
  }

  function saveSchedules(arr) {
    localStorage.setItem(STORAGE_SCHEDULES, JSON.stringify(arr));
  }

  /* ---------- FORMAT WAKTU & TANGGAL (WIB) ---------- */
  const BULAN = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
  const BULAN_PENUH = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
  const HARI = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
  const PILL = { SELESAI: 'p-done', TERJADWAL: 'p-plan', DIBATALKAN: 'p-cancel', AKTIF: 'p-done', NONAKTIF: 'p-cancel' };

  function dateParts(d = new Date()) {
    try {
      const f = new Intl.DateTimeFormat('en-CA', {
        timeZone: 'Asia/Jakarta', year: 'numeric', month: '2-digit', day: '2-digit',
        hour: '2-digit', minute: '2-digit', second: '2-digit', hourCycle: 'h23'
      });
      return Object.fromEntries(f.formatToParts(d).filter(p => p.type !== 'literal').map(p => [p.type, p.value]));
    } catch (e) {
      const pad = (n) => String(n).padStart(2, '0');
      return {
        year: String(d.getFullYear()),
        month: pad(d.getMonth() + 1),
        day: pad(d.getDate()),
        hour: pad(d.getHours()),
        minute: pad(d.getMinutes()),
        second: pad(d.getSeconds())
      };
    }
  }

  function todayISO() {
    const p = dateParts();
    return `${p.year}-${p.month}-${p.day}`;
  }

  function newScheduleId() {
    const p = dateParts();
    return `JD-${p.year}${p.month}${p.day}-${p.hour}${p.minute}${p.second}`;
  }

  function fmtTanggal(iso) {
    if (!iso) return '–';
    const [y, m, d] = iso.split('-').map(Number);
    return `${d} ${BULAN[m - 1]} ${y}`;
  }

  function fmtTanggalPanjang(iso) {
    if (!iso) return '–';
    const [y, m, d] = iso.split('-').map(Number);
    const dateObj = new Date(Date.UTC(y, m - 1, d));
    const hari = HARI[dateObj.getUTCDay()];
    return `${hari}, ${d} ${BULAN_PENUH[m - 1]} ${y}`;
  }

  function fmtJam(t) {
    return t ? t.replace(':', '.') : '–';
  }

  function fmtBulan(ym) {
    if (!ym) return '–';
    const [y, m] = ym.split('-').map(Number);
    return `${BULAN_PENUH[m - 1]} ${y}`;
  }

  function getDayNum(iso) {
    return String(Number(iso.slice(8, 10)));
  }

  function getMonShort(iso) {
    return BULAN[Number(iso.slice(5, 7)) - 1].toUpperCase();
  }

  /* ---------- NOTIFIKASI FLASH ---------- */
  function showFlash(msg) {
    const el = document.getElementById('app-flash');
    if (!el) return;
    el.textContent = msg;
    el.style.display = 'block';
    setTimeout(() => {
      el.style.display = 'none';
    }, 4000);
  }

  /* ---------- AUTENTIKASI (LOGIN / LOGOUT) ---------- */
  function isAuthenticated() {
    return localStorage.getItem(STORAGE_AUTH) === 'admin';
  }

  window.handleLogin = function () {
    const u = (document.getElementById('login-username').value || '').trim();
    const p = (document.getElementById('login-password').value || '').trim();
    const errEl = document.getElementById('login-err');

    if (u === 'admin' && p === 'admin@2025') {
      localStorage.setItem(STORAGE_AUTH, 'admin');
      errEl.style.display = 'none';
      document.getElementById('form-login').reset();
      updateAuthUI();
      location.hash = '#/dashboard';
    } else {
      errEl.style.display = 'block';
    }
  };

  window.handleLogout = function () {
    localStorage.removeItem(STORAGE_AUTH);
    updateAuthUI();
    const lf = document.getElementById('login-flash');
    if (lf) {
      lf.textContent = 'Anda telah berhasil keluar.';
      lf.style.display = 'block';
    }
  };

  function updateAuthUI() {
    const isAuth = isAuthenticated();
    const loginView = document.getElementById('view-login');
    const appRoot = document.getElementById('app-root');

    if (isAuth) {
      loginView.classList.remove('active');
      loginView.style.display = 'none';
      appRoot.style.display = 'flex';
      document.getElementById('side-date-text').textContent = fmtTanggalPanjang(todayISO());
      renderView();
    } else {
      loginView.classList.add('active');
      loginView.style.display = 'flex';
      appRoot.style.display = 'none';
    }
  }

  // Toggle Password Visibility
  const togglePassBtn = document.getElementById('toggle-pass');
  if (togglePassBtn) {
    togglePassBtn.addEventListener('click', () => {
      const passInp = document.getElementById('login-password');
      const eyeIcon = document.getElementById('eye-icon');
      const isPass = passInp.type === 'password';
      passInp.type = isPass ? 'text' : 'password';
      togglePassBtn.title = isPass ? 'Sembunyikan kata sandi' : 'Lihat kata sandi';
      eyeIcon.innerHTML = isPass
        ? '<path d="M9.88 9.88a3 3 0 1 0 4.24 4.24"/><path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68"/><path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3.5 7 10 7a9.74 9.74 0 0 0 5.39-1.61"/><line x1="2" y1="2" x2="22" y2="22"/>'
        : '<path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/>';
    });
  }

  /* ---------- ROUTER (HASH-BASED) ---------- */
  function getRoute() {
    const hash = location.hash || '#/dashboard';
    const [path, queryStr] = hash.split('?');
    const params = new URLSearchParams(queryStr || '');
    return { path, params };
  }

  function setActiveNav(name) {
    document.querySelectorAll('.nav').forEach((el) => el.classList.remove('on'));
    const target = document.getElementById(`nav-${name}`);
    if (target) target.classList.add('on');
  }

  function renderView() {
    if (!isAuthenticated()) return;

    const { path, params } = getRoute();
    document.querySelectorAll('.view-section').forEach((s) => s.classList.remove('active'));

    if (path === '#/ruangan') {
      setActiveNav('ruangan');
      document.getElementById('sec-ruangan').classList.add('active');
      renderRuanganTable();
      resetFormRuangan();
    } else if (path === '#/jadwal') {
      setActiveNav('jadwal');
      document.getElementById('sec-jadwal').classList.add('active');
      populateJadwalRoomSelect();
      const f = params.get('f') || '';
      setJadwalFilterCepat(f, false);
      renderJadwalTable();
    } else if (path === '#/form') {
      setActiveNav('form');
      document.getElementById('sec-form').classList.add('active');
      populateFormRoomSelect();
      const editId = params.get('ubah');
      if (editId) {
        loadScheduleForEdit(editId);
      } else {
        resetFormJadwal();
      }
    } else if (path === '#/riwayat') {
      setActiveNav('riwayat');
      document.getElementById('sec-riwayat').classList.add('active');
      populateRiwayatFilters();
      renderRiwayatTable();
    } else if (path === '#/backup') {
      setActiveNav('backup');
      document.getElementById('sec-backup').classList.add('active');
    } else {
      // Default: Dashboard
      setActiveNav('dashboard');
      document.getElementById('sec-dashboard').classList.add('active');
      renderDashboard();
    }
  }

  window.addEventListener('hashchange', renderView);

  /* ---------- VIEW: DASHBOARD ---------- */
  function renderDashboard() {
    const today = todayISO();
    const rooms = getRooms();
    const schedules = getSchedules();

    // Stats
    const totalRuang = rooms.length;
    const hariIni = schedules.filter((s) => s.tanggal === today).length;
    const mendatang = schedules.filter((s) => s.tanggal > today && s.status !== 'DIBATALKAN').length;
    const riwayat = schedules.filter((s) => s.tanggal < today).length;

    document.getElementById('stat-ruang').textContent = totalRuang;
    document.getElementById('stat-hariini').textContent = hariIni;
    document.getElementById('stat-hariini-hint').textContent = `kegiatan pada ${fmtTanggal(today)}`;
    document.getElementById('stat-mendatang').textContent = mendatang;
    document.getElementById('stat-riwayat').textContent = riwayat;

    // Room map
    const roomMap = Object.fromEntries(rooms.map((r) => [r.kode, r.nama]));

    // Jadwal hari ini & mendatang (up to 5 items)
    const akan = schedules
      .filter((s) => s.tanggal >= today && s.status !== 'DIBATALKAN')
      .sort((a, b) => a.tanggal.localeCompare(b.tanggal) || (a.mulai || '').localeCompare(b.mulai || ''))
      .slice(0, 5);

    const akanContainer = document.getElementById('dash-akan-list');
    if (!akan.length) {
      akanContainer.innerHTML = `
        <div class="empty">
          <strong>Belum ada jadwal.</strong>
          <span>Tidak ada kegiatan hari ini maupun setelahnya. Jadwal baru muncul di sini setelah dicatat.</span>
          <a class="btn ghost" href="#/form">Catat jadwal baru</a>
        </div>`;
    } else {
      akanContainer.innerHTML = akan.map((r) => `
        <div class="row">
          <div class="date"><b>${getDayNum(r.tanggal)}</b><span>${getMonShort(r.tanggal)}</span></div>
          <div class="rt"><b>${escapeHtml(r.kegiatan)}</b><span>${escapeHtml(r.pj)} · ${fmtJam(r.mulai)} (${escapeHtml(roomMap[r.kode_ruangan] || r.kode_ruangan)})</span></div>
          <span class="pill ${PILL[r.status] || ''}">${r.status}</span>
        </div>
      `).join('');
    }

    // Kegiatan terakhir (up to 4 items)
    const terakhir = schedules
      .filter((s) => s.tanggal < today)
      .sort((a, b) => b.tanggal.localeCompare(a.tanggal) || (b.mulai || '').localeCompare(a.mulai || ''))
      .slice(0, 4);

    const terakhirContainer = document.getElementById('dash-terakhir-list');
    if (!terakhir.length) {
      terakhirContainer.innerHTML = '<div class="empty"><strong>Belum ada riwayat.</strong></div>';
    } else {
      terakhirContainer.innerHTML = terakhir.map((r) => `
        <div class="row">
          <div class="date"><b>${getDayNum(r.tanggal)}</b><span>${getMonShort(r.tanggal)}</span></div>
          <div class="rt"><b>${escapeHtml(r.kegiatan)}</b><span>${escapeHtml(r.pj)} · ${fmtJam(r.mulai)} (${escapeHtml(roomMap[r.kode_ruangan] || r.kode_ruangan)})</span></div>
          <span class="pill ${PILL[r.status] || ''}">${r.status}</span>
        </div>
      `).join('');
    }
  }

  /* ---------- VIEW: DATA RUANGAN ---------- */
  function nextKode() {
    const rooms = getRooms();
    const max = rooms.map((r) => Number((r.kode.match(/\d+$/) || [0])[0])).reduce((a, b) => Math.max(a, b), 0);
    return `R${String(max + 1).padStart(3, '0')}`;
  }

  window.renderRuanganTable = function () {
    const q = (document.getElementById('ruangan-q').value || '').trim().toLowerCase();
    const st = document.getElementById('ruangan-filter-st').value;
    const rooms = getRooms();

    const filtered = rooms.filter((r) => {
      const matchQ = !q || r.kode.toLowerCase().includes(q) || r.nama.toLowerCase().includes(q) || (r.lokasi || '').toLowerCase().includes(q);
      const matchSt = !st || r.status === st;
      return matchQ && matchSt;
    });

    const tbody = document.getElementById('ruangan-tbody');
    if (!filtered.length) {
      tbody.innerHTML = '<tr><td colspan="7" class="dim">Tidak ada ruangan yang cocok.</td></tr>';
    } else {
      tbody.innerHTML = filtered.map((r) => `
        <tr>
          <td><b>${escapeHtml(r.kode)}</b></td>
          <td><b style="font-weight:600">${escapeHtml(r.nama)}</b></td>
          <td style="max-width:240px">${escapeHtml(r.lokasi || '–')}</td>
          <td class="dim">${r.kapasitas ? r.kapasitas + ' orang' : 'Belum diisi'}</td>
          <td class="dim">${escapeHtml(r.fasilitas || 'Belum diisi')}</td>
          <td><span class="pill ${PILL[r.status] || ''}">${r.status}</span></td>
          <td>
            <div class="act">
              <button type="button" onclick="editRuangan('${r.kode}')">Ubah</button>
              <button type="button" class="${r.status === 'AKTIF' ? 'del' : ''}" onclick="toggleStatusRuangan('${r.kode}')">
                ${r.status === 'AKTIF' ? 'Nonaktifkan' : 'Aktifkan'}
              </button>
            </div>
          </td>
        </tr>
      `).join('');
    }

    document.getElementById('ruangan-total-text').textContent = `Menampilkan ${filtered.length} dari ${rooms.length} ruangan`;
  };

  window.resetFormRuangan = function () {
    document.getElementById('ruangan-asli').value = '';
    document.getElementById('ruangan-kode').value = nextKode();
    document.getElementById('ruangan-kode').removeAttribute('readonly');
    document.getElementById('ruangan-status').value = 'AKTIF';
    document.getElementById('ruangan-nama').value = '';
    document.getElementById('ruangan-lokasi').value = '';
    document.getElementById('ruangan-kapasitas').value = '';
    document.getElementById('ruangan-fasilitas').value = '';
    document.getElementById('form-ruangan-title').textContent = 'Tambah ruangan';
    document.getElementById('btn-save-ruangan').textContent = 'Tambah ruangan';
    document.getElementById('ruangan-err-kode').style.display = 'none';
    document.getElementById('ruangan-err-nama').style.display = 'none';
  };

  window.editRuangan = function (kode) {
    const rooms = getRooms();
    const r = rooms.find((x) => x.kode === kode);
    if (!r) return;

    document.getElementById('ruangan-asli').value = r.kode;
    document.getElementById('ruangan-kode').value = r.kode;
    document.getElementById('ruangan-kode').setAttribute('readonly', 'true');
    document.getElementById('ruangan-status').value = r.status;
    document.getElementById('ruangan-nama').value = r.nama;
    document.getElementById('ruangan-lokasi').value = r.lokasi || '';
    document.getElementById('ruangan-kapasitas').value = r.kapasitas || '';
    document.getElementById('ruangan-fasilitas').value = r.fasilitas || '';
    document.getElementById('form-ruangan-title').textContent = 'Ubah ruangan';
    document.getElementById('btn-save-ruangan').textContent = 'Simpan perubahan';
  };

  window.saveRuangan = function () {
    const asli = document.getElementById('ruangan-asli').value.trim();
    const kode = document.getElementById('ruangan-kode').value.trim().toUpperCase();
    const nama = document.getElementById('ruangan-nama').value.trim().toUpperCase();
    const lokasi = document.getElementById('ruangan-lokasi').value.trim();
    const kapVal = document.getElementById('ruangan-kapasitas').value.trim();
    const fasilitas = document.getElementById('ruangan-fasilitas').value.trim();
    const status = document.getElementById('ruangan-status').value;

    const errKode = document.getElementById('ruangan-err-kode');
    const errNama = document.getElementById('ruangan-err-nama');
    errKode.style.display = 'none';
    errNama.style.display = 'none';

    if (!/^[A-Z0-9-]{2,12}$/.test(kode)) {
      errKode.textContent = 'Kode 2–12 karakter: huruf, angka, atau tanda hubung.';
      errKode.style.display = 'block';
      return;
    }
    if (!nama) {
      errNama.textContent = 'Nama ruangan wajib diisi.';
      errNama.style.display = 'block';
      return;
    }

    const rooms = getRooms();
    if (!asli && rooms.some((r) => r.kode === kode)) {
      errKode.textContent = 'Kode ini sudah dipakai.';
      errKode.style.display = 'block';
      return;
    }

    const kapasitas = kapVal ? Number(kapVal) : null;

    if (asli) {
      const idx = rooms.findIndex((r) => r.kode === asli);
      if (idx !== -1) {
        rooms[idx] = { ...rooms[idx], nama, lokasi, kapasitas, fasilitas, status };
        saveRooms(rooms);
        showFlash('Ruangan diperbarui.');
      }
    } else {
      rooms.push({ kode, nama, lokasi, kapasitas, fasilitas, status });
      saveRooms(rooms);
      showFlash('Ruangan ditambahkan.');
    }

    resetFormRuangan();
    renderRuanganTable();
  };

  window.toggleStatusRuangan = function (kode) {
    const rooms = getRooms();
    const r = rooms.find((x) => x.kode === kode);
    if (r) {
      r.status = r.status === 'AKTIF' ? 'NONAKTIF' : 'AKTIF';
      saveRooms(rooms);
      renderRuanganTable();
      showFlash(`Status ruangan ${r.kode} diubah.`);
    }
  };

  /* ---------- VIEW: JADWAL PENGGUNAAN ---------- */
  let jadwalCepatFilter = '';
  let jadwalCurrentPage = 1;
  const JADWAL_PER_PAGE = 20;

  function populateJadwalRoomSelect() {
    const sel = document.getElementById('jadwal-ruang');
    const current = sel.value;
    const rooms = getRooms();
    sel.innerHTML = '<option value="">Semua ruangan</option>' + rooms.map((r) => `
      <option value="${r.kode}" ${current === r.kode ? 'selected' : ''}>${r.kode} · ${r.nama}</option>
    `).join('');
  }

  window.setJadwalFilterCepat = function (f, shouldRender = true) {
    jadwalCepatFilter = f;
    document.querySelectorAll('.chips .chip').forEach((c) => c.classList.remove('on'));
    const btn = document.getElementById(f ? `chip-${f}` : 'chip-semua');
    if (btn) btn.classList.add('on');
    jadwalCurrentPage = 1;
    if (shouldRender) renderJadwalTable();
  };

  window.resetJadwalFilter = function () {
    document.getElementById('jadwal-q').value = '';
    document.getElementById('jadwal-dari').value = '';
    document.getElementById('jadwal-sampai').value = '';
    document.getElementById('jadwal-ruang').value = '';
    setJadwalFilterCepat('');
  };

  window.renderJadwalTable = function () {
    const q = (document.getElementById('jadwal-q').value || '').trim().toLowerCase();
    const dari = document.getElementById('jadwal-dari').value;
    const sampai = document.getElementById('jadwal-sampai').value;
    const ruang = document.getElementById('jadwal-ruang').value;
    const today = todayISO();

    const schedules = getSchedules();
    const rooms = getRooms();
    const roomMap = Object.fromEntries(rooms.map((r) => [r.kode, r.nama]));

    // Update counts on filter chips
    document.getElementById('cnt-semua').textContent = schedules.length;
    document.getElementById('cnt-hariini').textContent = schedules.filter((s) => s.tanggal === today).length;
    document.getElementById('cnt-mendatang').textContent = schedules.filter((s) => s.tanggal > today && s.status !== 'DIBATALKAN').length;
    document.getElementById('cnt-terjadwal').textContent = schedules.filter((s) => s.status === 'TERJADWAL').length;
    document.getElementById('cnt-selesai').textContent = schedules.filter((s) => s.status === 'SELESAI').length;
    document.getElementById('cnt-dibatalkan').textContent = schedules.filter((s) => s.status === 'DIBATALKAN').length;

    // Filter list
    const filtered = schedules.filter((s) => {
      if (q && !s.kegiatan.toLowerCase().includes(q) && !s.pj.toLowerCase().includes(q) && !s.id.toLowerCase().includes(q) && !(s.keterangan || '').toLowerCase().includes(q)) {
        return false;
      }
      if (dari && s.tanggal < dari) return false;
      if (sampai && s.tanggal > sampai) return false;
      if (ruang && s.kode_ruangan !== ruang) return false;

      if (jadwalCepatFilter === 'hariini') return s.tanggal === today;
      if (jadwalCepatFilter === 'mendatang') return s.tanggal > today && s.status !== 'DIBATALKAN';
      if (['TERJADWAL', 'SELESAI', 'DIBATALKAN'].includes(jadwalCepatFilter)) return s.status === jadwalCepatFilter;

      return true;
    }).sort((a, b) => b.tanggal.localeCompare(a.tanggal) || (b.mulai || '').localeCompare(a.mulai || '') || b.id.localeCompare(a.id));

    // Pagination
    const total = filtered.length;
    const totalPages = Math.max(1, Math.ceil(total / JADWAL_PER_PAGE));
    if (jadwalCurrentPage > totalPages) jadwalCurrentPage = totalPages;
    const startIdx = (jadwalCurrentPage - 1) * JADWAL_PER_PAGE;
    const paged = filtered.slice(startIdx, startIdx + JADWAL_PER_PAGE);

    const tbody = document.getElementById('jadwal-tbody');
    if (!paged.length) {
      tbody.innerHTML = '<tr><td colspan="8" class="dim">Tidak ada jadwal yang cocok dengan filter.</td></tr>';
    } else {
      tbody.innerHTML = paged.map((r) => `
        <tr>
          <td class="nw">${fmtTanggal(r.tanggal)}</td>
          <td class="nw">${r.mulai ? fmtJam(r.mulai) + ' – ' + (r.selesai ? fmtJam(r.selesai) : 'selesai') : 'Belum diisi'}</td>
          <td><b style="font-weight:600">${escapeHtml(r.kode_ruangan)}</b><br><span class="dim" style="font-size:12px">${escapeHtml(roomMap[r.kode_ruangan] || '')}</span></td>
          <td style="min-width:260px"><b style="font-weight:600">${escapeHtml(r.kegiatan)}</b>${r.keterangan ? '<br><span class="dim" style="font-size:13px">' + escapeHtml(r.keterangan) + '</span>' : ''}</td>
          <td>${escapeHtml(r.pj)}</td>
          <td><span class="pill ${PILL[r.status] || ''}">${r.status}</span></td>
          <td class="mono">${r.id}</td>
          <td>
            <div class="act">
              <a href="#/form?ubah=${encodeURIComponent(r.id)}">Ubah</a>
              ${r.status !== 'DIBATALKAN' ? `<button type="button" class="del" onclick="batalkanJadwal('${r.id}')">Batalkan</button>` : ''}
            </div>
          </td>
        </tr>
      `).join('');
    }

    // Pager
    document.getElementById('jadwal-pager-info').textContent = `Halaman ${jadwalCurrentPage} dari ${totalPages} (Total ${total} data)`;
    const pagerBtns = document.getElementById('jadwal-pager-btns');
    let btns = '';
    if (jadwalCurrentPage > 1) {
      btns += `<a onclick="goToJadwalPage(${jadwalCurrentPage - 1})">‹</a>`;
    } else {
      btns += `<span>‹</span>`;
    }
    for (let p = 1; p <= totalPages; p++) {
      if (p === jadwalCurrentPage) {
        btns += `<a class="on">${p}</a>`;
      } else if (p === 1 || p === totalPages || Math.abs(p - jadwalCurrentPage) <= 2) {
        btns += `<a onclick="goToJadwalPage(${p})">${p}</a>`;
      } else if (Math.abs(p - jadwalCurrentPage) === 3) {
        btns += `<span>...</span>`;
      }
    }
    if (jadwalCurrentPage < totalPages) {
      btns += `<a onclick="goToJadwalPage(${jadwalCurrentPage + 1})">›</a>`;
    } else {
      btns += `<span>›</span>`;
    }
    pagerBtns.innerHTML = btns;
  };

  window.goToJadwalPage = function (p) {
    jadwalCurrentPage = p;
    renderJadwalTable();
  };

  window.batalkanJadwal = function (id) {
    if (confirm('Yakin ingin membatalkan jadwal ini?')) {
      const schedules = getSchedules();
      const s = schedules.find((x) => x.id === id);
      if (s) {
        s.status = 'DIBATALKAN';
        saveSchedules(schedules);
        renderJadwalTable();
        showFlash('Jadwal dibatalkan.');
      }
    }
  };

  /* ---------- VIEW: FORM PENCATATAN ---------- */
  function populateFormRoomSelect() {
    const sel = document.getElementById('jf-kode-ruangan');
    const rooms = getRooms().filter((r) => r.status === 'AKTIF');
    sel.innerHTML = rooms.map((r) => `<option value="${r.kode}">${r.kode} · ${r.nama}</option>`).join('');
    updateFormRoomPreview();
  }

  window.updateFormRoomPreview = function () {
    const kode = document.getElementById('jf-kode-ruangan').value;
    const rooms = getRooms();
    const sel = rooms.find((r) => r.kode === kode);
    const box = document.getElementById('preview-room-info');
    if (sel) {
      box.innerHTML = `
        <div class="kv"><span class="k">Nama</span><b style="font-weight:600">${escapeHtml(sel.nama)} (${sel.kode})</b></div>
        <div class="kv"><span class="k">Lokasi</span>${escapeHtml(sel.lokasi || '–')}</div>
        <div class="kv"><span class="k">Status ruangan</span><span class="pill ${PILL[sel.status] || ''}" style="width:fit-content">${sel.status}</span></div>
      `;
    } else {
      box.innerHTML = '<p class="note">Belum ada ruangan aktif. Tambahkan dulu di <a href="#/ruangan" style="color:var(--brand);font-weight:600">Data Ruangan</a>.</p>';
    }
  };

  window.resetFormJadwal = function () {
    document.getElementById('jadwal-form-id').value = '';
    document.getElementById('jf-tanggal').value = todayISO();
    document.getElementById('jf-kegiatan').value = '';
    document.getElementById('jf-mulai').value = '';
    document.getElementById('jf-selesai').value = '';
    document.getElementById('jf-pj').value = '';
    document.getElementById('jf-keterangan').value = '';
    document.getElementById('jf-status').value = 'TERJADWAL';
    document.getElementById('form-title').textContent = 'Form Pencatatan Penggunaan Ruang';
    document.getElementById('form-sub').textContent = 'Silakan lengkapi data kegiatan penggunaan ruang.';
    document.getElementById('btn-submit-jadwal').textContent = 'Simpan jadwal';
    document.getElementById('preview-schedule-id').textContent = newScheduleId();
    updateFormRoomPreview();
  };

  function loadScheduleForEdit(id) {
    const schedules = getSchedules();
    const s = schedules.find((x) => x.id === id);
    if (!s) return resetFormJadwal();

    document.getElementById('jadwal-form-id').value = s.id;
    document.getElementById('jf-tanggal').value = s.tanggal;
    document.getElementById('jf-kode-ruangan').value = s.kode_ruangan;
    document.getElementById('jf-kegiatan').value = s.kegiatan;
    document.getElementById('jf-mulai').value = s.mulai || '';
    document.getElementById('jf-selesai').value = s.selesai || '';
    document.getElementById('jf-pj').value = s.pj;
    document.getElementById('jf-keterangan').value = s.keterangan || '';
    document.getElementById('jf-status').value = s.status;

    document.getElementById('form-title').textContent = 'Ubah Penggunaan Ruang';
    document.getElementById('form-sub').textContent = 'Ubah data kegiatan penggunaan ruang.';
    document.getElementById('btn-submit-jadwal').textContent = 'Simpan perubahan';
    document.getElementById('preview-schedule-id').textContent = s.id;
    updateFormRoomPreview();
  }

  window.saveJadwal = function () {
    const id = document.getElementById('jadwal-form-id').value.trim();
    const tanggal = document.getElementById('jf-tanggal').value;
    const kode_ruangan = document.getElementById('jf-kode-ruangan').value;
    const kegiatan = document.getElementById('jf-kegiatan').value.trim();
    const mulai = document.getElementById('jf-mulai').value;
    const selesai = document.getElementById('jf-selesai').value;
    const pj = document.getElementById('jf-pj').value.trim();
    const keterangan = document.getElementById('jf-keterangan').value.trim();
    const status = document.getElementById('jf-status').value;

    if (!tanggal || !kode_ruangan || !kegiatan || !mulai || !pj) {
      alert('Mohon lengkapi semua kolom yang bertanda bintang (*).');
      return;
    }

    if (selesai && selesai <= mulai) {
      alert('Waktu selesai harus setelah waktu mulai.');
      return;
    }

    const schedules = getSchedules();
    if (id) {
      const idx = schedules.findIndex((x) => x.id === id);
      if (idx !== -1) {
        schedules[idx] = { ...schedules[idx], tanggal, kode_ruangan, kegiatan, mulai, selesai, pj, keterangan, status };
        saveSchedules(schedules);
        showFlash('Jadwal diperbarui.');
      }
    } else {
      const newId = newScheduleId();
      schedules.push({ id: newId, tanggal, kode_ruangan, kegiatan, mulai, selesai, pj, keterangan, status });
      saveSchedules(schedules);
      showFlash('Jadwal tersimpan.');
    }

    location.hash = '#/jadwal';
  };

  /* ---------- VIEW: RIWAYAT PENGGUNAAN ---------- */
  let riwayatCurrentPage = 1;
  const RIWAYAT_PER_PAGE = 15;

  function populateRiwayatFilters() {
    const schedules = getSchedules();
    const rooms = getRooms();

    // Bulan
    const bulanSet = new Set(schedules.map((s) => s.tanggal.slice(0, 7)));
    const bulanList = Array.from(bulanSet).sort().reverse();
    const bulanSel = document.getElementById('rw-bulan');
    const curB = bulanSel.value;
    bulanSel.innerHTML = '<option value="">Semua bulan</option>' + bulanList.map((b) => `
      <option value="${b}" ${curB === b ? 'selected' : ''}>${fmtBulan(b)}</option>
    `).join('');

    // Ruang
    const ruangSel = document.getElementById('rw-ruang');
    const curR = ruangSel.value;
    ruangSel.innerHTML = '<option value="">Semua ruangan</option>' + rooms.map((r) => `
      <option value="${r.kode}" ${curR === r.kode ? 'selected' : ''}>${r.kode} · ${r.nama}</option>
    `).join('');
  }

  window.resetRiwayatFilter = function () {
    document.getElementById('rw-q').value = '';
    document.getElementById('rw-bulan').value = '';
    document.getElementById('rw-ruang').value = '';
    document.getElementById('rw-status').value = '';
    renderRiwayatTable();
  };

  window.renderRiwayatTable = function () {
    const q = (document.getElementById('rw-q').value || '').trim().toLowerCase();
    const bulan = document.getElementById('rw-bulan').value;
    const ruang = document.getElementById('rw-ruang').value;
    const status = document.getElementById('rw-status').value;

    const schedules = getSchedules();

    // Stats
    document.getElementById('rw-cnt-semua').textContent = schedules.length;
    document.getElementById('rw-cnt-selesai').textContent = schedules.filter((s) => s.status === 'SELESAI').length;
    document.getElementById('rw-cnt-terjadwal').textContent = schedules.filter((s) => s.status === 'TERJADWAL').length;
    document.getElementById('rw-cnt-dibatalkan').textContent = schedules.filter((s) => s.status === 'DIBATALKAN').length;

    const filtered = schedules.filter((s) => {
      if (q && !s.kegiatan.toLowerCase().includes(q) && !s.pj.toLowerCase().includes(q) && !s.id.toLowerCase().includes(q) && !(s.keterangan || '').toLowerCase().includes(q)) {
        return false;
      }
      if (bulan && s.tanggal.slice(0, 7) !== bulan) return false;
      if (ruang && s.kode_ruangan !== ruang) return false;
      if (status && s.status !== status) return false;
      return true;
    }).sort((a, b) => b.tanggal.localeCompare(a.tanggal) || (b.mulai || '').localeCompare(a.mulai || ''));

    // Pagination
    const total = filtered.length;
    const totalPages = Math.max(1, Math.ceil(total / RIWAYAT_PER_PAGE));
    if (riwayatCurrentPage > totalPages) riwayatCurrentPage = totalPages;
    const startIdx = (riwayatCurrentPage - 1) * RIWAYAT_PER_PAGE;
    const paged = filtered.slice(startIdx, startIdx + RIWAYAT_PER_PAGE);

    const tbody = document.getElementById('rw-tbody');
    if (!paged.length) {
      tbody.innerHTML = '<tr><td colspan="9" class="dim">Tidak ada riwayat yang cocok dengan filter.</td></tr>';
    } else {
      tbody.innerHTML = paged.map((r) => `
        <tr>
          <td class="mono">${r.id}</td>
          <td class="nw">${fmtTanggal(r.tanggal)}</td>
          <td class="nw">${escapeHtml(r.kode_ruangan)}</td>
          <td style="min-width:240px"><b style="font-weight:600">${escapeHtml(r.kegiatan)}</b></td>
          <td class="nw dim">${fmtJam(r.mulai)}</td>
          <td class="nw dim">${fmtJam(r.selesai)}</td>
          <td>${escapeHtml(r.pj)}</td>
          <td><span class="pill ${PILL[r.status] || ''}">${r.status}</span></td>
          <td class="dim">${escapeHtml(r.keterangan || '–')}</td>
        </tr>
      `).join('');
    }

    // Pager
    document.getElementById('rw-pager-info').textContent = `Halaman ${riwayatCurrentPage} dari ${totalPages} (Total ${total} data)`;
    const pagerBtns = document.getElementById('rw-pager-btns');
    let btns = '';
    if (riwayatCurrentPage > 1) {
      btns += `<a onclick="goToRiwayatPage(${riwayatCurrentPage - 1})">‹</a>`;
    } else {
      btns += `<span>‹</span>`;
    }
    for (let p = 1; p <= totalPages; p++) {
      if (p === riwayatCurrentPage) {
        btns += `<a class="on">${p}</a>`;
      } else if (p === 1 || p === totalPages || Math.abs(p - riwayatCurrentPage) <= 2) {
        btns += `<a onclick="goToRiwayatPage(${p})">${p}</a>`;
      } else if (Math.abs(p - riwayatCurrentPage) === 3) {
        btns += `<span>...</span>`;
      }
    }
    if (riwayatCurrentPage < totalPages) {
      btns += `<a onclick="goToRiwayatPage(${riwayatCurrentPage + 1})">›</a>`;
    } else {
      btns += `<span>›</span>`;
    }
    pagerBtns.innerHTML = btns;
  };

  window.goToRiwayatPage = function (p) {
    riwayatCurrentPage = p;
    renderRiwayatTable();
  };

  window.exportDataCSV = function () {
    const schedules = getSchedules();
    const rooms = getRooms();
    const roomMap = Object.fromEntries(rooms.map((r) => [r.kode, r.nama]));

    const headers = ['ID Jadwal', 'Tanggal', 'Kode Ruangan', 'Nama Ruangan', 'Nama Kegiatan', 'Mulai', 'Selesai', 'Penanggung Jawab', 'Status', 'Keterangan'];
    const rows = schedules.map((s) => [
      s.id,
      s.tanggal,
      s.kode_ruangan,
      roomMap[s.kode_ruangan] || '',
      `"${(s.kegiatan || '').replace(/"/g, '""')}"`,
      s.mulai || '',
      s.selesai || '',
      `"${(s.pj || '').replace(/"/g, '""')}"`,
      s.status,
      `"${(s.keterangan || '').replace(/"/g, '""')}"`
    ]);

    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\r\n');
    downloadBlob(csvContent, `Riwayat_Penjadwalan_Ruang_${todayISO()}.csv`, 'text/csv;charset=utf-8;');
  };

  /* ---------- CADANGAN DATA (BACKUP & RESTORE) ---------- */
  window.exportDataJSON = function () {
    const data = {
      backupDate: new Date().toISOString(),
      rooms: getRooms(),
      schedules: getSchedules()
    };
    const jsonStr = JSON.stringify(data, null, 2);
    downloadBlob(jsonStr, `Backup_Penjadwalan_Ruang_${todayISO()}.json`, 'application/json');
    showFlash('Berkas cadangan berhasil diunduh.');
  };

  window.importDataJSON = function () {
    const fileInput = document.getElementById('import-file-input');
    const file = fileInput.files && fileInput.files[0];
    if (!file) {
      alert('Pilih berkas JSON terlebih dahulu.');
      return;
    }
    const reader = new FileReader();
    reader.onload = function (e) {
      try {
        const parsed = JSON.parse(e.target.result);
        if (Array.isArray(parsed.rooms) && Array.isArray(parsed.schedules)) {
          saveRooms(parsed.rooms);
          saveSchedules(parsed.schedules);
          alert('Data berhasil dipulihkan!');
          location.hash = '#/dashboard';
          renderDashboard();
        } else {
          alert('Format berkas tidak valid.');
        }
      } catch (err) {
        alert('Gagal membaca berkas JSON: ' + err.message);
      }
    };
    reader.readAsText(file);
  };

  window.resetToInitialData = function () {
    if (confirm('Apakah Anda yakin ingin mengembalikan data ke kondisi awal? Semua data yang Anda tambahkan akan diganti data awal.')) {
      saveRooms(DEFAULT_ROOMS);
      saveSchedules(DEFAULT_SCHEDULES);
      alert('Data telah dikembalikan ke kondisi awal.');
      location.hash = '#/dashboard';
      renderDashboard();
    }
  };

  function downloadBlob(content, filename, mimeType) {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  function escapeHtml(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  /* ---------- INISIALISASI SAAT HALAMAN DIBUKA ---------- */
  initStorage();
  updateAuthUI();
})();
