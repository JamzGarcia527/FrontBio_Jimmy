export const calculateGenderQuota = ({ 
  items, 
  genders, 
  minCandidateQuotaGender, 
  minPercentageQuotaGender, 
  limitCandidate,
  onlyApprove,
}) => {
  const candidates = onlyApprove ? items.filter(e => e.approveStatus == 1) : [...items]
  const totalCandidates = candidates.length

  if (limitCandidate < minCandidateQuotaGender) return true
  if (totalCandidates == 1) return true

  const quotaGenders = genders.filter(g => g.enableQuota)
  const quotaCount = Math.ceil(totalCandidates * (minPercentageQuotaGender / 100)) // Cálculo del 30% de cuota

  const enabledGenders = quotaGenders.map(genero => String(genero.id).toUpperCase().substring(0, 1))

  const candidateGenders = candidates
    .map(c => String(c.gender).substring(0, 1))
    .filter(g => enabledGenders.includes(g))

  const quotaInF = candidateGenders.reduce((acc, item) => item == 'F' ? acc + 1 : acc, 0)
  
  return (quotaInF >= quotaCount) // Cumple con los criterios establecidos
}
