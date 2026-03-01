 (cd "$(git rev-parse --show-toplevel)" && git apply --3way <<'EOF' 
diff --git a/components/ProtocolPreview.tsx b/components/ProtocolPreview.tsx
index cd7651c89d912feb7d1351c4b03a5b096bdc7a44..1e734413ff779f26fa5e52770681ac9da4a9465b 100644
--- a/components/ProtocolPreview.tsx
+++ b/components/ProtocolPreview.tsx
@@ -7,111 +7,109 @@ import { Loader2, FileText, X, FileDown, AlertTriangle } from 'lucide-react';
 
 const LOGO_VBR_GOLD = "https://xqwzmvzfemjkvaquxedz.supabase.co/storage/v1/object/public/LOGO/DOURADO.png";
 
 export interface ProtocolPreviewHandle {
   download: () => Promise<void>;
 }
 
 interface Props {
   data: ProtocolData;
   onBack?: () => void;
   hideFloatingButton?: boolean;
   customTrigger?: React.ReactNode; 
 }
 
 const ProtocolPreview = React.memo(forwardRef<ProtocolPreviewHandle, Props>(({ data, onBack, hideFloatingButton, customTrigger }, ref) => {
   const [isGenerating, setIsGenerating] = useState(false);
   const [showModal, setShowModal] = useState(false);
   const pdfRef = useRef<HTMLDivElement>(null);
 
   const handleDownloadPDF = async () => {
     const targetRef = pdfRef.current;
     if (!targetRef) return;
     setIsGenerating(true);
     const clientName = data?.clientName || "Aluno";
     
-    // A4 Dimensions in Pixels (96 DPI)
-    // 210mm = 793.7px (approx 793px)
-    // 297mm = 1122.5px (approx 1122px)
-    const A4_WIDTH_PX = 793; 
-
     const opt = {
-      margin: [0, 0, 0, 0],
+      margin: 0,
       filename: `Protocolo_VBR_${clientName.replace(/\s+/g, '_')}.pdf`,
       image: { type: 'jpeg', quality: 1 },
       html2canvas: { 
         scale: 2, 
         useCORS: true, 
         scrollX: 0,
         scrollY: 0,
         windowWidth: 794
       },
       jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
-pagebreak: {
-  mode: ['css', 'legacy'],
-  avoid: ['tr', '.avoid-break'] };
+      pagebreak: {
+        mode: 'css',
+        avoid: ['tr', '.avoid-break']
+      }
+    };
 
     try {
       await new Promise(resolve => setTimeout(resolve, 500));
       // @ts-ignore
       await html2pdf().set(opt).from(targetRef).save();
     } catch (err) { alert("Erro ao gerar PDF."); console.error(err); } 
     finally { setIsGenerating(false); }
   };
 
   useImperativeHandle(ref, () => ({ download: handleDownloadPDF }));
 
   const renderContent = (isPdfMode = false) => {
     const safeData = data || EMPTY_DATA;
     const physical = safeData.physicalData || EMPTY_DATA.physicalData;
     const contract = safeData.contract || EMPTY_DATA.contract;
     const macros = safeData.macros || { protein: { value: '0', ratio: '' }, carbs: { value: '0', ratio: '' }, fats: { value: '0', ratio: '' } };
     const meals = (safeData.meals || []).filter(m => m.name || m.details || m.time);
     const supplements = (safeData.supplements || []).filter(s => s.name || s.dosage || s.timing);
     const trainingDays = (safeData.trainingDays || []).filter(d => d.title || d.focus || (d.exercises && d.exercises.length > 0));
     const tips = (safeData.tips || []).filter(t => t.trim() !== '');
     
     const protocolTitle = safeData.protocolTitle || "HIPERTROFIA";
     const clientName = safeData.clientName || "ALUNO";
     const firstName = clientName.split(' ')[0];
 
     // Configuração de Estilo para Página A4
     const pageStyle = (isFirst: boolean = false): React.CSSProperties => ({
-        width: '100%', 
+        width: '210mm',
+        minHeight: '297mm',
         backgroundColor: 'white',
         boxSizing: 'border-box',
         position: 'relative',
+        display: 'block',
         fontFamily: "'Inter', sans-serif",
         margin: '0', 
         padding: '15mm',
         WebkitTextSizeAdjust: '100%',
         textSizeAdjust: '100%',
         color: 'black',
-        pageBreakInside: 'avoid'
+        pageBreakBefore: isFirst ? 'auto' : 'always',
+        pageBreakInside: 'auto',
         breakInside: 'avoid',
-});
-      
     });
 
     const contentWrapperStyle: React.CSSProperties = {
         width: '100%',
         boxSizing: 'border-box'
     };
 
     const coverPageStyle: React.CSSProperties = {
         ...pageStyle(true),
         backgroundColor: '#050505',
         color: '#ffffff',
         display: 'flex',
         flexDirection: 'column',
         alignItems: 'center',
         justifyContent: 'center',
         padding: 0,
         position: 'relative',
         minHeight: '297mm'
     };
 
     const endPageStyle: React.CSSProperties = {
         ...pageStyle(false),
         backgroundColor: '#050505',
         color: '#ffffff',
         display: 'flex',
 
EOF
)
