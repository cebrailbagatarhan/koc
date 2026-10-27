import type { Session } from '@supabase/supabase-js';
import { FormEvent, useCallback, useEffect, useMemo, useState } from 'react';

import { configError, supabase } from './supabase';

type StaffRole = 'editor' | 'reviewer' | 'admin';
type Tab = 'dashboard' | 'questions' | 'review' | 'users' | 'ai';
type StaffProfile = {
  id: string;
  email: string | null;
  display_name: string | null;
  role: StaffRole;
};

type Question = {
  id: string;
  stem: string;
  difficulty: number;
  access_tier: 'free' | 'premium';
  status: string;
  origin: string;
  quality_score: number | null;
  created_at: string;
  koc_topics?: {
    title?: string;
    koc_courses?: { title?: string; level_name?: string } | null;
  } | null;
};

type Topic = {
  id: string;
  title: string;
  koc_courses?: { title?: string; level_name?: string } | null;
};

type UserRow = {
  id: string;
  email: string | null;
  display_name: string | null;
  role: string;
  created_at: string;
};

type AiJob = {
  id: string;
  kind: string;
  status: string;
  provider: string | null;
  model: string | null;
  input_tokens: number | null;
  output_tokens: number | null;
  cost_microunits: number | null;
  error_message: string | null;
  created_at: string;
};

const STAFF_ROLES = new Set<StaffRole>(['editor', 'reviewer', 'admin']);
const QUESTION_STATUSES = ['draft', 'auto_check', 'review', 'published', 'retired', 'rejected'];

export default function App() {
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<StaffProfile | null>(null);
  const [booting, setBooting] = useState(true);
  const [authError, setAuthError] = useState<string | null>(null);
  const [tab, setTab] = useState<Tab>('dashboard');

  useEffect(() => {
    if (!supabase) {
      setBooting(false);
      return;
    }
    let active = true;
    supabase.auth.getSession().then(({ data }) => {
      if (active) setSession(data.session);
      if (active) setBooting(false);
    });
    const { data } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
      if (!nextSession) setProfile(null);
    });
    return () => {
      active = false;
      data.subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (!supabase || !session) return;
    let active = true;
    setAuthError(null);
    supabase
      .from('koc_profiles')
      .select('id,email,display_name,role')
      .eq('id', session.user.id)
      .maybeSingle()
      .then(({ data, error }) => {
        if (!active) return;
        if (error) {
          setAuthError(error.message);
          return;
        }
        if (!data || !STAFF_ROLES.has(data.role as StaffRole)) {
          setAuthError('Bu hesap Koç admin paneline erişim yetkisine sahip değil.');
          return;
        }
        setProfile(data as StaffProfile);
      });
    return () => {
      active = false;
    };
  }, [session]);

  if (configError) return <SetupState message={configError} />;
  if (booting) return <SetupState message="Admin oturumu kontrol ediliyor…" />;
  if (!session) return <Login />;
  if (authError) {
    return (
      <SetupState
        message={authError}
        actionLabel="Çıkış yap"
        onAction={() => supabase?.auth.signOut()}
      />
    );
  }
  if (!profile) return <SetupState message="Yetki profili yükleniyor…" />;

  return (
    <div className="shell">
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-mark">K</div>
          <div>
            <strong>Koç Admin</strong>
            <span>İçerik & platform</span>
          </div>
        </div>
        <nav>
          <Nav active={tab === 'dashboard'} onClick={() => setTab('dashboard')}>Genel Bakış</Nav>
          <Nav active={tab === 'questions'} onClick={() => setTab('questions')}>Soru Bankası</Nav>
          <Nav active={tab === 'review'} onClick={() => setTab('review')}>İnceleme Kuyruğu</Nav>
          <Nav active={tab === 'users'} onClick={() => setTab('users')}>Üyeler</Nav>
          <Nav active={tab === 'ai'} onClick={() => setTab('ai')}>AI İşleri</Nav>
        </nav>
        <div className="sidebar-user">
          <strong>{profile.display_name || profile.email || 'Koç personeli'}</strong>
          <span>{profile.role}</span>
          <button className="ghost-button" onClick={() => supabase?.auth.signOut()}>Çıkış</button>
        </div>
      </aside>
      <main className="main">
        {tab === 'dashboard' && <Dashboard />}
        {tab === 'questions' && <Questions profile={profile} />}
        {tab === 'review' && <ReviewQueue profile={profile} />}
        {tab === 'users' && <Users profile={profile} />}
        {tab === 'ai' && <AiJobs />}
      </main>
    </div>
  );
}

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (!supabase || busy) return;
    setBusy(true);
    setError(null);
    const result = await supabase.auth.signInWithPassword({ email, password });
    if (result.error) setError(result.error.message);
    setBusy(false);
  };

  return (
    <div className="center-page">
      <form className="login-card" onSubmit={submit}>
        <div className="brand-mark large">K</div>
        <p className="eyebrow">KOÇ PLATFORM</p>
        <h1>Admin girişi</h1>
        <p>Yalnız editör, reviewer ve admin rolündeki hesaplar erişebilir.</p>
        <label>E-posta<input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} /></label>
        <label>Şifre<input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} /></label>
        {error && <div className="error-box">{error}</div>}
        <button className="primary-button" disabled={busy}>{busy ? 'Giriş yapılıyor…' : 'Giriş yap'}</button>
      </form>
    </div>
  );
}

