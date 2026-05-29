import { FieldType, defineObject } from 'twenty-sdk/define';

export default defineObject({
  nameSingular: 'brief',
  namePlural: 'briefs',
  labelSingular: 'Brief',
  labelPlural: 'Briefs',
  description: 'Campaign creative brief and creator instructions.',
  fields: [
    { name: 'campaign', label: 'Campaign', type: FieldType.RELATION, targetObject: 'campaign' },
    { name: 'productDescription', label: 'Product Description', type: FieldType.TEXT },
    { name: 'targetAudience', label: 'Target Audience', type: FieldType.TEXT },
    { name: 'keyMessage', label: 'Key Message', type: FieldType.TEXT },
    { name: 'creatorAngle', label: 'Creator Angle', type: FieldType.TEXT },
    { name: 'exampleHooks', label: 'Example Hooks', type: FieldType.TEXT },
    { name: 'doGuidelines', label: 'Do Guidelines', type: FieldType.TEXT },
    { name: 'dontGuidelines', label: 'Do Not Guidelines', type: FieldType.TEXT },
    { name: 'videoLength', label: 'Video Length', type: FieldType.TEXT },
    { name: 'format', label: 'Format', type: FieldType.TEXT },
    { name: 'deadline', label: 'Deadline', type: FieldType.DATE_TIME },
    { name: 'submissionInstruction', label: 'Submission Instruction', type: FieldType.TEXT },
    { name: 'usageRights', label: 'Usage Rights', type: FieldType.TEXT },
    { name: 'paymentTerms', label: 'Payment Terms', type: FieldType.TEXT },
  ],
});

