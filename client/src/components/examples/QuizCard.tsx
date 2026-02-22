import QuizCard from '../QuizCard'

export default function QuizCardExample() {
  return (
    <QuizCard
      question="What is the primary function of a neural network?"
      options={[
        "To store data in a structured format",
        "To process information and learn patterns from data",
        "To compile code into machine language",
        "To manage database transactions"
      ]}
      correctAnswer={1}
      questionNumber={5}
      totalQuestions={20}
    />
  )
}
