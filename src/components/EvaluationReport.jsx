import React from 'react';

export default function EvaluationReport({ results, onOpenMatrix }) {
    if (!results || results.length === 0) {
        return null;
    }

    return (
        <div className="evaluation-report-container">
            <div className="report-header">
                <h2>Evaluation Accuracy Report</h2>
                <button className="export-btn">Export Matrix</button>
            </div>

            <table className="report-table">
                <thead>
                    <tr>
                        <th>ROLL NO</th>
                        <th>STUDENT NAME</th>
                        <th>SCORE</th>
                        <th>ACCURACY</th>
                        <th>STATUS</th>
                        <th>DETAILS</th>
                    </tr>
                </thead>
                <tbody>
                    {results.map((student, index) => {
                        // Guarantee a non-empty string for Roll No
                        const rollNoDisplay =
                            student.rollNo ||
                            student.rollNumber ||
                            student.roll_no ||
                            String(index + 1);

                        const studentNameDisplay = student.studentName || student.name || `Student ${index + 1}`;
                        const totalQuestions = student.totalQuestions || student.totalScore || student.total || 0;
                        const scoreDisplay = `${student.score} / ${totalQuestions}`;

                        return (
                            <tr key={index}>
                                {/* Cell 1: ROLL NO */}
                                <td>{rollNoDisplay}</td>

                                {/* Cell 2: STUDENT NAME */}
                                <td>{studentNameDisplay}</td>

                                {/* Cell 3: SCORE */}
                                <td><strong>{scoreDisplay}</strong></td>

                                {/* Cell 4: ACCURACY */}
                                <td>{student.accuracy}</td>

                                {/* Cell 5: STATUS */}
                                <td>
                                    <span className={`status-badge ${student.status?.toLowerCase()}`}>
                                        {student.status}
                                    </span>
                                </td>

                                {/* Cell 6: DETAILS */}
                                <td>
                                    <button
                                        className="view-matrix-btn"
                                        onClick={() => onOpenMatrix && onOpenMatrix(student)}
                                    >
                                        View Matrix
                                    </button>
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </div>
    );
}