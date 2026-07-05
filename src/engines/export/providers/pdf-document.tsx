import { Document, Page, Text, View, StyleSheet, Font } from "@react-pdf/renderer";
import type { ResumeData } from "@/types";

const styles = StyleSheet.create({
  page: { padding: 40, fontFamily: "Helvetica", fontSize: 10, color: "#333" },
  section: { marginBottom: 12 },
  title: { fontSize: 14, fontWeight: "bold", marginBottom: 4, color: "#1a56db", textTransform: "uppercase" },
  divider: { height: 1, backgroundColor: "#1a56db", marginBottom: 6, opacity: 0.3 },
  name: { fontSize: 20, fontWeight: "bold", textAlign: "center", marginBottom: 2 },
  contact: { fontSize: 9, textAlign: "center", color: "#666", marginBottom: 12 },
  company: { fontSize: 10, fontWeight: "bold" },
  dates: { fontSize: 9, color: "#666" },
  bullet: { fontSize: 9, marginBottom: 2, marginLeft: 12 },
  summary: { fontSize: 9, lineHeight: 1.5, color: "#444" },
});

export default function PDFDocument({ data }: { data: ResumeData }) {
  return (
    <Document>
      <Page size="LETTER" style={styles.page}>
        <Text style={styles.name}>{data.personal.name}</Text>
        <Text style={styles.contact}>
          {[data.personal.email, data.personal.phone, data.personal.location].filter(Boolean).join(" | ")}
        </Text>

        {data.personal.summary && (
          <View style={styles.section}>
            <Text style={styles.title}>Summary</Text>
            <View style={styles.divider} />
            <Text style={styles.summary}>{data.personal.summary}</Text>
          </View>
        )}

        {data.experience.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.title}>Experience</Text>
            <View style={styles.divider} />
            {data.experience.map((exp) => (
              <View key={exp.id} wrap={false} style={{ marginBottom: 8 }}>
                <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                  <Text style={styles.company}>{exp.position} — {exp.company}</Text>
                  <Text style={styles.dates}>{exp.startDate} – {exp.current ? "Present" : exp.endDate}</Text>
                </View>
                {exp.bullets.filter(Boolean).map((b, i) => (
                  <Text key={i} style={styles.bullet}>• {b}</Text>
                ))}
              </View>
            ))}
          </View>
        )}

        {data.education.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.title}>Education</Text>
            <View style={styles.divider} />
            {data.education.map((edu) => (
              <View key={edu.id} style={{ marginBottom: 4 }}>
                <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                  <Text style={{ fontSize: 10 }}>{edu.degree} in {edu.field}</Text>
                  <Text style={styles.dates}>{edu.startDate} – {edu.endDate}</Text>
                </View>
                <Text style={{ fontSize: 9, color: "#666" }}>{edu.institution}</Text>
              </View>
            ))}
          </View>
        )}

        {data.skills.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.title}>Skills</Text>
            <View style={styles.divider} />
            {data.skills.map((cat) => (
              <Text key={cat.id} style={{ fontSize: 9, marginBottom: 2 }}>
                <Text style={{ fontWeight: "bold" }}>{cat.category}: </Text>
                {cat.skills.join(", ")}
              </Text>
            ))}
          </View>
        )}
      </Page>
    </Document>
  );
}
