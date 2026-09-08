import React, { useState } from 'react';
import { CheckCircle2, X, HelpCircle, Star, Sparkles, RotateCcw } from 'lucide-react';

/**
 * UnitQuiz — Interactive MCQ mini-quiz rendered inline in a unit tab.
 * Props:
 *   questions  {Array}    - [{ question, options: ['A','B','C','D'], correct: 0 }]
 *   onPass     {function} - called when user passes (>= 70%)
 *   unitTitle  {string}
 */
const UnitQuiz = ({
  questions = [],
  onPass,
  unitTitle = 'Unit',
  passingScore = 70,
  userScore = null,
  isCompleted = false
}) => {
  const [answers, setAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [currentQ, setCurrentQ] = useState(0);

  const defaultQuestions = questions && questions.length > 0 ? questions : [
    {
      question: `What is the primary objective of this unit on "${unitTitle}"?`,
      options: [
        'To memorize definitions without applying them',
        'To understand, apply, and build using the concepts learned',
        'To skip the exercises and move to the next lesson',
        'To watch the video without taking notes'
      ],
      correctIndex: 1,
      explanation: 'Hands-on practical implementation reinforces mastery and retention.'
    },
    {
      question: 'Which of the following best describes an effective technical learning methodology?',
      options: [
        'Reading only without practicing the material',
        'Watching videos and never executing the code',
        'Actively building projects and solving real-world exercises',
        'Only listening to lectures without note-taking'
      ],
      correctIndex: 2,
      explanation: 'Project-based application is the gold standard of real-world proficiency.'
    },
    {
      question: 'How should you approach challenging topics in this curriculum?',
      options: [
        'Skip the unit and hope it does not appear in evaluations',
        'Review the lecture notes, retry the exercises, and verify fundamentals',
        'Move to the next module without resolving confusion',
        'Immediately mark the unit complete without understanding it'
      ],
      correctIndex: 1,
      explanation: 'Iterative review and deliberate practice overcome conceptual bottlenecks.'
    }
  ];

  const q = defaultQuestions;
  const totalQ = q.length;

  const handleSelect = (optIdx) => {
    if (submitted) return;
    setAnswers(prev => ({ ...prev, [currentQ]: optIdx }));
  };

  const getIsCorrect = (quiz, idx) => {
    const expected = quiz.correctIndex !== undefined ? Number(quiz.correctIndex) : Number(quiz.correct);
    return Number(answers[idx]) === expected;
  };

  const handleSubmit = () => {
    if (Object.keys(answers).length < totalQ) return;
    setSubmitted(true);
    const correctCount = q.filter((quiz, i) => getIsCorrect(quiz, i)).length;
    const computedScore = Math.round((correctCount / totalQ) * 100);
    if (computedScore >= passingScore) {
      onPass?.({ exerciseAnswers: answers, score: computedScore });
    }
  };

  const handleReset = () => {
    setAnswers({});
    setSubmitted(false);
    setCurrentQ(0);
  };

  const score = submitted
    ? Math.round((q.filter((quiz, i) => getIsCorrect(quiz, i)).length / totalQ) * 100)
    : (userScore !== null ? userScore : 0);

  const passed = submitted ? score >= passingScore : (isCompleted || (userScore !== null && userScore >= passingScore));

  // Option letter labels
  const optLabels = ['A', 'B', 'C', 'D', 'E'];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '0.85rem',
        padding: '1.25rem 1.5rem',
        background: 'linear-gradient(135deg, rgba(56,189,248,0.12) 0%, rgba(99,102,241,0.08) 100%)',
        borderRadius: '14px',
        border: '1px solid rgba(56,189,248,0.25)'
      }}>
        <div style={{ width: 44, height: 44, borderRadius: '12px', background: 'linear-gradient(135deg, #38bdf8, #6366f1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <HelpCircle size={22} color="#fff" />
        </div>
        <div>
          <div style={{ fontWeight: 800, fontSize: '1rem', color: 'var(--text-main)' }}>Interactive Knowledge Check & Exercise</div>
          <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
            {submitted
              ? `Your Evaluation Score: ${score}% • ${passed ? 'PASSED ✓' : 'NEEDS RETRY'}`
              : (userScore !== null ? `Previous Score: ${userScore}% • ${totalQ} questions • Pass required: ${passingScore}%` : `${totalQ} questions • Passing Requirement: ${passingScore}%`)}
          </div>
        </div>
        {!submitted && (
          <div style={{ marginLeft: 'auto', display: 'flex', gap: '0.35rem' }}>
            {q.map((_, i) => (
              <div
                key={i}
                onClick={() => setCurrentQ(i)}
                style={{
                  width: 28, height: 28, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '0.75rem', fontWeight: 800, cursor: 'pointer',
                  background: currentQ === i ? '#38bdf8' : answers[i] !== undefined ? 'rgba(56,189,248,0.25)' : 'var(--bg-app)',
                  color: currentQ === i ? '#080c14' : answers[i] !== undefined ? '#38bdf8' : 'var(--text-muted)',
                  border: `2px solid ${currentQ === i ? '#38bdf8' : answers[i] !== undefined ? 'rgba(56,189,248,0.4)' : 'var(--border)'}`,
                  transition: 'all 0.2s ease'
                }}
              >
                {i + 1}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Results Screen */}
      {submitted ? (
        <div style={{ textAlign: 'center', padding: '2.5rem 1.5rem', background: passed ? 'rgba(16,185,129,0.06)' : 'rgba(239,68,68,0.06)', borderRadius: '14px', border: `1px solid ${passed ? 'rgba(16,185,129,0.2)' : 'rgba(239,68,68,0.2)'}` }}>
          <div style={{ fontSize: '4rem', marginBottom: '0.75rem' }}>{passed ? '🎉' : '📚'}</div>
          <div style={{ fontSize: '3rem', fontWeight: 900, color: passed ? '#10b981' : '#ef4444', lineHeight: 1, marginBottom: '0.5rem' }}>
            {score}%
          </div>
          <div style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '0.5rem' }}>
            {passed ? 'Excellent! Knowledge Check Passed' : 'Not quite — review the material and retry'}
          </div>
          <div style={{ fontSize: '0.88rem', color: 'var(--text-muted)', marginBottom: '2rem', lineHeight: 1.5 }}>
            {q.filter((quiz, i) => getIsCorrect(quiz, i)).length} of {totalQ} correct
          </div>

          {/* Answer Review */}
          <div style={{ textAlign: 'left', display: 'flex', flexDirection: 'column', gap: '0.85rem', marginBottom: '2rem' }}>
            {q.map((quiz, i) => {
              const isCorrect = getIsCorrect(quiz, i);
              const correctIdx = quiz.correctIndex !== undefined ? Number(quiz.correctIndex) : Number(quiz.correct);
              return (
                <div key={i} style={{ padding: '1rem 1.25rem', borderRadius: '10px', background: isCorrect ? 'rgba(16,185,129,0.08)' : 'rgba(239,68,68,0.08)', border: `1px solid ${isCorrect ? 'rgba(16,185,129,0.3)' : 'rgba(239,68,68,0.3)'}` }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem', marginBottom: '0.5rem' }}>
                    {isCorrect ? <CheckCircle2 size={16} color="#10b981" style={{ flexShrink: 0, marginTop: 2 }} /> : <X size={16} color="#ef4444" style={{ flexShrink: 0, marginTop: 2 }} />}
                    <span style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--text-main)' }}>Q{i + 1}: {quiz.question}</span>
                  </div>
                  {!isCorrect && (
                    <div style={{ fontSize: '0.82rem', color: '#10b981', marginLeft: '1.5rem', fontWeight: 600 }}>
                      ✓ Correct answer: {optLabels[correctIdx]}. {quiz.options?.[correctIdx]}
                    </div>
                  )}
                  {quiz.explanation && (
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginLeft: '1.5rem', marginTop: '0.35rem', fontStyle: 'italic' }}>
                      ℹ️ {quiz.explanation}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <button
              onClick={handleReset}
              style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', padding: '0.65rem 1.5rem', borderRadius: '10px', background: 'var(--bg-surface)', border: '1px solid var(--border)', color: 'var(--text-main)', fontWeight: 700, cursor: 'pointer', fontSize: '0.9rem' }}
            >
              <RotateCcw size={15} />
              <span>Retry Quiz</span>
            </button>
            {passed && (
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', padding: '0.65rem 1.5rem', borderRadius: '10px', background: 'linear-gradient(135deg, #10b981, #059669)', color: '#fff', fontWeight: 800, fontSize: '0.9rem' }}>
                <Sparkles size={15} />
                <span>Continue to Next Unit</span>
              </div>
            )}
          </div>
        </div>
      ) : (
        /* Active Question */
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ background: 'var(--bg-surface)', borderRadius: '14px', padding: '1.5rem', border: '1px solid var(--border)' }}>
            <div style={{ fontSize: '0.78rem', fontWeight: 800, color: '#6366f1', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.65rem' }}>
              Question {currentQ + 1} of {totalQ}
            </div>
            <p style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-main)', margin: 0, lineHeight: 1.55 }}>
              {q[currentQ].question}
            </p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
            {q[currentQ].options.map((opt, optIdx) => {
              const selected = answers[currentQ] === optIdx;
              return (
                <button
                  key={optIdx}
                  onClick={() => handleSelect(optIdx)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '0.85rem',
                    padding: '0.9rem 1.25rem', borderRadius: '12px', border: 'none',
                    background: selected ? 'rgba(99,102,241,0.12)' : 'var(--bg-surface)',
                    border: `2px solid ${selected ? '#6366f1' : 'var(--border)'}`,
                    cursor: 'pointer', textAlign: 'left', transition: 'all 0.18s ease',
                    transform: selected ? 'scale(1.01)' : 'scale(1)'
                  }}
                >
                  <div style={{
                    width: 32, height: 32, borderRadius: '50%', flexShrink: 0,
                    background: selected ? '#6366f1' : 'var(--bg-app)',
                    border: `2px solid ${selected ? '#6366f1' : 'var(--border)'}`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontWeight: 800, fontSize: '0.82rem',
                    color: selected ? '#fff' : 'var(--text-muted)',
                    transition: 'all 0.18s ease'
                  }}>
                    {optLabels[optIdx]}
                  </div>
                  <span style={{ fontSize: '0.95rem', color: selected ? '#818cf8' : 'var(--text-main)', fontWeight: selected ? 700 : 500, lineHeight: 1.4 }}>
                    {opt}
                  </span>
                  {selected && <CheckCircle2 size={18} color="#6366f1" style={{ marginLeft: 'auto', flexShrink: 0 }} />}
                </button>
              );
            })}
          </div>

          {/* Navigation */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '0.5rem' }}>
            <button
              onClick={() => setCurrentQ(q => Math.max(0, q - 1))}
              disabled={currentQ === 0}
              style={{ padding: '0.5rem 1.1rem', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--bg-surface)', color: 'var(--text-muted)', fontWeight: 700, cursor: currentQ === 0 ? 'not-allowed' : 'pointer', fontSize: '0.85rem', opacity: currentQ === 0 ? 0.4 : 1 }}
            >
              ← Previous
            </button>

            {currentQ < totalQ - 1 ? (
              <button
                onClick={() => setCurrentQ(q => q + 1)}
                disabled={answers[currentQ] === undefined}
                style={{ padding: '0.5rem 1.25rem', borderRadius: '8px', border: 'none', background: answers[currentQ] !== undefined ? '#6366f1' : 'var(--border)', color: '#fff', fontWeight: 700, cursor: answers[currentQ] !== undefined ? 'pointer' : 'not-allowed', fontSize: '0.85rem', opacity: answers[currentQ] !== undefined ? 1 : 0.5, transition: 'all 0.18s ease' }}
              >
                Next →
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={Object.keys(answers).length < totalQ}
                style={{ padding: '0.55rem 1.5rem', borderRadius: '8px', border: 'none', background: Object.keys(answers).length >= totalQ ? 'linear-gradient(135deg, #6366f1, #8b5cf6)' : 'var(--border)', color: '#fff', fontWeight: 800, cursor: Object.keys(answers).length >= totalQ ? 'pointer' : 'not-allowed', fontSize: '0.9rem', display: 'inline-flex', alignItems: 'center', gap: '0.4rem', opacity: Object.keys(answers).length >= totalQ ? 1 : 0.5, boxShadow: Object.keys(answers).length >= totalQ ? '0 4px 14px rgba(99,102,241,0.4)' : 'none', transition: 'all 0.2s ease' }}
              >
                <Star size={15} />
                <span>Submit Quiz</span>
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default UnitQuiz;
