import { api } from '@/lib/axios';

export interface Risk {
  Id: string;
  ProjectId: string;
  Name: string;
  Description: string;
  Category: string;
  Probability: number;
  Impact: number;
  Severity: number;
  OwnerId: string;
  Status: string;
}

export interface RiskCreateData {
  ProjectId: string;
  Name: string;
  Description?: string;
  Category: string;
  Probability: number;
  Impact: number;
  Severity: number;
  OwnerId?: string;
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

export interface RiskAnalysisCreateData {
  RiskId: string;
  AnalysisType: string;
  MatrixScore: string;
  ExpectedValue: number;
  OwnerId?: string;
}

export interface RiskResponsePlanCreateData {
  RiskId: string;
  Strategy: string;
  Description?: string;
  OwnerId?: string;
  PlannedActions: string;
  Status?: string;
}

/**
 * Get all risks for a project
 */
export async function getProjectRisks(projectId: string): Promise<Risk[]> {
  const response = await api.get(`/risks/project/${projectId}`);
  return response.data;
}

/**
 * Get a risk by ID
 */
export async function getRiskById(riskId: string): Promise<Risk> {
  const response = await api.get(`/risks/${riskId}`);
  return response.data;
}

/**
 * Create a new risk
 */
export async function createRisk(data: RiskCreateData): Promise<string> {
  const response = await api.post('/risks/create', data);
  return response.data;
}

/**
 * Update a risk
 */
export async function updateRisk(riskId: string, data: RiskUpdateData): Promise<string> {
  const response = await api.put(`/risks/${riskId}/update`, data);
  return response.data;
}

/**
 * Delete a risk
 */
export async function deleteRisk(riskId: string, projectId: string): Promise<string> {
  const response = await api.delete(`/risks/${riskId}/delete?projectId=${projectId}`);
  return response.data;
}

/**
 * Get all risk analyses for a risk
 */
export async function getRiskAnalyses(riskId: string): Promise<any[]> {
  const response = await api.get(`/risks/${riskId}/analyses`);
  return response.data;
}

/**
 * Create a new risk analysis
 */
export async function createRiskAnalysis(data: RiskAnalysisCreateData): Promise<string> {
  const response = await api.post('/risks/analysis/create', data);
  return response.data;
}

/**
 * Update a risk analysis
 */
export async function updateRiskAnalysis(
  analysisId: string,
  data: { MatrixScore?: string; ExpectedValue?: number }
): Promise<string> {
  const response = await api.put(`/risks/analysis/${analysisId}/update`, data);
  return response.data;
}

/**
 * Delete a risk analysis
 */
export async function deleteRiskAnalysis(analysisId: string): Promise<string> {
  const response = await api.delete(`/risks/analysis/${analysisId}/delete`);
  return response.data;
}

/**
 * Get a risk analysis by ID
 */
export async function getRiskAnalysisById(analysisId: string): Promise<any> {
  const response = await api.get(`/risks/analysis/${analysisId}`);
  return response.data;
}

/**
 * Get all risk response plans for a risk
 */
export async function getRiskResponsePlans(riskId: string): Promise<any[]> {
  const response = await api.get(`/risks/${riskId}/responses`);
  return response.data;
}

/**
 * Create a new risk response plan
 */
export async function createRiskResponsePlan(data: RiskResponsePlanCreateData): Promise<string> {
  const response = await api.post('/risks/response/create', data);
  return response.data;
}

/**
 * Update a risk response plan
 */
export async function updateRiskResponsePlan(
  responseId: string, 
  data: { 
    Strategy?: string; 
    Description?: string; 
    PlannedActions?: string; 
    Status?: string 
  }
): Promise<string> {
  const response = await api.put(`/risks/response/${responseId}/update`, data);
  return response.data;
}

/**
 * Delete a risk response plan
 */
export async function deleteRiskResponsePlan(responseId: string): Promise<string> {
  const response = await api.delete(`/risks/response/${responseId}/delete`);
  return response.data;
}

/**
 * Get a risk response plan by ID
 */
export async function getRiskResponsePlanById(responseId: string): Promise<any> {
  const response = await api.get(`/risks/response/${responseId}`);
  return response.data;
}