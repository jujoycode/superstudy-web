import { useSchoolsFindOne } from '@/legacy/generated/endpoint'

export function useSchools(id?: number) {
  const { data: schoolInfo } = useSchoolsFindOne(id!, { query: { enabled: !!id } })

  const privacyPolicyManagerArray = schoolInfo?.privacyPolicyManager.split('|') || []

  let privacyPolicyManager = ''
  let privacyPolicyOrgName = ''
  let privacyPolicyManagerEmail = ''

  if (privacyPolicyManagerArray?.length === 3) {
    privacyPolicyManager = privacyPolicyManagerArray[0]
    privacyPolicyOrgName = privacyPolicyManagerArray[1]
    privacyPolicyManagerEmail = privacyPolicyManagerArray[2]
  }

  return { schoolInfo, privacyPolicyManager, privacyPolicyOrgName, privacyPolicyManagerEmail }
}
