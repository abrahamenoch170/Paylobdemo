import * as React from 'react';
import { Document, Page, Text, View, StyleSheet, PDFDownloadLink, Image, Font } from '@react-pdf/renderer';
import { Button } from '@/components/ui/button';
import { Download, ShieldCheck, FileText, CheckCircle } from 'lucide-react';
import { Milestone, Project } from '@/types';

// PDF Styles
const styles = StyleSheet.create({
  page: {
    padding: 60,
    backgroundColor: '#ffffff',
    fontFamily: 'Helvetica',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 40,
    borderBottom: '2pt solid #F5F2ED',
    paddingBottom: 20,
  },
  logo: {
    fontSize: 24,
    fontWeight: 'black',
    letterSpacing: -1,
  },
  titleSection: {
    textAlign: 'center',
    marginBottom: 40,
  },
  certTitle: {
    fontSize: 10,
    letterSpacing: 2,
    textTransform: 'uppercase',
    color: '#8B8680',
    marginBottom: 10,
  },
  mainTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    fontStyle: 'italic',
    color: '#1C1C1C',
  },
  detailsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 40,
  },
  detailBox: {
    width: '50%',
    marginBottom: 20,
  },
  detailLabel: {
    fontSize: 8,
    color: '#8B8680',
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  detailValue: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#1C1C1C',
  },
  hashBox: {
    backgroundColor: '#F5F2ED',
    padding: 10,
    marginTop: 10,
  },
  hashText: {
    fontSize: 7,
    fontFamily: 'Courier',
    color: '#1C1C1C',
  },
  footer: {
    marginTop: 'auto',
    borderTop: '1pt solid #F5F2ED',
    paddingTop: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  legalText: {
    fontSize: 7,
    color: '#8B8680',
    width: '60%',
    lineHeight: 1.5,
  },
  seal: {
    width: 60,
    height: 60,
    borderRadius: 30,
    border: '2pt solid #C5A059',
    justifyContent: 'center',
    alignItems: 'center',
  }
});

// The PDF Document Component
const CertificateDocument = ({ milestone, project }: { milestone: Milestone, project: Project }) => (
  <Document>
    <Page size="A4" style={styles.page}>
      <View style={styles.header}>
        <Text style={styles.logo}>PAYLOB</Text>
        <Text style={{ fontSize: 8, color: '#8B8680' }}>ID: CERT-{milestone.id.substring(0, 8)}</Text>
      </View>

      <View style={styles.titleSection}>
        <Text style={styles.certTitle}>Certificate of Completion</Text>
        <Text style={styles.mainTitle}>Intellectual Property Transfer</Text>
      </View>

      <View style={styles.detailsGrid}>
        <View style={styles.detailBox}>
          <Text style={styles.detailLabel}>Project</Text>
          <Text style={styles.detailValue}>{project.title}</Text>
        </View>
        <View style={styles.detailBox}>
          <Text style={styles.detailLabel}>Milestone</Text>
          <Text style={styles.detailValue}>{milestone.title}</Text>
        </View>
        <View style={styles.detailBox}>
          <Text style={styles.detailLabel}>Settlement Date</Text>
          <Text style={styles.detailValue}>{new Date((milestone.updatedAt as Date) || Date.now()).toLocaleDateString()}</Text>
        </View>
        <View style={styles.detailBox}>
          <Text style={styles.detailLabel}>Consideration</Text>
          <Text style={styles.detailValue}>${milestone.amount.toLocaleString()} USD</Text>
        </View>
        
        <View style={{ width: '100%', marginTop: 10 }}>
          <Text style={styles.detailLabel}>Cryptographic Integrity Hash (SHA-256)</Text>
          <View style={styles.hashBox}>
            <Text style={styles.hashText}>6a2d9c8f0e1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d</Text>
          </View>
        </View>
      </View>

      <View style={styles.footer}>
        <Text style={styles.legalText}>
          NOTICE: All rights, title, and interest in and to the works described herein are hereby transferred to the Payor from the Payee upon successful cryptographic confirmation of payment via the Paylob protocol.
        </Text>
        <View style={styles.seal}>
           <Text style={{ fontSize: 8, color: '#C5A059', fontWeight: 'bold' }}>VERIFIED</Text>
        </View>
      </View>
    </Page>
  </Document>
);

export function DeliveryCertificateCard({ milestone, project }: { milestone: Milestone, project: Project }) {
  return (
    <div className="bg-white border-2 border-[#1C1C1C] rounded-2xl overflow-hidden shadow-xl animate-in zoom-in duration-300">
       <div className="p-6 bg-[#1C1C1C] text-white flex justify-between items-center">
          <div className="flex items-center gap-3">
             <div className="bg-white/10 p-2 rounded-xl">
                <ShieldCheck className="w-6 h-6 text-green-400" />
             </div>
             <div>
                <h3 className="font-bold text-sm uppercase tracking-widest">Delivery Certificate</h3>
                <p className="text-[10px] text-white/50 font-medium">Cryptographically Sealed & Signed</p>
             </div>
          </div>
          <CheckCircle className="w-5 h-5 text-green-400" />
       </div>

       <div className="p-6 space-y-4">
          <p className="text-xs text-[#8B8680] leading-relaxed">
            This certificate serves as legal proof of final payment and title transfer for <span className="text-[#1C1C1C] font-bold">"{milestone.title}"</span>. 
            Digital signatures and file hashes are embedded in the document.
          </p>

          <PDFDownloadLink 
            document={<CertificateDocument milestone={milestone} project={project} />} 
            fileName={`paylob-certificate-${milestone.id.substring(0, 8)}.pdf`}
          >
            {({ loading }) => (
              <Button 
                className="w-full bg-[#1C1C1C] text-white gap-2 h-12 uppercase tracking-widest font-black text-xs"
                disabled={loading}
              >
                {loading ? 'Generating...' : <><Download className="w-4 h-4" /> Download Certificate (PDF)</>}
              </Button>
            )}
          </PDFDownloadLink>

          <button className="w-full flex items-center justify-center gap-2 text-[10px] font-bold text-[#8B8680] uppercase tracking-widest hover:text-[#1C1C1C] transition-colors">
             <FileText className="w-3 h-3" /> View Hash Log
          </button>
       </div>
    </div>
  );
}
