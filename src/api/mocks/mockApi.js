/**
 * Exam Hub — Mock API (JavaScript)
 * -------------------------------------------------------------------------
 * Simule les routes du contrat /api/* imposées en Section 5 du sujet.
 *
 * But : permettre au frontend de développer sans attendre le vrai backend.
 * Le jour où le backend est prêt, il suffit de remplacer chaque fonction
 * appelante (dans src/api/*.api.js) par un vrai fetch, sans toucher aux
 * composants qui les utilisent.
 *
 * Toutes les fonctions sont async et lancent une ApiError (avec .status et
 * .message, cf RG-13) pour simuler fidèlement les cas d'erreur du backend.
 * -------------------------------------------------------------------------
 */

// ----------------------------- Erreur API ----------------------------------

export class ApiError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
    this.name = "ApiError";
  }
}

// ----------------------------- Latence simulée ------------------------------

const delay = (ms = 300) => new Promise((r) => setTimeout(r, ms));

// ----------------------------- Données en mémoire ----------------------------

let students = [
  { id: 1, name: "Jean Rakoto", email: "jean.rakoto@examhub.io", isActive: true, createdAt: "2026-08-01T09:00:00Z" },
  { id: 2, name: "Marie Andria", email: "marie.andria@examhub.io", isActive: true, createdAt: "2026-08-02T09:00:00Z" },
  { id: 3, name: "Paul Randria", email: "paul.randria@examhub.io", isActive: false, createdAt: "2026-08-03T09:00:00Z" },
];

let courses = [
  { id: 1, code: "PROG2", name: "Programmation avancée", description: "Structures de données et algorithmes." },
  { id: 2, code: "BDD1", name: "Bases de données", description: "Modélisation relationnelle et SQL." },
];

let exams = [
  {
    id: 10,
    courseId: 1,
    courseName: "Programmation avancée",
    title: "Contrôle final",
    description: "QCM sur les 6 derniers chapitres.",
    startsAt: "2026-08-20T08:00:00Z",
    endsAt: "2026-12-01T10:00:00Z", // fenêtre volontairement large pour tester facilement en dev
  },
  {
    id: 11,
    courseId: 2,
    courseName: "Bases de données",
    title: "Contrôle intermédiaire",
    description: "Normalisation et jointures.",
    startsAt: "2025-01-01T08:00:00Z",
    endsAt: "2025-01-01T10:00:00Z", // fenêtre déjà fermée, utile pour tester le cas RG-03
  },
];

let questions = {
  10: [
    {
      id: 100,
      examId: 10,
      text: "Quelle est la complexité de la recherche binaire ?",
      points: 2,
      choices: [
        { id: 1000, text: "O(n)", correct: false },
        { id: 1001, text: "O(log n)", correct: true },
        { id: 1002, text: "O(n²)", correct: false },
      ],
    },
    {
      id: 101,
      examId: 10,
      text: "Quelle structure utilise le principe LIFO ?",
      points: 3,
      choices: [
        { id: 1003, text: "File (queue)", correct: false },
        { id: 1004, text: "Pile (stack)", correct: true },
        { id: 1005, text: "Arbre binaire", correct: false },
        { id: 1006, text: "Liste chaînée", correct: false },
      ],
    },
  ],
  11: [],
};

// tentatives déjà soumises (pour tester "déjà passé" et l'historique)
let attempts = {};
let nextAttemptId = 500;

// utilisateur courant simulé (changez via setMockRole pour tester les deux rôles)
let currentUser = { id: 1, name: "Alice Admin", email: "admin@examhub.io", role: "admin" };

// ----------------------------- Helpers internes ------------------------------

function requireRole(role) {
  if (currentUser.role !== role) {
    throw new ApiError(403, "Accès refusé : rôle insuffisant.");
  }
}

function findOr404(arr, predicate, message) {
  const found = arr.find(predicate);
  if (!found) throw new ApiError(404, message);
  return found;
}

function randomPassword() {
  return Math.random().toString(36).slice(-8);
}

function validateChoices(choices) {
  if (choices.length < 2 || choices.length > 6) {
    throw new ApiError(400, "Une question doit avoir entre 2 et 6 choix.");
  }
  const correctCount = choices.filter((c) => c.correct).length;
  if (correctCount !== 1) {
    throw new ApiError(400, "Une question doit avoir exactement un choix correct.");
  }
}

