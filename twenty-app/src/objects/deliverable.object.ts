import { FieldType, defineObject } from 'twenty-sdk/define';

export default defineObject({
  nameSingular: 'deliverable',
  namePlural: 'deliverables',
  labelSingular: 'Deliverable',
  labelPlural: 'Deliverables',
  description: 'Creator content submission, revision, and final asset tracking.',
  fields: [
    { name: 'creator', label: 'Creator', type: FieldType.RELATION, targetObject: 'creator' },
    { name: 'campaign', label: 'Campaign', type: FieldType.RELATION, targetObject: 'campaign' },
    { name: 'brief', label: 'Brief', type: FieldType.RELATION, targetObject: 'brief' },
    { name: 'deliverableType', label: 'Deliverable Type', type: FieldType.TEXT },
    { name: 'submissionLink', label: 'Submission Link', type: FieldType.LINK },
    { name: 'submittedAt', label: 'Submitted At', type: FieldType.DATE_TIME },
    { name: 'reviewStatus', label: 'Review Status', type: FieldType.SELECT, options: ['Submitted', 'Needs Revision', 'Approved', 'Rejected', 'Ready for Ad Test'] },
    { name: 'reviewer', label: 'Reviewer', type: FieldType.TEXT },
    { name: 'revisionNotes', label: 'Revision Notes', type: FieldType.TEXT },
    { name: 'approvedAssetLink', label: 'Approved Asset Link', type: FieldType.LINK },
    { name: 'readyForAdTest', label: 'Ready For Ad Test', type: FieldType.BOOLEAN },
    { name: 'finalDecision', label: 'Final Decision', type: FieldType.TEXT },
  ],
});

