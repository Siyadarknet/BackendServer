const libre = require("./libreTranslate");
const mymem = require("./myMemory");
const translatte = require("./translatte");

class UnifiedTranslationService {
  constructor() {
    this.backends = [
      { name: "LibreTranslate", svc: libre, enabled: true },
      { name: "MyMemory", svc: mymem, enabled: true },
      { name: "Translatte", svc: translatte, enabled: true },
    ];
  }

  async translateText(text, targetLang, sourceLang = "en") {
    if (!text || targetLang === sourceLang) return text;
    for (const b of this.backends) {
      if (!b.enabled) continue;
      try {
        const out = await b.svc.translateText(text, targetLang, sourceLang);
        console.log(`[Unified] ${b.name}: in="${text}" out="${out}"`);
        if (typeof out === "string" && out.trim() && out !== text) {
          return out;
        }
      } catch (err) {
        console.warn(`[Unified] ${b.name} failed: ${err.message}`);
      }
    }
    // If all fail, fallback to original
    return text;
  }

  async translateBatch(texts, targetLang, sourceLang = "en") {
    const promises = texts.map((t) =>
      this.translateText(t, targetLang, sourceLang)
    );
    return Promise.all(promises);
  }

  async translateObject(
    obj,
    fields = [],
    targetLang = "en",
    sourceLang = "en"
  ) {
    if (!obj || !fields || targetLang === sourceLang) return obj;
    const out = { ...obj };
    const promises = fields.map(async (f) => {
      if (!Object.prototype.hasOwnProperty.call(obj, f)) return;
      const val = obj[f];
      if (typeof val === "string") {
        out[f] = await this.translateText(val, targetLang, sourceLang);
      } else if (Array.isArray(val)) {
        out[f] = await this.translateBatch(val, targetLang, sourceLang);
      }
    });
    await Promise.all(promises);
    return out;
  }

  async translateObjectArray(
    arr,
    fields = [],
    targetLang = "en",
    sourceLang = "en"
  ) {
    if (!Array.isArray(arr)) return arr;
    const promises = arr.map((item) =>
      this.translateObject(item, fields, targetLang, sourceLang)
    );
    return Promise.all(promises);
  }
}

module.exports = new UnifiedTranslationService();
