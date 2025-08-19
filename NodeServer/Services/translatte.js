const translatte = require("translatte");
const NodeCache = require("node-cache");

class TranslatteService {
  constructor() {
    this.cache = new NodeCache({ stdTTL: 60 * 60 * 24 });
    this.enabled = process.env.TRANSLATTE_ENABLED === "true" || true;
  }

  async translateText(text, targetLang, sourceLang = "en") {
    if (!this.enabled) return text;
    if (!text || targetLang === sourceLang) return text;

    const key = `tr_${sourceLang}_${targetLang}_${text}`;
    const cached = this.cache.get(key);
    if (cached) return cached;

    try {
      const res = await translatte(text, { from: sourceLang, to: targetLang });
      const translated = res && res.text ? res.text : text;
      this.cache.set(key, translated);
      // Logging for debug
      console.log(`[Translatte] input: "${text}", output: "${translated}"`);
      return translated;
    } catch (err) {
      console.warn("Translatte error:", err.message);
      throw err;
    }
  }

  async translateBatch(texts, targetLang, sourceLang = "en") {
    const results = [];
    for (const t of texts) {
      results.push(await this.translateText(t, targetLang, sourceLang));
    }
    return results;
  }
}

module.exports = new TranslatteService();