function SetupState({ message, actionLabel, onAction }: { message: string; actionLabel?: string; onAction?: () => void }) {
  return (
    <div className="center-page">
      <div className="setup-card">
        <div className="brand-mark large">K</div>
        <h1>Koç Admin</h1>
        <p>{message}</p>
        {actionLabel && onAction && <button className="primary-button" onClick={onAction}>{actionLabel}</button>}
      </div>
    </div>
  );
}

function Nav({ active, children, onClick }: { active: boolean; children: string; onClick: () => void }) {
  return <button className={`nav-item ${active ? 'active' : ''}`} onClick={onClick}>{children}</button>;
}

function PageHeader({ eyebrow, title, text, action }: { eyebrow: string; title: string; text: string; action?: React.ReactNode }) {
  return (
    <header className="page-header">
      <div>
        <p className="eyebrow">{eyebrow}</p>
        <h1>{title}</h1>
        <p>{text}</p>
      </div>
      {action}
    </header>
  );
}

function Dashboard() {
  const [metrics, setMetrics] = useState({ users: 0, premium: 0, questions: 0, review: 0, published: 0, failedAi: 0 });
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!supabase) return;
    setLoading(true);
    const [users, premium, questions, review, published, failedAi] = await Promise.all([
      supabase.from('koc_profiles').select('*', { count: 'exact', head: true }),
      supabase.from('koc_entitlements').select('*', { count: 'exact', head: true }).eq('entitlement_key', 'premium').eq('is_active', true),
      supabase.from('koc_questions').select('*', { count: 'exact', head: true }),
      supabase.from('koc_questions').select('*', { count: 'exact', head: true }).eq('status', 'review'),
      supabase.from('koc_questions').select('*', { count: 'exact', head: true }).eq('status', 'published'),
      supabase.from('koc_generation_jobs').select('*', { count: 'exact', head: true }).eq('status', 'failed'),
    ]);
    setMetrics({
      users: users.count ?? 0,
      premium: premium.count ?? 0,
      questions: questions.count ?? 0,
      review: review.count ?? 0,
      published: published.count ?? 0,
      failedAi: failedAi.count ?? 0,
    });
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  return (
    <>
      <PageHeader eyebrow="PLATFORM" title="Genel Bakış" text="İçerik kalitesi, üyelik ve AI üretim hattının sağlık ekranı." action={<button className="secondary-button" onClick={load}>Yenile</button>} />
      <div className="metric-grid">
        <Metric label="Üye" value={metrics.users} hint="kayıtlı profil" loading={loading} />
        <Metric label="Premium" value={metrics.premium} hint="aktif entitlement" loading={loading} />
        <Metric label="Toplam soru" value={metrics.questions} hint="tüm durumlar" loading={loading} />
        <Metric label="İnceleme" value={metrics.review} hint="review kuyruğu" loading={loading} />
        <Metric label="Yayında" value={metrics.published} hint="öğrenciye açık" loading={loading} />
        <Metric label="AI hata" value={metrics.failedAi} hint="başarısız işler" loading={loading} danger={metrics.failedAi > 0} />
      </div>
      <section className="panel">
        <p className="eyebrow">KALİTE KURALI</p>
        <h2>AI taslağı ≠ doğrulanmış soru</h2>
        <p className="muted">AI veya import kaynaklı soru önce otomatik kontrolden, sonra gerektiğinde reviewer kuyruğundan geçer. “Published” durumu editoryal bir karardır.</p>
      </section>
    </>
  );
}

