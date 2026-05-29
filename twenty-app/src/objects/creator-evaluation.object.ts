import { FieldType, defineObject } from 'twenty-sdk/define';

export default defineObject({
  nameSingular: 'creatorEvaluation',
  namePlural: 'creatorEvaluations',
  labelSingular: 'Creator Evaluation',
  labelPlural: 'Creator Evaluations',
  description: 'Standardized creator review scorecard and vote.',
  fields: [
    { name: 'proposal', label: 'Proposal', type: FieldType.RELATION, targetObject: 'creatorProposal' },
    { name: 'reviewer', label: 'Reviewer', type: FieldType.TEXT },
    { name: 'audienceFitScore', label: 'Audience Fit Score', type: FieldType.NUMBER },
    { name: 'brandFitScore', label: 'Brand Fit Score', type: FieldType.NUMBER },
    { name: 'contentQualityScore', label: 'Content Quality Score', type: FieldType.NUMBER },
    { name: 'authenticityScore', label: 'Authenticity Score', type: FieldType.NUMBER },
    { name: 'productExplanationScore', label: 'Product Explanation Score', type: FieldType.NUMBER },
    { name: 'engagementQualityScore', label: 'Engagement Quality Score', type: FieldType.NUMBER },
    { name: 'vote', label: 'Vote', type: FieldType.SELECT, options: ['Approve', 'Reject', 'Needs More Info'] },
    { name: 'concerns', label: 'Concerns', type: FieldType.TEXT },
    { name: 'notes', label: 'Notes', type: FieldType.TEXT },
  ],
});

