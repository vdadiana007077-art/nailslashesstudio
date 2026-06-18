const fs = require('fs');
const path = require('path');

const targetPath = path.join(__dirname, 'src/components/layout/AuthModal.tsx');
let code = fs.readFileSync(targetPath, 'utf8');

// 1. Add import
if (!code.includes("useTranslations")) {
  code = code.replace("import Link from 'next/link';", "import Link from 'next/link';\nimport { useTranslations } from 'next-intl';");
}

// 2. Add hook
if (!code.includes("const t = useTranslations('Auth');")) {
  code = code.replace("const [showPasswordConfirm, setShowPasswordConfirm] = useState(false);", "const [showPasswordConfirm, setShowPasswordConfirm] = useState(false);\n  const t = useTranslations('Auth');");
}

// 3. Replace text strings
const replacements = [
  // Subtitles
  { from: "'Hesabınıza giriş yapın'", to: "t('loginSubtitle')" },
  { from: "'Yeni hesap oluşturun'", to: "t('registerSubtitle')" },
  { from: "'Şifrenizi sıfırlayın'", to: "t('forgotSubtitle')" },
  
  // OAuth
  { from: ">\\n              Google ile Devam Et", to: ">\\n              {t('continueWithGoogle')}" },
  { from: "veya e-posta ile", to: "{t('orWithEmail')}" },
  
  // Tabs
  { from: ">\\n              Giriş Yap", to: ">\\n              {t('loginTab')}" },
  { from: ">\\n              Üye Ol", to: ">\\n              {t('registerTab')}" },
  
  // Error messages in functions
  { from: "'Şifre en az 6 karakter olmalıdır.'", to: "t('errPasswordLength')" },
  { from: "'Şifreler uyuşmuyor, lütfen kontrol ediniz.'", to: "t('errPasswordMismatch')" },
  { from: "'KVKK Aydınlatma Metnini onaylamanız gerekmektedir.'", to: "t('errKvkkRequired')" },
  { from: "'Kayıt başarılı! Oturum açılıyor...'", to: "t('msgRegisterSuccess')" },
  { from: "'Bir hata oluştu.'", to: "t('msgDefaultError')" },
  { from: "'Giriş başarılı! Yönlendiriliyorsunuz...'", to: "t('msgLoginSuccess')" },
  { from: "\\`Şifre sıfırlama bağlantısı ${email} adresine gönderildi.\\`", to: "t('msgResetSent', { email })" },
  
  // Labels and placeholders
  { from: ">E-Posta Adresi<", to: ">{t('emailLabel')}<" },
  { from: "placeholder=\"ornek@mail.com\"", to: "placeholder={t('emailPlaceholder')}" },
  { from: ">Şifre<", to: ">{t('passwordLabel')}<" },
  { from: ">Şifremi Unuttum<", to: ">{t('forgotPasswordLink')}<" },
  { from: "> GİRİŞ YAPILIYOR...<", to: "> {t('loginLoading')}<" },
  { from: "GİRİŞ YAP <", to: "{t('loginButton')} <" },
  
  { from: ">Ad Soyad *<", to: ">{t('fullNameLabel')}<" },
  { from: "placeholder=\"Adınız Soyadınız\"", to: "placeholder={t('fullNamePlaceholder')}" },
  { from: ">E-Posta Adresi *<", to: ">{t('emailLabel')} *<" },
  { from: ">Telefon<", to: ">{t('phoneLabel')}<" },
  { from: "placeholder=\"+90 5xx xxx xx xx\"", to: "placeholder={t('phonePlaceholder')}" },
  { from: ">Şifre *<", to: ">{t('passwordRequired')}<" },
  { from: "placeholder=\"Min. 6 karakter\"", to: "placeholder={t('passwordMin')}" },
  { from: ">Tekrar *<", to: ">{t('passwordConfirm')}<" },
  { from: "placeholder=\"Şifre tekrar\"", to: "placeholder={t('passwordConfirmPlaceholder')}" },
  
  { from: ">KVKK Aydınlatma Metnini<", to: ">{t('kvkkLink')}<" },
  { from: " okudum ve onaylıyorum. <", to: "{t('kvkkConsent')} <" },
  { from: ">Kampanyalardan, indirimlerden ve özel tekliflerden haberdar olmak istiyorum.<", to: ">{t('newsletterConsent')}<" },
  
  { from: "> KAYIT YAPILIYOR...<", to: "> {t('registerLoading')}<" },
  { from: "ÜYE OL <", to: "{t('registerButton')} <" },
  
  { from: ">Şifrenizi mi Unuttunuz?<", to: ">{t('forgotTitle')}<" },
  { from: ">E-posta adresinizi girin, şifre sıfırlama bağlantısı göndereceğiz.<", to: ">{t('forgotDesc')}<" },
  { from: ">E-Posta Adresiniz<", to: ">{t('emailLabelForgot')}<" },
  { from: ">\\n                  Geri Dön", to: ">\\n                  {t('goBack')}" },
  { from: ">\\n                  {loading ? 'GÖNDERİLİYOR...' : 'SIFIRLA'}", to: ">\\n                  {loading ? t('resetLoading') : t('resetButton')}" }
];

replacements.forEach(r => {
  code = code.replace(new RegExp(r.from, 'g'), r.to);
});

fs.writeFileSync(targetPath, code, 'utf8');
console.log('AuthModal updated.');
