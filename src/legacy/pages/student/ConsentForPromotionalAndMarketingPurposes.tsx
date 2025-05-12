export function ConsentForPromotionalAndMarketingPurposes() {
  return (
    <div className="consent-for-promotional-and-marketing-purposes p-8 leading-8">
      <h1 className={'text-4xl font-bold'}>홍보 및 마케팅에 관한 개인정보 제공 동의(고객)</h1>
      <br />
      <p>
        주식회사 슈퍼스쿨는 “개인정보 보호법”에 따라 동의를 얻어 아래와 같이 주식회사 슈퍼스쿨 서비스의 홍보 및 마케팅,
        서비스 개선을 위한 개인정보를 수집, 이용하고자 다음 사항을 안내 드리오니, 관련 내용을 충분히 숙지하신 후 해당
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
              - 서비스 프로모션 정보 제공
              <br /> - 뉴스레터 발송
              <br />
              - sns를 통한 이벤트 참여 기회 제공
              <br />- 경품 및 쿠폰 제공
            </td>
            <td className={'border border-slate-400 p-2'}>
              성명(성과 이름), 아이디, 이메일, 소속 학교명, 성별, 서비스 사용기록
            </td>
            <td rowSpan={3} className={'border border-slate-400 p-2'}>
              &#34;서비스&#34; 마지막 이용일 또는 회원탈퇴 후 1년 또는 법령에 따른 보존 기간
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
  );
}
