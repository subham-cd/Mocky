import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';

const styles = StyleSheet.create({
  page: { padding: 50, fontFamily: 'Helvetica', fontSize: 10, color: '#1a1a1a', lineHeight: 1.5, backgroundColor: '#ffffff' },
  header: { marginBottom: 30, borderBottom: '3px solid #3b82f6', paddingBottom: 15 },
  title: { fontSize: 26, fontFamily: 'Helvetica-Bold', color: '#111827', marginBottom: 5, textTransform: 'uppercase', letterSpacing: 2 },
  subtitle: { fontSize: 10, color: '#6b7280', textTransform: 'uppercase', letterSpacing: 1 },
  
  section: { marginBottom: 25 },
  sectionTitle: { fontSize: 14, fontFamily: 'Helvetica-Bold', color: '#3b82f6', textTransform: 'uppercase', marginBottom: 10, borderBottom: '1px solid #e5e7eb', paddingBottom: 5 },
  
  summaryText: { fontSize: 11, color: '#374151', lineHeight: 1.6, fontStyle: 'italic', marginBottom: 15 },
  
  scoreGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 15, marginBottom: 20 },
  scoreCard: { width: '45%', padding: 12, backgroundColor: '#f9fafb', borderRadius: 8, border: '1px solid #e5e7eb' },
  scoreLabel: { fontSize: 8, color: '#6b7280', textTransform: 'uppercase', marginBottom: 4, fontWeight: 'bold' },
  scoreValue: { fontSize: 20, fontFamily: 'Helvetica-Bold', color: '#111827' },
  
  bulletRow: { flexDirection: 'row', marginBottom: 6 },
  bulletDot: { width: 15, color: '#3b82f6', fontFamily: 'Helvetica-Bold' },
  bulletText: { flex: 1, color: '#4b5563' },
  
  verdictBox: { padding: 20, backgroundColor: '#eff6ff', borderRadius: 12, borderLeft: '5px solid #3b82f6', marginTop: 10 },
  verdictTitle: { fontSize: 10, fontFamily: 'Helvetica-Bold', color: '#1e40af', marginBottom: 5, textTransform: 'uppercase' },
  verdictText: { fontSize: 11, color: '#1e3a8a', lineHeight: 1.5 },
  
  planWeek: { marginTop: 15, padding: 12, backgroundColor: '#f3f4f6', borderRadius: 10 },
  weekTitle: { fontSize: 11, fontFamily: 'Helvetica-Bold', color: '#111827', marginBottom: 5 },
  
  footer: { position: 'absolute', bottom: 30, left: 50, right: 50, borderTop: '1px solid #e5e7eb', paddingTop: 10, textAlign: 'center' },
  footerText: { fontSize: 8, color: '#9ca3af' }
});

interface ReportPDFProps {
  reportData: any;
  userName: string;
  targetRole: string;
}

export const ReportPDF: React.FC<ReportPDFProps> = ({ reportData, userName, targetRole }) => {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Neural Career Intelligence</Text>
          <Text style={styles.subtitle}>Confidential Performance Audit | {userName} | {targetRole}</Text>
        </View>

        {/* Executive Summary */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Executive Summary</Text>
          <Text style={styles.summaryText}>{reportData.executive_summary}</Text>
        </View>

        {/* Scores */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Neural Score Metrics</Text>
          <View style={styles.scoreGrid}>
            <View style={styles.scoreCard}>
              <Text style={styles.scoreLabel}>Resume Strength</Text>
              <Text style={styles.scoreValue}>{reportData.section_scores.resume_strength}%</Text>
            </View>
            <View style={styles.scoreCard}>
              <Text style={styles.scoreLabel}>Interview Acumen</Text>
              <Text style={styles.scoreValue}>{reportData.section_scores.interview_acumen}%</Text>
            </View>
            <View style={styles.scoreCard}>
              <Text style={styles.scoreLabel}>Technical Efficiency</Text>
              <Text style={styles.scoreValue}>{reportData.section_scores.technical_efficiency}%</Text>
            </View>
            <View style={styles.scoreCard}>
              <Text style={styles.scoreLabel}>Overall Readiness</Text>
              <Text style={styles.scoreValue}>{reportData.section_scores.market_readiness}%</Text>
            </View>
          </View>
        </View>

        {/* Strengths & Gaps */}
        <View style={{ flexDirection: 'row', gap: 20 }}>
          <View style={{ flex: 1 }}>
            <Text style={styles.sectionTitle}>Top Strengths</Text>
            {reportData.top_strengths.map((s: string, i: number) => (
              <View key={i} style={styles.bulletRow}>
                <Text style={styles.bulletDot}>✓</Text>
                <Text style={styles.bulletText}>{s}</Text>
              </View>
            ))}
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.sectionTitle}>Critical Gaps</Text>
            {reportData.critical_gaps.map((g: string, i: number) => (
              <View key={i} style={styles.bulletRow}>
                <Text style={styles.bulletDot}>!</Text>
                <Text style={styles.bulletText}>{g}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* AI Verdict */}
        <View style={styles.verdictBox}>
          <Text style={styles.verdictTitle}>AI Senior Architect Verdict</Text>
          <Text style={styles.verdictText}>{reportData.ai_verdict}</Text>
        </View>

        {/* Action Plan */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>3-Week Neural Acceleration Plan</Text>
          {reportData.weekly_action_plan.map((w: any, i: number) => (
            <View key={i} style={styles.planWeek}>
              <Text style={styles.weekTitle}>{w.week}: {w.focus}</Text>
              {w.tasks.map((t: string, j: number) => (
                <View key={j} style={styles.bulletRow}>
                  <Text style={{ fontSize: 8, color: '#3b82f6', marginRight: 5 }}>→</Text>
                  <Text style={{ fontSize: 9, color: '#4b5563' }}>{t}</Text>
                </View>
              ))}
            </View>
          ))}
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>Generated by Mocky AI Neural Engine | Verified Professional Audit</Text>
        </View>
      </Page>
    </Document>
  );
};

export default ReportPDF;
