// Bu betik, güncellenen dil algılama algoritmasının çeşitli telefon numaralarıyla doğru dilleri döndürdüğünü test eder.

function detectCustomerLanguage(phone?: string | null): string {
  if (!phone) return 'TR';
  const cleanPhone = phone.replace(/\D/g, '');
  if (cleanPhone.startsWith('90') || cleanPhone.startsWith('05') || cleanPhone.startsWith('5')) {
    return 'TR';
  }
  if (cleanPhone.startsWith('7') || cleanPhone.startsWith('380')) {
    return 'RU';
  }
  if (cleanPhone.startsWith('49')) {
    return 'DE';
  }
  return 'EN';
}

const testCases = [
  { phone: '+90 541 240 07 24', expected: 'TR' },
  { phone: '0541 240 07 24', expected: 'TR' },
  { phone: '5412400724', expected: 'TR' },
  { phone: '+5412400724', expected: 'TR' }, // Başta artı olan ve 90'sız yazılan
  { phone: '+7 999 123 4567', expected: 'RU' },
  { phone: '+49 170 123 4567', expected: 'DE' },
  { phone: '+1 555 123 4567', expected: 'EN' },
  { phone: null, expected: 'TR' },
  { phone: '', expected: 'TR' },
];

let failed = 0;
for (const tc of testCases) {
  const result = detectCustomerLanguage(tc.phone);
  if (result === tc.expected) {
    console.log(`PASS: ${tc.phone} -> ${result}`);
  } else {
    console.error(`FAIL: ${tc.phone} -> Expected ${tc.expected}, got ${result}`);
    failed++;
  }
}

if (failed === 0) {
  console.log('\nTüm dil algılama testleri BAŞARIYLA geçti!');
} else {
  console.error(`\n${failed} adet test BAŞARISIZ oldu.`);
  process.exit(1);
}