function Metric({ label, value, hint, loading, danger }: { label: string; value: number; hint: string; loading: boolean; danger?: boolean }) {
  return (
    <div className={`metric-card ${danger ? 'danger' : ''}`}>
      <span>{label}</span><strong>{loading ? '—' : value.toLocaleString('tr-TR')}</strong><small>{hint}</small>
    </div>
  );
}

function Questions({ profile }: { profile: StaffProfile }) {
  const canEdit = profile.role === 'admin' || profile.role === 'editor';
  const [questions, setQuestions] = useState<Question[]>([]);
  const [topics, setTopics] = useState<Topic[]>([]);
  const [status, setStatus] = useState('all');
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!supabase) return;
    setLoading(true);
    setError(null);
    let request = supabase
      .from('koc_questions')
      .select('id,stem,difficulty,access_tier,status,origin,quality_score,created_at,koc_topics(title,koc_courses(title,level_name))')
      .order('created_at', { ascending: false })
      .limit(200);
    if (status !== 'all') request = request.eq('status', status);
    if (query.trim()) request = request.ilike('stem', `%${query.trim()}%`);
    const [{ data, error: loadError }, topicsResult] = await Promise.all([
      request,
      supabase.from('koc_topics').select('id,title,koc_courses(title,level_name)').eq('is_active', true).order('title'),
    ]);
    if (loadError) setError(loadError.message);
    setQuestions((data ?? []) as unknown as Question[]);
    setTopics((topicsResult.data ?? []) as unknown as Topic[]);
    setLoading(false);
  }, [query, status]);

  useEffect(() => { load(); }, [load]);

  const changeStatus = async (question: Question, nextStatus: string) => {
    if (!supabase || !canEdit) return;
    const before = { status: question.status };
    const { error: updateError } = await supabase
      .from('koc_questions')
      .update({ status: nextStatus, published_at: nextStatus === 'published' ? new Date().toISOString() : null })
      .eq('id', question.id);
    if (updateError) return setError(updateError.message);
    await supabase.from('koc_admin_audit_log').insert({
      actor_id: profile.id,
      action: 'question.status_changed',
      entity_type: 'question',
      entity_id: question.id,
      before_data: before,
      after_data: { status: nextStatus },
    });
    load();
  };

  return (
    <>
      <PageHeader
        eyebrow="İÇERİK"
        title="Soru Bankası"
        text="Soru yaşam döngüsünü, kalite puanını ve yayın durumunu yönet."
        action={canEdit ? <button className="primary-button compact" onClick={() => setShowCreate((v) => !v)}>{showCreate ? 'Formu kapat' : '+ Yeni soru'}</button> : undefined}
      />
      {showCreate && canEdit && <QuestionComposer topics={topics} profile={profile} onCreated={() => { setShowCreate(false); load(); }} />}
      <section className="panel filters">
        <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Soru metninde ara…" />
        <select value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="all">Tüm durumlar</option>
          {QUESTION_STATUSES.map((item) => <option key={item} value={item}>{item}</option>)}
        </select>
        <button className="secondary-button" onClick={load}>Yenile</button>
      </section>
      {error && <div className="error-box">{error}</div>}
      <section className="table-card">
        <table>
          <thead><tr><th>Soru</th><th>Konu</th><th>Kaynak</th><th>Zorluk</th><th>Kalite</th><th>Durum</th></tr></thead>
          <tbody>
            {questions.map((question) => (
              <tr key={question.id}>
                <td className="question-cell">{question.stem}</td>
                <td>{question.koc_topics?.koc_courses?.title ? `${question.koc_topics.koc_courses.title} · ` : ''}{question.koc_topics?.title ?? '—'}</td>
                <td><span className={`badge ${question.origin}`}>{question.origin}</span></td>
                <td>{question.difficulty}/5</td>
                <td>{question.quality_score == null ? '—' : `${question.quality_score}/100`}</td>
                <td>
                  {canEdit ? (
                    <select value={question.status} onChange={(e) => changeStatus(question, e.target.value)}>
                      {QUESTION_STATUSES.map((item) => <option key={item} value={item}>{item}</option>)}
                    </select>
                  ) : <span className="badge">{question.status}</span>}
                </td>
              </tr>
            ))}
            {!loading && questions.length === 0 && <tr><td colSpan={6} className="empty-row">Kayıt bulunamadı.</td></tr>}
          </tbody>
        </table>
      </section>
    </>
  );
}

