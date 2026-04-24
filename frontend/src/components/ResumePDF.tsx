import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';

const styles = StyleSheet.create({
  page: { padding: 40, fontFamily: 'Helvetica', fontSize: 10, color: '#1a1a1a', lineHeight: 1.5 },
  header: { marginBottom: 16, borderBottom: '1px solid #cccccc', paddingBottom: 10 },
  name: { fontSize: 22, fontFamily: 'Helvetica-Bold', marginBottom: 4 },
  contact: { fontSize: 9, color: '#555555', flexDirection: 'row', gap: 12, flexWrap: 'wrap' },
  sectionTitle: { fontSize: 12, fontFamily: 'Helvetica-Bold', textTransform: 'uppercase', letterSpacing: 1, marginTop: 14, marginBottom: 6, borderBottom: '0.5px solid #dddddd', paddingBottom: 3, color: '#2c2c2c' },
  bullet: { flexDirection: 'row', marginBottom: 3 },
  bulletDot: { marginRight: 6, color: '#555' },
  bulletText: { flex: 1 },
  experienceHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 3 },
  companyName: { fontFamily: 'Helvetica-Bold', fontSize: 10.5 },
  dateText: { fontSize: 9, color: '#666' },
  skillsWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 5 },
  skillChip: { backgroundColor: '#f0f0f0', padding: '2px 7px', borderRadius: 3, fontSize: 9 },
  summary: { fontSize: 10, color: '#333', lineHeight: 1.6, marginBottom: 4 },
});

interface ResumePDFProps { resumeData: any; tailoredData?: any; }

export const ResumePDF: React.FC<ResumePDFProps> = ({ resumeData, tailoredData = null }) => {
  const name = resumeData?.name || 'Your Name';
  const email = resumeData?.email || '';
  const phone = resumeData?.phone || '';
  const location = resumeData?.location || '';
  const summary = tailoredData?.tailored_summary?.tailored || resumeData?.summary || '';
  const skills = tailoredData ? [...(resumeData?.skills || []), ...(tailoredData?.skills_to_add || [])] : (resumeData?.skills || []);
  const experience = resumeData?.experience || [];

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.name}>{name}</Text>
          <View style={styles.contact}>
            {email && <Text>{email}</Text>}
            {phone && <Text>{phone}</Text>}
            {location && <Text>{location}</Text>}
          </View>
        </View>
        {summary && <View><Text style={styles.sectionTitle}>Summary</Text><Text style={styles.summary}>{summary}</Text></View>}
        {skills.length > 0 && <View><Text style={styles.sectionTitle}>Skills</Text><View style={styles.skillsWrap}>{skills.map((s: string, i: number) => <Text key={i} style={styles.skillChip}>{s}</Text>)}</View></View>}
        {experience.length > 0 && (
          <View>
            <Text style={styles.sectionTitle}>Experience</Text>
            {experience.map((exp: any, i: number) => (
              <View key={i} style={{ marginBottom: 10 }}>
                <View style={styles.experienceHeader}><Text style={styles.companyName}>{exp.role} — {exp.company}</Text><Text style={styles.dateText}>{exp.duration || exp.date}</Text></View>
                {(Array.isArray(exp.description) ? exp.description : [exp.description]).map((b: string, j: number) => (
                  <View key={j} style={styles.bullet}><Text style={styles.bulletDot}>•</Text><Text style={styles.bulletText}>{b}</Text></View>
                ))}
              </View>
            ))}
          </View>
        )}
      </Page>
    </Document>
  );
}

export default ResumePDF;
