import React from 'react';
import { Document, Page, Text, View, StyleSheet, Font } from '@react-pdf/renderer';

const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontFamily: 'Helvetica',
    fontSize: 10,
    color: '#1a1a1a',
    lineHeight: 1.5,
  },
  header: {
    marginBottom: 16,
    borderBottom: '1px solid #cccccc',
    paddingBottom: 10,
  },
  name: {
    fontSize: 22,
    fontFamily: 'Helvetica-Bold',
    marginBottom: 4,
  },
  contact: {
    fontSize: 9,
    color: '#555555',
    flexDirection: 'row',
    gap: 12,
    flexWrap: 'wrap',
  },
  sectionTitle: {
    fontSize: 12,
    fontFamily: 'Helvetica-Bold',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginTop: 14,
    marginBottom: 6,
    borderBottom: '0.5px solid #dddddd',
    paddingBottom: 3,
    color: '#2c2c2c',
  },
  bullet: {
    flexDirection: 'row',
    marginBottom: 3,
  },
  bulletDot: { marginRight: 6, color: '#555' },
  bulletText: { flex: 1 },
  experienceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 3,
  },
  companyName: { fontFamily: 'Helvetica-Bold', fontSize: 10.5 },
  dateText: { fontSize: 9, color: '#666' },
  skillsWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 5 },
  skillChip: {
    backgroundColor: '#f0f0f0',
    padding: '2px 7px',
    borderRadius: 3,
    fontSize: 9,
  },
  summary: { fontSize: 10, color: '#333', lineHeight: 1.6, marginBottom: 4 },
});

interface ResumePDFProps {
  resumeData: any;
  tailoredData?: any;
}

export const ResumePDF: React.FC<ResumePDFProps> = ({ resumeData, tailoredData = null }) => {
  const name = resumeData?.name || 'Your Name';
  const email = resumeData?.email || '';
  const phone = resumeData?.phone || '';
  const location = resumeData?.location || '';
  
  const summary = tailoredData?.tailored_summary?.tailored || resumeData?.summary || '';
  const skills = tailoredData
    ? [...(resumeData?.skills || []), ...(tailoredData?.skills_to_add || [])]
    : (resumeData?.skills || []);
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

        {summary && (
          <View>
            <Text style={styles.sectionTitle}>Professional Summary</Text>
            <Text style={styles.summary}>{summary}</Text>
          </View>
        )}

        {skills.length > 0 && (
          <View>
            <Text style={styles.sectionTitle}>Technical Skills</Text>
            <View style={styles.skillsWrap}>
              {skills.map((skill: string, i: number) => (
                <Text key={i} style={styles.skillChip}>{skill}</Text>
              ))}
            </View>
          </View>
        )}

        {experience.length > 0 && (
          <View>
            <Text style={styles.sectionTitle}>Experience</Text>
            {experience.map((exp: any, i: number) => {
              const tailoredBullets = tailoredData?.bullet_rewrites;
              const originalBullets = Array.isArray(exp.description) ? exp.description : [exp.description];
              
              return (
                <View key={i} style={{ marginBottom: 10 }}>
                  <View style={styles.experienceHeader}>
                    <Text style={styles.companyName}>{exp.role} — {exp.company}</Text>
                    <Text style={styles.dateText}>{exp.duration || exp.date}</Text>
                  </View>
                  {originalBullets.map((b: string, j: number) => {
                    const tailored = tailoredBullets?.find((t: any) => 
                      t.original.toLowerCase().includes(b.toLowerCase().slice(0, 30))
                    );
                    const bulletText = tailored ? tailored.tailored : b;
                    return (
                      <View key={j} style={styles.bullet}>
                        <Text style={styles.bulletDot}>•</Text>
                        <Text style={styles.bulletText}>{bulletText}</Text>
                      </View>
                    );
                  })}
                </View>
              );
            })}
          </View>
        )}

        {resumeData?.projects?.length > 0 && (
          <View>
            <Text style={styles.sectionTitle}>Projects</Text>
            {resumeData.projects.map((proj: any, i: number) => (
              <View key={i} style={{ marginBottom: 8 }}>
                <Text style={styles.companyName}>{proj.name}</Text>
                <Text style={{ fontSize: 9.5 }}>{proj.description}</Text>
              </View>
            ))}
          </View>
        )}

        {resumeData?.education?.length > 0 && (
          <View>
            <Text style={styles.sectionTitle}>Education</Text>
            {resumeData.education.map((edu: any, i: number) => (
              <View key={i} style={styles.experienceHeader}>
                <Text style={styles.companyName}>{edu.degree} — {edu.institution}</Text>
                <Text style={styles.dateText}>{edu.year || edu.duration}</Text>
              </View>
            ))}
          </View>
        )}

      </Page>
    </Document>
  );
}

export default ResumePDF;
