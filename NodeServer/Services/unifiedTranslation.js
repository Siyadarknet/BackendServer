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
    return text; // fallback
  }

  async translateBatch(texts, targetLang, sourceLang = "en") {
    const promises = texts.map((t) =>
      this.translateText(t, targetLang, sourceLang)
    );
    return Promise.all(promises);
  }

  // --- helper: apply translation on nested paths like "options.option"
  async applyField(obj, path, targetLang, sourceLang) {
    const parts = path.split(".");
    let current = obj;

    for (let i = 0; i < parts.length; i++) {
      const key = parts[i];

      if (Array.isArray(current)) {
        // recurse into array
        await Promise.all(
          current.map((item) =>
            this.applyField(
              item,
              parts.slice(i).join("."),
              targetLang,
              sourceLang
            )
          )
        );
        return;
      }

      if (!current || !Object.prototype.hasOwnProperty.call(current, key)) {
        return; // key not found
      }

      if (i === parts.length - 1) {
        // last key -> translate
        if (typeof current[key] === "string") {
          current[key] = await this.translateText(
            current[key],
            targetLang,
            sourceLang
          );
        } else if (Array.isArray(current[key])) {
          current[key] = await this.translateBatch(
            current[key],
            targetLang,
            sourceLang
          );
        }
      } else {
        current = current[key];
      }
    }
  }

  async translateObject(
    obj,
    fields = [],
    targetLang = "en",
    sourceLang = "en"
  ) {
    if (!obj || !fields || targetLang === sourceLang) return obj;
    const out = { ...obj };
    await Promise.all(
      fields.map((f) => this.applyField(out, f, targetLang, sourceLang))
    );
    return out;
  }

  async translateObjectArray(
    arr,
    fields = [],
    targetLang = "en",
    sourceLang = "en"
  ) {
    if (!Array.isArray(arr)) return arr;
    return Promise.all(
      arr.map((item) =>
        this.translateObject(item, fields, targetLang, sourceLang)
      )
    );
  }
}

module.exports = new UnifiedTranslationService();
