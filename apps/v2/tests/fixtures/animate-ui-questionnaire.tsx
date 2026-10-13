'use client';

import * as React from 'react';
import type { QuestionnaireItemStatus } from '@animate-ui/react/primitives/questionnaire';
import { AnimateUIProvider } from '@animate-ui/react/provider';

import {
  Questionnaire,
  QuestionnaireActions,
  QuestionnaireChoice,
  QuestionnaireChoices,
  QuestionnaireDescription,
  QuestionnaireError,
  QuestionnaireItem,
  QuestionnaireNext,
  QuestionnairePrevious,
  QuestionnaireProgress,
  QuestionnaireSkip,
  QuestionnaireSubmit,
  QuestionnaireTitle,
} from '@/demos/base-ui/questionnaire';

type Question = {
  name: string;
  title: string;
  description?: string;
  required: boolean;
  multiple: boolean;
  choices: string[];
};

const QUESTIONS: Question[] = [
  {
    name: 'color',
    title: 'Pick a color',
    required: true,
    multiple: false,
    choices: ['Red', 'Green', 'Blue'],
  },
  {
    name: 'extras',
    title: 'Any extras?',
    description: 'Select all that apply, or skip.',
    required: false,
    multiple: true,
    choices: ['Cheese', 'Olives', 'Basil', 'Garlic'],
  },
  {
    name: 'size',
    title: 'Which size?',
    required: true,
    multiple: false,
    choices: ['Small', 'Large'],
  },
];
const [COLOR, , SIZE] = QUESTIONS as [Question, Question, Question];

type FlowProps = React.ComponentProps<typeof Questionnaire> & {
  progress?: React.ReactNode;
  defaults?: Record<string, string[]>;
  questions?: Question[];
  progressInItems?: boolean;
  itemProps?: (
    question: Question,
  ) => Partial<React.ComponentProps<typeof QuestionnaireItem>>;
  actionsProps?: React.ComponentProps<typeof QuestionnaireActions>;
  nextProps?: React.ComponentProps<typeof QuestionnaireNext>;
  submitProps?: React.ComponentProps<typeof QuestionnaireSubmit>;
  onStatusChange?: (name: string, status: QuestionnaireItemStatus) => void;
};

function Flow({
  progress,
  defaults = {},
  questions = QUESTIONS,
  progressInItems = false,
  itemProps,
  actionsProps,
  nextProps,
  submitProps,
  onStatusChange,
  ...props
}: FlowProps) {
  return (
    <Questionnaire {...props}>
      {progressInItems ? null : (progress ?? <QuestionnaireProgress />)}
      {questions.map((question) => (
        <QuestionnaireItem
          key={question.name}
          name={question.name}
          required={question.required}
          multiple={question.multiple}
          onStatusChange={
            onStatusChange
              ? (status) => onStatusChange(question.name, status)
              : undefined
          }
          {...itemProps?.(question)}
        >
          <QuestionnaireTitle>{question.title}</QuestionnaireTitle>
          {progressInItems ? <QuestionnaireProgress /> : null}
          {question.description ? (
            <QuestionnaireDescription>
              {question.description}
            </QuestionnaireDescription>
          ) : null}
          <QuestionnaireChoices>
            {question.choices.map((choice) => (
              <QuestionnaireChoice
                key={choice}
                value={choice.toLowerCase()}
                defaultChecked={defaults[question.name]?.includes(choice)}
              >
                {choice}
              </QuestionnaireChoice>
            ))}
          </QuestionnaireChoices>
          <QuestionnaireError />
        </QuestionnaireItem>
      ))}
      <QuestionnaireActions {...actionsProps}>
        <QuestionnairePrevious />
        <QuestionnaireSkip />
        <QuestionnaireNext {...nextProps} />
        <QuestionnaireSubmit {...submitProps} />
      </QuestionnaireActions>
    </Questionnaire>
  );
}

function Controlled() {
  const [item, setItem] = React.useState('color');
  const [calls, setCalls] = React.useState<string[]>([]);

  return (
    <>
      <Flow
        item={item}
        onItemChange={(next) => {
          setCalls((current) => [...current, next]);
          setItem(next);
        }}
      />
      <div className="mt-4 flex gap-2">
        {QUESTIONS.map((question) => (
          <button
            key={question.name}
            type="button"
            onClick={() => setItem(question.name)}
          >
            Show {question.name}
          </button>
        ))}
      </div>
      <output data-testid="controlled-calls">{calls.join(',')}</output>
    </>
  );
}

function Submitted() {
  const [data, setData] = React.useState('');

  return (
    <>
      <Flow
        onSubmit={(event) => {
          event.preventDefault();
          const formData = new FormData(event.currentTarget);
          setData(
            JSON.stringify(
              Object.fromEntries(
                QUESTIONS.map((question) => [
                  question.name,
                  formData.getAll(question.name),
                ]),
              ),
            ),
          );
        }}
      />
      <pre data-testid="submit-data">{data}</pre>
    </>
  );
}

