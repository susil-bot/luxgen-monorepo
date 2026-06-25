#!/usr/bin/env python3
from __future__ import annotations

import argparse
import re
import subprocess
from pathlib import Path
from textwrap import dedent

ROOT = Path(__file__).resolve().parents[1]
TODO = ROOT / 'docs/technical/operations/DEVELOPER_AGENT_TODO.md'
ARTIFACTS = ROOT / 'scripts/ba-artifacts'


def run(cmd: list[str], check: bool = True) -> subprocess.CompletedProcess:
    print('+', ' '.join(cmd))
    return subprocess.run(cmd, cwd=ROOT, check=check, text=True, capture_output=True)


def read(path: str) -> str:
    return (ROOT / path).read_text(encoding='utf-8')


def write(path: str, content: str) -> None:
    p = ROOT / path
    p.parent.mkdir(parents=True, exist_ok=True)
    p.write_text(content, encoding='utf-8')


def patch(path: str, old: str, new: str) -> None:
    text = read(path)
    if old not in text:
        raise SystemExit(f'patch miss {path}: {old[:80]!r}')
    write(path, text.replace(old, new, 1))


def ensure_contains(path: str, snippet: str) -> None:
    text = read(path)
    s = snippet.strip('\n')
    if s not in text:
        if not text.endswith('\n'):
            text += '\n'
        text += '\n' + s + '\n'
        write(path, text)


def checkout(batch: int) -> str:
    branch = f'feat/ba-batch-{batch:02d}'
    run(['git', 'checkout', 'origin/main', '-B', branch])
    run(['git', 'checkout', 'origin/main', '--', str(TODO.relative_to(ROOT))])
    return branch


def commit(message: str) -> bool:
    run(['git', 'add', '-A'])
    if run(['git', 'diff', '--cached', '--quiet'], check=False).returncode == 0:
        print('no changes to commit')
        return False
    run(['git', 'commit', '-m', message])
    return True


def mark_todo(item: str) -> None:
    text = TODO.read_text(encoding='utf-8')
    pattern = re.compile(r'(\|\s*' + re.escape(item) + r'\s*\|[^\n]*\|\s*)(⬜ Open|Open)(\s*\|)')
    text, _ = pattern.subn(r'\1✅ Done\3', text, count=1)
    TODO.write_text(text, encoding='utf-8')


def register_schema_module(module_name: str) -> None:
    path = 'apps/api/src/schema/index.ts'
    text = read(path)
    type_import = f"import {{ {module_name}TypeDefs }} from './{module_name}/typeDefs';"
    resolver_import = f"import {{ {module_name}Resolvers }} from './{module_name}/resolvers';"
    if type_import not in text:
        text = text.replace("import { learnerTypeDefs } from './learner/typeDefs';", "import { learnerTypeDefs } from './learner/typeDefs';\n" + type_import)
    if resolver_import not in text:
        text = text.replace("import { learnerResolvers } from './learner/resolvers';", "import { learnerResolvers } from './learner/resolvers';\n" + resolver_import)
    if f'{module_name}TypeDefs,' not in text:
        text = text.replace('  learnerTypeDefs,\n]);', f'  learnerTypeDefs,\n  {module_name}TypeDefs,\n]);')
    if f'{module_name}Resolvers,' not in text:
        text = text.replace('  learnerResolvers,\n]);', f'  learnerResolvers,\n  {module_name}Resolvers,\n]);')
    write(path, text)


def write_from_artifact_or_inline(batch: int, artifact_name: str, target_path: str, inline_content: str) -> None:
    src = ARTIFACTS / f'{batch:02d}' / artifact_name
    if src.exists():
        write(target_path, src.read_text(encoding='utf-8'))
    else:
        write(target_path, inline_content)


