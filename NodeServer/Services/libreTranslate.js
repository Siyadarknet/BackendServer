const axios = require("axios");
const NodeCache = require("node-cache");

class LibreTranslateService {
  constructor(baseUrl) {
    this.baseUrl =
      baseUrl || process.env.LIBRETRANSLATE_URL || "http://localhost:5000";
    this.cache = new NodeCache({ stdTTL: 60 * 60 * 24 });
    this.enabled = process.env.LIBRETRANSLATE_ENABLED === "true";
  }

  async translateText(text, targetLang, sourceLang = "en") {
    if (!this.enabled) return text;
    if (!text || targetLang === sourceLang) return text;

    const key = `libre_${sourceLang}_${targetLang}_${text}`;
    const cached = this.cache.get(key);
    if (cached) return cached;

    try {
      const resp = await axios.post(
        `${this.baseUrl}/translate`,
        {
          q: text,
          source: sourceLang,
          target: targetLang,
          format: "text",
        },
        { timeout: 10000 }
      );
      const translated =
        resp.data && (resp.data.translatedText || resp.data.translation);
      if (translated && translated !== text) {
        this.cache.set(key, translated);
        return translated;
      }
      // If not translated, throw error
      throw new Error(`LibreTranslate did not translate: "${text}"`);
    } catch (err) {
      // Only throw if a real error or 400
      if (err.response && err.response.status === 400) {
        console.warn("LibreTranslate HTTP 400, will fallback:", err.message);
        throw err;
      }
      console.warn("LibreTranslate error:", err.message);
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

  async getLanguages() {
    try {
      const resp = await axios.get(`${this.baseUrl}/languages`);
      return resp.data;
    } catch (err) {
      console.warn("LibreTranslate getLanguages error:", err.message);
      return [];
    }
  }
}

module.exports = new LibreTranslateService();
