/**
 * Generated by orval v6.11.1 🍺
 * Do not edit manually.
 * Super School 백엔드
 * Super School API 상세
 * OpenAPI spec version: 0.1
 */

/**
 * 
수정가능 상태 값:
- **LOCK**: 수정불가능
- **REQUEST_UNLOCK**: 수정 요청상태
- **UNLOCK**: 수정가능상태

 */
export type ResponseTKPPFDtoEditStatus = (typeof ResponseTKPPFDtoEditStatus)[keyof typeof ResponseTKPPFDtoEditStatus]

export const ResponseTKPPFDtoEditStatus = {
  LOCK: 'LOCK',
  REQUEST_UNLOCK: 'REQUEST_UNLOCK',
  UNLOCK: 'UNLOCK',
} as const