function QuestionComposer({ topics, profile, onCreated }: { topics: Topic[]; profile: StaffProfile; onCreated: () => void }) {
  const [topicId, setTopicId] = useState('');
  const [stem, setStem] = useState('');
  const [difficulty, setDifficulty] = useState(2);
  const [accessTier, setAccessTier] = useState<'free' | 'premium'>('free');
  const [options, setOptions] = useState(['', '', '', '']);
  const [correctIndex, setCorrectIndex] = useState(0);
  const [explanation, setExplanation] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const valid = topicId && stem.trim().length >= 10 && options.every((option) => option.trim().length > 0);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (!supabase || !valid || busy) return;
    setBusy(true);
    setError(null);
    let questionId: string | null = null;
    try {
      const questionResult = await supabase
        .from('koc_questions')
        .insert({ topic_id: topicId, origin: 'curated', stem: stem.trim(), difficulty, access_tier: accessTier, status: 'draft', created_by: profile.id })
        .select('id')
        .single();
      if (questionResult.error) throw questionResult.error;
      questionId = questionResult.data.id;
      const keys = ['A', 'B', 'C', 'D'];
      const optionResult = await supabase
        .from('koc_question_options')
        .insert(options.map((body, index) => ({ question_id: questionId, option_key: keys[index], body: body.trim(), sort_order: index * 10 })))
        .select('id,option_key');
      if (optionResult.error) throw optionResult.error;
      const correct = optionResult.data?.find((item) => item.option_key === keys[correctIndex]);
      if (!correct) throw new Error('Doğru seçenek kaydedilemedi.');
      const answerResult = await supabase.from('koc_question_answers').insert({ question_id: questionId, correct_option_id: correct.id, explanation: explanation.trim() });
      if (answerResult.error) throw answerResult.error;
      await supabase.from('koc_admin_audit_log').insert({ actor_id: profile.id, action: 'question.created', entity_type: 'question', entity_id: questionId, after_data: { origin: 'curated', status: 'draft' } });
      onCreated();
    } catch (caught) {
      if (questionId) await supabase.from('koc_questions').delete().eq('id', questionId);
      setError(caught instanceof Error ? caught.message : 'Soru oluşturulamadı.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <form className="panel composer" onSubmit={submit}>
      <div className="form-grid">
        <label className="wide">Konu<select required value={topicId} onChange={(e) => setTopicId(e.target.value)}><option value="">Konu seç</option>{topics.map((topic) => <option key={topic.id} value={topic.id}>{topic.koc_courses?.level_name} · {topic.koc_courses?.title} · {topic.title}</option>)}</select></label>
        <label>Zorluk<select value={difficulty} onChange={(e) => setDifficulty(Number(e.target.value))}>{[1,2,3,4,5].map((value) => <option key={value} value={value}>{value}/5</option>)}</select></label>
        <label>Erişim<select value={accessTier} onChange={(e) => setAccessTier(e.target.value as 'free' | 'premium')}><option value="free">Free</option><option value="premium">Premium</option></select></label>
        <label className="wide">Soru<textarea required rows={3} value={stem} onChange={(e) => setStem(e.target.value)} /></label>
        {options.map((option, index) => (
          <label key={index}>Seçenek {String.fromCharCode(65 + index)}<input required value={option} onChange={(e) => setOptions((current) => current.map((item, i) => i === index ? e.target.value : item))} /></label>
        ))}
        <label>Doğru cevap<select value={correctIndex} onChange={(e) => setCorrectIndex(Number(e.target.value))}>{options.map((_item, index) => <option key={index} value={index}>{String.fromCharCode(65 + index)}</option>)}</select></label>
        <label className="wide">Açıklama<textarea rows={3} value={explanation} onChange={(e) => setExplanation(e.target.value)} /></label>
      </div>
      {error && <div className="error-box">{error}</div>}
      <button className="primary-button compact" disabled={!valid || busy}>{busy ? 'Kaydediliyor…' : 'Taslak oluştur'}</button>
    </form>
  );
}

function ReviewQueue({ profile }: { profile: StaffProfile }) {
  const canReview = profile.role === 'admin' || profile.role === 'reviewer';
  const [questions, setQuestions] = useState<Question[]>([]);
  const [note, setNote] = useState('');
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!supabase) return;
    const { data, error: loadError } = await supabase
      .from('koc_questions')
      .select('id,stem,difficulty,access_tier,status,origin,quality_score,created_at,koc_topics(title,koc_courses(title,level_name))')
      .eq('status', 'review')
      .order('created_at', { ascending: true })
      .limit(100);
    if (loadError) setError(loadError.message);
    setQuestions((data ?? []) as unknown as Question[]);
  }, []);

  useEffect(() => { load(); }, [load]);

  const review = async (questionId: string, verdict: 'approve' | 'changes_requested' | 'reject') => {
    if (!supabase || !canReview) return;
    const { error: reviewError } = await supabase.from('koc_question_reviews').insert({
      question_id: questionId,
      reviewer_id: profile.id,
      verdict,
      accuracy_score: verdict === 'approve' ? 5 : 3,
      clarity_score: verdict === 'approve' ? 5 : 3,
      distractor_score: verdict === 'approve' ? 4 : 3,
      source_support_score: verdict === 'approve' ? 4 : 3,
      note: note.trim(),
    });
    if (reviewError) return setError(reviewError.message);
    setNote('');
    load();
  };

  return (
    <>
      <PageHeader eyebrow="KALİTE" title="İnceleme Kuyruğu" text="AI/import taslaklarını insan gözüyle doğrula. Reviewer kararı yayınlama işlemi değildir." />
      {!canReview && <div className="warning-box">Bu rol inceleme kararı yazamaz. Kuyruğu yalnız görüntülüyorsun.</div>}
      {error && <div className="error-box">{error}</div>}
      <div className="review-list">
        {questions.map((question) => (
          <article key={question.id} className="review-card">
            <div className="review-meta"><span className={`badge ${question.origin}`}>{question.origin}</span><span>{question.difficulty}/5</span><span>{question.koc_topics?.title ?? 'Konu yok'}</span></div>
            <h3>{question.stem}</h3>
            {canReview && (
              <>
                <textarea rows={2} value={note} onChange={(e) => setNote(e.target.value)} placeholder="İnceleme notu (bu kart için karar vermeden önce yaz)…" />
                <div className="review-actions">
                  <button className="success-button" onClick={() => review(question.id, 'approve')}>Onayla</button>
                  <button className="secondary-button" onClick={() => review(question.id, 'changes_requested')}>Düzeltme iste</button>
                  <button className="danger-button" onClick={() => review(question.id, 'reject')}>Reddet</button>
                </div>
              </>
            )}
          </article>
        ))}
        {questions.length === 0 && <div className="panel muted">İnceleme bekleyen soru yok.</div>}
      </div>
    </>
  );
}