function isExamLocked(examId) {
  return Object.values(attempts).some((a) => a.examId === examId);
}

// =============================================================================
//  API — les noms de méthodes suivent le contrat officiel (section 5 du sujet)
// =============================================================================

export const mockApi = {
  // -------------------- POST /api/auth/login (public) --------------------

  async login(email, password) {
    await delay();
    if (email === "inactive@examhub.io") {
      throw new ApiError(403, "Ce compte a été désactivé.");
    }
    if (!email || !password) {
      throw new ApiError(401, "Identifiants invalides.");
    }
    const user = email.includes("admin")
      ? { id: 1, name: "Alice Admin", email, role: "admin" }
      : { id: 1, name: "Jean Rakoto", email, role: "student" };
    currentUser = user;
    return { token: "mock-jwt-token." + btoa(email), user };
  },

  /** Utilitaire dev uniquement : change le rôle simulé sans repasser par login. */
  setMockRole(role) {
    currentUser =
      role === "admin"
        ? { id: 1, name: "Alice Admin", email: "admin@examhub.io", role: "admin" }
        : { id: 1, name: "Jean Rakoto", email: "jean.rakoto@examhub.io", role: "student" };
  },

  // -------------------- GET/POST /api/students (admin) --------------------

  async getStudents() {
    await delay();
    requireRole("admin");
    return [...students];
  },

  async createStudent(data) {
    await delay();
    requireRole("admin");
    if (!data.name || !data.email) throw new ApiError(400, "Nom et email requis.");
    if (students.some((s) => s.email === data.email)) throw new ApiError(400, "Cet email est déjà utilisé.");
    const student = {
      id: Math.max(0, ...students.map((s) => s.id)) + 1,
      name: data.name,
      email: data.email,
      isActive: true,
      createdAt: new Date().toISOString(),
    };
    students.push(student);
    return { ...student, initialPassword: randomPassword() };
  },

  // -------------------- PUT /api/students/:id (modif identité uniquement) --------------------
  async updateStudent(id, data) {
    await delay();
    requireRole("admin");
    const student = findOr404(students, (s) => s.id === id, "Étudiant introuvable.");
    if (data.name !== undefined) student.name = data.name;
    if (data.email !== undefined) student.email = data.email;
    return student;
  },

  // -------------------- POST /api/students/:id/reset-password (extension documentée) ------
  // Route séparée : action avec effet de bord (génère un mot de passe), pas une simple
  // mise à jour de champ — décision actée avec l'équipe backend, cf exam-hub-api-contract.md
  async resetStudentPassword(id) {
    await delay();
    requireRole("admin");
    const student = findOr404(students, (s) => s.id === id, "Étudiant introuvable.");
    return { ...student, initialPassword: randomPassword() };
  },

  // -------------------- DELETE /api/students/:id (= désactivation, RG-10) ------------

  async deleteStudent(id) {
    await delay();
    requireRole("admin");
    const student = findOr404(students, (s) => s.id === id, "Étudiant introuvable.");
    student.isActive = false;
    return student;
  },

  // -------------------- GET/POST /api/courses (admin) --------------------

  async getCourses() {
    await delay();
    requireRole("admin");
    return [...courses];
  },

  async createCourse(data) {
    await delay();
    requireRole("admin");
    if (courses.some((c) => c.code === data.code)) throw new ApiError(400, "Ce code cours existe déjà.");
    const course = { id: Math.max(0, ...courses.map((c) => c.id)) + 1, ...data };
    courses.push(course);
    return course;
  },

  async updateCourse(id, data) {
    await delay();
    requireRole("admin");
    const course = findOr404(courses, (c) => c.id === id, "Cours introuvable.");
    Object.assign(course, data);
    return course;
  },

  async deleteCourse(id) {
    await delay();
    requireRole("admin");
    findOr404(courses, (c) => c.id === id, "Cours introuvable.");
    if (exams.some((e) => e.courseId === id)) {
      throw new ApiError(409, "Impossible de supprimer un cours qui possède des examens.");
    }
    courses = courses.filter((c) => c.id !== id);
    return { id, deleted: true };
  },

  // -------------------- GET/POST /api/exams, GET/PUT/DELETE /api/exams/:id (admin) ----

  async getExams(courseId) {
    await delay();
    requireRole("admin");
    return courseId ? exams.filter((e) => e.courseId === courseId) : [...exams];
  },

  async getExam(id) {
    await delay();
    requireRole("admin");
    return findOr404(exams, (e) => e.id === id, "Examen introuvable.");
  },

  async createExam(data) {
    await delay();
    requireRole("admin");
    if (new Date(data.endsAt) <= new Date(data.startsAt)) {
      throw new ApiError(400, "La date de fin doit être après la date de début.");
    }
    const exam = { id: Math.max(0, ...exams.map((e) => e.id)) + 1, ...data };
    exams.push(exam);
    questions[exam.id] = [];
    return exam;
  },

  async updateExam(id, data) {
    await delay();
    requireRole("admin");
    const exam = findOr404(exams, (e) => e.id === id, "Examen introuvable.");
    Object.assign(exam, data);
    return exam;
  },

  async deleteExam(id) {
    await delay();
    requireRole("admin");
    findOr404(exams, (e) => e.id === id, "Examen introuvable.");
    const hasAttempts = Object.values(attempts).some((a) => a.examId === id);
    if (hasAttempts) throw new ApiError(409, "Impossible de supprimer un examen qui a des tentatives.");
    exams = exams.filter((e) => e.id !== id);
    delete questions[id];
    return { id, deleted: true };
  },

  // -------------------- GET/POST /api/exams/:id/questions, PUT/DELETE /api/questions/:id --

  async getQuestions(examId) {
    await delay();
    requireRole("admin");
    return questions[examId] ?? [];
  },

  async createQuestion(examId, data) {
    await delay();
    requireRole("admin");
    findOr404(exams, (e) => e.id === examId, "Examen introuvable.");
    validateChoices(data.choices);
    if (isExamLocked(examId)) throw new ApiError(403, "Impossible d'ajouter une question : l'examen a déjà des tentatives.");
    const question = {
      id: Math.floor(Math.random() * 100000),
      examId,
      text: data.text,
      points: data.points,
      choices: data.choices.map((c) => ({ id: Math.floor(Math.random() * 100000), ...c })),
    };
    questions[examId] = [...(questions[examId] ?? []), question];
    return question;
  },

  async updateQuestion(id, data) {
    await delay();
    requireRole("admin");
    const allQuestions = Object.values(questions).flat();
    const question = findOr404(allQuestions, (q) => q.id === id, "Question introuvable.");
    if (isExamLocked(question.examId)) throw new ApiError(403, "Question verrouillée : l'examen a déjà des tentatives.");
    if (data.choices) {
      validateChoices(data.choices);
      question.choices = data.choices.map((c) => ({ id: Math.floor(Math.random() * 100000), ...c }));
    }
    if (data.text) question.text = data.text;
    if (data.points !== undefined) question.points = data.points;
    return question;
  },

  async deleteQuestion(id) {
    await delay();
    requireRole("admin");
    const examId = Object.keys(questions).find((eid) => questions[Number(eid)].some((q) => q.id === id));
    if (!examId) throw new ApiError(404, "Question introuvable.");
    if (isExamLocked(Number(examId))) throw new ApiError(403, "Question verrouillée : l'examen a déjà des tentatives.");
    questions[Number(examId)] = questions[Number(examId)].filter((q) => q.id !== id);
    return { id, deleted: true };
  },

  // -------------------- GET /api/exams/:id/results (admin) --------------------

  async getExamResults(examId) {
    await delay();
    requireRole("admin");
    const exam = findOr404(exams, (e) => e.id === examId, "Examen introuvable.");
    const totalPoints = (questions[examId] ?? []).reduce((sum, q) => sum + q.points, 0);
    const relevant = Object.values(attempts).filter((a) => a.examId === examId);
    const results = relevant.map((a) => ({
      studentId: a.studentId,
      studentName: students.find((s) => s.id === a.studentId)?.name ?? "?",
      attemptId: a.attemptId,
      score: a.score,
      submittedAt: a.submittedAt,
      attemptsCount: 1,
    }));
    const average = results.length
      ? Math.round((results.reduce((s, r) => s + r.score, 0) / results.length) * 10) / 10
      : 0;
    return { examId, examTitle: exam.title, totalPoints, average, results };
  },

  // -------------------- GET /api/my/exams (étudiant) --------------------

  async getMyExams() {
    await delay();
    requireRole("student");
    const now = new Date();
    const passedExamIds = new Set(
      Object.values(attempts)
        .filter((a) => a.studentId === currentUser.id)
        .map((a) => a.examId)
    );
    return exams.filter(
      (e) => new Date(e.startsAt) <= now && now <= new Date(e.endsAt) && !passedExamIds.has(e.id)
    );
  },

  // -------------------- GET /api/my/exams/:id (étudiant) --------------------

  async getMyExam(id) {
    await delay();
    requireRole("student");
    const exam = findOr404(exams, (e) => e.id === id, "Examen introuvable.");
    const now = new Date();
    if (now < new Date(exam.startsAt) || now > new Date(exam.endsAt)) {
      throw new ApiError(403, "Cet examen n'est pas disponible actuellement.");
    }
    const already = Object.values(attempts).some((a) => a.examId === id && a.studentId === currentUser.id);
    if (already) throw new ApiError(409, "Vous avez déjà passé cet examen.");

    const qs = (questions[id] ?? []).map((q) => ({
      id: q.id,
      text: q.text,
      points: q.points,
      choices: q.choices.map((c) => ({ id: c.id, text: c.text })), // jamais "correct" (RG-07)
    }));
    return { ...exam, questions: qs };
  },

  // -------------------- POST /api/my/exams/:id/submit (étudiant) --------------------

  async submitExam(examId, body) {
    await delay();
    requireRole("student");
    const exam = findOr404(exams, (e) => e.id === examId, "Examen introuvable.");
    const now = new Date();
    if (now < new Date(exam.startsAt) || now > new Date(exam.endsAt)) {
      throw new ApiError(403, "Cet examen n'est pas disponible actuellement.");
    }
    const already = Object.values(attempts).some((a) => a.examId === examId && a.studentId === currentUser.id);
    if (already) throw new ApiError(409, "Vous avez déjà passé cet examen.");

    const examQuestions = questions[examId] ?? [];
    let score = 0;
    const totalPoints = examQuestions.reduce((s, q) => s + q.points, 0);

    const answers = examQuestions.map((q) => {
      const submitted = body.answers.find((a) => a.questionId === q.id);
      const correctChoice = q.choices.find((c) => c.correct);
      const isCorrect = submitted?.choiceId === correctChoice.id;
      if (isCorrect) score += q.points;
      return {
        questionId: q.id,
        questionText: q.text,
        points: q.points,
        choiceId: submitted?.choiceId ?? null,
        correctChoiceId: correctChoice.id,
        isCorrect,
        choices: q.choices,
      };
    });

    const attemptId = nextAttemptId++;
    const result = {
      attemptId,
      examId,
      examTitle: exam.title,
      studentId: currentUser.id,
      score,
      totalPoints,
      submittedAt: new Date().toISOString(),
      answers,
    };
    attempts[attemptId] = result;
    return result;
  },

  // -------------------- GET /api/my/results (étudiant) --------------------

  async getMyResults() {
    await delay();
    requireRole("student");
    return Object.values(attempts)
      .filter((a) => a.studentId === currentUser.id)
      .map((a) => ({
        attemptId: a.attemptId,
        examId: a.examId,
        examTitle: a.examTitle,
        courseName: exams.find((e) => e.id === a.examId)?.courseName ?? "",
        score: a.score,
        totalPoints: a.totalPoints,
        submittedAt: a.submittedAt,
      }));
  },

  // -------------------- GET /api/my/results/:attemptId (extension documentée) --------------
  // Permet de revoir la correction complète d'une tentative passée depuis l'historique,
  // même après avoir fermé l'onglet où le résultat a été affiché la première fois.
  // Décision actée avec l'équipe backend, cf exam-hub-api-contract.md
  async getMyResultDetail(attemptId) {
    await delay();
    requireRole("student");
    const attempt = attempts[attemptId];
    if (!attempt) throw new ApiError(404, "Tentative introuvable.");
    if (attempt.studentId !== currentUser.id) {
      throw new ApiError(403, "Accès refusé à cette tentative.");
    }
    return attempt;
  },
};