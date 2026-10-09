import { query } from './client.js';
import type { Submission, Evaluation } from './types.js';

export async function createSubmission(
  attemptId: string,
  learnerId: string,
  patch: string,
  structuredAnswers: Record<string, unknown> = {},
  clientChecksum: string = ''
): Promise<Submission> {
  // Insert submission record
  const sql = `
    INSERT INTO submissions (attempt_id, learner_id, patch, structured_answers, client_checksum, status, submitted_at)
    VALUES ($1, $2, $3, $4::jsonb, $5, 'queued', NOW())
    RETURNING *
  `;
  const res = await query<Submission>(sql, [
    attemptId,
    learnerId,
    patch,
    JSON.stringify(structuredAnswers),
    clientChecksum,
  ]);
  const submission = res.rows[0];

  // Update attempt submissions_count and status
  await query(
    `UPDATE attempts
     SET submissions_count = submissions_count + 1,
         status = 'submitted',
         submitted_at = NOW()
     WHERE id = $1`,
    [attemptId]
  );

  return submission;
}

export async function getSubmissionById(id: string): Promise<Submission | null> {
  const sql = 'SELECT * FROM submissions WHERE id = $1';
  const res = await query<Submission>(sql, [id]);
  return res.rows[0] || null;
}

export async function getSubmissionWithEvaluation(
  id: string
): Promise<{ submission: Submission; evaluation: Evaluation | null } | null> {
  const subSql = 'SELECT * FROM submissions WHERE id = $1';
  const subRes = await query<Submission>(subSql, [id]);
  const submission = subRes.rows[0];
  if (!submission) {
    return null;
  }

  const evalSql = `
    SELECT * FROM evaluations 
    WHERE submission_id = $1 
    ORDER BY created_at DESC 
    LIMIT 1
  `;
  const evalRes = await query<Evaluation>(evalSql, [id]);
  const evaluation = evalRes.rows[0] || null;

  return { submission, evaluation };
}

export async function updateSubmissionStatus(
  id: string,
  status: Submission['status']
): Promise<Submission | null> {
  const sql = `
    UPDATE submissions
    SET status = $2
    WHERE id = $1
    RETURNING *
  `;
  const res = await query<Submission>(sql, [id, status]);
  return res.rows[0] || null;
}

export async function createEvaluation(
  submissionId: string,
  attemptId: string,
  data: {
    patchValid: boolean;
    publicTestsPassed: number;
    publicTestsTotal: number;
    hiddenTestsPassed: number;
    hiddenTestsTotal: number;
    benchmarksPassed?: boolean | null;
    structuredAnswersResult?: Record<string, unknown>;
    rubricResults?: Record<string, unknown> | null;
    passed: boolean;
    score: number;
  }
): Promise<Evaluation> {
  const sql = `
    INSERT INTO evaluations (
      submission_id,
      attempt_id,
      patch_valid,
      public_tests_passed,
      public_tests_total,
      hidden_tests_passed,
      hidden_tests_total,
      benchmarks_passed,
      structured_answers_result,
      rubric_results,
      passed,
      score,
      created_at
    )
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9::jsonb, $10::jsonb, $11, $12, NOW())
    RETURNING *
  `;
  const res = await query<Evaluation>(sql, [
    submissionId,
    attemptId,
    data.patchValid,
    data.publicTestsPassed,
    data.publicTestsTotal,
    data.hiddenTestsPassed,
    data.hiddenTestsTotal,
    data.benchmarksPassed ?? null,
    JSON.stringify(data.structuredAnswersResult ?? {}),
    data.rubricResults ? JSON.stringify(data.rubricResults) : null,
    data.passed,
    data.score,
  ]);
  return res.rows[0];
}
