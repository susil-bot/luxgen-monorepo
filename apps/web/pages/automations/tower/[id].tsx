import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';

import styles from '../../../components/automations/tower/TowerFlow.module.css';

type NodeType = 'trigger' | 'wait' | 'action' | 'condition';

interface FlowStep {
  id: string;
  type: NodeType;
  title: string;
  description: string;
}

const DEFAULT_STEPS: FlowStep[] = [
  {
    id: 't1',
    type: 'trigger',
    title: 'Order created',
    description: 'This tower starts when a new order is created',
  },
  {
    id: 'w1',
    type: 'wait',
    title: 'Wait 10 seconds',
    description: 'Delay before the next step runs',
  },
  {
    id: 'a1',
    type: 'action',
    title: 'Run code',
    description: 'Execute a custom script on the order payload',
  },
  {
    id: 'c1',
    type: 'condition',
    title: 'Check subscription',
    description: 'Run code has subscriptions is equal to true',
  },
];

function stepIcon(type: NodeType) {
  if (type === 'trigger') return '⚡';
  if (type === 'wait') return '🕐';
  if (type === 'condition') return '◆';
  return '{/}';
}

function stepIconClass(type: NodeType) {
  if (type === 'trigger') return styles.stepIconTrigger;
  if (type === 'wait') return styles.stepIconWait;
  if (type === 'condition') return styles.stepIconCondition;
  return styles.stepIconAction;
}

function stepTypeLabel(type: NodeType) {
  if (type === 'trigger') return 'Trigger';
  if (type === 'wait') return 'Wait';
  if (type === 'condition') return 'Condition';
  return 'Action';
}

