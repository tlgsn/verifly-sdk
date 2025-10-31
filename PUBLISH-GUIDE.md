# NPM Publishing Guide

Bu rehber, Verifly SDK'yı NPM'e nasıl publish edeceğinizi gösterir.

## 📋 Gereksinimler

1. ✅ NPM hesabı (https://www.npmjs.com)
2. ✅ NPM CLI yüklü (`npm -v` ile kontrol edin)
3. ✅ Package adı müsait (https://www.npmjs.com/package/verifly-sdk kontrol edin)

---

## 🚀 Publish Adımları

### 1. NPM'e Login Olun

```bash
npm login
```

Kullanıcı adı, şifre ve email girin.

### 2. Package Bilgilerini Kontrol Edin

```bash
cd packages/verifly-sdk
```

`package.json` dosyasını kontrol edin:
- ✅ `name`: "verifly-sdk" (veya başka bir isim)
- ✅ `version`: "1.0.0"
- ✅ `description`: Açıklama ekli
- ✅ `main`: "src/index.js"
- ✅ `repository`: GitHub URL'iniz
- ✅ `keywords`: Ekli
- ✅ `license`: "MIT"

### 3. Dependencies Yükleyin

```bash
npm install
```

### 4. Test Edin (Opsiyonel)

Lokal olarak test etmek için:

```bash
# Global olarak link edin
npm link

# Başka bir projede test edin
cd /path/to/test-project
npm link verifly-sdk

# Test kodunuzu çalıştırın
node test.js
```

### 5. Dry Run (Test Publish)

Gerçek publish etmeden önce ne gönderileceğini görün:

```bash
npm publish --dry-run
```

Bu komut şunları gösterecek:
- Hangi dosyaların publish edileceği
- Package boyutu
- Version bilgisi

### 6. Publish!

```bash
npm publish
```

İlk kez publish ediyorsanız ve `@yourorg/verifly-sdk` gibi scoped bir paket kullanıyorsanız:

```bash
npm publish --access public
```

---

## 🔄 Yeni Version Yayınlama

### Version Güncelleme

```bash
# Patch version (1.0.0 → 1.0.1)
npm version patch

# Minor version (1.0.0 → 1.1.0)
npm version minor

# Major version (1.0.0 → 2.0.0)
npm version major
```

Bu komut:
1. `package.json` version'ı günceller
2. Git commit oluşturur
3. Git tag oluşturur

### Publish

```bash
npm publish
```

### Git Push (Tag'lerle birlikte)

```bash
git push origin main --tags
```

---

## 📦 Package.json Önerileri

### Scoped Package

Eğer özel bir organizasyon adı kullanmak isterseniz:

```json
{
  "name": "@verifly/sdk",
  ...
}
```

Publish için:
```bash
npm publish --access public
```

### Files Field

Hangi dosyaların publish edileceğini belirtin:

```json
{
  "files": [
    "src/",
    "types/",
    "README.md",
    "LICENSE"
  ]
}
```

### Scripts

Yararlı scriptler ekleyin:

```json
{
  "scripts": {
    "prepublishOnly": "echo 'Publishing...'",
    "postpublish": "echo 'Published successfully!'"
  }
}
```

---

## 🧪 Test Publish (Test Registry)

NPM'e publish etmeden önce [Verdaccio](https://verdaccio.org/) gibi lokal bir registry kullanabilirsiniz.

### Verdaccio Kurulumu

```bash
npm install -g verdaccio
verdaccio
```

### Verdaccio'ya Publish

```bash
npm adduser --registry http://localhost:4873
npm publish --registry http://localhost:4873
```

---

## 📊 Post-Publish Checklist

Publish edildikten sonra kontrol edin:

1. ✅ NPM sayfası: https://www.npmjs.com/package/verifly-sdk
2. ✅ README düzgün görünüyor mu?
3. ✅ Version doğru mu?
4. ✅ Dependencies yüklü mü?
5. ✅ Test projesinde çalışıyor mu?

### Test Kurulumu

```bash
mkdir test-verifly-sdk
cd test-verifly-sdk
npm init -y
npm install verifly-sdk
```

Test dosyası (`test.js`):
```javascript
const Verifly = require('verifly-sdk');

const verifly = new Verifly('test-api-key', {
  debug: true
});

console.log('✅ Verifly SDK loaded successfully!');
console.log('Version:', require('verifly-sdk/package.json').version);
```

```bash
node test.js
```

---

## 🔒 Güvenlik

### .npmignore

Hassas dosyaları `.npmignore` dosyasına ekleyin:
- `.env` files
- Test files
- Development configs

### 2FA (İki Faktörlü Doğrulama)

NPM hesabınızda 2FA açmanız önerilir:

```bash
npm profile enable-2fa auth-and-writes
```

---

## 📝 Package Adı Değiştirme

Eğer `verifly-sdk` adı alınmışsa:

1. `package.json` içinde `name` field'ını değiştirin:
   ```json
   {
     "name": "verifly-client",
     "name": "@yourusername/verifly",
     "name": "verifly-node-sdk"
   }
   ```

2. README ve diğer dosyalardaki referansları güncelleyin

3. Publish edin:
   ```bash
   npm publish
   ```

---

## 🎯 Best Practices

### Semantic Versioning

- **MAJOR** (1.x.x): Breaking changes
- **MINOR** (x.1.x): New features (backward compatible)
- **PATCH** (x.x.1): Bug fixes

### Changelog

`CHANGELOG.md` dosyası oluşturup her version'da ne değiştiğini yazın:

```markdown
# Changelog

## [1.0.1] - 2025-01-14
### Fixed
- Fixed webhook signature verification
- Updated error messages

## [1.0.0] - 2025-01-14
### Added
- Initial release
- Verification API
- Webhook utilities
```

### GitHub Release

NPM publish'ten sonra GitHub'da da release oluşturun:

```bash
# Tag oluştur
git tag -a v1.0.0 -m "Version 1.0.0"
git push origin v1.0.0

# GitHub'da Releases → Create new release
```

---

## 📞 Yardım

Sorun yaşarsanız:

1. NPM Docs: https://docs.npmjs.com/
2. NPM Support: https://www.npmjs.com/support
3. Verifly Support: support@verifly.net

---

## ✅ Quick Reference

```bash
# Login
npm login

# Test (Dry run)
npm publish --dry-run

# Publish
npm publish

# Update patch version (1.0.0 → 1.0.1)
npm version patch

# Update minor version (1.0.0 → 1.1.0)
npm version minor

# Unpublish (24 saat içinde)
npm unpublish verifly-sdk@1.0.0

# Deprecate
npm deprecate verifly-sdk@1.0.0 "Use version 1.0.1"
```

---

**İyi şanslar! 🚀**
