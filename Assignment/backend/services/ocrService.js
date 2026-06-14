import Tesseract from "tesseract.js";

/**
 * Clean but preserve structure
 */
function cleanText(text) {
  return text
    .replace(/[^\w\s.,:RM]/g, " ") // keep useful symbols
    .replace(/\n{2,}/g, "\n")      // reduce empty lines
    .replace(/[ \t]+/g, " ")       // normalize spaces
    .trim();
}

/**
 * Extract amount from TNG screenshot safely
 */
function extractAmount(text) {
  const matches = text.match(/(\d+\.\d{2})/g);
  if (!matches) return null;

  return Math.max(...matches.map(Number)); // pick largest amount
}

/**
 * Extract name near "paid to" or "receiver"
 */
function extractName(text) {
  const lines = text.split("\n");

  for (const line of lines) {
    if (/paid\s*to|receiver|to:/i.test(line)) {
      return line.replace(/paid\s*to|receiver|to:/i, "").trim();
    }
  }

  return null;
}

export async function extractPaymentText(imagePath) {
  try {
    const result = await Tesseract.recognize(imagePath, "eng", {
      logger: m => console.log(m)
    });

    const rawText = result.data.text;
    const text = cleanText(rawText);

    const amount = extractAmount(text);
    const name = extractName(text);

    return {
      success: true,
      rawText,
      text,
      parsed: {
        amount,
        name
      }
    };

  } catch (err) {
    return {
      success: false,
      error: err.message
    };
  }
}