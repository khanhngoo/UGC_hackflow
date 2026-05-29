/** Days after last contact to schedule follow-up when replyStatus is NO_REPLY. */
export const FOLLOW_UP_DAYS_NO_REPLY = 3;

export function computeNextFollowUpAt(lastContactedAt: string | Date): string {
  const anchor = typeof lastContactedAt === 'string' ? new Date(lastContactedAt) : lastContactedAt;
  const next = new Date(anchor.getTime());
  next.setUTCDate(next.getUTCDate() + FOLLOW_UP_DAYS_NO_REPLY);
  return next.toISOString();
}

export function shouldApplyNoReplyFollowUp(replyStatus: string | null | undefined): boolean {
  return replyStatus === 'NO_REPLY' || replyStatus == null;
}
