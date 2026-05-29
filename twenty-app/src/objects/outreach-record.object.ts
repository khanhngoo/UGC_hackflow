import { FieldType, defineObject } from 'twenty-sdk/define';

export default defineObject({
  nameSingular: 'outreachRecord',
  namePlural: 'outreachRecords',
  labelSingular: 'Outreach Record',
  labelPlural: 'Outreach Records',
  description: 'Contact, deal, and follow-up tracking for approved creators.',
  fields: [
    { name: 'creator', label: 'Creator', type: FieldType.RELATION, targetObject: 'creator' },
    { name: 'campaign', label: 'Campaign', type: FieldType.RELATION, targetObject: 'campaign' },
    { name: 'owner', label: 'Owner', type: FieldType.TEXT },
    { name: 'contactMethod', label: 'Contact Method', type: FieldType.SELECT, options: ['Email', 'Instagram DM', 'TikTok DM', 'X DM', 'Telegram', 'Other'] },
    { name: 'firstContactedAt', label: 'First Contacted At', type: FieldType.DATE_TIME },
    { name: 'lastContactedAt', label: 'Last Contacted At', type: FieldType.DATE_TIME },
    { name: 'nextFollowUpAt', label: 'Next Follow-Up At', type: FieldType.DATE_TIME },
    { name: 'replyStatus', label: 'Reply Status', type: FieldType.SELECT, options: ['Not Contacted', 'No Reply', 'Replied', 'Not Interested', 'Interested'] },
    { name: 'dealStatus', label: 'Deal Status', type: FieldType.SELECT, options: ['Not Started', 'Discussing', 'Confirmed', 'Lost'] },
    { name: 'pipelineStatus', label: 'Pipeline Status', type: FieldType.SELECT, options: ['Approved to Contact', 'Contacted', 'Replied', 'Negotiating', 'Deal Confirmed', 'Brief Sent', 'Content Submitted', 'Needs Revision', 'Approved', 'Ready for Ad Test', 'Paid', 'Closed'] },
    { name: 'blocker', label: 'Blocker', type: FieldType.TEXT },
    { name: 'notes', label: 'Notes', type: FieldType.TEXT },
  ],
});

