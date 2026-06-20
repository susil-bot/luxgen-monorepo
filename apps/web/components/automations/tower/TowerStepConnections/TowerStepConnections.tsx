import { useEffect, useMemo, useState } from 'react';

import {
  connectFlowEdge,
  disconnectFlowEdge,
  flowNodeToStepView,
  getNode,
  listIncomingEdges,
  listOutgoingEdges,
  normalizeEdgeLabel,
  type FlowEdge,
  type FlowEdgeLabel,
  type FlowStepView,
  type TowerFlowDocument,
} from '../../../../lib/automation-flow';
import styles from './styles';

function portLabel(label?: FlowEdgeLabel): string {
  const port = normalizeEdgeLabel(label);
  if (port === 'true') return 'Yes';
  if (port === 'false') return 'No';
  return 'Next';
}

function stepSummary(step: FlowStepView): string {
  return `${step.title} (${step.kind})`;
}

function edgeTargetStep(flow: TowerFlowDocument, edge: FlowEdge): FlowStepView | undefined {
  const node = getNode(flow, edge.to);
  return node ? flowNodeToStepView(node) : undefined;
}

function edgeSourceStep(flow: TowerFlowDocument, edge: FlowEdge): FlowStepView | undefined {
  const node = getNode(flow, edge.from);
  return node ? flowNodeToStepView(node) : undefined;
}

interface TowerStepConnectionsProps {
  flow: TowerFlowDocument;
  selectedStep: FlowStepView;
  onFlowChange: (updater: (flow: TowerFlowDocument) => TowerFlowDocument) => void;
  onSelectStep: (stepId: string) => void;
}

export function TowerStepConnections({ flow, selectedStep, onFlowChange, onSelectStep }: TowerStepConnectionsProps) {
  const outgoing = useMemo(() => listOutgoingEdges(flow, selectedStep.id), [flow, selectedStep.id]);
  const incoming = useMemo(() => listIncomingEdges(flow, selectedStep.id), [flow, selectedStep.id]);

  const connectPorts: FlowEdgeLabel[] = selectedStep.kind === 'condition' ? ['true', 'false'] : ['default'];

  const [connectPort, setConnectPort] = useState<FlowEdgeLabel>(connectPorts[0] ?? 'default');
  const [connectTargetId, setConnectTargetId] = useState('');

  useEffect(() => {
    setConnectPort(selectedStep.kind === 'condition' ? 'true' : 'default');
    setConnectTargetId('');
  }, [selectedStep.id, selectedStep.kind]);

  const targetOptions = useMemo(
    () => flow.nodes.filter((node) => node.id !== selectedStep.id).map((node) => flowNodeToStepView(node)),
    [flow.nodes, selectedStep.id],
  );

  const handleConnect = () => {
    if (!connectTargetId) return;
    onFlowChange((prev) => connectFlowEdge(prev, selectedStep.id, connectTargetId, connectPort));
    setConnectTargetId('');
  };

  const handleDisconnectOutgoing = (edge: FlowEdge) => {
    onFlowChange((prev) => disconnectFlowEdge(prev, edge.from, edge.to, edge.label));
  };

  const handleDisconnectIncoming = (edge: FlowEdge) => {
    onFlowChange((prev) => disconnectFlowEdge(prev, edge.from, edge.to, edge.label));
  };

  return (
    <div className={styles.connectionsPanel}>
      <h3 className={styles.connectionsTitle}>Connections</h3>
      <p className={styles.connectionsLead}>Link or unlink this step to other nodes in the flow graph.</p>

      <div className={styles.connectionsSection}>
        <p className={styles.connectionsSectionLabel}>Outgoing</p>
        {outgoing.length === 0 ? (
          <p className={styles.connectionsEmpty}>No outgoing links</p>
        ) : (
          <ul className={styles.connectionsList}>
            {outgoing.map((edge) => {
              const target = edgeTargetStep(flow, edge);
              return (
                <li key={`${edge.from}-${portLabel(edge.label)}-${edge.to}`} className={styles.connectionsItem}>
                  <div className={styles.connectionsItemBody}>
                    <span className={styles.connectionsPort}>{portLabel(edge.label)}</span>
                    <span className={styles.connectionsArrow}>→</span>
                    {target ? (
                      <button
                        type="button"
                        className={styles.connectionsLinkBtn}
                        onClick={() => onSelectStep(target.id)}
                      >
                        {stepSummary(target)}
                      </button>
                    ) : (
                      <span className={styles.connectionsMissing}>{edge.to}</span>
                    )}
                  </div>
                  <button
                    type="button"
                    className={styles.connectionsDisconnectBtn}
                    onClick={() => handleDisconnectOutgoing(edge)}
                  >
                    Unlink
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      <div className={styles.connectionsSection}>
        <p className={styles.connectionsSectionLabel}>Incoming</p>
        {incoming.length === 0 ? (
          <p className={styles.connectionsEmpty}>No incoming links</p>
        ) : (
          <ul className={styles.connectionsList}>
            {incoming.map((edge) => {
              const source = edgeSourceStep(flow, edge);
              return (
                <li key={`${edge.from}-${portLabel(edge.label)}-${edge.to}`} className={styles.connectionsItem}>
                  <div className={styles.connectionsItemBody}>
                    {source ? (
                      <button
                        type="button"
                        className={styles.connectionsLinkBtn}
                        onClick={() => onSelectStep(source.id)}
                      >
                        {stepSummary(source)}
                      </button>
                    ) : (
                      <span className={styles.connectionsMissing}>{edge.from}</span>
                    )}
                    <span className={styles.connectionsArrow}>→</span>
                    <span className={styles.connectionsPort}>{portLabel(edge.label)}</span>
                  </div>
                  <button
                    type="button"
                    className={styles.connectionsDisconnectBtn}
                    onClick={() => handleDisconnectIncoming(edge)}
                  >
                    Unlink
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      <div className={styles.connectionsSection}>
        <p className={styles.connectionsSectionLabel}>Connect to…</p>
        <div className={styles.configField}>
          <label className={styles.configLabel} htmlFor="connect-port">
            Port
          </label>
          {connectPorts.length === 1 ? (
            <input className={styles.configInput} id="connect-port" readOnly value={portLabel(connectPorts[0])} />
          ) : (
            <select
              id="connect-port"
              className={styles.configInput}
              value={connectPort}
              onChange={(e) => setConnectPort(e.target.value as FlowEdgeLabel)}
            >
              {connectPorts.map((port) => (
                <option key={port} value={port}>
                  {portLabel(port)}
                </option>
              ))}
            </select>
          )}
        </div>
        <div className={styles.configField}>
          <label className={styles.configLabel} htmlFor="connect-target">
            Target step
          </label>
          <select
            id="connect-target"
            className={styles.configInput}
            value={connectTargetId}
            onChange={(e) => setConnectTargetId(e.target.value)}
          >
            <option value="">Choose target…</option>
            {targetOptions.map((step) => (
              <option key={step.id} value={step.id}>
                {stepSummary(step)}
              </option>
            ))}
          </select>
        </div>
        <button
          type="button"
          className={styles.connectionsConnectBtn}
          disabled={!connectTargetId}
          onClick={handleConnect}
        >
          Link
        </button>
      </div>
    </div>
  );
}
