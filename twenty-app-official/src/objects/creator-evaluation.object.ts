import { defineObject, FieldType, OnDeleteAction, RelationType } from 'twenty-sdk/define';

import { UGC_FIELD_IDS, UGC_OBJECT_IDS } from 'src/constants/ugc-universal-identifiers';

export default defineObject({
  universalIdentifier: UGC_OBJECT_IDS.evaluation,
  nameSingular: 'creatorEvaluation',
  namePlural: 'creatorEvaluations',
  labelSingular: 'Creator Evaluation',
  labelPlural: 'Creator Evaluations',
  description: 'Compact creator scorecard and review vote.',
  icon: 'IconChecklist',
  labelIdentifierFieldMetadataUniversalIdentifier: UGC_FIELD_IDS.evaluation.notes,
  fields: [
    {
      universalIdentifier: UGC_FIELD_IDS.evaluation.candidate,
      name: 'candidate',
      label: 'Candidate',
      type: FieldType.RELATION,
      icon: 'IconUserPlus',
      relationTargetObjectMetadataUniversalIdentifier: UGC_OBJECT_IDS.candidate,
      relationTargetFieldMetadataUniversalIdentifier: UGC_FIELD_IDS.candidate.evaluations,
      universalSettings: { relationType: RelationType.MANY_TO_ONE, onDelete: OnDeleteAction.CASCADE, joinColumnName: 'candidateId' },
    },
    { universalIdentifier: UGC_FIELD_IDS.evaluation.reviewer, name: 'reviewer', label: 'Reviewer', type: FieldType.TEXT, icon: 'IconUser' },
    { universalIdentifier: UGC_FIELD_IDS.evaluation.audienceFitScore, name: 'audienceFitScore', label: 'Audience Fit Score', type: FieldType.NUMBER, icon: 'IconUsersGroup' },
    { universalIdentifier: UGC_FIELD_IDS.evaluation.brandFitScore, name: 'brandFitScore', label: 'Brand Fit Score', type: FieldType.NUMBER, icon: 'IconSparkles' },
    { universalIdentifier: UGC_FIELD_IDS.evaluation.contentQualityScore, name: 'contentQualityScore', label: 'Content Quality Score', type: FieldType.NUMBER, icon: 'IconVideo' },
    {
      universalIdentifier: UGC_FIELD_IDS.evaluation.vote,
      name: 'vote',
      label: 'Vote',
      type: FieldType.SELECT,
      icon: 'IconThumbUp',
      options: [
        { value: 'APPROVE', label: 'Approve', position: 0, color: 'green' },
        { value: 'REJECT', label: 'Reject', position: 1, color: 'red' },
        { value: 'NEEDS_MORE_INFO', label: 'Needs More Info', position: 2, color: 'orange' },
      ],
    },
    { universalIdentifier: UGC_FIELD_IDS.evaluation.concerns, name: 'concerns', label: 'Concerns', type: FieldType.TEXT, icon: 'IconAlertTriangle' },
    { universalIdentifier: UGC_FIELD_IDS.evaluation.notes, name: 'notes', label: 'Notes', type: FieldType.TEXT, icon: 'IconNotes' },
  ],
});
