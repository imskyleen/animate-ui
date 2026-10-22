export type Question = {
  name: string
  title: string
  description?: string
  required: boolean
  multiple: boolean
  choices: string[]
}

export const QUESTIONS: Question[] = [
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
]

export const [COLOR, , SIZE] = QUESTIONS as [Question, Question, Question]
