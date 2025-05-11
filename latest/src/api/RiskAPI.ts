import { api } from '@/lib/axios';

export interface Risk {
  Id: string;
  ProjectId: string;
  Name: string;
  Description?: string;
  Category: string;
  Probability: number;
  Impact: number;
  Severity: number;
  OwnerId: string;
  Status: string;
  IdentifiedDate: string;
  IsDeleted: boolean;
}

export interface RiskCreateData {
  ProjectId: string;
  Name: string;
  Description?: string;
  Category: string;
  Probability: number;
  Impact: number;
  Severity: number;
  Status?: string;
}

export interface RiskUpdateData {
  Name?: string;
  Description?: string;
  Category?: string;
  Probability?: number;
  Impact?: number;
  Severity?: number;
  Status?: string;
}

export async function getProjectRisks(projectId: string): Promise<Risk[]> {
  const response = await api.get(`/risks/project/${projectId}`);
  return response.data;
}

export async function getRiskById(riskId: string): Promise<Risk> {
  const response = await api.get(`/risks/${riskId}`);
  return response.data;
}

export async function createRisk(data: RiskCreateData): Promise<Risk> {
  const response = await api.post('/risks/create', data);
  return response.data;
}

export async function updateRisk(riskId: string, data: RiskUpdateData): Promise<Risk> {
  const response = await api.put(`/risks/${riskId}/update`, data);
  return response.data;
}

export async function deleteRisk(riskId: string, projectId: string): Promise<void> {
  await api.delete(`/risks/${riskId}/delete?projectId=${projectId}`);
}

// Risk Analysis API functions
export async function getRiskAnalyses(riskId: string): Promise<any[]> {
  const response = await api.get(`/risks/${riskId}/analyses`);
  return response.data;
}

export async function createRiskAnalysis(data: {
  RiskId: string;
  AnalysisType: string;
  MatrixScore: string;
  ExpectedValue: number;
}): Promise<any> {
  const response = await api.post('/risks/analysis/create', data);
  return response.data;
}

// Risk Response Plan API functions
export async function getRiskResponsePlans(riskId: string): Promise<any[]> {
  const response = await api.get(`/risks/${riskId}/responses`);
  return response.data;
}

export async function createRiskResponsePlan(data: {
  RiskId: string;
  Strategy: string;
  Description?: string;
  PlannedActions: string;
  Status?: string;
}): Promise<any> {
  const response = await api.post('/risks/response/create', data);
  return response.data;
}