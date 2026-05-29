import { FieldType, defineObject } from 'twenty-sdk/define';

export default defineObject({
  nameSingular: 'creatorProposal',
  namePlural: 'creatorProposals',
  labelSingular: 'Creator Proposal',
  labelPlural: 'Creator Proposals',
  description: 'Campaign-specific proposal created when a teammate submits a creator.',
  fields: [
    { name: 'creator', label: 'Creator', type: FieldType.RELATION, targetObject: 'creator' },
    { name: 'campaign', label: 'Campaign', type: FieldType.RELATION, targetObject: 'campaign' },
    { name: 'proposedBy', label: 'Proposed By', type: FieldType.TEXT },
    { name: 'proposedByExternalId', label: 'Proposed By External ID', type: FieldType.TEXT },
    { name: 'reason', label: 'Reason', type: FieldType.TEXT },
    { name: 'source', label: 'Source', type: FieldType.SELECT, options: ['Telegram', 'Manual', 'Import', 'Other'] },
    { name: 'dateProposed', label: 'Date Proposed', type: FieldType.DATE_TIME },
    { name: 'aiSummary', label: 'AI Summary', type: FieldType.TEXT },
    { name: 'decisionStatus', label: 'Decision Status', type: FieldType.SELECT, options: ['Proposed', 'Under Review', 'Approved to Contact', 'Rejected', 'Duplicate', 'Needs More Info'] },
    { name: 'decisionReason', label: 'Decision Reason', type: FieldType.TEXT },
    { name: 'priority', label: 'Priority', type: FieldType.SELECT, options: ['Low', 'Medium', 'High'] },
  ],
});

