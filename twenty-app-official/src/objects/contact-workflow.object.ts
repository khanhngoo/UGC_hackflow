import { defineObject, FieldType, OnDeleteAction, RelationType } from 'twenty-sdk/define';

import { CHANNEL_OPTIONS } from 'src/constants/ugc-options';
import { UGC_FIELD_IDS, UGC_OBJECT_IDS } from 'src/constants/ugc-universal-identifiers';

export default defineObject({
  universalIdentifier: UGC_OBJECT_IDS.contactWorkflow,
  nameSingular: 'contactWorkflow',
  namePlural: 'contactWorkflows',
  labelSingular: 'Contact Workflow',
  labelPlural: 'Contact Workflows',
  description: 'Reusable outreach sequence for accepted or selected creators.',
  icon: 'IconTimeline',
  labelIdentifierFieldMetadataUniversalIdentifier: UGC_FIELD_IDS.contactWorkflow.name,
  fields: [
    { universalIdentifier: UGC_FIELD_IDS.contactWorkflow.name, name: 'name', label: 'Name', type: FieldType.TEXT, icon: 'IconAbc' },
    {
      universalIdentifier: UGC_FIELD_IDS.contactWorkflow.campaign,
      name: 'campaign',
      label: 'Campaign',
      type: FieldType.RELATION,
      icon: 'IconTargetArrow',
      relationTargetObjectMetadataUniversalIdentifier: UGC_OBJECT_IDS.campaign,
      relationTargetFieldMetadataUniversalIdentifier: UGC_FIELD_IDS.campaign.contactWorkflows,
      universalSettings: { relationType: RelationType.MANY_TO_ONE, onDelete: OnDeleteAction.SET_NULL, joinColumnName: 'campaignId' },
      isNullable: true,
    },
    { universalIdentifier: UGC_FIELD_IDS.contactWorkflow.channel, name: 'channel', label: 'Channel', type: FieldType.SELECT, icon: 'IconMessage', options: [...CHANNEL_OPTIONS] },
    {
      universalIdentifier: UGC_FIELD_IDS.contactWorkflow.status,
      name: 'status',
      label: 'Status',
      type: FieldType.SELECT,
      icon: 'IconProgress',
      options: [
        { value: 'DRAFT', label: 'Draft', position: 0, color: 'gray' },
        { value: 'ACTIVE', label: 'Active', position: 1, color: 'green' },
        { value: 'PAUSED', label: 'Paused', position: 2, color: 'orange' },
        { value: 'ARCHIVED', label: 'Archived', position: 3, color: 'gray' },
      ],
    },
    { universalIdentifier: UGC_FIELD_IDS.contactWorkflow.owner, name: 'owner', label: 'Owner', type: FieldType.TEXT, icon: 'IconUser' },
    { universalIdentifier: UGC_FIELD_IDS.contactWorkflow.notes, name: 'notes', label: 'Notes', type: FieldType.TEXT, icon: 'IconNotes' },
    {
      universalIdentifier: UGC_FIELD_IDS.contactWorkflow.steps,
      name: 'steps',
      label: 'Steps',
      type: FieldType.RELATION,
      icon: 'IconListNumbers',
      relationTargetObjectMetadataUniversalIdentifier: UGC_OBJECT_IDS.contactWorkflowStep,
      relationTargetFieldMetadataUniversalIdentifier: UGC_FIELD_IDS.contactWorkflowStep.workflow,
      universalSettings: { relationType: RelationType.ONE_TO_MANY },
    },
    {
      universalIdentifier: UGC_FIELD_IDS.contactWorkflow.scheduledTasks,
      name: 'scheduledTasks',
      label: 'Scheduled Tasks',
      type: FieldType.RELATION,
      icon: 'IconClock',
      relationTargetObjectMetadataUniversalIdentifier: UGC_OBJECT_IDS.scheduledContactTask,
      relationTargetFieldMetadataUniversalIdentifier: UGC_FIELD_IDS.scheduledContactTask.workflow,
      universalSettings: { relationType: RelationType.ONE_TO_MANY },
    },
  ],
});
