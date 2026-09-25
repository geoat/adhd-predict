import "server-only";

import rawQuestionBank from "@/data/adhd-questions.json";
import { adhdQuestionBankSchema } from "@/lib/schemas/adhd-questions";

// Parse once when this server module is loaded; invalid data fails fast.
export const adhdQuestionBank = adhdQuestionBankSchema.parse(rawQuestionBank);
