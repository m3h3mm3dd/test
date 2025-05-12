import { api } from '@/lib/axios';

export interface ScopeManagementPlan {
  ScopeDefinitionMethod: string;
  WBSDevelopmentMethod: string;
  ScopeBaselineApproval: string;
  DeliverablesImpactHandling: string;
}

export interface RequirementManagementPlan {
  ReqPlanningApproach: string;
  ReqChangeControl: string;
  ReqPrioritization: string;
  ReqMetrics: string;
}

export interface RequirementDocumentation {
  StakeholderNeeds: string[];
  QuantifiedExpectations: string[];
  Traceability: string;
}

export interface ProjectScopeStatement {
  EndProductScope: string;
  Deliverables: string[];
  AcceptanceCriteria: string;
  Exclusions: string;
  OptionalSOW: string;
}

export interface WorkPackage {
  Name: string;
  Description: string;
  EstimatedDuration: number;
  EstimatedCost: number;
}

export interface WorkBreakdownStructure {
  WorkPackages: WorkPackage[];
  ScopeBaselineReference: string;
}

export interface ProjectScope {
  scopeManagementPlan: ScopeManagementPlan;
  requirementManagementPlan: RequirementManagementPlan;
  requirementDocumentation: RequirementDocumentation;
  projectScopeStatement: ProjectScopeStatement;
  workBreakdownStructure: WorkBreakdownStructure;
}

/**
 * Add project scope
 */
export async function addProjectScope(projectId: string, data: ProjectScope): Promise<string> {
  const response = await api.post(`/scope/add/${projectId}`, data);
  return response.data;
}

/**
 * Edit project scope
 */
export async function editProjectScope(projectId: string, data: ProjectScope): Promise<string> {
  const response = await api.put(`/scope/edit/${projectId}`, data);
  return response.data;
}