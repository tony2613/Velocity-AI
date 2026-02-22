import StatsCard from '../StatsCard'
import { FileText } from 'lucide-react'

export default function StatsCardExample() {
  return (
    <StatsCard
      icon={FileText}
      label="Notes Summarized"
      value={127}
      trend="+12 this week"
    />
  )
}
