import { t } from 'i18next'
import { useState } from 'react'
import { UseFormSetValue } from 'react-hook-form'
import { useBlockChain } from '@/legacy/container/block-chain'
import { useBlockChainContract } from '@/legacy/container/block-chain-contract'
import { useBlockChainRequest } from '@/legacy/container/block-chain-request'
import { useBlockChainWallet } from '@/legacy/container/block-chain-wallet'
import { RequestUpdateSchoolInfoDto } from '@/legacy/generated/model'
import { PrivacyManager } from '@/legacy/pages/admin/school/SchoolPage'
import CertificationBadge from './CertificationBadge'

interface BlockchainSettingProps {
  useBlockChainState: boolean | undefined
  setValue: UseFormSetValue<RequestUpdateSchoolInfoDto & { privacyManager: PrivacyManager }>
  updateUseBlockChain: () => Promise<void>
}

export default function BlockchainSetting({
  useBlockChainState,
  setValue,
  updateUseBlockChain,
}: BlockchainSettingProps) {
  const [coachMark1, setCoachMark1] = useState<boolean>(false)
  const [coachMark2, setCoachMark2] = useState<boolean>(false)
  const { wallet, contract, isContractLoading, isWalletLoading } = useBlockChain()
  const { createWallet, isCreating, isError, error } = useBlockChainWallet()
  const { createContract } = useBlockChainContract()
  const { requestId } = useBlockChainRequest()

  return (
    <>
      <div className="flex flex-col gap-2 px-5 py-2">
        <div className="flex flex-row items-center justify-between">
          <div className="flex flex-row items-center gap-1">
            <h6 className="font-bold" children={t('슈퍼스쿨 블록체인', '슈퍼스쿨 블록체인')} />
          </div>
        </div>
        {useBlockChainState ? (
          <button
            className="flex w-max rounded-lg border border-[#333333] px-4 py-2 text-sm font-semibold text-[#333333]"
            onClick={(e) => {
              if (confirm('슈퍼스쿨 블록체인을 적용을 취소하시겠습니까?')) {
                setValue('useBlockChain', false)
                updateUseBlockChain()
              }
            }}
          >
            블록체인 사용취소
          </button>
        ) : (
          <button
            className="flex w-max rounded-lg border border-[#333333] px-4 py-2 text-sm font-semibold text-[#333333]"
            onClick={(e) => {
              if (confirm('슈퍼스쿨 블록체인을 사용하시겠습니까?')) {
                setValue('useBlockChain', true)
                updateUseBlockChain()
              }
            }}
          >
            블록체인 사용하기
          </button>
        )}
      </div>
      <div className="flex flex-col gap-2 px-5 py-2">
        <div className="flex flex-row items-center justify-between">
          <div className="flex flex-row items-center gap-1">
            <h6 className="font-bold" children={t('슈퍼스쿨 블록체인 인증', '슈퍼스쿨 블록체인 인증')} />
            <div
              className="text-md relative flex h-5 w-5 cursor-pointer items-center justify-center rounded-full border border-gray-500 text-sm text-[#777777]"
              onClick={() => setCoachMark1(!coachMark1)}
            >
              {coachMark1 && (
                <span
                  className={`text-13 absolute right-4 bottom-full z-10 mb-4 flex w-80 translate-x-full transform rounded-sm border border-black bg-white p-2.5 text-black after:absolute after:top-full after:left-4 after:block after:-translate-x-1/2 after:border-8 after:border-transparent after:border-t-black`}
                >
                  <p className="text-14 flex leading-6 font-normal whitespace-normal">
                    슈퍼스쿨의 블록체인 인증을 통해 학교 구성원들의 개인 정보를 더욱 안전하게 보호할 수 있습니다.
                  </p>
                </span>
              )}
              <p>?</p>
            </div>
          </div>
          {wallet?.status && wallet.status !== 'NO_DATA' && <CertificationBadge status={wallet.status} />}
        </div>
        {wallet?.status === 'PENDING' ? (
          <button
            className="flex w-max rounded-lg border border-[#333333] px-4 py-2 text-sm font-semibold text-[#333333]"
            onClick={() => requestId({ referenceTable: 'BLOCK_CHAIN_EOAKEY', referenceId: wallet.referenceId })}
          >
            블록체인 재인증
          </button>
        ) : (
          <button
            className="flex w-max rounded-lg border border-[#333333] px-4 py-2 text-sm font-semibold text-[#333333] disabled:border disabled:border-gray-300 disabled:text-gray-300"
            disabled={wallet?.status === 'COMPLETE'}
            onClick={() => createWallet()}
          >
            블록체인 인증하기
          </button>
        )}
      </div>
      <div className="flex flex-col gap-2 px-5 py-2">
        <div className="flex flex-row items-center justify-between">
          <div className="flex flex-row items-center gap-1">
            <h6 className="font-bold" children={t('학교 문서 인증', '학교 문서 인증')} />
            <div
              className="text-md relative flex h-5 w-5 cursor-pointer items-center justify-center rounded-full border border-gray-500 text-sm text-[#777777]"
              onClick={() => setCoachMark2(!coachMark2)}
            >
              {coachMark2 && (
                <span
                  className={`text-13 absolute right-4 bottom-full z-10 mb-4 flex w-80 translate-x-full transform rounded-sm border border-black bg-white p-2.5 text-black after:absolute after:top-full after:left-4 after:block after:-translate-x-1/2 after:border-8 after:border-transparent after:border-t-black`}
                >
                  <p className="text-14 flex leading-6 font-normal whitespace-normal">
                    확인증 및 결석신고서 문서를 더욱 안전하게 보호 및 보관하실 수 있습니다.
                  </p>
                </span>
              )}
              ?
            </div>
          </div>
          {contract?.status && contract?.status !== 'NO_DATA' && <CertificationBadge status={contract?.status} />}
        </div>
        {contract?.status === 'PENDING' ? (
          <button
            className="flex w-max rounded-lg border border-[#333333] px-4 py-2 text-sm font-semibold text-[#333333]"
            onClick={() => requestId({ referenceTable: 'BLOCK_CHAIN_CONTRACT', referenceId: contract.referenceId })}
          >
            학교문서 재인증
          </button>
        ) : (
          <button
            className="flex w-max rounded-lg border border-[#333333] px-4 py-2 text-sm font-semibold text-[#333333] disabled:border disabled:border-gray-300 disabled:text-gray-300"
            disabled={contract?.status === 'COMPLETE'}
            onClick={() => createContract()}
          >
            학교문서 인증
          </button>
        )}
      </div>
    </>
  )
}
