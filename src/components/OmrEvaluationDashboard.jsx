import React, { useState, useRef } from "react";

export default function OmrEvaluationDashboard() {
    const [masterKeyFile, setMasterKeyFile] = useState(null);
    const [studentFiles, setStudentFiles] = useState([]);
    const [loading, setLoading] = useState(false);
    const [results, setResults] = useState([]);
    const [expandedRows, setExpandedRows] = useState({});
    const [errorMessage, setErrorMessage] = useState("");

    const masterInputRef = useRef(null);
    const studentInputRef = useRef(null);

    // 1. Handle File Selections
    const handleMasterKeyChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            setMasterKeyFile(e.target.files[0]);
            setErrorMessage("");
        }
    };

    const handleStudentSheetsChange = (e) => {
        if (e.target.files && e.target.files.length > 0) {
            setStudentFiles(Array.from(e.target.files));
            setErrorMessage("");
        }
    };

    // 2. Toggle View/Hide Matrix for Question Breakdown
    const toggleMatrix = (rollNumber) => {
        setExpandedRows((prev) => ({
            ...prev,
            [rollNumber]: !prev[rollNumber],
        }));
    };

    // 3. Detailed Browser Console Debug Logging Helper
    const logEvaluationDebugToConsole = (data) => {
        console.group(
            "%c OMR Evaluation Console Log Debugger",
            "color: #00f2fe; font-size: 14px; font-weight: bold; background: #0f172a; padding: 4px 8px; border-radius: 4px;"
        );

        if (!data || !data.results) {
            console.error("No valid evaluation results returned:", data);
            console.groupEnd();
            return;
        }

        data.results.forEach((student) => {
            console.groupCollapsed(
                `%c ${student.studentName || student.name} (Roll: ${student.rollNumber}) — Score: ${student.score}/${student.totalScore} (${student.accuracy}) [${student.status}]`,
                student.status === "Pass" ? "color: #10b981; font-weight: bold;" : "color: #f43f5e; font-weight: bold;"
            );

            const tableData = (student.details || []).map((q) => ({
                "Question #": `Q${q.questionNumber || q.qNum || q.id}`,
                "Marked (Student)": q.markedAnswer || q.marked || "Unmarked",
                "Correct (Master)": q.correctAnswer || q.correct || "N/A",
                "Match Result": q.isCorrect ? "MATCH" : "MISMATCH",
            }));

            console.table(tableData);
            console.groupEnd();
        });

        console.groupEnd();
    };

    // 4. Submit to Backend API
    const handleRunEvaluation = async () => {
        if (!masterKeyFile) {
            setErrorMessage("Please select a Master Answer Key image first.");
            return;
        }
        if (studentFiles.length === 0) {
            setErrorMessage("Please select at least one Student Answer Sheet.");
            return;
        }

        setLoading(true);
        setErrorMessage("");

        try {
            const formData = new FormData();
            formData.append("answerKey", masterKeyFile);
            studentFiles.forEach((file) => {
                formData.append("studentSheets", file);
            });

            // Update URL if your backend endpoint path differs (e.g., http://localhost:5000/api/omr/evaluate)
            const response = await fetch("/api/omr/evaluate", {
                method: "POST",
                body: formData,
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.errorMessage || `Server returned error status ${response.status}`);
            }

            const data = await response.json();

            if (data.success && data.results) {
                setResults(data.results);
                logEvaluationDebugToConsole(data);
            } else {
                setErrorMessage(data.errorMessage || "Evaluation failed. Please check image formats.");
            }
        } catch (err) {
            console.error("Evaluation API Error:", err);
            setErrorMessage(err.message || "Failed to connect to backend evaluation server.");
        } finally {
            setLoading(false);
        }
    };

    // 5. CSV Export Helper
    const handleExportCSV = () => {
        if (results.length === 0) return;

        let csvContent = "data:text/csv;charset=utf-8,Roll No,Student Name,Score,Total,Accuracy,Status\n";
        results.forEach((row) => {
            csvContent += `${row.rollNumber},"${row.studentName}",${row.score},${row.totalScore},${row.accuracy},${row.status}\n`;
        });

        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `OMR_Evaluation_Report_${Date.now()}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div className="min-h-screen bg-[#070b14] text-slate-100 p-6 font-sans">
            <div className="max-w-6xl mx-auto space-y-6">

                {/* Helper Note */}
                <p className="text-slate-400 text-xs text-center">
                    Upload answer key and student answer sheets (single JPG/PNG or multiple selection).
                </p>

                {/* Upload Cards Section */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                    {/* Master Key Card */}
                    <div className="bg-[#0f172a] border border-slate-800 rounded-xl p-8 text-center flex flex-col items-center justify-center space-y-4 shadow-lg">
                        <div className="w-12 h-12 rounded-full bg-cyan-950/60 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                            </svg>
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-slate-100">1. Master Key</h3>
                            <p className="text-xs text-slate-400 mt-1">Upload the correct solution sheet</p>
                        </div>

                        <input
                            type="file"
                            ref={masterInputRef}
                            onChange={handleMasterKeyChange}
                            accept="image/*"
                            className="hidden"
                        />

                        <button
                            onClick={() => masterInputRef.current?.click()}
                            className="bg-cyan-900/40 border border-cyan-500/40 text-cyan-300 hover:bg-cyan-800/50 px-5 py-2 rounded-lg text-sm font-medium transition"
                        >
                            Select Answer Key
                        </button>

                        {masterKeyFile && (
                            <div className="text-emerald-400 text-xs flex items-center gap-1 font-medium">
                                <span>✓</span> {masterKeyFile.name}
                            </div>
                        )}
                    </div>

                    {/* Student Sheets Card */}
                    <div className="bg-[#0f172a] border border-slate-800 rounded-xl p-8 text-center flex flex-col items-center justify-center space-y-4 shadow-lg">
                        <div className="w-12 h-12 rounded-full bg-cyan-950/60 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-slate-100">2. Student Sheets</h3>
                            <p className="text-xs text-slate-400 mt-1">Upload student responses for grading</p>
                        </div>

                        <input
                            type="file"
                            ref={studentInputRef}
                            onChange={handleStudentSheetsChange}
                            accept="image/*"
                            multiple
                            className="hidden"
                        />

                        <button
                            onClick={() => studentInputRef.current?.click()}
                            className="bg-cyan-900/40 border border-cyan-500/40 text-cyan-300 hover:bg-cyan-800/50 px-5 py-2 rounded-lg text-sm font-medium transition"
                        >
                            Select Student Sheets
                        </button>

                        {studentFiles.length > 0 && (
                            <div className="text-emerald-400 text-xs flex items-center gap-1 font-medium">
                                <span>✓</span> {studentFiles.length} file(s) selected
                            </div>
                        )}
                    </div>

                </div>

                {/* Run Evaluation Action Button */}
                <div className="flex flex-col items-center justify-center pt-2">
                    {errorMessage && (
                        <div className="mb-3 text-rose-400 text-xs bg-rose-950/50 border border-rose-800/60 px-4 py-2 rounded-md">
                            {errorMessage}
                        </div>
                    )}

                    <button
                        onClick={handleRunEvaluation}
                        disabled={loading}
                        className="bg-gradient-to-r from-cyan-400 via-purple-400 to-amber-300 text-slate-950 font-bold px-8 py-3 rounded-full text-sm shadow-md hover:opacity-90 transition disabled:opacity-50 flex items-center gap-2"
                    >
                        {loading ? (
                            <>
                                <svg className="animate-spin h-4 w-4 text-slate-950" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                </svg>
                                Evaluating Sheets...
                            </>
                        ) : (
                            <>
                                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                                    <path d="M8 5v14l11-7z" />
                                </svg>
                                Run Accurate Evaluation
                            </>
                        )}
                    </button>
                </div>

                {/* Evaluation Accuracy Report Card */}
                <div className="bg-[#0f172a] border border-slate-800 rounded-xl overflow-hidden shadow-xl">

                    {/* Card Header */}
                    <div className="p-5 border-b border-slate-800 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <div className="w-5 h-5 rounded-full bg-emerald-950 border border-emerald-500 flex items-center justify-center text-emerald-400 text-xs font-bold">
                                ✓
                            </div>
                            <h2 className="text-base font-bold text-slate-100">Evaluation Accuracy Report</h2>
                        </div>

                        <button
                            onClick={handleExportCSV}
                            disabled={results.length === 0}
                            className="text-cyan-400 hover:text-cyan-300 text-xs font-medium flex items-center gap-1 border border-cyan-500/30 hover:bg-cyan-950/40 px-3 py-1.5 rounded transition disabled:opacity-40"
                        >
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                            </svg>
                            Export Matrix
                        </button>
                    </div>

                    {/* Report Data Table */}
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-slate-800/80 text-[11px] font-semibold text-slate-400 uppercase tracking-wider bg-[#0a0f1d]">
                                    <th className="py-3 px-6">ROLL NO</th>
                                    <th className="py-3 px-6">STUDENT NAME</th>
                                    <th className="py-3 px-6">SCORE</th>
                                    <th className="py-3 px-6">ACCURACY</th>
                                    <th className="py-3 px-6">STATUS</th>
                                    <th className="py-3 px-6 text-right">DETAILS</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-800/60 text-sm">
                                {results.length === 0 ? (
                                    <tr>
                                        <td colSpan="6" className="py-12 text-center text-slate-500 text-xs">
                                            No evaluation results to display yet. Upload key and student sheets, then click "Run Accurate Evaluation".
                                        </td>
                                    </tr>
                                ) : (
                                    results.map((row) => {
                                        const roll = row.rollNumber || row.rollNo;
                                        const isExpanded = !!expandedRows[roll];
                                        const isPass = row.status === "Pass";

                                        return (
                                            <React.Fragment key={roll}>
                                                <tr className="hover:bg-slate-800/30 transition">
                                                    <td className="py-4 px-6 text-slate-300 font-mono text-xs">{roll}</td>
                                                    <td className="py-4 px-6 font-semibold text-slate-200">{row.studentName || row.name}</td>
                                                    <td className="py-4 px-6 font-bold text-slate-100">
                                                        {row.score} / {row.totalScore || row.maxScore || row.total}
                                                    </td>
                                                    <td className="py-4 px-6 text-slate-300 font-medium">{row.accuracy}</td>
                                                    <td className="py-4 px-6">
                                                        <span
                                                            className={`px-3 py-1 rounded-full text-xs font-semibold inline-block ${isPass
                                                                ? "bg-emerald-950/80 text-emerald-400 border border-emerald-800/60"
                                                                : "bg-rose-950/80 text-rose-400 border border-rose-800/60"
                                                                }`}
                                                        >
                                                            {row.status}
                                                        </span>
                                                    </td>
                                                    <td className="py-4 px-6 text-right">
                                                        <button
                                                            onClick={() => toggleMatrix(roll)}
                                                            className="text-xs text-cyan-400 border border-cyan-500/30 hover:bg-cyan-950/50 px-3 py-1.5 rounded-full inline-flex items-center gap-1.5 transition"
                                                        >
                                                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                                            </svg>
                                                            {isExpanded ? "Hide Matrix" : "View Matrix"}
                                                        </button>
                                                    </td>
                                                </tr>

                                                {/* Collapsible Matrix Breakdown Row */}
                                                {isExpanded && (
                                                    <tr className="bg-[#0b101e]">
                                                        <td colSpan="6" className="p-6 border-t border-b border-slate-800/80">
                                                            <h4 className="text-xs font-bold text-slate-400 tracking-wider uppercase mb-4">
                                                                Question-by-Question Evaluation Breakdown
                                                            </h4>

                                                            {row.details && row.details.length > 0 ? (
                                                                <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-3">
                                                                    {row.details.map((q, idx) => {
                                                                        const qNum = q.questionNumber || q.qNum || idx + 1;
                                                                        const marked = q.markedAnswer || q.marked || "Unmarked";
                                                                        const correct = q.correctAnswer || q.correct || "N/A";
                                                                        const matched = q.isCorrect;

                                                                        return (
                                                                            <div
                                                                                key={qNum}
                                                                                className={`p-3 rounded-lg border text-center flex flex-col justify-between ${matched
                                                                                    ? "bg-slate-900/60 border-rose-900/40 text-slate-200"
                                                                                    : "bg-slate-900/60 border-rose-900/60 text-slate-200"
                                                                                    }`}
                                                                            >
                                                                                <div className="text-[11px] font-bold text-slate-400">
                                                                                    Q{qNum}
                                                                                </div>
                                                                                <div className="mt-2 text-xs flex items-center justify-center gap-2 font-mono">
                                                                                    <span className={matched ? "text-emerald-400 font-bold" : "text-rose-400 font-bold"}>
                                                                                        {marked}
                                                                                    </span>
                                                                                    <span className="text-slate-600">→</span>
                                                                                    <span className="text-slate-300 font-bold">
                                                                                        {correct}
                                                                                    </span>
                                                                                </div>
                                                                            </div>
                                                                        );
                                                                    })}
                                                                </div>
                                                            ) : (
                                                                <p className="text-xs text-slate-500">No question breakdown detail available for this student.</p>
                                                            )}
                                                        </td>
                                                    </tr>
                                                )}
                                            </React.Fragment>
                                        );
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>

                </div>

            </div>
        </div>
    );
}