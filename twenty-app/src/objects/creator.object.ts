import { FieldType, defineObject } from 'twenty-sdk/define';

export default defineObject({
  nameSingular: 'creator',
  namePlural: 'creators',
  labelSingular: 'Creator',
  labelPlural: 'Creators',
  description: 'Canonical creator profile reused across campaigns.',
  fields: [
    { name: 'name', label: 'Name', type: FieldType.TEXT },
    { name: 'handle', label: 'Handle', type: FieldType.TEXT },
    { name: 'platform', label: 'Platform', type: FieldType.SELECT, options: ['TikTok', 'Instagram', 'YouTube', 'X', 'Other'] },
    { name: 'profileLink', label: 'Profile Link', type: FieldType.LINK },
    { name: 'normalizedProfileLink', label: 'Normalized Profile Link', type: FieldType.LINK },
    { name: 'contactMethod', label: 'Contact Method', type: FieldType.TEXT },
    { name: 'country', label: 'Country', type: FieldType.TEXT },
    { name: 'language', label: 'Language', type: FieldType.TEXT },
    { name: 'niche', label: 'Niche', type: FieldType.TEXT },
    { name: 'contentStyle', label: 'Content Style', type: FieldType.TEXT },
    { name: 'audienceType', label: 'Audience Type', type: FieldType.TEXT },
    { name: 'followerCount', label: 'Follower Count', type: FieldType.NUMBER },
    { name: 'averageViews', label: 'Average Views', type: FieldType.NUMBER },
    { name: 'engagementQuality', label: 'Engagement Quality', type: FieldType.TEXT },
    { name: 'brandFit', label: 'Brand Fit', type: FieldType.TEXT },
    { name: 'audienceFit', label: 'Audience Fit', type: FieldType.TEXT },
    { name: 'riskNotes', label: 'Risk Notes', type: FieldType.TEXT },
    { name: 'priority', label: 'Priority', type: FieldType.SELECT, options: ['Low', 'Medium', 'High'] },
    { name: 'currentStatus', label: 'Current Status', type: FieldType.SELECT, options: ['Proposed', 'Under Review', 'Approved to Contact', 'Contacted', 'Replied', 'Negotiating', 'Deal Confirmed', 'Brief Sent', 'Content Submitted', 'Needs Revision', 'Approved', 'Ready for Ad Test', 'Paid', 'Closed'] },
    { name: 'owner', label: 'Owner', type: FieldType.TEXT },
  ],
});