function Users({ profile }: { profile: StaffProfile }) {
  const [users, setUsers] = useState<UserRow[]>([]);
  const [premiumIds, setPremiumIds] = useState<Set<string>>(new Set());
  const [error, setError] = useState<string | null>(null);
  const isAdmin = profile.role === 'admin';

  const load = useCallback(async () => {
    if (!supabase) return;
    const [profiles, premium] = await Promise.all([
      supabase.from('koc_profiles').select('id,email,display_name,role,created_at').order('created_at', { ascending: false }).limit(250),
      supabase.from('koc_entitlements').select('user_id').eq('entitlement_key', 'premium').eq('is_active', true),
    ]);
    if (profiles.error) setError(profiles.error.message);
    setUsers((profiles.data ?? []) as UserRow[]);
    setPremiumIds(new Set((premium.data ?? []).map((item) => item.user_id as string)));
  }, []);

  useEffect(() => { load(); }, [load]);

  const changeRole = async (user: UserRow, role: string) => {
    if (!supabase || !isAdmin) return;
    const { error: updateError } = await supabase.from('koc_profiles').update({ role }).eq('id', user.id);
    if (updateError) return setError(updateError.message);
    await supabase.from('koc_admin_audit_log').insert({ actor_id: profile.id, action: 'user.role_changed', entity_type: 'user', entity_id: user.id, before_data: { role: user.role }, after_data: { role } });
    load();
  };

  return (
    <>
      <PageHeader eyebrow="ÜYELİK" title="Üyeler" text="Rol ve entitlement görünümü. Mağaza aboneliğinin kaynak gerçeği webhook tarafıdır." action={<button className="secondary-button" onClick={load}>Yenile</button>} />
      {!isAdmin && <div className="warning-box">Rol değişikliği yalnız admin hesabına açıktır.</div>}
      {error && <div className="error-box">{error}</div>}
      <section className="table-card">
        <table><thead><tr><th>Kullanıcı</th><th>Plan</th><th>Rol</th><th>Kayıt</th></tr></thead><tbody>
          {users.map((user) => <tr key={user.id}>
            <td><strong>{user.display_name || '—'}</strong><br /><small>{user.email || user.id}</small></td>
            <td><span className={`badge ${premiumIds.has(user.id) ? 'premium' : ''}`}>{premiumIds.has(user.id) ? 'Premium' : 'Free'}</span></td>
            <td>{isAdmin ? <select value={user.role} onChange={(e) => changeRole(user, e.target.value)}><option value="learner">learner</option><option value="editor">editor</option><option value="reviewer">reviewer</option><option value="admin">admin</option></select> : user.role}</td>
            <td>{new Date(user.created_at).toLocaleDateString('tr-TR')}</td>
          </tr>)}
        </tbody></table>
      </section>
    </>
  );
}

