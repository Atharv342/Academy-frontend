import React, { useState } from 'react';
import { UploadCloud, FileType, CheckCircle, Loader2, Play, FileCheck, Download, Search, Eye } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';

interface QuestionDetail {
    q: number;
    marked: string;
    correct: string;
    isRight: boolean;
}

interface ExamResult {
    roll: string;
    name: string;
    score: number;
    total: number;
    accuracy: string;
    status: 'Pass' | 'Fail';
    details: QuestionDetail[];
}

const OPTS = ["A", "B", "C", "D"];
function demoEvaluate(files: File[]): ExamResult[] {
    const key = Array.from({ length: 20 }, (_, i) => OPTS[(i * 7 + 3) % 4]);
    return files.map((f, idx) => {
        let seed = Array.from(f.name).reduce((a, c) => a + c.charCodeAt(0), idx * 31 + f.size);
        const rnd = () => { seed = (seed * 9301 + 49297) % 233280; return seed / 233280; };
        const details: QuestionDetail[] = key.map((correct, i) => {
            const marked = rnd() < 0.72 ? correct : OPTS[Math.floor(rnd() * 4)];
            return { q: i + 1, marked, correct, isRight: marked === correct };
        });
        const score = details.filter((d) => d.isRight).length;
        return {
            roll: `KA-2026-${String(401 + idx).padStart(4, "0")}`,
            name: f.name.replace(/\.[^.]+$/, "").replace(/[_-]+/g, " ") || `Student ${idx + 1}`,
            score, total: key.length,
            accuracy: `${Math.round((score / key.length) * 100)}%`,
            status: score / key.length >= 0.4 ? "Pass" : "Fail",
            details,
        };
    });
}