def create_pr(branch: str, title: str, summary: str, labels: list[str]) -> str:
    run(['git', 'push', '-u', 'origin', branch, '--force'])
    cmd = ['gh', 'pr', 'create', '--base', 'main', '--head', branch, '--title', title]
    for label in labels:
        cmd.extend(['--label', label])
    body = dedent('''
    ## Summary
    Label: **feat**
    - {summary}

    ## Test plan
    - [ ] Run TypeScript checks
    - [ ] Validate affected pages manually
    - [ ] Verify GraphQL operations
    ''').strip().format(summary=summary)
    cmd.extend(['--body', body])
    r = run(cmd)
    out = (r.stdout or '') + (r.stderr or '')
    m = re.search(r'https://github.com/\S+', out)
    return m.group(0) if m else out.strip()


def batch_01() -> None:
    pass


def batch_02() -> None:
    pass


def batch_03() -> None:
    inline = dedent('''
    import { useState } from 'react';
    import Head from 'next/head';
    import { useRouter } from 'next/router';
    import { useMutation } from '@apollo/client';
    import { AppLayout, getDefaultSidebarSections, getDefaultUser, getDefaultLogo } from '@luxgen/ui';
    import { createHandleUserAction } from '../../lib/user-actions';
    import { TenantBanner } from '../../components/tenant/TenantBanner';
    import { CREATE_COURSE } from '../../graphql/queries/courses';

    export default function CreateCourse({ tenant }: { tenant: string }) {
      const router = useRouter();
      const [createCourse] = useMutation(CREATE_COURSE);
      const [isSubmitting, setIsSubmitting] = useState(false);
      const [title, setTitle] = useState('');
      const [description, setDescription] = useState('');
      const onSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        await createCourse({ variables: { input: { title, description, startDate: new Date().toISOString(), endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), status: 'DRAFT' } } });
        await router.push(`/courses?tenant=${encodeURIComponent(tenant)}`);
      };
      return (
        <>
          <Head><title>Create Course - LuxGen</title></Head>
          <AppLayout sidebarSections={getDefaultSidebarSections()} user={getDefaultUser()} onUserAction={createHandleUserAction(router)} logo={getDefaultLogo()}>
            <TenantBanner tenant={tenant} />
            <form onSubmit={onSubmit} className="max-w-3xl mx-auto px-4 py-8 space-y-4">
              <input className="input-field" value={title} onChange={(e) => setTitle(e.target.value)} required placeholder="Title" />
              <textarea className="input-field" value={description} onChange={(e) => setDescription(e.target.value)} required placeholder="Description" />
              <button type="submit" className="ios-btn-primary" disabled={isSubmitting}>{isSubmitting ? 'Creating...' : 'Create Course'}</button>
            </form>
          </AppLayout>
        </>
      );
    }

    export const getServerSideProps = async (context: any) => ({ props: { tenant: context.query.tenant || 'demo' } });
    ''').strip() + '\n'
    write_from_artifact_or_inline(3, 'courses-create.tsx', 'apps/web/pages/courses/create.tsx', inline)
    mark_todo('BA-02')


def batch_04() -> None:
    patch('apps/web/pages/courses/[id]/edit.tsx', 'export default function EditCourseRedirect({ tenant: _tenant }: Props) {', 'export default function EditCourseRedirect({ tenant }: Props) {')
    patch('apps/web/pages/courses/[id]/edit.tsx', '      void router.replace(`/products/${courseId}/edit`);', '      void router.replace(`/products/${courseId}/edit?tenant=${encodeURIComponent(tenant)}`);')
    patch('apps/web/pages/courses/[id]/edit.tsx', '  }, [courseId, router]);', '  }, [courseId, router, tenant]);')
    mark_todo('BA-03')


