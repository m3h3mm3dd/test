export function useUserProjectRole(project: any, userId: string | undefined) {
  if (!project || !userId) {
    return {
      isOwner: false,
      isTeamLeader: false,
      isStakeholder: false,
      isMember: false,
    }
  }

  const isOwner = project.owner?.id === userId
  const isTeamLeader = project.teams?.some((t: any) => t.leader?.id === userId)
  const isStakeholder = project.stakeholders?.some((s: any) => s.id === userId)
  const isMember = project.members?.some((m: any) => m.id === userId)

  return { isOwner, isTeamLeader, isStakeholder, isMember }
}