function AiJobs() {
  const [jobs, setJobs] = useState<AiJob[]>([]);
  const [status, setStatus] = useState('all');
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!supabase) return;
    let request = supabase.from('koc_generation_jobs').select('id,kind,status,provider,model,input_tokens,output_tokens,cost_microunits,error_message,created_at').order('created_at', { ascending: false }).limit(250);
    if (status !== 'all') request = request.eq('status', status);
    const result = await request;
    if (result.error) setError(result.error.message);
    setJobs((result.data ?? []) as AiJob[]);
  }, [status]);

  useEffect(() => { load(); }, [load]);
  const totalCost = useMemo(() => jobs.reduce((sum, job) => sum + (job.cost_microunits ?? 0), 0) / 1_000_000, [jobs]);

  return (
    <>
      <PageHeader eyebrow="AI OPERASYONU" title="Generation Jobs" text="Model kullanımı, token maliyeti ve hata takibi." action={<div className="cost-pill">Kayıtlı maliyet: {totalCost.toFixed(4)}</div>} />
      <section className="panel filters"><select value={status} onChange={(e) => setStatus(e.target.value)}><option value="all">Tüm durumlar</option><option value="queued">queued</option><option value="running">running</option><option value="succeeded">succeeded</option><option value="failed">failed</option></select><button className="secondary-button" onClick={load}>Yenile</button></section>
      {error && <div className="error-box">{error}</div>}
      <section className="table-card"><table><thead><tr><th>İş</th><th>Durum</th><th>Model</th><th>Token</th><th>Maliyet</th><th>Hata</th></tr></thead><tbody>
        {jobs.map((job) => <tr key={job.id}><td>{job.kind}<br /><small>{new Date(job.created_at).toLocaleString('tr-TR')}</small></td><td><span className={`badge ${job.status}`}>{job.status}</span></td><td>{[job.provider, job.model].filter(Boolean).join(' / ') || '—'}</td><td>{(job.input_tokens ?? 0) + (job.output_tokens ?? 0)}</td><td>{job.cost_microunits == null ? '—' : (job.cost_microunits / 1_000_000).toFixed(5)}</td><td className="error-cell">{job.error_message || '—'}</td></tr>)}
      </tbody></table></section>
    </>
  );
}
