/* =========================================================
   MicroLab Interactive — script.js
   Platform: Tanpa framework, tanpa backend
   Penyimpanan: Semua data di array JavaScript (offline)
   Fitur: Board selector, pin interaktif, device cards, wiring simulator
   ========================================================= */

// ============ UTILITIES ============

/**
 * Buat placeholder gambar SVG untuk offline 100%
 * @param {Object} options - { label, subtitle, accent }
 * @returns {string} Data URL SVG
 */
function makeSvgDataUrl({ label, subtitle = "", accent = "#2563eb" }) {
  const safeLabel = String(label).replace(/[<>]/g, "");
  const safeSub = String(subtitle).replace(/[<>]/g, "");
  const svg = `
  <svg xmlns="http://www.w3.org/2000/svg" width="900" height="520" viewBox="0 0 900 520">
    <defs>
      <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stop-color="${accent}" stop-opacity="0.22"/>
        <stop offset="1" stop-color="#ffffff" stop-opacity="0.9"/>
      </linearGradient>
      <filter id="s" x="-20%" y="-20%" width="140%" height="140%">
        <feDropShadow dx="0" dy="22" stdDeviation="18" flood-color="#0f172a" flood-opacity="0.25"/>
      </filter>
    </defs>
    <rect x="0" y="0" width="900" height="520" fill="url(#g)"/>
    <rect x="76" y="86" width="748" height="348" rx="26" fill="#ffffff" fill-opacity="0.85" stroke="#0f172a" stroke-opacity="0.12" filter="url(#s)"/>
    <rect x="120" y="140" width="190" height="190" rx="22" fill="${accent}" fill-opacity="0.85"/>
    <rect x="330" y="150" width="450" height="22" rx="11" fill="#0f172a" fill-opacity="0.14"/>
    <rect x="330" y="190" width="390" height="18" rx="9" fill="#0f172a" fill-opacity="0.12"/>
    <rect x="330" y="222" width="330" height="18" rx="9" fill="#0f172a" fill-opacity="0.10"/>
    <rect x="120" y="352" width="660" height="14" rx="7" fill="#2563eb" fill-opacity="0.14"/>
    <text x="330" y="310" font-family="ui-sans-serif,system-ui,Segoe UI,Roboto,Arial" font-size="44" font-weight="800" fill="#0f172a">${safeLabel}</text>
    <text x="330" y="350" font-family="ui-sans-serif,system-ui,Segoe UI,Roboto,Arial" font-size="22" font-weight="650" fill="#52617a">${safeSub}</text>
    <text x="120" y="120" font-family="ui-sans-serif,system-ui,Segoe UI,Roboto,Arial" font-size="16" font-weight="800" fill="#0f172a" fill-opacity="0.55">Placeholder • Offline</text>
  </svg>`;
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg.trim())}`;
}

/**
 * Query selector shorthand
 */
const $ = (selector, root = document) => root.querySelector(selector);

/**
 * Query selector all + convert to array
 */
const $all = (selector, root = document) => Array.from(root.querySelectorAll(selector));

/**
 * HTML escape untuk keamanan XSS
 */
function escapeHtml(str) {
  return String(str).replace(/[&<>"']/g, (c) => {
    const map = { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;" };
    return map[c] || c;
  });
}

// ============ DATA: BOARDS ============

/**
 * Daftar board/mikrokontroler dengan:
 * - Spesifikasi ringkas
 * - Pin penting dengan contoh penggunaan
 */
const BOARDS = [
  {
    id: "uno",
    name: "Arduino Uno",
    image: "POTO/uno.jpg",
    specs: {
      "MCU": "ATmega328P",
      "Tegangan logika": "5V",
      "Input daya": "USB / VIN (7–12V)",
      "Pin digital": "14 (D0–D13)",
      "Pin PWM": "6 (D3, D5, D6, D9, D10, D11)",
      "Pin analog": "6 (A0–A5)",
      "Komunikasi": "UART, I2C, SPI",
      "Flash Memory": "32 KB",

      
    },
    pins: [
      { key: "D13", name: "D13", func: "LED Built-in", example: "digitalWrite(13, HIGH); // menyalakan LED onboard" },
      { key: "A0", name: "A0", func: "Analog Input", example: "int v = analogRead(A0); // membaca sensor analog" },
      { key: "VIN", name: "VIN", func: "Tegangan Masuk (7–12V)", example: "Gunakan adaptor/baterai ke VIN + GND" },
      { key: "5V", name: "5V", func: "Output 5V", example: "Memberi daya modul 5V (perhatikan arus max ~500mA)" },
      { key: "3.3V", name: "3.3V", func: "Output 3.3V", example: "Cocok untuk sensor 3.3V (arus terbatas ~50mA)" },
      { key: "GND", name: "GND", func: "Ground (Common Reference)", example: "Semua rangkaian harus memiliki GND bersama" },
      { key: "D0/D1", name: "D0/D1 (RX/TX)", func: "UART Serial", example: "Serial.begin(9600); // komunikasi serial" },
      { key: "A4/A5", name: "A4/A5 (SDA/SCL)", func: "I2C Bus", example: "Wire.begin(); // untuk sensor I2C (OLED, IMU, dsb.)" },
      { key: "D10–D13", name: "D10–D13 (SS/MOSI/MISO/SCK)", func: "SPI Bus", example: "Digunakan untuk modul SD, RF, Ethernet" },
      { key: "RESET", name: "RESET", func: "Reset board", example: "Tekan tombol atau hubung ke GND untuk reset" },
    ],
  },
  {
    id: "nano",
    name: "Arduino Nano",
    tag: "ATmega328P",
    accent: "#1d4ed8",
    image:"POTO/nano.jpg",
    specs: {
      "MCU": "ATmega328P",
      "Tegangan logika": "5V",
      "Input daya": "USB Mini / VIN (7–12V)",
      "Pin digital": "14",
      "Pin PWM": "6",
      "Pin analog": "8 (A0–A7)",
      "Komunikasi": "UART, I2C, SPI",
      "Ukuran": "Sangat ringkas (breadboard friendly)",
    },
    pins: [
      { key: "D13", name: "D13", func: "LED Built-in", example: "digitalWrite(13, !digitalRead(13));" },
      { key: "A0", name: "A0", func: "Analog Input", example: "analogRead(A0); // baca LDR/potensiometer" },
      { key: "A6/A7", name: "A6/A7", func: "Analog Only (Input)", example: "Khusus input analog (tidak bisa digitalWrite)" },
      { key: "VIN", name: "VIN", func: "Tegangan Masuk", example: "VIN + GND untuk suplai eksternal (7-12V)" },
      { key: "5V", name: "5V", func: "Output 5V", example: "Daya modul 5V (atur konsumsi)" },
      { key: "GND", name: "GND", func: "Ground", example: "Hubungkan GND modul & board" },
      { key: "D0/D1", name: "D0/D1 (RX/TX)", func: "UART Serial", example: "Serial untuk debug / komunikasi" },
      { key: "A4/A5", name: "A4/A5 (SDA/SCL)", func: "I2C Bus", example: "Sensor I2C: OLED, IMU, sensor suhu, dsb." },
    ],
  },
  {
    id: "esp32",
    name: "ESP32",
    tag: "Wi‑Fi + BT • 3.3V",
    accent: "#0b2a6b",
    image: "POTO/esp.jpg",
    specs: {
      "MCU": "Xtensa Dual‑core 32-bit",
      "Tegangan logika": "3.3V (PENTING!)",
      "Konektivitas": "Wi‑Fi 802.11 b/g/n + Bluetooth 4.2",
      "ADC": "12-bit, multiple channels",
      "PWM": "LEDC (LED PWM Controller)",
      "GPIO": "36 pin (varian umum DevKit)",
      "Catatan": "Beberapa pin reserved untuk boot/flash",
    },
    pins: [
      { key: "3V3", name: "3V3", func: "Output 3.3V", example: "VCC sensor 3.3V → 3V3 pin" },
      { key: "GND", name: "GND", func: "Ground", example: "Pastikan GND common di seluruh circuit" },
      { key: "GPIO4", name: "GPIO 4", func: "GPIO (sering DATA)", example: "Contoh: DHT11 DATA → GPIO4" },
      { key: "GPIO21/22", name: "GPIO 21/22 (SDA/SCL)", func: "I2C (default)", example: "Wire.begin(21, 22);" },
      { key: "GPIO18/19/23", name: "GPIO 18/19/23", func: "SPI (SCK/MISO/MOSI)", example: "SCK=18, MISO=19, MOSI=23" },
      { key: "GPIO34–39", name: "GPIO 34–39", func: "Input-only (ADC)", example: "Cocok untuk input analog (tidak output)" },
      { key: "EN", name: "EN", func: "Enable/Reset", example: "Tombol EN untuk soft reset" },
      { key: "GPIO0/2/15", name: "GPIO 0/2/15", func: "Boot pins (hati-hati!)", example: "Jangan hubung ke GND di power-on (bisa strapping)" },
    ],
  },
  {
    id: "esp8266",
    name: "ESP8266 (NodeMCU)",
    tag: "Wi‑Fi • 3.3V",
    accent: "#1e40af",
    image: "POTO/ESP8266.jpeg",
    specs: {
      "MCU": "ESP8266EX",
      "Tegangan logika": "3.3V (PENTING!)",
      "Konektivitas": "Wi‑Fi 802.11 b/g/n",
      "ADC": "1 channel (A0) — limited",
      "GPIO": "16 total, beberapa reserved",
      "UART": "2 (tapi RX0 conflict dengan flash)",
      "Catatan": "Hemat pin—perhatikan boot straps",
    },
    pins: [
      { key: "3V3", name: "3V3", func: "Output 3.3V", example: "Gunakan untuk sensor 3.3V" },
      { key: "GND", name: "GND", func: "Ground", example: "GND bersama di seluruh circuit" },
      { key: "D1/D2", name: "D1/D2 (GPIO5/GPIO4)", func: "I2C (SCL/SDA, default)", example: "Wire.begin(D2, D1); // SDA=D2, SCL=D1" },
      { key: "D5–D8", name: "D5–D8", func: "SPI / General GPIO", example: "Untuk modul SPI tertentu" },
      { key: "A0", name: "A0 (ADC0)", func: "Analog Input (0–1V default, 3.3V via mod)", example: "Baca sensor analog (range tergantung board)" },
      { key: "RST", name: "RST", func: "Reset", example: "Tarik LOW atau klik tombol untuk reset" },
      { key: "D0/GPIO16", name: "D0 (GPIO16)", func: "Wake-up from deep sleep", example: "Hanya pin yang bisa wake dari sleep" },
    ],
  },
  {
    id: "pico",
    name: "Raspberry Pi Pico",
    tag: "RP2040 • 3.3V",
    accent: "#3b82f6",
    image:"POTO/RPI.jpg",
    specs: {
      "MCU": "RP2040 (Dual‑core ARM Cortex‑M0+)",
      "Tegangan logika": "3.3V",
      "Frekuensi": "125 MHz (standar), bisa OC",
      "GPIO": "26 (GP0–GP28, dengan fungsi spesial)",
      "ADC": "3 channel + internal temperature",
      "Penyimpanan": "264 KB SRAM + external Flash",
      "Bahasa": "MicroPython, C/C++, CircuitPython",
    },
    pins: [
      { key: "3V3", name: "3V3(OUT)", func: "Output 3.3V (regulated)", example: "VCC sensor 3.3V → 3V3(OUT)" },
      { key: "GND", name: "GND", func: "Ground", example: "GND bersama critical" },
      { key: "VBUS", name: "VBUS", func: "5V dari USB", example: "Hanya ada jika terhubung USB" },
      { key: "VSYS", name: "VSYS", func: "Input suplai (1.8–5.5V)", example: "Dari baterai/adaptor external (ikuti datasheet)" },
      { key: "GP26/27/28", name: "GP26/27/28 (ADC)", func: "Analog Input", example: "analogRead(26); // baca LDR/sensor" },
      { key: "RUN", name: "RUN", func: "Reset", example: "Tarik LOW untuk reset (via RC circuit)" },
      { key: "GP0/GP1", name: "GP0/GP1 (UART0 TX/RX)", func: "Serial UART", example: "UART serial debug/komunikasi" },
      { key: "GP4/GP5", name: "GP4/GP5 (I2C0 SDA/SCL)", func: "I2C Bus 0", example: "Banyak contoh MicroPython pakai ini" },
    ],
  },
];

// ============ DATA: DEVICES (SENSORS & ACTUATORS) ============

/**
 * Komponen sensor & aktuator
 * Field: kind (sensor/aktuator), pins (daftar pin), usage, dll
 */
const DEVICES = [
  {
    id: "hcsr04",
    name: "HC-SR04",
    kind: "sensor",
    tag: "Ultrasonik",
    accent: "#2563eb",
    image:  "POTO/HC.webp",
    function: "Mengukur jarak dengan gelombang ultrasonik (echo/pantulan).",
    howItWorks:
      "Board mengirim pulsa ke pin TRIG, modul memancarkan ultrasonik 40kHz, lalu mengukur waktu pantulan di pin ECHO untuk hitung jarak.",
    pins: ["VCC", "TRIG", "ECHO", "GND"],
    usage:
      "Robot penghindar halangan, pengukur tinggi air, sensor parkir sederhana, navigasi robot, radar depth-sensing.",
  },
  {
    id: "dht11",
    name: "DHT11",
    kind: "sensor",
    tag: "Suhu & Kelembapan",
    accent: "#1d4ed8",
    image: "POTO/DHT.jpeg",
    function: "Mengukur suhu (0–50°C, ±2°C) dan kelembapan (20–95%, ±5%).",
    howItWorks:
      "Mengirim data digital melalui satu pin DATA dengan protokol khusus (bit-banging 1-wire). Butuh pull-up resistor 10kΩ jika modul tidak memiliki built-in.",
    pins: ["VCC (3.3–5.5V)", "DATA", "GND"],
    usage: "Monitoring lingkungan, otomatisasi ruangan (AC/heater), greenhouse mini, alarm suhu/kelembapan, weather station sederhana.",
  },
  {
    id: "ldr",
    name: "LDR (Light Dependent Resistor)",
    kind: "sensor",
    tag: "Cahaya",
    accent: "#3b82f6",
    image: "POTO/LDR.jpg",
    function: "Mendeteksi intensitas cahaya (resistansi berubah inversly terhadap cahaya).",
    howItWorks:
      "Biasanya dipasang sebagai voltage divider circuit dengan resistor tetap (~10kΩ). Saat terang: R turun, Vout naik. Saat gelap: R naik, Vout turun. Dibaca via ADC.",
    pins: ["Kaki 1 (ke Vcc)", "Kaki 2 (ke resistor + ADC)"],
    usage: "Lampu otomatis (street light), deteksi siang/malam, pengaturan brightness (auto-backlight), sensor level cahaya ruangan.",
  },
  {
    id: "irsensor",
    name: "IR Sensor (Infrared)",
    kind: "sensor",
    tag: "Obstacle/Line",
    accent: "#0b2a6b",
    image: "POTO/INFR.jpg",
    function: "Mendeteksi objek atau garis menggunakan pantulan cahaya inframerah.",
    howItWorks:
      "IR LED memancarkan (biasanya 940nm), photodioda/transistor membaca pantulan. Output bisa analog (AO) untuk sensor strength atau digital (DO) untuk threshold detection.",
    pins: ["VCC (3.3–5V)", "GND", "AO (Analog)", "DO (Digital, opsional)"],
    usage: "Line follower robot, counter/encoder sederhana, deteksi halangan jarak dekat (2–20cm), proximity sensor, collision detector.",
  },
  {
    id: "mq2",
    name: "MQ-2",
    kind: "sensor",
    tag: "Gas/Asap",
    accent: "#1e40af",
    image: "POTO/mq2.jpg",
    function: "Mendeteksi gas (LPG, propana, methane) dan asap di udara.",
    howItWorks:
      "Elemen sensor (tin dioxide) dipanaskan heater ~3-5V. Konsentrasi gas mengubah resistansi → output analog (AO) atau threshold digital (DO). Butuh warm-up ~30 detik.",
    pins: ["VCC (5V, heater)", "GND", "AO (Analog)", "DO (Digital threshold)"],
    usage: "Alarm kebocoran gas (safety), monitoring kualitas udara ruangan (kasar), fire/asap detector sederhana, industrial gas sensing.",
  },
  {
    id: "servo",
    name: "Servo Motor",
    kind: "aktuator",
    tag: "PWM • Posisi",
    accent: "#2563eb",
    image: "POTO/SERVO.webp",
    function: "Menggerakkan poros pada sudut tertentu (0–180° atau 0–270° tergantipe).",
    howItWorks:
      "Menerima sinyal PWM ~50Hz pada pin signal. Pulse width menentukan sudut: 1.0ms = 0°, 1.5ms = 90°, 2.0ms = 180°. Pakai library Servo.h / servo.attach().",
    pins: ["VCC (4.8–6V, sering 5V)", "GND (common)", "SIG (PWM signal)"],
    usage: "Robot arm, pintu otomatis mini, steering robot RC, pan-tilt kamera, gate/latch actuator, game machine control.",
  },
  {
    id: "relay",
    name: "Relay Module",
    kind: "aktuator",
    tag: "Switch • AC/DC",
    accent: "#1d4ed8",
    image: "POTO/RLY.jpg",
    function: "Mengendalikan beban tegangan/arus besar menggunakan sinyal digital kecil dari mikrokontroler.",
    howItWorks:
      "Sinyal HIGH ke IN mengaktifkan kumparan (coil) → memindah kontak NO/NC. Modul relay biasanya sudah pakai transistor driver & optocoupler (galvanic isolation).",
    pins: ["VCC (modul, biasanya 5V)", "GND", "IN (digital control)"],
    usage: "Kontrol lampu AC rumah (dengan prosedur keselamatan!), pompa DC, motor AC, pemanas, cooler, perangkat rumah tangga, industrial control.",
  },
  {
    id: "buzzer",
    name: "Buzzer",
    kind: "aktuator",
    tag: "Audio",
    accent: "#3b82f6",
    image: "POTO/BUZ.webp",
    function: "Menghasilkan bunyi untuk indikator atau alarm.",
    howItWorks:
      "Buzzer aktif (built-in oscillator): cukup diberi HIGH/LOW. Buzzer pasif: butuh PWM untuk nada. Tipe aktif lebih mudah; tipe pasif lebih fleksibel nada.",
    pins: ["VCC (+) atau kaki panjang", "GND atau kaki pendek"],
    usage: "Alarm/notifikasi, indikator status perangkat, beep confirmation, music player sederhana (pasif), smart home alert.",
  },
  {
    id: "led",
    name: "LED (Light Emitting Diode)",
    kind: "aktuator",
    tag: "Indikator",
    accent: "#0b2a6b",
    image: "POTO/LED.webp",
    function: "Menghasilkan cahaya sebagai indikator status atau output visual.",
    howItWorks:
      "LED adalah dioda: anoda (+) ke power, katoda (-) ke GND via resistor pembatas arus (220Ω–1kΩ tergantung tegangan & warna). I_max biasanya 20mA.",
    pins: ["Anoda (panjang, +)", "Katoda (pendek, -) via resistor"],
    usage: "Indikator status (ON/OFF/error), traffic light mini, debug visual circuit, display pixel, mood lighting, interrupt indicator.",
  },
];
// TARUH DI SINI
function showBoard(boardId) {
    const board = BOARDS.find(b => b.id === boardId);

    document.getElementById("boardName").textContent = board.name;
    document.getElementById("boardImage").src = board.image;
}
// ============ DATA: WIRING MAPPINGS ============

/**
 * Pemetaan wiring: key = "boardId:deviceId"
 * Value = array koneksi pin dengan keterangan
 * 
 * PENTING: Mapping ini berdasarkan praktik umum.
 * User HARUS verifikasi dengan datasheet resmi sebelum merangkai!
 */
const WIRING_MAP = {
  // ===== ESP32 =====
  "esp32:dht11": [
    { devicePin: "VCC", boardPin: "3.3V", note: "DHT11 bisa 3.3–5V. Pakai 3.3V untuk ESP32 safety." },
    { devicePin: "GND", boardPin: "GND", note: "Ground harus terhubung common." },
    { devicePin: "DATA", boardPin: "GPIO4", note: "Data line. Tambahkan pull-up 10kΩ jika modul tanpa built-in." },
  ],
"esp32:hcsr04": [
  { devicePin: "VCC", boardPin: "5V", note: "Supply daya sensor ultrasonik." },
  { devicePin: "GND", boardPin: "GND", note: "Ground bersama." },
  { devicePin: "TRIG", boardPin: "GPIO5", note: "Pin trigger untuk mengirim gelombang ultrasonik." },
  { devicePin: "ECHO", boardPin: "GPIO18", note: "Pin penerima pantulan. Gunakan pembagi tegangan jika diperlukan." },
],

"esp32:ldr": [
  { devicePin: "VCC", boardPin: "3.3V", note: "Supply tegangan sensor LDR module." },
  { devicePin: "GND", boardPin: "GND", note: "Ground bersama." },
  { devicePin: "AO", boardPin: "GPIO34", note: "Output analog untuk membaca intensitas cahaya." },
],

"esp32:irsensor": [
  { devicePin: "VCC", boardPin: "3.3V", note: "Supply sensor infrared." },
  { devicePin: "GND", boardPin: "GND", note: "Ground bersama." },
  { devicePin: "OUT", boardPin: "GPIO15", note: "Output digital deteksi objek." },
],

"esp32:mq2": [
  { devicePin: "VCC", boardPin: "5V", note: "Supply sensor gas MQ-2." },
  { devicePin: "GND", boardPin: "GND", note: "Ground bersama." },
  { devicePin: "AO", boardPin: "GPIO34", note: "Output analog untuk membaca kadar gas." },
  { devicePin: "DO", boardPin: "GPIO27", note: "Output digital berdasarkan threshold modul." },
],

"esp32:servo": [
  { devicePin: "VCC", boardPin: "5V", note: "Gunakan supply eksternal jika servo berarus besar." },
  { devicePin: "GND", boardPin: "GND", note: "Ground harus common dengan ESP32." },
  { devicePin: "SIGNAL", boardPin: "GPIO13", note: "Pin PWM untuk mengendalikan sudut servo." },
],

"esp32:relay": [
  { devicePin: "VCC", boardPin: "5V", note: "Supply modul relay." },
  { devicePin: "GND", boardPin: "GND", note: "Ground bersama." },
  { devicePin: "IN", boardPin: "GPIO26", note: "Pin kontrol relay." },
],

"esp32:buzzer": [
  { devicePin: "VCC", boardPin: "3.3V", note: "Supply buzzer aktif." },
  { devicePin: "GND", boardPin: "GND", note: "Ground bersama." },
  { devicePin: "SIG", boardPin: "GPIO25", note: "Pin output untuk menghasilkan bunyi." },
],

"esp32:led": [
  { devicePin: "Anoda (+)", boardPin: "GPIO2", note: "Hubungkan melalui resistor 220Ω." },
  { devicePin: "Katoda (-)", boardPin: "GND", note: "Ground rangkaian LED." },
],
  // ===== Arduino UNO =====
  "uno:hcsr04": [
    { devicePin: "VCC", boardPin: "5V", note: "HC-SR04 standar butuh 5V." },
    { devicePin: "GND", boardPin: "GND", note: "Ground bersama." },
    { devicePin: "TRIG", boardPin: "D9 (PWM)", note: "Pin output trigger (HIGH pulsa 10µs)." },
    { devicePin: "ECHO", boardPin: "D10", note: "Pin input echo (measured pulse width)." },
  ],

  "uno:dht11": [
    { devicePin: "VCC", boardPin: "5V", note: "DHT11 aman 3.3–5V. Pilih 5V jika pakai uno." },
    { devicePin: "GND", boardPin: "GND", note: "Ground bersama." },
    { devicePin: "DATA", boardPin: "D2", note: "Pin digital I/O. Pakai library DHT11.h." },
  ],

  "uno:servo": [
    { devicePin: "VCC", boardPin: "5V atau supply eksternal", note: "Servo bisa butuh arus besar; pertimbangkan power terpisah jika multi-servo." },
    { devicePin: "GND", boardPin: "GND", note: "Jika supply eksternal, tetap satukan GND untuk reference." },
    { devicePin: "SIG", boardPin: "D9 (PWM)", note: "PWM signal pin. Pakai library Servo.h → servo.attach(9)." },
  ],

  "uno:relay": [
    { devicePin: "VCC", boardPin: "5V", note: "Relay module standar 5V." },
    { devicePin: "GND", boardPin: "GND", note: "Ground." },
    { devicePin: "IN", boardPin: "D7", note: "Input kontrol (HIGH=ON, LOW=OFF)." },
  ],

  "uno:led": [
    { devicePin: "Anoda (+)", boardPin: "D13 via resistor 220Ω", note: "Resistor pembatas arus adalah WAJIB (untuk limit ~20mA)." },
    { devicePin: "Katoda (-)", boardPin: "GND", note: "Kaki pendek LED ke GND." },
  ],

  "uno:ldr": [
    { devicePin: "Kaki 1", boardPin: "5V", note: "Via voltage divider resistor ~10kΩ." },
    { devicePin: "Kaki 2 + Resistor", boardPin: "A0 (ADC)", note: "Tap point antara LDR & resistor → A0." },
    { devicePin: "Resistor satunya", boardPin: "GND", note: "" },
  ],
  "uno:irsensor": [
  { devicePin: "VCC", boardPin: "5V", note: "Supply daya sensor IR." },
  { devicePin: "GND", boardPin: "GND", note: "Ground bersama." },
  { devicePin: "OUT", boardPin: "D2", note: "Output digital untuk deteksi objek." },
],

"uno:mq2": [
  { devicePin: "VCC", boardPin: "5V", note: "Supply daya sensor gas MQ-2." },
  { devicePin: "GND", boardPin: "GND", note: "Ground bersama." },
  { devicePin: "AO", boardPin: "A0", note: "Output analog untuk membaca kadar gas." },
  { devicePin: "DO", boardPin: "D3", note: "Output digital berdasarkan threshold modul." },
],

"uno:buzzer": [
  { devicePin: "VCC", boardPin: "5V", note: "Supply daya buzzer aktif." },
  { devicePin: "GND", boardPin: "GND", note: "Ground bersama." },
  { devicePin: "SIG", boardPin: "D8", note: "Pin output untuk mengaktifkan buzzer." },
],

  // ===== Arduino NANO =====
  "nano:hcsr04": [
    { devicePin: "VCC", boardPin: "5V", note: "" },
    { devicePin: "GND", boardPin: "GND", note: "" },
    { devicePin: "TRIG", boardPin: "D9", note: "" },
    { devicePin: "ECHO", boardPin: "D10", note: "" },
  ],

  "nano:dht11": [
    { devicePin: "VCC", boardPin: "5V", note: "" },
    { devicePin: "GND", boardPin: "GND", note: "" },
    { devicePin: "DATA", boardPin: "D2", note: "" },
  ],
  "nano:ldr": [
  { devicePin: "VCC", boardPin: "5V", note: "" },
  { devicePin: "GND", boardPin: "GND", note: "" },
  { devicePin: "AO", boardPin: "A0", note: "" },
],

"nano:irsensor": [
  { devicePin: "VCC", boardPin: "5V", note: "" },
  { devicePin: "GND", boardPin: "GND", note: "" },
  { devicePin: "OUT", boardPin: "D2", note: "" },
],

"nano:mq2": [
  { devicePin: "VCC", boardPin: "5V", note: "" },
  { devicePin: "GND", boardPin: "GND", note: "" },
  { devicePin: "AO", boardPin: "A0", note: "" },
  { devicePin: "DO", boardPin: "D3", note: "" },
],

"nano:servo": [
  { devicePin: "VCC", boardPin: "5V", note: "" },
  { devicePin: "GND", boardPin: "GND", note: "" },
  { devicePin: "SIG", boardPin: "D9", note: "" },
],

"nano:relay": [
  { devicePin: "VCC", boardPin: "5V", note: "" },
  { devicePin: "GND", boardPin: "GND", note: "" },
  { devicePin: "IN", boardPin: "D7", note: "" },
],

"nano:buzzer": [
  { devicePin: "VCC", boardPin: "5V", note: "" },
  { devicePin: "GND", boardPin: "GND", note: "" },
  { devicePin: "SIG", boardPin: "D8", note: "" },
],

"nano:led": [
  { devicePin: "Anoda (+)", boardPin: "D13", note: "" },
  { devicePin: "Katoda (-)", boardPin: "GND", note: "" },
],

  // ===== ESP8266 =====
  "esp8266:dht11": [
    { devicePin: "VCC", boardPin: "3.3V", note: "ESP8266 hanya 3.3V logic." },
    { devicePin: "GND", boardPin: "GND", note: "" },
    { devicePin: "DATA", boardPin: "D4 (GPIO2)", note: "D4 aman untuk data line. Hindari GPIO0/15 (boot pins)." },
  ],

  "esp8266:ldr": [
    { devicePin: "Kaki 1", boardPin: "3.3V", note: "Via voltage divider." },
    { devicePin: "Kaki 2", boardPin: "A0 (ADC)", note: "Tap ke A0." },
    { devicePin: "Resistor", boardPin: "GND", note: "" },
  ],
  "esp8266:hcsr04": [
  { devicePin: "VCC", boardPin: "5V", note: "Supply sensor ultrasonik." },
  { devicePin: "GND", boardPin: "GND", note: "" },
  { devicePin: "TRIG", boardPin: "D5 (GPIO14)", note: "" },
  { devicePin: "ECHO", boardPin: "D6 (GPIO12)", note: "Gunakan pembagi tegangan untuk keamanan GPIO ESP8266." },
],

"esp8266:irsensor": [
  { devicePin: "VCC", boardPin: "3.3V", note: "ESP8266 menggunakan logika 3.3V." },
  { devicePin: "GND", boardPin: "GND", note: "" },
  { devicePin: "OUT", boardPin: "D2 (GPIO4)", note: "" },
],

"esp8266:mq2": [
  { devicePin: "VCC", boardPin: "5V", note: "Supply sensor MQ-2." },
  { devicePin: "GND", boardPin: "GND", note: "" },
  { devicePin: "AO", boardPin: "A0", note: "ESP8266 hanya memiliki satu pin analog (A0)." },
  { devicePin: "DO", boardPin: "D1 (GPIO5)", note: "" },
],

"esp8266:servo": [
  { devicePin: "VCC", boardPin: "5V", note: "Disarankan supply eksternal untuk servo." },
  { devicePin: "GND", boardPin: "GND", note: "Ground harus common dengan ESP8266." },
  { devicePin: "SIG", boardPin: "D5 (GPIO14)", note: "Pin PWM untuk kontrol servo." },
],

"esp8266:relay": [
  { devicePin: "VCC", boardPin: "5V", note: "Supply modul relay." },
  { devicePin: "GND", boardPin: "GND", note: "" },
  { devicePin: "IN", boardPin: "D1 (GPIO5)", note: "" },
],

"esp8266:buzzer": [
  { devicePin: "VCC", boardPin: "3.3V", note: "" },
  { devicePin: "GND", boardPin: "GND", note: "" },
  { devicePin: "SIG", boardPin: "D7 (GPIO13)", note: "" },
],

"esp8266:led": [
  { devicePin: "Anoda (+)", boardPin: "D4 (GPIO2)", note: "Gunakan resistor 220Ω." },
  { devicePin: "Katoda (-)", boardPin: "GND", note: "" },
],

  // ===== Raspberry Pi Pico =====
  "pico:ldr": [
    { devicePin: "Kaki 1", boardPin: "3.3V", note: "Via voltage divider resistor." },
    { devicePin: "Kaki 2", boardPin: "GP26 (ADC0)", note: "ADC pin. MicroPython: ADC(Pin(26))." },
    { devicePin: "Resistor", boardPin: "GND", note: "" },
  ],

  "pico:dht11": [
    { devicePin: "VCC", boardPin: "3.3V", note: "Pico: 3.3V logic." },
    { devicePin: "GND", boardPin: "GND", note: "" },
    { devicePin: "DATA", boardPin: "GP4 (I2C SDA, tapi untuk DHT pakai GPIO biasa)", note: "GP4 atau GP lain yang bukan I2C jika pakai bit-bang." },
  ],
  "pico:hcsr04": [
  { devicePin: "VCC", boardPin: "VBUS (5V)", note: "Supply sensor ultrasonik." },
  { devicePin: "GND", boardPin: "GND", note: "" },
  { devicePin: "TRIG", boardPin: "GP14", note: "Output trigger." },
  { devicePin: "ECHO", boardPin: "GP15", note: "Input echo. Gunakan level shifter/pembagi tegangan jika diperlukan." },
],

"pico:irsensor": [
  { devicePin: "VCC", boardPin: "3.3V", note: "Logika Pico adalah 3.3V." },
  { devicePin: "GND", boardPin: "GND", note: "" },
  { devicePin: "OUT", boardPin: "GP16", note: "Input digital deteksi objek." },
],

"pico:mq2": [
  { devicePin: "VCC", boardPin: "5V", note: "Supply sensor MQ-2." },
  { devicePin: "GND", boardPin: "GND", note: "" },
  { devicePin: "AO", boardPin: "GP26 (ADC0)", note: "Membaca kadar gas secara analog." },
  { devicePin: "DO", boardPin: "GP17", note: "Output digital berdasarkan threshold modul." },
],

"pico:servo": [
  { devicePin: "VCC", boardPin: "5V", note: "Disarankan supply eksternal jika servo besar." },
  { devicePin: "GND", boardPin: "GND", note: "Ground harus common dengan Pico." },
  { devicePin: "SIG", boardPin: "GP18", note: "PWM output untuk kontrol servo." },
],

"pico:relay": [
  { devicePin: "VCC", boardPin: "5V", note: "Supply modul relay." },
  { devicePin: "GND", boardPin: "GND", note: "" },
  { devicePin: "IN", boardPin: "GP19", note: "Pin kontrol relay." },
],

"pico:buzzer": [
  { devicePin: "VCC", boardPin: "3.3V", note: "" },
  { devicePin: "GND", boardPin: "GND", note: "" },
  { devicePin: "SIG", boardPin: "GP20", note: "Output PWM untuk menghasilkan nada." },
],

"pico:led": [
  { devicePin: "Anoda (+)", boardPin: "GP21", note: "Gunakan resistor 220Ω." },
  { devicePin: "Katoda (-)", boardPin: "GND", note: "" },
],
};

// ============ DOM ELEMENTS ============

const el = {
  navToggle: $("#navToggle"),
  nav: $("#nav"),
  navLinks: $all(".nav__link"),

  boardCards: $("#boardCards"),
  boardPanel: $("#boardPanel"),
  boardImage: $("#boardImage"),
  boardName: $("#boardName"),
  boardTag: $("#boardTag"),
  boardMeta: $("#boardMeta"),
  pinGrid: $("#pinGrid"),

  deviceCards: $("#deviceCards"),
  deviceSearch: $("#deviceSearch"),
  filterChips: $all(".chip"),

  selectBoard: $("#selectBoard"),
  selectDevice: $("#selectDevice"),
  wiringTitle: $("#wiringTitle"),
  wiringSubtitle: $("#wiringSubtitle"),
  wiringTable: $("#wiringTable"),
  wiringEmpty: $("#wiringEmpty"),
  btnUseExample: $("#btnUseExample"),
  diagBoard: $("#diagBoard"),
  diagDevice: $("#diagDevice"),
  diagBoardPins: $("#diagBoardPins"),
  diagDevicePins: $("#diagDevicePins"),
  diagLines: $("#diagLines"),

  modal: $("#modal"),
  modalTitle: $("#modalTitle"),
  modalSubtitle: $("#modalSubtitle"),
  modalBody: $("#modalBody"),
  modalFoot: $("#modalFoot"),
};

// ============ STATE ============

const state = {
  selectedBoardId: null,
  deviceFilter: "all",
  deviceQuery: "",
};

// ============ BOARD MANAGEMENT ============

/**
 * Render board cards
 */
function renderBoardCards() {
  el.boardCards.innerHTML = BOARDS.map(b =>`
    <article class="card">
      <div class="card__media">
        <img src="${b.image}" alt="${b.name}" class="card__img" loading="lazy" />
      </div>
      <div class="card__body">
        <span class="badge" style="color:${b.accent}; background-color:${b.accent}10; border-color:${b.accent}30">${b.tag}</span>
        <h3 class="card__title" style="margin-top:10px;">${b.name}</h3>
        <p class="card__desc">Klik tombol di bawah untuk memeriksa konfigurasi pinout instruksional.</p>
        <button class="btn btn--primary btn--sm" onclick="selectBoard('${b.id}')">Eksplorasi Pin</button>
      </div>
    </article>
  `).join("");
}
  // Event: klik atau keyboard Enter/Space
  $all("[data-board-id]", el.boardCards).forEach((card) => {
    const pick = () => selectBoard(card.getAttribute("data-board-id"));
    card.addEventListener("click", pick);
    card.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        pick();
      }
    });
  });
/**
 * Pilih & tampilkan detail board
 */
function selectBoard(boardId) {
  const board = BOARDS.find((b) => b.id === boardId);
  if (!board) {
    console.warn(`Board ${boardId} tidak ditemukan`);
    return;
  }

  state.selectedBoardId = boardId;

  // Highlight selected card
  $all("[data-board-id]", el.boardCards).forEach((c) => {
    c.classList.toggle("is-selected", c.getAttribute("data-board-id") === boardId);
  });

  // Tampilkan panel detail
  el.boardPanel.hidden = false;
  el.boardImage.src = board.image;
  el.boardImage.alt = `Gambar ${board.name}`;
  el.boardName.textContent = board.name;
  el.boardTag.textContent = board.tag;

  // Render specs
  el.boardMeta.innerHTML = Object.entries(board.specs)
    .map(([k, v]) => {
      return `
        <div class="meta">
          <div class="meta__k">${escapeHtml(k)}</div>
          <div class="meta__v">${escapeHtml(v)}</div>
        </div>
      `;
    })
    .join("");

  // Render pin buttons
  el.pinGrid.innerHTML = board.pins
    .map((p) => `<button class="pin-chip" type="button" data-pin="${escapeHtml(p.key)}">${escapeHtml(p.name)}</button>`)
    .join("");

  // Event: klik pin untuk modal detail
  $all("[data-pin]", el.pinGrid).forEach((btn) => {
    btn.addEventListener("click", () => openPinDetail(boardId, btn.getAttribute("data-pin")));
  });

  // Sync dropdown wiring
  el.selectBoard.value = boardId;
  updateWiring();
}

/**
 * Buka modal detail pin
 */
function openPinDetail(boardId, pinKey) {
  const board = BOARDS.find((b) => b.id === boardId);
  const pin = board?.pins.find((p) => p.key === pinKey);
  
  if (!pin) {
    console.warn(`Pin ${pinKey} tidak ditemukan`);
    return;
  }

  openModal({
    title: `${pin.name} — ${board.name}`,
    subtitle: "Informasi pin & contoh kode",
    bodyHtml: `
      <div class="kvs">
        <div class="kv">
          <div class="k">Nama Pin</div>
          <div class="v">${escapeHtml(pin.name)}</div>
        </div>
        <div class="kv">
          <div class="k">Fungsi</div>
          <div class="v">${escapeHtml(pin.func)}</div>
        </div>
        <div class="kv">
          <div class="k">Contoh Kode</div>
          <div class="v"><code>${escapeHtml(pin.example)}</code></div>
        </div>
      </div>
      <div style="margin-top: 12px; padding: 12px; background: rgba(37,99,235,0.06); border-radius: 12px; border-left: 3px solid #2563eb;">
        <strong>💡 Tips Praktik:</strong><br>
        Selalu verifikasi pin function dengan datasheet board sebelum coding. 
        Perhatikan tegangan logika (5V vs 3.3V) dan arus maksimal per pin.
      </div>
    `,
    footerButtons: [
      {
        label: "Tutup",
        className: "btn btn--ghost",
        onClick: closeModal,
      },
    ],
  });
}

// ============ DEVICE (SENSOR & AKTUATOR) MANAGEMENT ============

/**
 * Filter device berdasarkan kategori & search query
 */
function getFilteredDevices() {
  const q = state.deviceQuery.trim().toLowerCase();
  return DEVICES.filter((d) => {
    const passFilter = state.deviceFilter === "all" ? true : d.kind === state.deviceFilter;
    const hay = `${d.name} ${d.tag} ${d.function} ${d.usage}`.toLowerCase();
    const passQuery = q ? hay.includes(q) : true;
    return passFilter && passQuery;
  });
}

/**
 * Render device cards dengan filter
 */
function renderDeviceCards() {
  const list = getFilteredDevices();
  el.deviceCards.innerHTML =
    list.length === 0
      ? `<div class="empty" style="grid-column: 1/-1;">Tidak ada hasil. Coba kata kunci atau filter lain.</div>`
      : list
          .map((d) => {
            const kindLabel = d.kind === "sensor" ? "Sensor" : "Aktuator";
            return `
              <article class="card" role="button" tabindex="0" data-device-id="${d.id}" aria-label="Lihat ${escapeHtml(d.name)}">
                <div class="card__media">
                  <img src="${d.image}" alt="Gambar ${escapeHtml(d.name)}" loading="lazy" />
                </div>
                <div class="card__body">
                  <div class="card__title">
                    <h3>${escapeHtml(d.name)}</h3>
                    <span class="tag">${escapeHtml(kindLabel)}</span>
                  </div>
                  <p class="card__desc">
                    ${escapeHtml(d.function)}
                  </p>
                </div>
              </article>
            `;
          })
          .join("");

  // Event: klik card untuk modal detail
  $all("[data-device-id]", el.deviceCards).forEach((card) => {
    const open = () => openDeviceDetail(card.getAttribute("data-device-id"));
    card.addEventListener("click", open);
    card.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        open();
      }
    });
  });
}

/**
 * Buka modal detail device (sensor/aktuator)
 */
function openDeviceDetail(deviceId) {
  const d = DEVICES.find((x) => x.id === deviceId);
  if (!d) {
    console.warn(`Device ${deviceId} tidak ditemukan`);
    return;
  }

  const kindLabel = d.kind === "sensor" ? "Sensor" : "Aktuator";
  const pinsText = Array.isArray(d.pins) ? d.pins.join(", ") : String(d.pins);

  openModal({
    title: `${d.name}`,
    subtitle: `${kindLabel} • ${d.tag}`,
    bodyHtml: `
      <div style="display:grid; grid-template-columns:1fr; gap:12px">
        <div style="border-radius:16px; border:1px solid rgba(15,23,42,0.1); overflow:hidden; background:rgba(255,255,255,0.9)">
          <div style="padding:12px; background:rgba(37,99,235,0.06); border-bottom:1px solid rgba(15,23,42,0.08); font-weight:900; font-size:0.95rem;">Gambar Komponen</div>
          <div style="padding:12px; display:grid; place-items:center; min-height:200px">
            <img src="${d.image}" alt="Gambar ${escapeHtml(d.name)}" style="max-height:180px; width:auto" loading="lazy" />
          </div>
        </div>

        <div class="kvs">
          <div class="kv">
            <div class="k">Fungsi Utama</div>
            <div class="v">${escapeHtml(d.function)}</div>
          </div>
          <div class="kv">
            <div class="k">Jumlah Pin</div>
            <div class="v">${escapeHtml(String(d.pins.length))} • ${escapeHtml(pinsText)}</div>
          </div>
        </div>

        <div class="kv">
          <div class="k">Cara Kerja Singkat</div>
          <div class="v">${escapeHtml(d.howItWorks)}</div>
        </div>

        <div class="kv">
          <div class="k">Kegunaan dalam Proyek</div>
          <div class="v">${escapeHtml(d.usage)}</div>
        </div>
      </div>
    `,
    footerButtons: [
      {
        label: "Gunakan di Wiring",
        className: "btn btn--primary",
        onClick: () => {
          el.selectDevice.value = d.id;
          updateWiring();
          closeModal();
          window.location.hash = "#wiring";
        },
      },
      {
        label: "Tutup",
        className: "btn btn--ghost",
        onClick: closeModal,
      },
    ],
  });
}

// ============ WIRING SIMULATOR ============

/**
 * Render select options untuk board & device di wiring section
 */
function renderWiringSelects() {
  el.selectBoard.innerHTML = BOARDS.map((b) => 
    `<option value="${b.id}">${escapeHtml(b.name)}</option>`
  ).join("");
  
  el.selectDevice.innerHTML = DEVICES.map((d) => {
    const k = d.kind === "sensor" ? "Sensor" : "Aktuator";
    return `<option value="${d.id}">${escapeHtml(d.name)} — ${k}</option>`;
  }).join("");

  el.selectBoard.addEventListener("change", updateWiring);
  el.selectDevice.addEventListener("change", updateWiring);
  el.btnUseExample.addEventListener("click", () => {
    el.selectBoard.value = "esp32";
    el.selectDevice.value = "dht11";
    updateWiring();
  });
}

/**
 * Update tampilan wiring berdasarkan pilihan board & device
 */
function updateWiring() {
  const boardId = el.selectBoard.value;
  const deviceId = el.selectDevice.value;

  const board = BOARDS.find((b) => b.id === boardId);
  const dev = DEVICES.find((d) => d.id === deviceId);
  const key = `${boardId}:${deviceId}`;
  const map = WIRING_MAP[key] || null;

  el.wiringTitle.textContent = board && dev 
    ? `${board.name} + ${dev.name}` 
    : "Pilih kombinasi untuk melihat wiring";
  el.wiringSubtitle.textContent = "Contoh mapping standar — verifikasi dengan datasheet!";

  el.diagBoard.textContent = board?.name || "Board";
  el.diagDevice.textContent = dev?.name || "Device";

  if (!map) {
    el.wiringTable.innerHTML = "";
    el.wiringEmpty.hidden = false;
    el.diagBoardPins.innerHTML = "";
    el.diagDevicePins.innerHTML = "";
    el.diagLines.innerHTML = "";
    return;
  }

  el.wiringEmpty.hidden = true;

  // Render tabel koneksi
  el.wiringTable.innerHTML = map
    .map((row) => {
      return `
        <tr>
          <td><strong>${escapeHtml(row.devicePin)}</strong></td>
          <td><strong>${escapeHtml(row.boardPin)}</strong></td>
          <td class="muted">${escapeHtml(row.note || "—")}</td>
        </tr>
      `;
    })
    .join("");

  // Render diagram visual
  el.diagDevicePins.innerHTML = map
    .map((r) => `<div class="diag-pin">${escapeHtml(r.devicePin)} <span>→</span></div>`)
    .join("");
  el.diagBoardPins.innerHTML = map.map((r) => `<div class="diag-pin">${escapeHtml(r.boardPin)} <span>✓</span></div>`).join("");
  el.diagLines.innerHTML = map.map(() => `<div class="line"></div>`).join("");
}

// ============ MODAL ============

/**
 * Buka modal dialog
 */
function openModal({ title, subtitle = "", bodyHtml = "", footerButtons = [] }) {
  el.modalTitle.textContent = title;
  el.modalSubtitle.textContent = subtitle;
  el.modalBody.innerHTML = bodyHtml;
  el.modalFoot.innerHTML = "";

  footerButtons.forEach((b) => {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = b.className || "btn btn--ghost";
    btn.textContent = b.label || "OK";
    btn.addEventListener("click", b.onClick || closeModal);
    el.modalFoot.appendChild(btn);
  });

  el.modal.classList.add("is-open");
  el.modal.setAttribute("aria-hidden", "false");
  document.body.style.overflow = "hidden";
  
  // Focus ke close button untuk accessibility
  const closeBtn = $(".modal__close");
  closeBtn?.focus();
}

/**
 * Tutup modal dialog
 */
function closeModal() {
  el.modal.classList.remove("is-open");
  el.modal.setAttribute("aria-hidden", "true");
  document.body.style.overflow = "";
}

/**
 * Event listener untuk modal (close button & overlay click)
 */
function initModalEvents() {
  el.modal.addEventListener("click", (e) => {
    if (e.target && e.target.getAttribute?.("data-close") === "true") {
      closeModal();
    }
  });

  window.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && el.modal.classList.contains("is-open")) {
      closeModal();
    }
  });
}

// ============ NAVIGATION ============

/**
 * Initialize mobile nav toggle & active link highlight
 */
function initNav() {
  // Toggle menu
  el.navToggle.addEventListener("click", () => {
    const isOpen = el.nav.classList.toggle("is-open");
    el.navToggle.setAttribute("aria-expanded", String(isOpen));
  });

  // Close menu after clicking link (mobile UX)
  el.navLinks.forEach((a) => {
    a.addEventListener("click", () => {
      el.nav.classList.remove("is-open");
      el.navToggle.setAttribute("aria-expanded", "false");
    });
  });

  // Highlight active link based on visible section
  const sections = $all("[data-section]");
  const observer = new IntersectionObserver(
    (entries) => {
      const visible = entries
        .filter((x) => x.isIntersecting)
        .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
      if (!visible) return;
      
      const id = visible.target.id;
      el.navLinks.forEach((link) => {
        link.classList.toggle("is-active", link.getAttribute("data-route") === id);
      });
    },
    { threshold: [0.2, 0.35, 0.55] }
  );

  sections.forEach((s) => observer.observe(s));
}

// ============ DEVICE FILTER & SEARCH ============

/**
 * Initialize device search & filter
 */
function initDeviceFilters() {
  el.deviceSearch.addEventListener("input", (e) => {
    state.deviceQuery = e.target.value || "";
    renderDeviceCards();
  });

  el.filterChips.forEach((btn) => {
    btn.addEventListener("click", () => {
      el.filterChips.forEach((b) => b.classList.remove("is-active"));
      btn.classList.add("is-active");
      state.deviceFilter = btn.getAttribute("data-filter") || "all";
      renderDeviceCards();
    });
  });
}

// ============ INITIALIZATION ============

/**
 * Main init function
 */
function init() {
  console.log("🚀 MicroLab Interactive initializing...");
  
  initNav();
  initModalEvents();

  renderBoardCards();
  renderDeviceCards();
  initDeviceFilters();

  renderWiringSelects();

  // Default: show ESP32 + DHT11 example
  el.selectBoard.value = "esp32";
  el.selectDevice.value = "dht11";
  updateWiring();

  // Default: select Arduino Uno board
  selectBoard("uno");

  console.log("✅ MicroLab Interactive ready!");
}

// Wait for DOM to load
document.addEventListener("DOMContentLoaded", init);
