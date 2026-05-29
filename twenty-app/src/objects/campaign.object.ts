import { FieldType, defineObject } from 'twenty-sdk/define';

export default defineObject({
  nameSingular: 'campaign',
  namePlural: 'campaigns',
  labelSingular: 'Campaign',
  labelPlural: 'Campaigns',
  description: 'UGC campaign container for creators, goals, content, and reporting.',
  fields: [
    { name: 'name', label: 'Name', type: FieldType.TEXT },
    { name: 'objective', label: 'Objective', type: FieldType.TEXT },
    { name: 'product', label: 'Product', type: FieldType.TEXT },
    { name: 'targetAudience', label: 'Target Audience', type: FieldType.TEXT },
    { name: 'platforms', label: 'Platforms', type: FieldType.MULTI_SELECT, options: ['TikTok', 'Instagram', 'YouTube', 'X', 'Other'] },
    { name: 'owner', label: 'Owner', type: FieldType.TEXT },
    { name: 'status', label: 'Status', type: FieldType.SELECT, options: ['Planning', 'Active', 'Paused', 'Completed', 'Archived'] },
    { name: 'startDate', label: 'Start Date', type: FieldType.DATE },
    { name: 'endDate', label: 'End Date', type: FieldType.DATE },
    { name: 'creatorSourcingGoal', label: 'Creator Sourcing Goal', type: FieldType.NUMBER },
    { name: 'contentSubmissionGoal', label: 'Content Submission Goal', type: FieldType.NUMBER },
    { name: 'viewGoal', label: 'View Goal', type: FieldType.NUMBER },
    { name: 'clickGoal', label: 'Click Goal', type: FieldType.NUMBER },
    { name: 'conversionGoal', label: 'Conversion Goal', type: FieldType.NUMBER },
    { name: 'notes', label: 'Notes', type: FieldType.TEXT },
    { name: 'weeklySummary', label: 'Weekly Summary', type: FieldType.TEXT },
  ],
});

