export function ConsentToUseOfPersonalInformation() {
  return (
    <div className="consent-to-use-of-personal-information p-8 leading-8">
      <h1 className={'text-4xl font-bold'}>개인정보/민감정보 수집 및 이용에 관한 동의(고객)</h1>
      <br />
      <p>
        주식회사 슈퍼스쿨은 수집한 개인정보를 관리함에 있어서 개인정보보호법에서 규정하고 있는 책임과 의무를 준수하고
        있습니다. 개인 정보 수집 및 이용과 관련하여 다음 사항을 안내 드리오니, 관련 내용을 충분히 숙지하신 후 해당
        내용에 동의하여 주시기 바랍니다.
      </p>
      <br />
      <table className={'w-full table-auto border border-slate-400'}>
        <thead className={'border border-slate-400'}>
          <tr>
            <th className={'border border-slate-400'}>수집 및 이용 목적</th>
            <th className={'border border-slate-400'}>수집항목</th>
            <th className={'border border-slate-400'}>보유기간</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td className={'border border-slate-400 p-2'}>
              - 본인확인
              <br /> - 회원가입 의사 확인
              <br />
              - 회원가입시 계정의 제공
              <br />
              - 서비스 및 회원 맞춤형 서비스의 제공
              <br />- 상담 및 문의 처리
            </td>
            <td className={'border border-slate-400 p-2'}>
              성명(성과 이름), 생년월일, 주소, 휴대전화 번호, 이메일, 아이디, 비밀번호, 중복가입확인정보(DI), 암호화된
              동일인 식별정보(CI), 시간관리장, 학습 통계자료, 개인 일정표, 성적 및 학업일정 관련 정보
            </td>
            <td rowSpan={3} className={'border border-slate-400 p-2'}>
              &#34;서비스&#34; 마지막 이용일 또는 회원탈퇴 후 1년 또는 법령에 따른 보존 기간
            </td>
          </tr>
          <tr>
            <td className={'border border-slate-400 p-2'}>- 출결관리</td>
            <td className={'border border-slate-400 p-2'}>(민감정보) 진료확인서 및 진단서</td>
          </tr>
          <tr>
            <td className={'border border-slate-400 p-2'}>- (만 14세 미만인 경우) 법정대리인의 동의 취득</td>
            <td className={'border border-slate-400 p-2'}>
              보호자의 성명(성과 이름), 거주국가, 생년월일, 성별, 휴대전화 번호
            </td>
          </tr>
        </tbody>
      </table>
      <br />
      <p>
        - 동의를 거부할 권리가 있으나, 동의거부에 따라 서비스 이용이 제한될 수 있습니다.
        <br />- 법령에 따른 개인정보의 수집 및 이용, 계약의 이행과 편의 증진을 위한 개인정보 처리위탁 기타 개인정보
        처리와 관련된 일반 사항은 주식회사 슈퍼스쿨 개인정보처리방침에 따릅니다.
      </p>
    </div>
  )
}
