import { defineObject, FieldType, OnDeleteAction, RelationType } from 'twenty-sdk/define';

import { CHANNEL_OPTIONS } from 'src/constants/ugc-options';
import { UGC_FIELD_IDS, UGC_OBJECT_IDS } from 'src/constants/ugc-universal-identifiers';

export default defineObject({
  universalIdentifier: UGC_OBJECT_IDS.contactWorkflowStep,
  nameSingular: 'contactWorkflowStep',
  namePlural: 'contactWorkflowSteps',
  labelSingular: 'Contact Workflow Step',
  labelPlural: 'Contact Workflow Steps',
  description: 'Timed step in a creator contact workflow.',
  icon: 'IconListNumbers',
  labelIdentifierFieldMetadataUniversalIdentifier: UGC_FIELD_IDS.contactWorkflowStep.template,
  fields: [
    {
      universalIdentifier: UGC_FIELD_IDS.contactWorkflowStep.workflow,
      name: 'workflow',
      label: 'Workflow',
      type: FieldType.RELATION,
      icon: 'IconTimeline',
      relationTargetObjectMetadataUniversalIdentifier: UGC_OBJECT_IDS.contactWorkflow,
      relationTargetFieldMetadataUniversalIdentifier: UGC_FIELD_IDS.contactWorkflow.steps,
      universalSettings: { relationType: RelationType.MANY_TO_ONE, onDelete: OnDeleteAction.CASCADE, joinColumnName: 'workflowId' },
    },
    { universalIdentifier: UGC_FIELD_IDS.contactWorkflowStep.stepNumber, name: 'stepNumber', label: 'Step Number', type: FieldType.NUMBER, icon: 'IconHash' },
    { universalIdentifier: UGC_FIELD_IDS.contactWorkflowStep.delayHours, name: 'delayHours', label: 'Delay Hours', type: FieldType.NUMBER, icon: 'IconClock' },
    { universalIdentifier: UGC_FIELD_IDS.contactWorkflowStep.channel, name: 'channel', label: 'Channel', type: FieldType.SELECT, icon: 'IconMessage', options: [...CHANNEL_OPTIONS] },
    { universalIdentifier: UGC_FIELD_IDS.contactWorkflowStep.template, name: 'template', label: 'Template', type: FieldType.TEXT, icon: 'IconTemplate' },
    { universalIdentifier: UGC_FIELD_IDS.contactWorkflowStep.requiresApproval, name: 'requiresApproval', label: 'Requires Approval', type: FieldType.BOOLEAN, icon: 'IconUserCheck' },
    {
      universalIdentifier: UGC_FIELD_IDS.contactWorkflowStep.scheduledTasks,
      name: 'scheduledTasks',
      label: 'Scheduled Tasks',
      type: FieldType.RELATION,
      icon: 'IconClock',
      relationTargetObjectMetadataUniversalIdentifier: UGC_OBJECT_IDS.scheduledContactTask,
      relationTargetFieldMetadataUniversalIdentifier: UGC_FIELD_IDS.scheduledContactTask.workflowStep,
      universalSettings: { relationType: RelationType.ONE_TO_MANY },
    },
  ],
});
