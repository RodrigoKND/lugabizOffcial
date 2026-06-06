import { createReport, getReportsForTarget, getReportCount, hasUserReported, getFlaggedContent, REPORT_THRESHOLD } from './reports';

export const reportsService = {
  createReport,
  getReportsForTarget,
  getReportCount,
  hasUserReported,
  getFlaggedContent,
  REPORT_THRESHOLD,
};