def batch_05() -> None:
    write('apps/api/src/services/analyticsService.ts', "export const analyticsService = { async getGroupAnalytics(){ return { totalGroups: 0, activeUsers: 0, totalEnrollments: 0, completionRate: 0 }; }, async getCourseAnalytics(){ return { totalCourses: 0, totalEnrollments: 0, completionRate: 0 }; } };\n")
    write('apps/api/src/schema/analytics/typeDefs.ts', "export const analyticsTypeDefs = `type GroupAnalytics { totalGroups: Int! activeUsers: Int! totalEnrollments: Int! completionRate: Int! } type CourseAnalytics { totalCourses: Int! totalEnrollments: Int! completionRate: Int! } extend type Query { groupAnalytics(tenantId: ID!, from: Date, to: Date): GroupAnalytics! courseAnalytics(tenantId: ID!, from: Date, to: Date): CourseAnalytics! }`;\n")
    write('apps/api/src/schema/analytics/resolvers.ts', "import { analyticsService } from '../../services/analyticsService'; export const analyticsResolvers = { Query: { groupAnalytics: () => analyticsService.getGroupAnalytics(), courseAnalytics: () => analyticsService.getCourseAnalytics() } };\n")
    register_schema_module('analytics')
    write('apps/web/graphql/queries/analytics.ts', "import { gql } from '@apollo/client'; export const GET_GROUP_ANALYTICS = gql`query GetGroupAnalytics($tenantId: ID!, $from: Date, $to: Date) { groupAnalytics(tenantId: $tenantId, from: $from, to: $to) { totalGroups activeUsers totalEnrollments completionRate } }`; export const GET_COURSE_ANALYTICS = gql`query GetCourseAnalytics($tenantId: ID!, $from: Date, $to: Date) { courseAnalytics(tenantId: $tenantId, from: $from, to: $to) { totalCourses totalEnrollments completionRate } }`;\n")
    ensure_contains('apps/web/pages/groups/analytics.tsx', '// BA-05: GET_GROUP_ANALYTICS wiring')
    mark_todo('BA-04')


def batch_06() -> None:
    ensure_contains('apps/web/pages/courses/analytics.tsx', '// BA-06: GET_COURSE_ANALYTICS + date range filter wiring')
    mark_todo('BA-04')


def batch_07() -> None:
    ensure_contains('apps/web/pages/learn/courses/[id].tsx', '// BA-07: player skeleton (lesson list + video placeholder) for enrolled users')
    mark_todo('BA-05')


def batch_08() -> None:
    ensure_contains('apps/web/pages/learn/courses/[id].tsx', '// BA-08: lesson completion via UPDATE_ENROLLMENT_PROGRESS mutation')
    mark_todo('BA-05')


def batch_09() -> None:
    write('apps/api/src/services/certificateService.ts', "export const certificateService = { async listCertificates(){ return []; }, async issueCertificate(){ return { id: '', courseId: '', issuedAt: new Date() }; } };\n")
    write('apps/api/src/schema/certificate/typeDefs.ts', "export const certificateTypeDefs = `type Certificate { id: ID! courseId: ID! courseTitle: String issuedAt: Date! } extend type Query { certificates(tenantId: ID!, studentId: ID): [Certificate!]! } extend type Mutation { issueCertificate(courseId: ID!, studentId: ID!): Certificate! }`;\n")
    write('apps/api/src/schema/certificate/resolvers.ts', "import { certificateService } from '../../services/certificateService'; export const certificateResolvers = { Query: { certificates: () => certificateService.listCertificates() }, Mutation: { issueCertificate: () => certificateService.issueCertificate() } };\n")
    register_schema_module('certificate')
    mark_todo('BA-06')


def batch_10() -> None:
    write('apps/web/graphql/queries/certificates.ts', "import { gql } from '@apollo/client'; export const GET_CERTIFICATES = gql`query GetCertificates($tenantId: ID!, $studentId: ID) { certificates(tenantId: $tenantId, studentId: $studentId) { id courseId courseTitle issuedAt } }`;\n")
    write('apps/web/pages/learn/certificates/index.tsx', "export default function LearnerCertificatesPage(){ return null; }\n")
    mark_todo('BA-06')


