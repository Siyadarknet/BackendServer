// services/myMemoryService.js

const axios = require("axios");
const NodeCache = require("node-cache");

class MyMemoryService {
  constructor(email = null) {
    this.baseUrl = "https://api.mymemory.translated.net";
    this.email = process.env.MYMEMORY_EMAIL || email;
    this.cache = new NodeCache({ stdTTL: 60 * 60 * 24 });
    this.enabled = process.env.MYMEMORY_ENABLED === "true" || true;
    this.dailyCharCount = 0;
    this.maxDailyChars = this.email ? 50000 : 10000;
  }

  async translateText(text, targetLang, sourceLang = "en") {
    if (!this.enabled) return text;
    if (!text || targetLang === sourceLang) return text;
    if (this.dailyCharCount + text.length > this.maxDailyChars) {
      const msg = "MyMemory daily limit reached";
      console.warn(msg);
      throw new Error(msg); // THROW instead of return text
    }

    const key = `mymem_${sourceLang}_${targetLang}_${text}`;
    const cached = this.cache.get(key);
    if (cached) return cached;

    try {
      const params = {
        q: text,
        langpair: `${sourceLang}|${targetLang}`,
        mt: 1,
      };
      if (this.email) params.de = this.email;
      const resp = await axios.get(`${this.baseUrl}/get`, {
        params,
        timeout: 10000,
      });

      // THROW on 429 or API-side rate limiting
      if (resp.data && resp.data.responseStatus === 429) {
        const msg = "MyMemory API rate limit (429)";
        console.warn(msg);
        throw new Error(msg); // THROW error instead of returning text
      }

      if (
        resp.data &&
        resp.data.responseStatus === 200 &&
        resp.data.responseData
      ) {
        const translated = resp.data.responseData.translatedText;
        this.cache.set(key, translated);
        this.dailyCharCount += text.length;
        return translated;
      }
      throw new Error("MyMemory API did not translate");
    } catch (err) {
      console.warn("MyMemory error:", err.message);
      throw err; // Throw so fallback is used
    }
  }

  async translateBatch(texts, targetLang, sourceLang = "en") {
    const results = [];
    for (const t of texts) {
      results.push(await this.translateText(t, targetLang, sourceLang));
      await new Promise((r) => setTimeout(r, 80));
    }
    return results;
  }

  resetDailyCounter() {
    this.dailyCharCount = 0;
  }
}

module.exports = new MyMemoryService();