function NavigationState() {
  const [item, setItem] = React.useState('color');
  const [statuses, setStatuses] = React.useState<
    Record<string, QuestionnaireItemStatus>
  >({ color: 'unanswered', size: 'unanswered' });
  const unanswered = statuses[item] === 'unanswered';

  return (
    <>
      <Flow
        questions={[COLOR, SIZE]}
        item={item}
        onItemChange={setItem}
        onStatusChange={(name, status) =>
          setStatuses((current) => ({ ...current, [name]: status }))
        }
        nextProps={{
          className: 'data-[status=unanswered]:opacity-50',
          disabled: unanswered,
          variant: 'secondary',
        }}
        submitProps={{ disabled: unanswered }}
      />
      <div className="mt-4 flex gap-2">
        {[COLOR, SIZE].map((question) => (
          <button
            key={question.name}
            type="button"
            onClick={() => setItem(question.name)}
          >
            Go to {question.name}
          </button>
        ))}
      </div>
    </>
  );
}

function Conditional() {
  const [runtime, setRuntime] = React.useState('local');
  const items = React.useMemo(
    () => [
      { name: 'runtime', required: true },
      { disabled: runtime !== 'cloud', name: 'environment', required: true },
      { name: 'approval', required: true },
    ],
    [runtime],
  );

  return (
    <Questionnaire defaultItem="runtime" items={items}>
      <QuestionnaireProgress />
      <QuestionnaireItem name="runtime" required>
        <QuestionnaireTitle>Where should it run?</QuestionnaireTitle>
        <QuestionnaireDescription>
          Cloud adds an environment question.
        </QuestionnaireDescription>
        <QuestionnaireChoices>
          <QuestionnaireChoice
            checked={runtime === 'local'}
            value="local"
            onChange={() => setRuntime('local')}
          >
            Local
          </QuestionnaireChoice>
          <QuestionnaireChoice
            checked={runtime === 'cloud'}
            value="cloud"
            onChange={() => setRuntime('cloud')}
          >
            Cloud
          </QuestionnaireChoice>
        </QuestionnaireChoices>
        <QuestionnaireError />
      </QuestionnaireItem>
      <QuestionnaireItem
        disabled={runtime !== 'cloud'}
        name="environment"
        required
      >
        <QuestionnaireTitle>Which environment?</QuestionnaireTitle>
        <QuestionnaireChoices>
          <QuestionnaireChoice value="preview">Preview</QuestionnaireChoice>
          <QuestionnaireChoice value="staging">Staging</QuestionnaireChoice>
          <QuestionnaireChoice value="isolated">Isolated</QuestionnaireChoice>
        </QuestionnaireChoices>
        <QuestionnaireError />
      </QuestionnaireItem>
      <QuestionnaireItem name="approval" required>
        <QuestionnaireTitle>When to ask?</QuestionnaireTitle>
        <QuestionnaireChoices>
          <QuestionnaireChoice value="writes">
            Before writes
          </QuestionnaireChoice>
          <QuestionnaireChoice value="commands">
            Before commands
          </QuestionnaireChoice>
        </QuestionnaireChoices>
        <QuestionnaireError />
      </QuestionnaireItem>
      <QuestionnaireActions>
        <QuestionnairePrevious />
        <QuestionnaireNext />
        <QuestionnaireSubmit />
      </QuestionnaireActions>
    </Questionnaire>
  );
}

export default function QuestionnaireFixture() {
  return (
    <div className="flex w-[448px] flex-col gap-16">
      <section data-testid="controlled">
        <Controlled />
      </section>
      <section data-testid="resume">
        <Flow
          defaultItem="extras"
          defaults={{ color: ['Green'], extras: ['Olives'] }}
        />
      </section>
      <section data-testid="custom-progress">
        <Flow
          progress={
            <QuestionnaireProgress
              render={(props, state) => (
                <div {...props}>
                  Step {state.current}/{state.total}
                </div>
              )}
            />
          }
        />
      </section>
      <section data-testid="tempo">
        <AnimateUIProvider tempo={2}>
          <Flow />
        </AnimateUIProvider>
      </section>
      <section data-testid="reset">
        <Flow />
      </section>
      <section data-testid="submit">
        <Submitted />
      </section>
      <section data-testid="rtl" dir="rtl">
        <Flow />
      </section>
      <section data-testid="progress-in-items">
        <Flow progressInItems />
      </section>
      <section data-testid="navigation-state">
        <NavigationState />
      </section>
      <section data-testid="inline-styles">
        <Flow
          style={{ position: 'static' }}
          itemProps={(question) =>
            question.name === 'color'
              ? { style: { width: '400px', marginBottom: '6px' } }
              : {}
          }
          actionsProps={{ style: { position: 'static' } }}
          nextProps={{ style: { width: '120px' } }}
        />
      </section>
      <section data-testid="content-box">
        <Flow
          itemProps={() => ({
            className: 'box-content border-2 border-border p-3.5',
          })}
        />
      </section>
      <section data-testid="fractional" style={{ width: '400.39px' }}>
        <Flow />
      </section>
      <section data-testid="jump-back">
        <Flow
          questions={[COLOR, SIZE]}
          defaultItem="size"
          defaults={{ size: ['Large'] }}
        />
      </section>
      <section data-testid="conditional">
        <Conditional />
      </section>
    </div>
  );
}
