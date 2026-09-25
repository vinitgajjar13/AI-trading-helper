import React from 'react';
import { parseTradeSetupFromMarkdown } from '../../services/marketData';
import { TradeSetupCard } from './TradeSetupCard';
import { TradeSetup } from '../../types/trading';

interface AiMarkdownRendererProps {
  content: string;
  currency?: 'INR' | 'USD';
  onApplyToCalculator?: (setup: TradeSetup) => void;
  onAddToJournal?: (setup: TradeSetup) => void;
}

export const AiMarkdownRenderer: React.FC<AiMarkdownRendererProps> = ({
  content,
  currency = 'INR',
  onApplyToCalculator,
  onAddToJournal,
}) => {
  const { cleanedMarkdown, setup } = parseTradeSetupFromMarkdown(content);

  // Render markdown lines
  const lines = cleanedMarkdown.split('\n');

  const renderFormattedText = (text: string) => {
    // Basic inline formatter for bold, code, and links
    const parts = text.split(/(\*\*.*?\*\*|`.*?`|\*.*?\*)/g);
    return parts.map((part, index) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return (
          <strong key={index} className="font-semibold text-slate-900">
            {part.slice(2, -2)}
          </strong>
        );
      }
      if (part.startsWith('`') && part.endsWith('`')) {
        return (
          <code
            key={index}
            className="px-1.5 py-0.5 rounded bg-slate-100 border border-slate-200 font-mono text-[12px] text-slate-800"
          >
            {part.slice(1, -1)}
          </code>
        );
      }
      if (part.startsWith('*') && part.endsWith('*') && !part.startsWith('**')) {
        return (
          <em key={index} className="italic text-slate-700">
            {part.slice(1, -1)}
          </em>
        );
      }
      return part;
    });
  };

  const elements: React.ReactNode[] = [];
  let currentList: string[] = [];
  let tableRows: string[][] = [];
  let inTable = false;

  const flushList = (key: string) => {
    if (currentList.length > 0) {
      elements.push(
        <ul key={key} className="my-1.5 space-y-1 pl-4 list-disc marker:text-emerald-500">
          {currentList.map((item, idx) => (
            <li key={idx} className="text-slate-700 leading-relaxed text-sm">
              {renderFormattedText(item)}
            </li>
          ))}
        </ul>
      );
      currentList = [];
    }
  };

  const flushTable = (key: string) => {
    if (tableRows.length > 0) {
      const headerRow = tableRows[0];
      const dataRows = tableRows.slice(1);
      elements.push(
        <div key={key} className="my-2.5 overflow-x-auto rounded-lg border border-slate-200">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200">
              <tr>
                {headerRow.map((col, idx) => (
                  <th key={idx} className="px-3 py-2">
                    {col.trim()}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {dataRows.map((row, rIdx) => (
                <tr key={rIdx} className="hover:bg-slate-50/50">
                  {row.map((cell, cIdx) => (
                    <td key={cIdx} className="px-3 py-2 text-slate-700">
                      {renderFormattedText(cell.trim())}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
      tableRows = [];
      inTable = false;
    }
  };

  lines.forEach((line, index) => {
    const trimmed = line.trim();

    // Table row detection
    if (trimmed.startsWith('|') && trimmed.endsWith('|')) {
      if (trimmed.includes('---')) {
        return;
      }
      flushList(`list-before-table-${index}`);
      inTable = true;
      const cols = trimmed.slice(1, -1).split('|');
      tableRows.push(cols);
      return;
    } else if (inTable) {
      flushTable(`table-${index}`);
    }

    // List item detection
    if (trimmed.startsWith('* ') || trimmed.startsWith('- ')) {
      currentList.push(trimmed.slice(2));
      return;
    } else {
      flushList(`list-${index}`);
    }

    if (!trimmed) {
      return;
    }

    if (trimmed.startsWith('### ')) {
      elements.push(
        <h3 key={index} className="text-base font-bold text-slate-900 mt-3 mb-1">
          {renderFormattedText(trimmed.slice(4))}
        </h3>
      );
      return;
    }

    if (trimmed.startsWith('#### ')) {
      elements.push(
        <h4 key={index} className="text-xs font-bold uppercase tracking-wider text-slate-600 mt-2.5 mb-1">
          {renderFormattedText(trimmed.slice(5))}
        </h4>
      );
      return;
    }

    if (trimmed === '---') {
      elements.push(<hr key={index} className="my-2.5 border-slate-200" />);
      return;
    }

    // Regular paragraph
    elements.push(
      <p key={index} className="my-1 text-sm text-slate-700 leading-relaxed">
        {renderFormattedText(trimmed)}
      </p>
    );
  });

  flushList('final-list');
  flushTable('final-table');

  return (
    <div className="space-y-1">
      {elements}

      {setup && (
        <TradeSetupCard
          setup={setup}
          currency={currency}
          onApplyToCalculator={onApplyToCalculator}
          onAddToJournal={onAddToJournal}
        />
      )}
    </div>
  );
};
