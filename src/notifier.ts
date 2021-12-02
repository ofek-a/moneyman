import { Telegraf } from "telegraf";
import { Message } from "telegraf/typings/core/types/typegram";
import { TELEGRAM_API_KEY, TELEGRAM_CHAT_ID } from "./config.js";
import type { AccountScrapeResult, SaveStats } from "./types.js";

const bot = new Telegraf(TELEGRAM_API_KEY);

export async function send(message: string) {
  console.info(`[send] ${message}`);
  return await bot.telegram.sendMessage(TELEGRAM_CHAT_ID, message);
}

export async function deleteMessage(message: Message.TextMessage) {
  await bot.telegram.deleteMessage(TELEGRAM_CHAT_ID, message.message_id);
}

export async function editMessage(message: number, newText: string) {
  await bot.telegram.editMessageText(
    TELEGRAM_CHAT_ID,
    message,
    undefined,
    newText
  );
}

export async function sendError(message: any) {
  return await send("❌ " + String(message));
}

export function getSummaryMessage(
  results: Array<AccountScrapeResult>,
  stats: Array<SaveStats>
) {
  const accountsSummary = results.flatMap(({ result, companyId }) => {
    if (!result.success) {
      return `\t❌ [${companyId}] ${result.errorType}\n\t${result.errorMessage}`;
    }
    return result.accounts.map(
      (account) =>
        `\t✔️ [${companyId}] ${account.accountNumber}: ${account.txns.length}`
    );
  });

  const saveSummary = stats.map((s) => {
    const skipped = s.existing + s.pending;
    return `\t📝 ${s.name}
\t\t${s.added} added, ${skipped} skipped
\t\t(${s.existing} existing,  ${s.pending} pending)`;
  });

  return `
Accounts updated:
${accountsSummary.join("\n") || "\t😶 None"}
Saved to:
${saveSummary.join("\n") || "\t😶 None"}
  `.trim();
}