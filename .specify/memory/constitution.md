<!--
SYNC IMPACT REPORT
==================
Version Change: 1.0.0 → 1.1.0
Modified Principles:
  - Testing Standards (Principle II): Expanded with Kent Beck & 和田卓人 TDD methodologies
Added Sections:
  - TDDの三原則 (Kent Beck)
  - テスト駆動開発の目的 (和田卓人)
  - F.I.R.S.T原則
  - テストの段階 (仮実装・三角測量・明白な実装)
Templates Status:
  - ✅ plan-template.md: Constitution Check section aligns
  - ✅ spec-template.md: Requirements and Success Criteria sections align
  - ✅ tasks-template.md: Test-first approach enhanced with detailed TDD methodology
Follow-up TODOs: None
Rationale: MINOR version bump - Significant expansion of Testing Standards principle with industry-standard TDD methodologies (Kent Beck's 3 rules, 和田卓人's TDD purpose, F.I.R.S.T principles, test implementation stages).
-->

# Fitronix Project Constitution

## Core Principles

### I. Code Quality (NON-NEGOTIABLE)

**All code MUST adhere to the following quality standards:**

- **DRY Principle**: Eliminate code duplication. Extract shared logic into reusable functions, classes, or modules with clear single responsibilities.
- **Meaningful Naming**: Use descriptive, intention-revealing names for variables, functions, classes, and files. Names must communicate purpose without requiring code inspection.
- **Consistent Style**: Maintain uniform formatting, naming conventions, and code organization across the entire codebase. Use automated linting and formatting tools.
- **Self-Documenting Code**: Code structure and naming should clearly express intent. Comments explain "why" decisions were made, not "what" the code does.
- **Error Prevention**: Proactively identify and fix issues. Never suppress errors with `@ts-ignore`, empty catch blocks, or similar workarounds without explicit justification and documentation.

**Rationale**: High code quality reduces maintenance burden, prevents bugs, and enables sustainable long-term development.

### II. Testing Standards (NON-NEGOTIABLE)

**Test-Driven Development (TDD) is mandatory for all features (Kent Beck & 和田卓人の手法):**

- **Red-Green-Refactor Cycle (Kent Beck)**:
  1. **Red**: Write a failing test that defines desired behavior (テストファースト)
  2. **Green**: Write the minimal code to make the test pass (仮実装・三角測量・明白な実装)
  3. **Refactor**: Improve code quality while keeping tests green (リファクタリング)
- **TDD の三原則 (Kent Beck)**:
  1. まず失敗する自動テストを書くまでは、プロダクションコードを書かない
  2. 失敗する自動テストを一度にひとつ以上書かない（コンパイルが通らないのも失敗）
  3. 現在失敗しているテストをパスさせる以上のプロダクションコードを書かない
- **テスト駆動開発の目的 (和田卓人)**:
  - 動作するきれいなコードを書く（"Clean code that works" - Ron Jeffries）
  - ストレスなく開発を進める（不安をテストに置き換える）
  - 設計の改善（テスタビリティの向上 = 疎結合・高凝集な設計）
  - ドキュメントとしてのテスト（実行可能な仕様書）
- **Test Coverage Requirements**:
  - **Contract Tests**: All public APIs, endpoints, and module interfaces MUST have contract tests validating inputs/outputs.
  - **Integration Tests**: Critical user journeys and inter-service communication MUST be integration tested.
  - **Unit Tests**: Business logic and edge cases MUST be covered by fast, isolated unit tests.
- **Test Quality (F.I.R.S.T 原則)**:
  - **Fast**: Tests MUST be fast (unit tests < 100ms, integration tests < 5s when possible).
  - **Independent**: Tests MUST be independent (runnable in any order, no shared state).
  - **Repeatable**: Tests MUST be deterministic (same input = same output, no flakiness).
  - **Self-Validating**: Tests have clear pass/fail outcomes (no manual verification).
  - **Timely**: Tests are written before production code (test-first).
- **テストの段階 (和田卓人)**:
  - **仮実装**: ベタ書きの値を返してテストを通す
  - **三角測量**: 複数のテストケースから一般化を導く
  - **明白な実装**: 明らかな実装を一気に書く（慣れてから）
- **Error Scenarios**: All error conditions, edge cases, and boundary values MUST be tested.

**Rationale**: TDD ensures requirements are clear, code is testable, and regressions are caught immediately. High-quality tests enable confident refactoring and continuous delivery. テストファーストにより、インターフェースを先に考えることで使いやすいAPIが生まれる。

### III. User Experience Consistency

**All user-facing features MUST maintain consistent experience:**

- **Interface Consistency**: UI components, interactions, and visual design follow established patterns and design system.
- **Response Time Standards**: User actions receive immediate feedback (<100ms acknowledgment, <1s primary operations).
- **Error Communication**: Error messages are clear, actionable, and guide users to resolution. No technical jargon exposed to end users.
- **Accessibility**: Features MUST meet WCAG 2.1 Level AA standards (keyboard navigation, screen reader support, color contrast).
- **Cross-Platform Consistency**: Features behave predictably across supported devices, browsers, and platforms.