export default function TowerEditRoom() {
  const router = useRouter();
  const { id } = router.query;
  const towerId = typeof id === 'string' ? id : 'new';

  const [steps] = useState<FlowStep[]>(DEFAULT_STEPS);
  const [selectedStepId, setSelectedStepId] = useState<string>('t1');
  const [towerName, setTowerName] = useState('Order created');
  const [isEnabled, setIsEnabled] = useState(false);
  const [editingName, setEditingName] = useState(false);
  const [nameInput, setNameInput] = useState(towerName);

  const selectedStep = useMemo(() => steps.find((s) => s.id === selectedStepId) ?? steps[0], [steps, selectedStepId]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') void router.push('/automations/tower');
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [router]);

  const commitName = () => {
    setTowerName(nameInput.trim() || towerName);
    setEditingName(false);
  };

  return (
    <>
      <Head>
        <title>{towerName} — Tower</title>
      </Head>

      <div className={styles.editorRoot}>
        <header className={styles.editorTopBar}>
          <button
            type="button"
            className={styles.backBtn}
            onClick={() => void router.push('/automations/tower')}
            title="Back to towers"
            aria-label="Back to towers"
          >
            ←
          </button>

          {editingName ? (
            <input
              autoFocus
              className={styles.editorTitleInput}
              value={nameInput}
              onChange={(e) => setNameInput(e.target.value)}
              onBlur={commitName}
              onKeyDown={(e) => {
                if (e.key === 'Enter') commitName();
                if (e.key === 'Escape') {
                  setNameInput(towerName);
                  setEditingName(false);
                }
              }}
            />
          ) : (
            <button
              type="button"
              className={styles.editorTitle}
              onClick={() => {
                setNameInput(towerName);
                setEditingName(true);
              }}
            >
              {towerName}
            </button>
          )}

          <span className={styles.statusPill}>{towerId === 'new' ? 'Draft' : 'Saved'}</span>

          <div style={{ flex: 1 }} />

          <button
            type="button"
            className={styles.secondaryBtn}
            onClick={() => void router.push('/automations/tower/runs')}
          >
            View run logs
          </button>

          <button
            type="button"
            className={isEnabled ? styles.toggleOff : styles.toggleOn}
            onClick={() => setIsEnabled((v) => !v)}
          >
            {isEnabled ? 'Turn off' : 'Turn on'}
          </button>
        </header>

        <div className={styles.editorBody}>
          {/* Left step rail — Shopify Flow sidebar */}
          <aside className={styles.stepRail}>
            <div className={styles.stepRailHead}>Workflow steps</div>
            {steps.map((step, index) => (
              <button
                key={step.id}
                type="button"
                className={`${styles.stepItem} ${selectedStepId === step.id ? styles.stepItemActive : ''}`}
                onClick={() => setSelectedStepId(step.id)}
              >
                <span className={`${styles.stepIcon} ${stepIconClass(step.type)}`}>{stepIcon(step.type)}</span>
                <span>
                  <p className={styles.stepLabel}>
                    {index + 1}. {stepTypeLabel(step.type)}
                  </p>
                  <p className={styles.stepMeta}>{step.title}</p>
                </span>
              </button>
            ))}
          </aside>

          {/* Center canvas — vertical flow */}
          <main className={styles.canvas}>
            <div className={styles.testBar}>
              <span style={{ fontSize: 13, fontWeight: 600, color: '#202223' }}>Test tower</span>
              <input
                type="text"
                className={styles.configInput}
                placeholder="Enter test payload…"
                style={{ width: 220 }}
              />
              <button type="button" className={styles.toggleOn}>
                Run test
              </button>
            </div>

            <div className={styles.flowColumn}>
              {steps.map((step, index) => (
                <div key={step.id} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <div
                    role="button"
                    tabIndex={0}
                    className={`${styles.flowNode} ${selectedStepId === step.id ? styles.flowNodeSelected : ''}`}
                    onClick={() => setSelectedStepId(step.id)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') setSelectedStepId(step.id);
                    }}
                  >
                    {step.type === 'trigger' ? (
                      <>
                        <div className={styles.flowNodeTriggerHead}>
                          <span>{stepIcon(step.type)}</span>
                          {stepTypeLabel(step.type)}
                        </div>
                        <div className={styles.flowNodeBody}>
                          <h3 className={styles.flowNodeTitle}>{step.title}</h3>
                          <p className={styles.flowNodeDesc}>{step.description}</p>
                        </div>
                      </>
                    ) : (
                      <div className={styles.flowNodeBody}>
                        <p
                          style={{
                            margin: '0 0 6px',
                            fontSize: 11,
                            fontWeight: 700,
                            color: '#616161',
                            textTransform: 'uppercase',
                          }}
                        >
                          {stepTypeLabel(step.type)}
                        </p>
                        <h3 className={styles.flowNodeTitle}>{step.title}</h3>
                        <p className={styles.flowNodeDesc}>{step.description}</p>
                      </div>
                    )}
                  </div>
                  {index < steps.length - 1 ? <div className={styles.flowConnector} aria-hidden /> : null}
                </div>
              ))}
            </div>
          </main>

          {/* Right config panel */}
          <aside className={styles.configPanel}>
            <div className={styles.configPanelHead}>{stepTypeLabel(selectedStep.type)} settings</div>
            <div className={styles.configPanelBody}>
              <div className={styles.configField}>
                <label className={styles.configLabel} htmlFor="step-title">
                  Title
                </label>
                <input id="step-title" className={styles.configInput} defaultValue={selectedStep.title} />
              </div>
              <div className={styles.configField}>
                <label className={styles.configLabel} htmlFor="step-desc">
                  Description
                </label>
                <input id="step-desc" className={styles.configInput} defaultValue={selectedStep.description} />
              </div>
              {selectedStep.type === 'trigger' && (
                <div className={styles.configField}>
                  <label className={styles.configLabel}>Event</label>
                  <select className={styles.configInput} defaultValue="order_created">
                    <option value="order_created">Order created</option>
                    <option value="user_enrolled">User enrolled</option>
                    <option value="course_completed">Course completed</option>
                  </select>
                </div>
              )}
              {selectedStep.type === 'wait' && (
                <div className={styles.configField}>
                  <label className={styles.configLabel} htmlFor="wait-seconds">
                    Wait duration (seconds)
                  </label>
                  <input id="wait-seconds" type="number" className={styles.configInput} defaultValue={10} min={1} />
                </div>
              )}
              {selectedStep.type === 'action' && (
                <div className={styles.configField}>
                  <label className={styles.configLabel}>Action type</label>
                  <select className={styles.configInput} defaultValue="run_code">
                    <option value="run_code">Run code</option>
                    <option value="send_email">Send email</option>
                    <option value="notify_slack">Notify Slack</option>
                  </select>
                </div>
              )}
              {selectedStep.type === 'condition' && (
                <div className={styles.configField}>
                  <label className={styles.configLabel} htmlFor="condition-expr">
                    Condition
                  </label>
                  <input id="condition-expr" className={styles.configInput} defaultValue={selectedStep.description} />
                </div>
              )}
              <p style={{ fontSize: 12, color: '#616161', lineHeight: 1.5, margin: 0 }}>
                Configure this step like Shopify Flow — changes save to the tower definition when wired to GraphQL.
              </p>
            </div>
          </aside>
        </div>
      </div>
    </>
  );
}

export async function getServerSideProps() {
  return { props: {} };
}
