import { api } from './client';
import { DashboardResponse, DashboardSummaryItem } from './types';

export const getDashboard = async (): Promise<DashboardSummaryItem[]> => {
  const { data } = await api.get<DashboardResponse>('/dashboard');
  return data.dashboard;
};