**Rationale**: Consistent UX builds user trust, reduces cognitive load, minimizes support burden, and ensures inclusive access.

### IV. Performance Requirements

**System performance MUST meet the following standards:**

- **Response Time**:
  - API endpoints: p95 latency < 200ms
  - Database queries: p95 < 100ms
  - UI rendering: First Contentful Paint < 1.5s, Time to Interactive < 3s
- **Throughput**: System handles minimum 1,000 concurrent users without degradation.
- **Resource Efficiency**:
  - Memory: Peak usage < 512MB per service instance
  - CPU: Average utilization < 70% under normal load
  - Network: Minimize payload sizes (API responses < 1MB, images optimized)
- **Scalability**: Architecture supports horizontal scaling to 10x current load without refactoring.
- **Performance Testing**: All features affecting critical paths MUST include performance benchmarks and load tests.

**Rationale**: Performance directly impacts user satisfaction, operational costs, and system reliability. Proactive performance engineering prevents costly late-stage optimizations.

### V. Observability & Monitoring

**All systems MUST be observable and measurable:**

- **Structured Logging**: Use consistent JSON logging format with correlation IDs, timestamps, severity levels, and contextual data.
- **Metrics Collection**: Track key performance indicators (request rates, error rates, latency percentiles, resource utilization).
- **Distributed Tracing**: Trace requests across service boundaries to diagnose bottlenecks and failures.
- **Health Checks**: All services expose `/health` and `/ready` endpoints for monitoring and orchestration.
- **Alerting**: Define SLOs (Service Level Objectives) and alert on violations before users are impacted.

**Rationale**: Observability enables rapid debugging, informed optimization decisions, and proactive issue resolution. You cannot improve what you cannot measure.

## Development Workflow

### Code Review Requirements

- All code changes MUST be reviewed by at least one team member before merging.
- Reviewers verify:
  - Constitution compliance (quality, testing, performance, observability)
  - Security best practices (input validation, authentication, authorization)
  - Documentation completeness (README, API docs, inline comments where needed)
  - Test coverage and quality
- Review feedback is constructive and focuses on code, not individuals.

### Branch Strategy

- `main` branch is always production-ready and deployable.
- Feature branches follow naming: `###-feature-name` (e.g., `001-user-authentication`).
- No direct commits to `main` without pull request approval.
- Merge strategy: Squash commits to maintain clean history.

### Commit Standards

- Use Conventional Commits format: `<type>(<scope>): <description>`.
- Types: `feat`, `fix`, `docs`, `test`, `refactor`, `perf`, `chore`.
- Commit messages are clear, concise, and explain the "why" when non-obvious.
- Commits are atomic (one logical change per commit).

## Quality Gates

### Pre-Merge Checklist

Before merging any pull request, verify:

- [ ] All tests pass (unit, integration, contract).
- [ ] Code coverage meets minimum threshold (80% for new code).
- [ ] Linting and formatting checks pass.
- [ ] Performance benchmarks do not regress.
- [ ] Security scans pass (no high/critical vulnerabilities).
- [ ] Documentation updated (README, API docs, inline comments).
- [ ] Code review approved by at least one team member.
- [ ] Constitution compliance verified.

### Deployment Gates

Before deploying to production:

- [ ] All pre-merge checks pass.
- [ ] Integration tests pass in staging environment.
- [ ] Performance tests confirm no regressions.
- [ ] Monitoring and alerting configured for new features.
- [ ] Rollback plan documented.
- [ ] Security review completed for changes affecting authentication, authorization, or data handling.

## Governance

### Constitution Authority

This constitution supersedes all other development practices and guidelines. When conflicts arise, constitution principles take precedence.

### Amendment Process

1. **Proposal**: Document proposed change with rationale and impact analysis.
2. **Review**: Team reviews proposal and provides feedback.
3. **Approval**: Requires consensus from majority of active contributors.
4. **Migration**: Update all dependent templates, documentation, and tooling.
5. **Version Bump**: Increment constitution version according to semantic versioning.

### Version Policy

- **MAJOR**: Breaking changes to principles or governance (e.g., removing a principle, changing non-negotiable rules).
- **MINOR**: New principles added or significant expansions to existing principles.
- **PATCH**: Clarifications, wording improvements, typo fixes.

### Compliance Review

- All pull requests MUST verify constitution compliance before approval.
- Quarterly constitution review to assess effectiveness and identify needed amendments.
- Violations require explicit justification documented in `Complexity Tracking` section of implementation plan.

### Complexity Justification

When constitution violations are unavoidable:

- Document violation in implementation plan `Complexity Tracking` table.
- Explain why the violation is necessary.
- Provide evidence that simpler alternatives were evaluated and rejected.
- Require additional review and approval from senior team members.

**Version**: 1.1.0 | **Ratified**: 2025-11-29 | **Last Amended**: 2025-11-29