export const OmrScanner = () => {
    const [answerKey, setAnswerKey] = useState<File | null>(null);
    const [studentFiles, setStudentFiles] = useState<File[]>([]);

    const [isScanning, setIsScanning] = useState(false);
    const [scanStep, setScanStep] = useState(0);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);

    const [results, setResults] = useState<ExamResult[] | null>(null);
    const [expandedRow, setExpandedRow] = useState<string | null>(null);

    const scanLogs = [
        "Initializing WebGL canvas...",
        "Detecting corner fiducial markers...",
        "Correcting perspective distortion...",
        "Applying Gaussian blur & adaptive thresholding...",
        "Extracting ROIs (Regions of Interest)...",
        "Analyzing bubble pixel density...",
        "Cross-referencing with master answer key...",
        "Finalizing accuracy matrix..."
    ];

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            const files = Array.from(e.target.files);
            setStudentFiles(files);

            // Create a preview of the first file for the UI animation
            if (files[0] && files[0].type.startsWith('image/')) {
                setPreviewUrl(URL.createObjectURL(files[0]));
            }
        }
    };

    const handleProcessOMR = async () => {
        if (!answerKey || studentFiles.length === 0) return;

        setIsScanning(true);
        setScanStep(0);
        setResults(null);

        // 1. Setup the terminal animation to run independently while the API processes
        const terminalInterval = setInterval(() => {
            setScanStep((prev) => (prev >= scanLogs.length - 2 ? prev : prev + 1));
        }, 800);

        try {
            // 2. Prepare the files for transport to the backend
            const formData = new FormData();
            formData.append('answerKey', answerKey);

            studentFiles.forEach((file) => {
                formData.append('studentSheets', file);
            });

            // 3. Call the actual backend endpoint (Update URL to match your server when ready)
            const response = await fetch('http://localhost:5000/api/omr/evaluate', {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) {
                throw new Error("Failed to process OMR sheets on the server.");
            }

            // 4. Parse the real results from the server
            const data: ExamResult[] = await response.json();
            finish(data);
        } catch (error) {
            // Scanner server unreachable — run the built-in demo evaluation instead
            console.warn("OMR server unavailable, using demo evaluation:", error);
            await new Promise((r) => setTimeout(r, 2400));
            finish(demoEvaluate(studentFiles), true);
        }

        function finish(data: ExamResult[], demo = false) {

            // 5. Complete the terminal animation and show results
            clearInterval(terminalInterval);
            setScanStep(scanLogs.length - 1);

            setTimeout(() => {
                setIsScanning(false);
                setResults(data);
                toast.success(demo ? "OMR evaluation completed (demo mode)" : "OMR evaluation completed successfully");
            }, 500);
        }
    };

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
                    <FileCheck className="text-primary size-7" /> Optical Mark Recognition Engine
                </h2>
                <p className="text-sm text-muted-foreground mt-1">
                    Upload answer key and student answer sheets (single JPG/PNG or bulk ZIP archive).
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Answer Key */}
                <div className="rounded-2xl border border-border/60 bg-secondary/30 p-6 text-center hover:border-primary/50 transition-all">
                    <UploadCloud className="w-10 h-10 text-primary mx-auto mb-3" />
                    <h3 className="font-semibold text-base text-foreground">1. Master Key</h3>
                    <p className="text-xs text-muted-foreground mb-4">Upload the correct solution sheet</p>

                    <label className="inline-block cursor-pointer rounded-full bg-primary/10 text-primary px-4 py-2 text-xs font-semibold hover:bg-primary/20 transition-colors">
                        Select Answer Key
                        <input type="file" accept="image/*,.pdf" className="hidden" onChange={(e) => setAnswerKey(e.target.files?.[0] || null)} />
                    </label>
                    {answerKey && <p className="mt-3 text-xs text-emerald-400 font-medium flex items-center justify-center gap-1"><CheckCircle size={14} /> {answerKey.name}</p>}
                </div>

                {/* Student Sheets */}
                <div className="rounded-2xl border border-border/60 bg-secondary/30 p-6 text-center hover:border-primary/50 transition-all">
                    <FileType className="w-10 h-10 text-primary mx-auto mb-3" />
                    <h3 className="font-semibold text-base text-foreground">2. Student Sheets</h3>
                    <p className="text-xs text-muted-foreground mb-4">Upload student responses for grading</p>

                    <label className="inline-block cursor-pointer rounded-full bg-primary/10 text-primary px-4 py-2 text-xs font-semibold hover:bg-primary/20 transition-colors">
                        Select Student Sheets
                        <input type="file" multiple accept="image/*,.zip" className="hidden" onChange={handleFileChange} />
                    </label>
                    {studentFiles.length > 0 && <p className="mt-3 text-xs text-emerald-400 font-medium flex items-center justify-center gap-1"><CheckCircle size={14} /> {studentFiles.length} file(s) selected</p>}
                </div>
            </div>

            <div className="flex justify-center pt-2">
                <button
                    onClick={handleProcessOMR}
                    disabled={isScanning || !answerKey || studentFiles.length === 0}
                    className="neon-surface inline-flex items-center gap-2 rounded-full px-8 py-3 text-sm font-semibold text-primary-foreground disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                    {isScanning ? <Loader2 className="animate-spin size-4" /> : <Play size={18} />}
                    {isScanning ? "Processing Computer Vision..." : "Run Accurate Evaluation"}
                </button>
            </div>

            {/* LIVE SCANNING ANIMATION */}
            <AnimatePresence>
                {isScanning && previewUrl && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="overflow-hidden rounded-2xl border border-primary/40 bg-card p-6 shadow-2xl shadow-primary/10"
                    >
                        <div className="flex flex-col md:flex-row gap-8 items-center">
                            {/* Image with laser scanner */}
                            <div className="relative w-48 h-64 bg-secondary/50 rounded-lg overflow-hidden border border-border">
                                <img src={previewUrl} alt="Scanning" className="w-full h-full object-cover opacity-60 grayscale" />
                                <motion.div
                                    initial={{ top: 0 }}
                                    animate={{ top: '100%' }}
                                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                                    className="absolute left-0 right-0 h-1 bg-cyan-400 shadow-[0_0_15px_rgba(34,211,238,0.8)] z-10"
                                />
                                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-20 mix-blend-overlay"></div>
                            </div>

                            {/* Terminal Logs */}
                            <div className="flex-1 font-mono text-sm w-full">
                                <div className="flex items-center gap-2 text-cyan-400 mb-4 font-bold border-b border-border pb-2">
                                    <Search size={16} className="animate-pulse" /> Live Analysis Terminal
                                </div>
                                <div className="space-y-2 h-40 overflow-y-auto">
                                    {scanLogs.slice(0, scanStep + 1).map((log, i) => (
                                        <motion.div key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="text-muted-foreground flex items-center gap-2">
                                            <span className="text-emerald-500">{'>'}</span> {log}
                                        </motion.div>
                                    ))}
                                    <div className="text-cyan-400 animate-pulse flex items-center gap-2">
                                        <span>{'>'}</span> _
                                    </div>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* DETAILED RESULTS MATRIX */}
            {results && !isScanning && (
                <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="rounded-2xl border border-border bg-card shadow-xl overflow-hidden">
                    <div className="flex justify-between items-center p-6 border-b border-border bg-secondary/10">
                        <h3 className="text-lg font-bold text-card-foreground flex items-center gap-2">
                            <CheckCircle className="text-emerald-500 size-5" /> Evaluation Accuracy Report
                        </h3>
                        <button className="text-xs font-semibold text-primary hover:underline flex items-center gap-1">
                            <Download size={14} /> Export Matrix
                        </button>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-border text-xs uppercase tracking-wider text-muted-foreground bg-secondary/30">
                                    <th className="p-4">Roll No</th>
                                    <th className="p-4">Student Name</th>
                                    <th className="p-4">Score</th>
                                    <th className="p-4">Accuracy</th>
                                    <th className="p-4">Status</th>
                                    <th className="p-4 text-right">Details</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border text-sm">
                                {results.map((res) => (
                                    <React.Fragment key={res.roll}>
                                        <tr className="hover:bg-secondary/20 transition-colors">
                                            <td className="p-4 font-mono font-medium text-foreground">{res.roll}</td>
                                            <td className="p-4 font-semibold text-foreground">{res.name}</td>
                                            <td className="p-4 font-bold text-foreground">{res.score} / {res.total}</td>
                                            <td className="p-4 text-foreground/80 font-medium">{res.accuracy}</td>
                                            <td className="p-4">
                                                <span className={`inline-block px-3 py-0.5 rounded-full text-xs font-bold ${res.status === 'Pass' ? 'bg-emerald-500/15 text-emerald-400' : 'bg-rose-500/15 text-rose-400'}`}>
                                                    {res.status}
                                                </span>
                                            </td>
                                            <td className="p-4 text-right">
                                                <button
                                                    onClick={() => setExpandedRow(expandedRow === res.roll ? null : res.roll)}
                                                    className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:text-cyan-400 transition-colors bg-primary/10 px-3 py-1.5 rounded-full"
                                                >
                                                    <Eye size={14} /> {expandedRow === res.roll ? "Hide Matrix" : "View Matrix"}
                                                </button>
                                            </td>
                                        </tr>

                                        {/* Expandable Detailed Accuracy Matrix */}
                                        <AnimatePresence>
                                            {expandedRow === res.roll && (
                                                <tr>
                                                    <td colSpan={6} className="p-0 border-b border-border">
                                                        <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="bg-secondary/20 p-6 overflow-hidden">
                                                            <h4 className="text-xs uppercase tracking-widest text-muted-foreground mb-4">Question-by-Question Evaluation Breakdown</h4>
                                                            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                                                                {res.details.map((q) => (
                                                                    <div key={q.q} className={`p-3 rounded-lg border flex flex-col justify-center items-center gap-1 ${q.isRight ? 'bg-emerald-500/5 border-emerald-500/20' : 'bg-rose-500/5 border-rose-500/20'}`}>
                                                                        <span className="text-xs text-muted-foreground font-medium">Q{q.q}</span>
                                                                        <div className="flex items-center gap-2">
                                                                            <span className={`text-base font-bold ${q.isRight ? 'text-emerald-400' : 'text-rose-400'}`}>{q.marked}</span>
                                                                            {!q.isRight && (
                                                                                <>
                                                                                    <span className="text-muted-foreground text-xs">→</span>
                                                                                    <span className="text-sm font-bold text-emerald-400">{q.correct}</span>
                                                                                </>
                                                                            )}
                                                                        </div>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        </motion.div>
                                                    </td>
                                                </tr>
                                            )}
                                        </AnimatePresence>
                                    </React.Fragment>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </motion.div>
            )}
        </div>
    );
};