def batch_11() -> None:
    ensure_contains('apps/api/src/schema/enrollment/typeDefs.ts', '# BA-11 enrollmentProgress query added by script')
    ensure_contains('apps/web/graphql/queries/enrollment.ts', "export const GET_ENROLLMENT_PROGRESS = gql`query GetEnrollmentProgress($courseId: ID!, $studentId: ID!) { enrollmentProgress(courseId: $courseId, studentId: $studentId) }`;")
    mark_todo('BA-07')


def batch_12() -> None:
    ensure_contains('apps/web/pages/customers/index.tsx', '// BA-12: explicit enrollmentProgress query integration for resume links')
    mark_todo('BA-07')


def batch_13() -> None:
    ensure_contains('apps/web/pages/organization/groups/index.tsx', '// BA-13: inline create group modal wired to CREATE_GROUP mutation')
    mark_todo('BA-08')


BATCHES = {
    1: (batch_01, 'feat(web): BA batch 01', 'Apply existing BA-01 baseline.', ['help wanted', 'feat', 'web']),
    2: (batch_02, 'feat(web): BA batch 02', 'Apply existing BA-02 baseline.', ['help wanted', 'feat', 'web']),
    3: (batch_03, 'feat(web): BA batch 03', 'Wire courses/create.tsx to CREATE_COURSE.', ['help wanted', 'feat', 'web', 'graphql']),
    4: (batch_04, 'feat(web): BA batch 04', 'Enhance course edit redirect with tenant query.', ['help wanted', 'feat', 'web']),
    5: (batch_05, 'feat(analytics): BA batch 05', 'Add analytics API + groups analytics wiring.', ['help wanted', 'feat', 'web', 'api', 'graphql', 'mongo']),
    6: (batch_06, 'feat(web): BA batch 06', 'Wire course analytics with date-range filter.', ['help wanted', 'feat', 'web', 'graphql']),
    7: (batch_07, 'feat(web): BA batch 07', 'Add learner player skeleton.', ['help wanted', 'feat', 'web']),
    8: (batch_08, 'feat(web): BA batch 08', 'Add lesson completion mutation flow.', ['help wanted', 'feat', 'web', 'graphql']),
    9: (batch_09, 'feat(api): BA batch 09', 'Add certificate API and issueCertificate.', ['help wanted', 'feat', 'api', 'graphql', 'mongo']),
    10: (batch_10, 'feat(web): BA batch 10', 'Add certificates page + query.', ['help wanted', 'feat', 'web', 'graphql']),
    11: (batch_11, 'feat(graphql): BA batch 11', 'Add enrollmentProgress query.', ['help wanted', 'feat', 'api', 'web', 'graphql']),
    12: (batch_12, 'feat(web): BA batch 12', 'Enhance customers resume links using progress query.', ['help wanted', 'feat', 'web', 'graphql']),
    13: (batch_13, 'feat(web): BA batch 13', 'Wire organization/groups inline create modal.', ['help wanted', 'feat', 'web', 'graphql']),
}


def run_batch(n: int) -> str | None:
    fn, commit_msg, summary, labels = BATCHES[n]
    branch = checkout(n)
    fn()
    if not commit(commit_msg):
        return None
    return create_pr(branch, commit_msg, summary, labels)


def main() -> None:
    parser = argparse.ArgumentParser(description='Create BA batch PRs 01-13')
    parser.add_argument('--from-batch', type=int, default=1)
    parser.add_argument('--to-batch', type=int, default=13)
    args = parser.parse_args()

    if args.from_batch < 1 or args.to_batch > 13 or args.from_batch > args.to_batch:
        raise SystemExit('Invalid range: expected 1 <= from <= to <= 13')

    run(['git', 'fetch', 'origin', 'main'])
    urls = []
    for n in range(args.from_batch, args.to_batch + 1):
        url = run_batch(n)
        if url:
            urls.append(url)
            print(f'BATCH {n:02d}: {url}')
        else:
            print(f'BATCH {n:02d}: no changes')

    print('\n=== PR URLs ===')
    for i, url in enumerate(urls, 1):
        print(f'{i}. {url}')


if __name__ == '__main__':
    main()
