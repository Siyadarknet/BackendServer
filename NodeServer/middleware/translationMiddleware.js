const unified = require("../Services/unifiedTranslation");
const mongoose = require("mongoose");

//getting target language to send translated data/response
function getTargetLang(req) {
  const q = req.query.lang || (req.body && req.body.lang);
  if (q) return q.split(",")[0];
  const header = req.headers["accept-language"];
  if (header) return header.split(",")[0];
  return process.env.DEFAULT_LANG || "en";
}

// Helper to convert Mongoose doc(s) to plain object(s)
function toPlainObject(item) {
  if (Array.isArray(item)) {
    return item.map((subItem) => {
      if (subItem instanceof mongoose.Document) {
        return subItem.toObject({ getters: true, virtuals: true });
      }
      return { ...subItem }; // Shallow copy for plain objects
    });
  } else if (item instanceof mongoose.Document) {
    return item.toObject({ getters: true, virtuals: true });
  }
  return { ...item }; // Shallow copy for plain objects
}

/**
 * fieldsConfig: { single: ['title','content'], array: ['title','content'], data: ['title','content'] }
 * - If the response is an array, use array fields
 * - If response is object with data: use data fields
 * - If response is single object, use single fields
 */
const TranslationMiddleware = (fieldsConfig = {}) => {
  return async (req, res, next) => {
    const origJson = res.json.bind(res);

    res.json = async function (payload) {
      try {
        const targetLang = getTargetLang(req);
        const srcLang = req.headers["x-source-lang"] || "en";
        if (!targetLang || targetLang === srcLang) {
          return origJson(payload);
        }

        let translated = payload;

        // If payload has a typical envelope { data: [...] } pattern
        if (payload && typeof payload === "object") {
          // arrays at root
          if (
            Array.isArray(payload) &&
            fieldsConfig.array &&
            fieldsConfig.array.length
          ) {
            const plainPayload = toPlainObject(payload); // Convert to plain objects first
            translated = await unified.translateObjectArray(
              plainPayload,
              fieldsConfig.array,
              targetLang,
              srcLang
            );
          }
          // standard envelope { data: [...] }
          else if (
            payload.data &&
            Array.isArray(payload.data) &&
            fieldsConfig.data &&
            fieldsConfig.data.length
          ) {
            const plainData = toPlainObject(payload.data); // Convert to plain objects first
            payload.data = await unified.translateObjectArray(
              plainData,
              fieldsConfig.data,
              targetLang,
              srcLang
            );
            translated = payload;
          }
          // single object
          else if (
            !Array.isArray(payload) &&
            fieldsConfig.single &&
            fieldsConfig.single.length
          ) {
            const plainPayload = toPlainObject(payload); // Convert to plain object first
            translated = await unified.translateObject(
              plainPayload,
              fieldsConfig.single,
              targetLang,
              srcLang
            );
          }
        }

        return origJson(translated);
      } catch (err) {
        console.error("Translation middleware error:", err.message);
        return origJson(payload);
      }
    };

    next();
  };
};

module.exports = { TranslationMiddleware };
